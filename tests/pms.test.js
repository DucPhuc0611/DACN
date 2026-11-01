const {test}=require('node:test');
const assert=require('node:assert/strict');
const {create,S}=require('../shared/pms.js');
function fixture(){
    const data=new Map(),storage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
    storage.setItem('LoaiPhong',JSON.stringify([{MaLoaiPhong:'KING',GiaTieuChuan:100,SucChua:2},{MaLoaiPhong:'SUITE',GiaTieuChuan:200,SucChua:4}]));
    storage.setItem('Phong',JSON.stringify([{MaPhong:'101',MaLoaiPhong:'KING',TrangThaiVeSinh:S.ready},{MaPhong:'102',MaLoaiPhong:'KING',TrangThaiVeSinh:S.ready},{MaPhong:'201',MaLoaiPhong:'SUITE',TrangThaiVeSinh:S.ready}]));
    storage.setItem('KhachHang',JSON.stringify([{MaKH:'K1',HoTen:'Khách A'},{MaKH:'K2',HoTen:'Khách B'}]));
    const p=create(storage,()=>new Date('2026-11-01T10:00:00+07:00'));
    const staff=role=>({MaNV:role,HoTen:role,ChucDanh:role});
    const admin=staff('admin'),front=staff('letan'),house=staff('buongphong'),floor=staff('giamsattang'),audit=staff('kiemtoan'),service=staff('phucvu'),tech=staff('kythuat');
    const reserve=(over={})=>p.reserve(front,{customer:'K1',type:'KING',start:'2026-11-01',end:'2026-11-03',guests:1,count:1,deposit:0,...over})[0];
    const checkin=bid=>p.checkIn(front,bid,{identity:'ID123',nationality:'Việt Nam',key:'KEY101'});
    return {p,storage,data,staff,admin,front,house,floor,audit,service,tech,reserve,checkin};
}
test('complete reservation → checkin → service → move → audit → checkout → inspection',()=>{
    const {p,front,admin,house,floor,audit,service,reserve,checkin}=fixture();
    const bid=reserve();p.deposit(front,bid,50);checkin(bid);p.residence(front,bid,'REC001');
    p.service(service,bid,{item:'BREAKFAST',quantity:2,confirmed:true,customer:'Khách A'});
    assert.equal(p.bill(bid).total,230);assert.equal(p.bill(bid).due,180);
    p.nightAudit(audit);assert.equal(p.load().extra.reports[0].roomRevenue,100);
    p.move(front,bid,{room:'201',key:'KEY201',reason:'Nâng hạng',free:false});
    assert.equal(p.bill(bid).roomTotal,300);assert.equal(p.load().rooms[0].TrangThaiVeSinh,S.dirty);
    p.adjust(admin,bid,-10,'Bồi thường đã duyệt');p.nightAudit(audit);
    assert.equal(p.load().extra.reports[1].roomRevenue,200);
    p.roomCheck(house,bid,'Không có tiêu hao bổ sung');
    p.checkout(front,bid,{amount:270,method:'Thẻ',ref:'AUTH01',confirmed:true});
    const state=p.load();assert.equal(state.bookings[0].TrangThai,S.closed);assert.equal(state.bookings[0].QuyenMoPhong,null);assert.equal(state.extra.invoices.length,1);
    assert.throws(()=>p.checkout(front,bid,{amount:270,method:'Thẻ',ref:'AUTH01',confirmed:true}));
    p.clean(house,'201');assert.equal(p.load().rooms[2].TrangThaiVeSinh,S.inspect);p.inspect(floor,'201',true,'Đạt yêu cầu');assert.equal(p.load().rooms[2].TrangThaiVeSinh,S.ready);
    assert.equal(p.bill(bid).total,320);assert.ok(state.extra.logs.length>=10);
});
test('inventory checks overlapping reservations and permits adjacent dates',()=>{
    const {p,reserve}=fixture();reserve();reserve();assert.throws(()=>reserve(),/Không đủ phòng/);
    assert.equal(p.available('101','2026-11-03','2026-11-04'),true);
    assert.throws(()=>reserve({guests:3}),/sức chứa/);assert.throws(()=>reserve({count:1.5}),/số nguyên/);
    assert.throws(()=>reserve({start:'2026-02-30'}));
});
test('check-in requires pending state, ready room and correct date',()=>{
    const {p,reserve,checkin,front}=fixture();const bid=reserve({start:'2026-11-02'});assert.throws(()=>checkin(bid),/ngày kinh doanh/);
    p.editBooking(front,bid,{start:'2026-11-01',end:'2026-11-03'});checkin(bid);assert.throws(()=>checkin(bid),/trạng thái/);
});
test('guest deposits are never invented, multi-room deposits keep exact cents',()=>{
    const {p,front}=fixture();const guest={MaKH:'K1',HoTen:'Khách A'};
    p.reserve(guest,{customer:'K1',type:'KING',start:'2026-11-01',end:'2026-11-03',guests:1,count:2,deposit:100});assert.equal(p.load().bookings.reduce((s,b)=>s+b.TienCoc,0),0);
    const f=fixture();f.p.reserve(f.front,{customer:'K1',type:'KING',start:'2026-11-01',end:'2026-11-03',guests:1,count:2,deposit:100.01});assert.equal(f.p.load().bookings.reduce((s,b)=>s+Math.round(b.TienCoc*100),0),10001);assert.equal(f.p.load().extra.payments.length,2);
    assert.throws(()=>p.reserve(guest,{customer:'K2'}),/tài khoản khác/);
});
test('unauthorized mutations and upgrades leave all data unchanged',()=>{
    const {p,reserve,checkin,front,house}=fixture();const bid=reserve();checkin(bid);const before=JSON.stringify(p.load());
    assert.throws(()=>p.adjust(front,bid,-1,'Discount'),/quyền/);assert.throws(()=>p.move(front,bid,{room:'201',free:true,key:'NEW',reason:'Upgrade'}),/quyền/);assert.throws(()=>p.deposit(house,bid,50),/quyền/);assert.equal(JSON.stringify(p.load()),before);
});
test('service signature, amount and credit limits are enforced',()=>{
    const {p,reserve,checkin,service,house,admin}=fixture();const bid=reserve();checkin(bid);
    p.settings(admin,{tax:0,credit:205});assert.throws(()=>p.service(service,bid,{item:'BREAKFAST',quantity:1,confirmed:true,customer:'A'}),/hạn mức/);
    assert.throws(()=>p.service(service,bid,{item:'WATER',quantity:1,confirmed:true,customer:'A'}),/quyền/);
    assert.throws(()=>p.service(house,bid,{item:'WATER',quantity:-1,confirmed:true,customer:'A'}));assert.throws(()=>p.service(house,bid,{item:'WATER',quantity:1,confirmed:false,customer:'A'}),/xác nhận/);
    p.service(house,bid,{item:'WATER',quantity:1,confirmed:true,customer:'A'});assert.equal(p.bill(bid).due,202);
});
test('repair workflow requires approvals and blocks room inspection until closed',()=>{
    const {p,front,tech,admin,house,floor,storage}=fixture();const iid=p.reportIncident(front,{room:'101',note:'Điều hòa hỏng'});
    assert.equal(p.available('101','2026-11-01','2026-11-03'),false);
    assert.throws(()=>p.incident(tech,iid,'Đang sửa chữa','skip'),/bỏ qua/);
    p.incident(tech,iid,'Kỹ thuật đã báo quản lý','Kiểm tra');assert.throws(()=>p.incident(tech,iid,'Quản lý đã duyệt sửa','duyệt'),/quyền/);
    p.incident(admin,iid,'Quản lý đã duyệt sửa','Đồng ý');p.incident(tech,iid,'Đang sửa chữa','Thay thiết bị');p.incident(tech,iid,'Kỹ thuật báo đã sửa xong','Xong');
    const rooms=p.load().rooms;rooms[0].TrangThaiVeSinh=S.dirty;storage.setItem('Phong',JSON.stringify(rooms));p.clean(house,'101');assert.throws(()=>p.inspect(floor,'101',true,'Đạt'),/sự cố/);
    p.incident(admin,iid,S.done,'Đã kiểm tra');p.clean(house,'101');p.inspect(floor,'101',true,'Đạt');assert.equal(p.available('101','2026-11-01','2026-11-03'),true);
});
test('checkout requires inspection and correct successful payment, supports refunds',()=>{
    const {p,reserve,checkin,front,house}=fixture();const bid=reserve({deposit:250});checkin(bid);p.departure(front,bid,'2026-11-02','Trả sớm');
    assert.throws(()=>p.checkout(front,bid,{amount:-150,method:'Tiền mặt',confirmed:true}),/kiểm phòng/);
    p.roomCheck(house,bid,'Đạt');assert.throws(()=>p.checkout(front,bid,{amount:-150,method:'Tiền mặt',confirmed:true}),/ngày trả/);
    p.residence(front,bid,'REF');p.nightAudit(fixture().audit);
    assert.throws(()=>p.checkout(front,bid,{amount:150,method:'Tiền mặt',confirmed:true}),/không khớp/);
    assert.throws(()=>p.checkout(front,bid,{amount:-150,method:'Thẻ',confirmed:true,ref:''}),/mã chuẩn chi/);
    assert.throws(()=>p.checkout(front,bid,{amount:-150,method:'Tiền mặt',confirmed:false}),/thành công/);
    p.checkout(front,bid,{amount:-150,method:'Tiền mặt',confirmed:true});assert.equal(p.bill(bid).due,-150);
});
test('night audit blocks unresolved arrivals and departures, never double counts room charges',()=>{
    const {p,reserve,checkin,front,audit}=fixture();const bid=reserve();assert.throws(()=>p.nightAudit(audit),/chưa nhận/);checkin(bid);assert.throws(()=>p.nightAudit(audit),/tạm trú/);p.residence(front,bid,'REF');
    p.nightAudit(audit);p.nightAudit(audit);assert.equal(p.bill(bid).roomTotal,200);assert.equal(p.load().extra.reports.length,2);assert.throws(()=>p.nightAudit(audit),/chưa trả/);
});
test('cancellation refunds exactly once and releases inventory',()=>{
    const {p,front,reserve}=fixture();const bid=reserve({deposit:50});assert.throws(()=>p.cancel(front,bid,49),/đúng tiền cọc/);p.cancel(front,bid,50);assert.equal(p.available('101','2026-11-01','2026-11-03'),true);assert.throws(()=>p.cancel(front,bid,50));
});
test('guest requests enforce ownership and keep responses',()=>{
    const {p,reserve,front}=fixture();const bid=reserve();assert.throws(()=>p.request({MaKH:'K2'},bid,'Dịch vụ','Food'),/Không được/);
    const req=p.request({MaKH:'K1',HoTen:'A'},bid,'Đổi phòng','Cần phòng yên tĩnh');p.resolveRequest(front,req,'Đã tiếp nhận');assert.equal(p.load().extra.requests[0].response,'Đã tiếp nhận');
});
test('departure changes cannot change locked days or overlap another reservation',()=>{
    const {p,reserve,checkin,front,audit}=fixture();const bid=reserve();checkin(bid);p.residence(front,bid,'REF');p.nightAudit(audit);p.nightAudit(audit);assert.throws(()=>p.departure(front,bid,'2026-11-02','backdate'),/khóa sổ/);
    p.departure(front,bid,'2026-11-04','Gia hạn');assert.equal(p.bill(bid).roomTotal,300);
});
test('failed storage write restores booking, room and financial state',()=>{
    const f=fixture();const bid=f.reserve();const before=JSON.stringify(f.p.load()),set=f.storage.setItem;let fail=true;
    f.storage.setItem=(k,v)=>{if(k==='PhieuDatPhong'&&fail){fail=false;throw Error('quota');}set(k,v);};assert.throws(()=>f.checkin(bid),/quota/);assert.equal(JSON.stringify(f.p.load()),before);assert.equal(f.storage.getItem('SSA_TransactionBackup'),null);
});
test('recovery journal restores a tab interrupted mid-write',()=>{
    const f=fixture();f.reserve();const previous=Object.fromEntries(['Phong','LoaiPhong','KhachHang','PhieuDatPhong','SuCoKyThuat','SSA_Workflows_v1'].map(k=>[k,f.storage.getItem(k)]));f.storage.setItem('SSA_TransactionBackup',JSON.stringify(previous));f.storage.setItem('Phong','[]');f.p.recover();assert.equal(f.p.load().rooms.length,3);
});
test('promotions require approval, valid dates and a price above the configured floor',()=>{
    const {p,admin,front,staff,reserve}=fixture();
    p.settings(admin,{tax:10,credit:2000,type:'KING',floor:70,rate:100});
    p.promotion(staff('truongca'),{code:'WELCOME',type:'KING',start:'2026-11-01',end:'2026-11-04',percent:20});
    assert.throws(()=>reserve({promo:'WELCOME'}),/chưa duyệt/);
    const promo=p.load().extra.promotions[0];assert.throws(()=>p.approvePromotion(front,promo.id),/quyền/);p.approvePromotion(admin,promo.id);
    const quote=p.quote({type:'KING',start:'2026-11-01',end:'2026-11-03',count:2,promo:'welcome'});assert.equal(quote.rate,80);assert.equal(quote.total,352);
    const bid=reserve({promo:'welcome'});assert.equal(p.bill(bid).total,176);
    assert.throws(()=>p.editBooking(front,bid,{start:'2026-11-01',end:'2026-11-05'}),/khuyến mãi/);
    p.settings(admin,{tax:20,credit:2000,type:'KING',floor:90,rate:100});assert.equal(p.bill(bid).total,176);assert.throws(()=>reserve({promo:'WELCOME'}),/giá sàn/);
});
test('material norms and service cost reports retain recorded unit costs',()=>{
    const {p,admin,front,floor,house,reserve,checkin,service}=fixture();
    assert.throws(()=>p.supply(house,{name:'Khăn',par:2,unit:'cái',cost:3}),/quyền/);p.supply(floor,{name:'Khăn',par:2,unit:'cái',cost:3});assert.equal(p.load().extra.supplies[0].par,2);
    const bid=reserve();checkin(bid);p.menu(admin,{id:'BREAKFAST',name:'Ăn sáng',price:15,cost:5,kind:'service'});p.service(service,bid,{item:'BREAKFAST',quantity:2,confirmed:true,customer:'Khách A'});
    p.menu(admin,{id:'BREAKFAST',name:'Ăn sáng',price:20,cost:8,kind:'service'});assert.equal(p.load().extra.lines[0].cost,10);assert.equal(p.load().extra.lines[0].amount,30);
    assert.throws(()=>p.menu(front,{name:'Thử',price:10,cost:2,kind:'service'}),/quyền/);
});
test('reductions cannot make pre-tax subtotal negative',()=>{
    const {p,admin,reserve,checkin}=fixture();p.settings(admin,{tax:10,credit:2000});const bid=reserve();checkin(bid);assert.equal(p.bill(bid).total,220);
    assert.throws(()=>p.adjust(admin,bid,-210,'Sai giảm trừ'),/không hợp lệ/);p.adjust(admin,bid,-200,'Miễn toàn bộ tiền phòng');assert.equal(p.bill(bid).total,0);
});
test('common-area incidents preserve existing technical form fields',()=>{
    const {p,front}=fixture();p.reportIncident(front,{area:'Nhà hàng',category:'Điện',priority:'Cao',note:'Đèn hỏng'});const i=p.load().incidents[0];assert.equal(i.MaPhong,'');assert.equal(i.KhuVuc,'Nhà hàng');assert.equal(i.NhomSuCo,'Điện');assert.equal(i.TenNVBao,front.HoTen);
});
