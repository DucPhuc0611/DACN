/* UI adapter for the shared PMS engine; legacy entry points route here too. */
const pms = HotelPMS.create(localStorage);
let operationTab = 'booking';
const groupNames = { booking:'Đặt / nhận phòng', stay:'Điều chỉnh lưu trú', service:'Dịch vụ / minibar', rooms:'Buồng phòng / kỹ thuật', checkout:'Trả phòng / tất toán', audit:'Kiểm toán / quản trị' };
const esc = escapeHTML;
const moneyLabel = value => '$' + Number(value).toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2});
const opt = (value,label) => ({value,label});
function pmsButton(label, action, id='', permission='') {return !permission||pms.can(currentStaff,permission)?`<button type="button" class="pms-btn" data-action="${action}" data-id="${esc(id)}">${label}</button>`:'';}
function pmsTable(headers,rows){return `<div class="pms-scroll"><table class="pms-table"><thead><tr>${headers.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}">Chưa có dữ liệu.</td></tr>`}</tbody></table></div>`;}
function field(name,label,type='text',value='',options=[]){return {name,label,type,value,options};}
function closePmsDialog(){document.getElementById('pms-dialog')?.close();}
async function pmsWrite(run){
    // Shared lock serializes operations between customer and staff tabs.
    if(navigator.locks)return navigator.locks.request('ssa-pms-write',()=>run());
    return run();
}
function pmsForm(title,fields,submit,description=''){
    const dialog=document.getElementById('pms-dialog');
    dialog.innerHTML=`<h2>${esc(title)}</h2><p class="pms-note">${esc(description)}</p><form class="pms-form"><div class="pms-error" hidden role="alert"></div>${fields.map(f=>`<label>${esc(f.label)}${f.type==='select'?`<select name="${f.name}" required>${f.options.map(o=>`<option value="${esc(o.value)}" ${String(o.value)===String(f.value)?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`:f.type==='textarea'?`<textarea name="${f.name}" required maxlength="2000">${esc(f.value)}</textarea>`:`<input name="${f.name}" type="${f.type}" ${f.type==='checkbox'?(f.value?'checked':''):'required'} ${f.type==='number'?'step="0.01"':''} value="${f.type==='checkbox'?'yes':esc(f.value)}">`}</label>`).join('')}<div class="pms-actions"><button class="pms-btn primary" type="submit">Xác nhận</button><button class="pms-btn" type="button" id="pms-cancel">Đóng</button></div></form>`;
    dialog.querySelector('#pms-cancel').onclick=closePmsDialog;
    dialog.querySelector('form').onsubmit=async e=>{
        e.preventDefault();const button=e.submitter;button.disabled=true;
        const data=Object.fromEntries(new FormData(e.target));fields.filter(f=>f.type==='checkbox').forEach(f=>data[f.name]=data[f.name]==='yes');
        try{await pmsWrite(()=>submit(data));closePmsDialog();refreshPms();}catch(error){const box=e.target.querySelector('[role=alert]');box.hidden=false;box.textContent=error.message;}finally{button.disabled=false;}
    };
    if(!dialog.open)dialog.showModal();
}
function refreshPms(){if(activeTab==='operations')renderOperations();else lamMoiTabHienTai();}
const originalSwitchTab=chuyenTab;
chuyenTab=function(tab){
    document.getElementById('tab-operations')?.classList.add('hidden');document.getElementById('btn-operations')?.classList.remove('bg-gray-700','text-white');
    if(tab!=='operations'){originalSwitchTab(tab);return;}
    if(!currentStaff)return;
    ['dashboard','rooms','bookings','technical','customers'].forEach(k=>{document.getElementById('tab-'+k)?.classList.add('hidden');document.getElementById('btn-'+k)?.classList.remove('bg-gray-700','text-white');});
    activeTab='operations';document.getElementById('tab-operations').classList.remove('hidden');document.getElementById('btn-operations').classList.add('bg-gray-700','text-white');document.getElementById('page-title').textContent='Các nghiệp vụ khác';capNhatHeaderActions('operations');renderOperations();
};
function renderOperations(){
    const d=pms.load(),date=d.extra.businessDate;
    const bs=d.bookings.filter(b=>b.TrangThai===HotelPMS.S.staying),pending=d.bookings.filter(b=>b.TrangThai===HotelPMS.S.pending);
    const bookingName=b=>`${b.MaPhong} · ${d.customers.find(c=>c.MaKH===b.MaKH)?.HoTen||b.MaKH}`;
    let body='';
    if(operationTab==='booking'){
        body=`<h3>Đặt phòng và nhận phòng</h3><div class="pms-actions">${pmsButton('Lập phiếu đặt phòng','reserve','','booking')}</div>`+pmsTable(['Khách / phòng','Lịch lưu trú','Cọc đã thu','Thao tác'],pending.map(b=>[esc(bookingName(b)),esc(b.NgayNhanDuKien+' → '+b.NgayTraDuKien),moneyLabel(b.TienCoc||0),`<div class="pms-actions">${pmsButton('Sửa lịch','edit',b.MaPDP,'booking')}${pmsButton('Thu cọc','deposit',b.MaPDP,'booking')}${pmsButton('Nhận phòng','checkin',b.MaPDP,'stay')}${pmsButton('Hủy / hoàn cọc','cancel',b.MaPDP,'booking')}</div>`]));
        body+='<h4>Yêu cầu của khách</h4>'+pmsTable(['Yêu cầu','Nội dung','Trạng thái','Phản hồi'],d.extra.requests.map(q=>[esc(q.booking+' · '+q.kind),esc(q.note),esc(q.status),q.status==='Chờ xử lý'?pmsButton('Phản hồi','request',q.id,'stay'):esc(q.response)]));
        body+='<h4>Khai báo tạm trú</h4>'+pmsTable(['Lượt ở','Khai báo','Thao tác'],bs.map(b=>[esc(bookingName(b)),esc(b.KhaiBaoTamTru?.status||'Chưa ghi nhận'),pmsButton('Ghi mã tiếp nhận','residence',b.MaPDP,'stay')]));
    }
    if(operationTab==='stay')body='<h3>Điều chỉnh trong kỳ lưu trú</h3>'+pmsTable(['Khách / phòng','Ngày trả','Chi phí','Nghiệp vụ'],bs.map(b=>[esc(bookingName(b)),esc(b.NgayTraDuKien),moneyLabel(pms.bill(b.MaPDP).total),`<div class="pms-actions">${pmsButton('Đổi phòng','move',b.MaPDP,'stay')}${pmsButton('Điều chỉnh giá','adjust',b.MaPDP,'approve')}${pmsButton('Sổ chi phí','invoice',b.MaPDP)}${pmsButton('Đổi ngày trả','departure',b.MaPDP,'stay')}</div>`]));
    if(operationTab==='service'){
        body='<h3>Dịch vụ và minibar</h3>'+pmsTable(['Khách / phòng','Công nợ còn lại','Ghi nhận'],bs.map(b=>[esc(bookingName(b)),moneyLabel(pms.bill(b.MaPDP).due),pmsButton('Gọi món / ghi minibar','service',b.MaPDP)]));
        body+='<h4>Danh mục và đơn giá</h4>'+pmsButton('Thêm dịch vụ','menu','','manage')+pmsTable(['Dịch vụ','Nhóm','Đơn giá',''],d.extra.menu.map(m=>[esc(m.name),esc(m.kind==='minibar'?'Minibar':'Dịch vụ'),moneyLabel(m.price),pmsButton('Sửa giá','menu',m.id,'manage')]));
        body+='<h4>Chi phí đã ghi nhận</h4>'+pmsTable(['Ngày','Lượt ở','Nội dung','Số tiền'],d.extra.lines.slice().reverse().map(x=>[esc(x.date),esc(x.booking),esc(x.label),moneyLabel(x.amount)]));
    }
    if(operationTab==='rooms'){
        body='<h3>Buồng phòng và kỹ thuật</h3>'+pmsButton('Báo sự cố','incident-new','','incident')+pmsTable(['Phòng','Trạng thái','Nghiệp vụ'],d.rooms.map(r=>[esc(r.MaPhong),esc(r.TrangThaiVeSinh),r.TrangThaiVeSinh===HotelPMS.S.dirty?pmsButton('Báo dọn xong','clean',r.MaPhong,'clean'):r.TrangThaiVeSinh===HotelPMS.S.inspect?pmsButton('Nghiệm thu / dọn lại','inspect',r.MaPhong,'inspect'):'—']));
        body+='<h4>Sự cố cần xử lý</h4>'+pmsTable(['Phòng','Nội dung','Trạng thái','Thao tác'],d.incidents.filter(i=>i.TrangThai!==HotelPMS.S.done).map(i=>[esc(i.MaPhong),esc(i.MoTa),esc(i.TrangThai),pmsButton('Xử lý bước tiếp','incident',i.MaSC)]));
    }
    if(operationTab==='checkout'){
        body='<h3>Kiểm phòng và tất toán</h3><p class="pms-note">Tiền dương: thu thêm. Tiền âm: hoàn lại cho khách. Hóa đơn chốt sau khi xác nhận giao dịch thành công.</p>'+pmsTable(['Khách / phòng','Kiểm phòng','Cần thu / hoàn','Nghiệp vụ'],bs.map(b=>[esc(bookingName(b)),b.KiemPhong?'Đã kiểm':'Chưa kiểm',moneyLabel(pms.bill(b.MaPDP).due),`<div class="pms-actions">${pmsButton('Kiểm phòng trả','room-check',b.MaPDP,'clean')}${pmsButton('Xem chi phí','invoice',b.MaPDP)}${pmsButton('Tất toán','checkout',b.MaPDP,'checkout')}</div>`]));
        body+='<h4>Hóa đơn đã tất toán</h4>'+pmsTable(['Hóa đơn','Ngày','Tổng tiền',''],d.extra.invoices.map(i=>[esc(i.id),esc(i.date),moneyLabel(i.total),pmsButton('Xem / in','invoice',i.booking)]));
    }
    if(operationTab==='audit'){
        if(!pms.can(currentStaff,'report')&&!pms.can(currentStaff,'audit'))body='<p>Bạn không có quyền xem kiểm toán và báo cáo quản trị.</p>';
        else{
            const issues=pms.auditIssues();
            body=`<h3>Kiểm toán ngày ${esc(date)}</h3><p class="pms-note">Khóa ngày ghi nhận doanh thu phòng của ngày đó một lần, lưu báo cáo và chuyển sang ngày kế tiếp. Tiền phòng trên hóa đơn không bị cộng trùng.</p><div class="pms-actions">${pmsButton('Khóa sổ và chuyển ngày','audit','','audit')}${pmsButton('Cấu hình giá / thuế / tín dụng','settings','','manage')}${pmsButton('Xuất báo cáo CSV','export-reports','','report')}</div>${issues.length?`<ul class="pms-error">${issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="pms-success">Không còn hồ sơ chặn khóa ngày.</p>'}`;
            body+='<h4>Báo cáo ngày đã khóa</h4>'+pmsTable(['Ngày','Tiền phòng','Dịch vụ / điều chỉnh','Thực thu / hoàn','Công suất'],d.extra.reports.slice().reverse().map(x=>[esc(x.date),moneyLabel(x.roomRevenue),moneyLabel(x.services),moneyLabel(x.receipts),x.occupancy+'%']));
            body+='<h4>Dự kiến công suất 7 ngày</h4>'+pmsTable(['Ngày','Phòng đã đặt / tổng','Công suất'],Array.from({length:7},(_,i)=>{let dt=date;for(let j=0;j<i;j++)dt=HotelPMS.nextDay(dt);const n=new Set(d.bookings.filter(b=>[HotelPMS.S.pending,HotelPMS.S.staying].includes(b.TrangThai)&&b.NgayNhanDuKien<=dt&&b.NgayTraDuKien>dt).map(b=>b.MaPhong)).size;return [dt,`${n} / ${d.rooms.length}`,d.rooms.length?Math.round(n/d.rooms.length*100)+'%':'0%'];}));
            body+='<h4>Nhật ký thao tác</h4>'+pmsTable(['Thời điểm','Nhân viên','Thao tác','Đối tượng'],d.extra.logs.slice(-100).reverse().map(l=>[esc(formatNgayGio(l.at)),esc(l.name),esc(l.action),esc(l.target)]));
        }
    }
    if(['booking','service','rooms'].includes(operationTab)){
        body+='<h4>Phiếu phối hợp: hành lý, đồ thất lạc, phân công, vật tư, bảo trì, đặt bàn</h4>'+pmsButton('Lập phiếu','task')+pmsTable(['Loại / ngày','Phòng','Nội dung','Trạng thái',''],d.extra.tasks.slice().reverse().map(t=>[esc(t.kind+' · '+(t.date||'')),esc(t.room),esc(t.note),esc(t.status),t.status==='Chờ xử lý'?pmsButton('Hoàn tất / duyệt','task-done',t.id):'—']));
    }
    if(operationTab==='service'&&pms.can(currentStaff,'report')){
        const services=d.extra.lines.filter(l=>['service','minibar'].includes(l.kind));
        body+='<h4>Chi phí nguyên liệu dịch vụ</h4>'+pmsTable(['Ngày','Dịch vụ','Doanh thu','Giá vốn đã khai báo'],services.map(l=>[esc(l.date),esc(l.label),moneyLabel(l.amount),moneyLabel(l.cost||0)]));
    }
    if(operationTab==='rooms')body+='<h4>Định mức vật tư mỗi phòng</h4>'+pmsButton('Thiết lập định mức','supply','','inspect')+pmsTable(['Vật tư','Định mức','Đơn vị','Đơn giá dự toán',''],d.extra.supplies.map(s=>[esc(s.name),s.par,esc(s.unit),moneyLabel(s.cost),pmsButton('Sửa','supply',s.id,'inspect')]));
    if(operationTab==='audit'&&pms.can(currentStaff,'report'))body+='<h4>Chiến dịch khuyến mãi</h4>'+pmsButton('Lập chiến dịch','promotion','','approve')+pmsTable(['Mã','Khoảng áp dụng','Giảm','Trạng thái',''],d.extra.promotions.map(p=>[esc(p.code),esc(p.start+' → '+p.end),p.percent+'%',esc(p.status),p.status==='Chờ duyệt'?pmsButton('Phê duyệt','approve-promotion',p.id,'manage'):'—']));
    document.getElementById('tab-operations').innerHTML=`<div class="pms-tabs">${Object.entries(groupNames).map(([k,v])=>`<button data-group="${k}" class="${operationTab===k?'selected':''}">${v}</button>`).join('')}</div><p class="pms-note">Ngày kinh doanh: <strong>${esc(date)}</strong> · ${esc(currentStaff?.HoTen||'')}</p><section class="pms-panel">${body}</section>`;
}
function pmsAction(action,bid){
    const d=pms.load(),b=d.bookings.find(x=>x.MaPDP===bid),actor=currentStaff;
    const active=d.bookings.filter(x=>x.TrangThai===HotelPMS.S.staying).map(x=>opt(x.MaPDP,x.MaPhong+' · '+x.MaPDP));
    const rooms=d.rooms.map(r=>opt(r.MaPhong,r.MaPhong+' · '+r.TrangThaiVeSinh));
    const yes=field('confirmed','Tôi đã đối chiếu và xác nhận','checkbox');
    if(action==='supply'){const s=d.extra.supplies.find(x=>x.id===bid);return pmsForm('Định mức vật tư mỗi phòng',[field('name','Tên vật tư','text',s?.name||''),field('par','Định mức mỗi phòng','number',s?.par||1),field('unit','Đơn vị','text',s?.unit||'cái'),field('cost','Đơn giá dự toán ($)','number',s?.cost||0)],p=>pms.supply(actor,{...p,id:bid||undefined}));}
    if(action==='promotion')return pmsForm('Lập chiến dịch khuyến mãi',[field('code','Mã khuyến mãi'),field('type','Hạng phòng','select','',d.types.map(t=>opt(t.MaLoaiPhong,t.TenLoai))),field('start','Ngày bắt đầu','date',d.extra.businessDate),field('end','Ngày kết thúc (ngày trả tối đa)','date',HotelPMS.nextDay(d.extra.businessDate)),field('percent','Giảm (%)','number',10)],p=>pms.promotion(actor,p));
    if(action==='approve-promotion')return pmsForm('Phê duyệt chiến dịch',[yes],p=>{if(!p.confirmed)throw Error('Cần xác nhận phê duyệt.');pms.approvePromotion(actor,bid);});
    if(action==='reserve')return pmsForm('Lập phiếu đặt phòng',[field('customer','Khách hàng','select','',d.customers.map(c=>opt(c.MaKH,c.HoTen))),field('type','Hạng phòng','select','',d.types.map(t=>opt(t.MaLoaiPhong,t.TenLoai))),field('start','Ngày nhận','date',d.extra.businessDate),field('end','Ngày trả','date',HotelPMS.nextDay(d.extra.businessDate)),field('count','Số phòng','number',1),field('guests','Số khách mỗi phòng','number',1),field('deposit','Tiền cọc đã thực thu ($)','number',0),field('note','Ghi chú','text','Đặt tại quầy')],p=>pms.reserve(actor,p));
    if(action==='edit')return pmsForm('Sửa lịch đặt phòng',[field('start','Ngày nhận','date',b.NgayNhanDuKien),field('end','Ngày trả','date',b.NgayTraDuKien),field('note','Ghi chú','text',b.GhiChu||'Điều chỉnh lịch')],p=>pms.editBooking(actor,bid,p));
    if(action==='deposit')return pmsForm('Ghi nhận cọc đã thu',[field('amount','Số tiền ($)','number',0)],p=>pms.deposit(actor,bid,p.amount));
    if(action==='cancel')return pmsForm('Hủy phiếu và hoàn cọc',[field('refund','Tiền cọc đã hoàn ($)','number',b.TienCoc||0),yes],p=>{if(!p.confirmed)throw Error('Cần xác nhận hủy và hoàn cọc.');return pms.cancel(actor,bid,p.refund);});
    if(action==='checkin')return pmsForm('Làm thủ tục nhận phòng',[field('identity','Số giấy tờ tùy thân'),field('nationality','Quốc tịch','text','Việt Nam'),field('key','Mã thẻ / quyền mở phòng đã cấp')],p=>pms.checkIn(actor,bid,p),'Đối chiếu giấy tờ trước khi nhận phòng. Ghi nhận mã tiếp nhận khai báo sau khi gửi qua kênh của khách sạn.');
    if(action==='residence')return pmsForm('Ghi nhận khai báo tạm trú',[field('ref','Mã tiếp nhận từ cơ quan tiếp nhận')],p=>pms.residence(actor,bid,p.ref));
    if(action==='move')return pmsForm('Đổi phòng lưu trú',[field('room','Phòng mới','select','',rooms.filter(r=>r.value!==b.MaPhong)),field('key','Mã thẻ mới đã cấp'),field('free','Duyệt nâng hạng miễn phí (quản lý)','checkbox'),field('reason','Lý do đổi phòng')],p=>pms.move(actor,bid,p),'Phòng mới phải trống và đã nghiệm thu. Phòng cũ chuyển sang chờ dọn; chi phí được tính theo từng giai đoạn.');
    if(action==='departure')return pmsForm('Điều chỉnh ngày trả',[field('end','Ngày trả mới','date',b.NgayTraDuKien),field('reason','Lý do')],p=>pms.departure(actor,bid,p.end,p.reason));
    if(action==='adjust')return pmsForm('Điều chỉnh sổ chi phí',[field('amount','Số tiền ($): âm để giảm, dương để tăng','number',0),field('reason','Lý do / căn cứ phê duyệt')],p=>pms.adjust(actor,bid,p.amount,p.reason));
    if(action==='service')return pmsForm('Ghi dịch vụ / minibar vào phòng',[field('item','Món / dịch vụ','select','',d.extra.menu.map(m=>opt(m.id,`${m.name} · ${moneyLabel(m.price)}`))),field('quantity','Số lượng','number',1),field('customer','Tên khách xác nhận'),field('confirmed','Khách đã xác nhận ký nợ','checkbox')],p=>pms.service(actor,bid,p));
    if(action==='clean')return pmsForm('Báo dọn xong phòng '+bid,[yes],p=>{if(!p.confirmed)throw Error('Cần xác nhận đã dọn xong.');pms.clean(actor,bid);});
    if(action==='inspect')return pmsForm('Nghiệm thu phòng '+bid,[field('passed','Phòng đạt vệ sinh và vật dụng','checkbox'),field('note','Kết quả kiểm tra')],p=>pms.inspect(actor,bid,p.passed,p.note));
    if(action==='room-check')return pmsForm('Kiểm phòng trả',[field('note','Kết quả kiểm phòng / minibar')],p=>pms.roomCheck(actor,bid,p.note),'Ghi mọi khoản tiêu hao minibar trước khi xác nhận kiểm phòng.');
    if(action==='checkout'){const bill=pms.bill(bid);return pmsForm('Tất toán lượt lưu trú',[field('amount','Số tiền thu (+) / hoàn (-) ($)','number',bill.due),field('method','Phương thức','select','Tiền mặt',['Tiền mặt','Thẻ','Chuyển khoản'].map(x=>opt(x,x))),field('ref','Mã giao dịch / chuẩn chi (tiền mặt nhập TM)','text','TM'),field('confirmed','Đã thu / hoàn tiền thành công','checkbox')],p=>pms.checkout(actor,bid,p),`Tổng ${moneyLabel(bill.total)} · Cọc ${moneyLabel(bill.deposit)} · Còn lại ${moneyLabel(bill.due)}`);}
    if(action==='invoice')return pmsInvoice(bid);
    if(action==='incident-new')return pmsForm('Báo sự cố thiết bị',[field('room','Phòng','select','',rooms),field('note','Mô tả sự cố','textarea')],p=>pms.reportIncident(actor,p));
    if(action==='incident'){
        const i=d.incidents.find(x=>x.MaSC===bid),chain=['Lễ tân đã báo kỹ thuật','Kỹ thuật đã báo quản lý','Quản lý đã duyệt sửa','Đang sửa chữa','Kỹ thuật báo đã sửa xong',HotelPMS.S.done],to=chain[chain.indexOf(i.TrangThai)+1];
        return pmsForm(to,[field('note','Nội dung xử lý / nghiệm thu','textarea')],p=>pms.incident(actor,bid,to,p.note));
    }
    if(action==='task')return pmsForm('Lập phiếu phối hợp',[field('kind','Loại phiếu','select','hanhly',[opt('hanhly','Hành lý'),opt('thatlac','Đồ thất lạc'),opt('donphong','Phân công dọn phòng'),opt('baotri','Bảo trì phòng ngừa'),opt('vattu','Đề xuất vật tư'),opt('datban','Đặt bàn / suất dịch vụ')]),field('room','Phòng','select','',rooms),field('assignee','Người phụ trách'),field('date','Ngày thực hiện','date',d.extra.businessDate),field('cost','Chi phí vật tư / dự toán ($)','number',0),field('note','Nội dung / số thẻ hành lý','textarea')],p=>pms.task(actor,p));
    if(action==='task-done')return pmsForm('Xác nhận hoàn tất / duyệt phiếu',[yes],p=>{if(!p.confirmed)throw Error('Cần xác nhận.');pms.completeTask(actor,bid);});
    if(action==='request')return pmsForm('Phản hồi yêu cầu của khách',[field('response','Kết quả xử lý / phản hồi','textarea')],p=>pms.resolveRequest(actor,bid,p.response),'Thực hiện nghiệp vụ tương ứng trước khi phản hồi hoàn tất cho khách.');
    if(action==='menu'){const item=d.extra.menu.find(x=>x.id===bid);return pmsForm('Danh mục dịch vụ',[field('name','Tên','text',item?.name||''),field('price','Đơn giá ($)','number',item?.price||0),field('cost','Giá vốn nguyên liệu / đơn vị ($)','number',item?.cost||0),field('kind','Nhóm','select',item?.kind||'service',[opt('service','Dịch vụ'),opt('minibar','Minibar')])],p=>pms.menu(actor,{...p,id:bid||undefined}));}
    if(action==='settings')return pmsForm('Giá phòng và tín dụng',[field('tax','Thuế (%)','number',d.extra.settings.tax),field('credit','Hạn mức tín dụng mặc định ($)','number',d.extra.settings.credit),field('type','Hạng phòng','select','',d.types.map(t=>opt(t.MaLoaiPhong,t.TenLoai))),field('floor','Giá sàn ($)','number',0),field('rate','Giá bán mới ($)','number',d.types[0]?.GiaTieuChuan||0)],p=>pms.settings(actor,p),'Giá mới áp dụng cho đặt phòng mới. Lịch giá đã chốt của khách đang ở được giữ nguyên.');
    if(action==='audit')return pmsForm('Khóa sổ ngày '+d.extra.businessDate,[field('date','Nhập ngày cần khóa để xác nhận','date',d.extra.businessDate),yes],p=>{if(!p.confirmed||p.date!==pms.load().extra.businessDate)throw Error('Ngày đã thay đổi hoặc chưa xác nhận.');pms.nightAudit(actor);});
    if(action==='export-reports'){if(!pms.can(actor,'report'))throw Error('Không có quyền.');downloadCSV('bao-cao-ngay.csv',[['Ngày','Tiền phòng','Dịch vụ','Thực thu / hoàn','Phòng sử dụng','Công suất %'],...d.extra.reports.map(x=>[x.date,x.roomRevenue,x.services,x.receipts,x.occupied,x.occupancy])]);}
}
function downloadCSV(name,rows){const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function pmsInvoice(bid){const i=pms.bill(bid),dialog=document.getElementById('pms-dialog');dialog.innerHTML=`<h2>${i.id?'Hóa đơn '+esc(i.id):'Sổ chi phí lưu trú'}</h2><p>${esc(i.booking)} · ${esc(i.room)}</p>${pmsTable(['Nội dung','Số tiền'],[['Tiền phòng',moneyLabel(i.roomTotal)],...i.lines.map(l=>[esc(l.label),moneyLabel(l.amount)]),['Thuế '+i.taxRate+'%',moneyLabel(i.tax)],['Tổng cộng',moneyLabel(i.total)],['Tiền cọc',moneyLabel(i.deposit)],['Cần thu / hoàn',moneyLabel(i.due)]])}<p class="pms-note">${i.payment?'Đã tất toán · '+esc(i.payment.method):'Chưa tất toán'}</p><div class="pms-actions"><button class="pms-btn" id="pms-print">In</button><button class="pms-btn" id="pms-close">Đóng</button></div>`;dialog.querySelector('#pms-close').onclick=closePmsDialog;dialog.querySelector('#pms-print').onclick=()=>window.print();if(!dialog.open)dialog.showModal();}
// Existing buttons must not bypass the new workflow checks.
checkIn=bid=>pmsAction('checkin',bid);
checkOut=rid=>{const b=pms.load().bookings.find(x=>x.MaPhong===rid&&x.TrangThai===HotelPMS.S.staying);if(b)pmsAction('checkout',b.MaPDP);else alert('Không tìm thấy lượt lưu trú.');};
huyDatPhong=bid=>pmsAction('cancel',bid);
donXong=rid=>pmsAction('clean',rid);
capNhatSuCoKyThuat=(iid,to,note)=>{pmsWrite(()=>pms.incident(currentStaff,iid,to,note||to)).then(refreshPms).catch(e=>alert(e.message));};
taoBaoCaoSuCo=async e=>{
    e.preventDefault();const button=e.submitter;button.disabled=true;
    try{const selected=document.getElementById('incident-room').value,isRoom=pms.load().rooms.some(r=>r.MaPhong===selected);
        await pmsWrite(()=>pms.reportIncident(currentStaff,{room:isRoom?selected:'',area:isRoom?'':selected,category:document.getElementById('incident-category').value,priority:document.getElementById('incident-priority').value,note:document.getElementById('incident-note').value}));e.target.reset();refreshPms();
    }catch(error){alert(error.message);}finally{button.disabled=false;}
};
const originalBookingButtons=taoNutDatPhong;
taoNutDatPhong=b=>originalBookingButtons(b)+(b.TrangThai===HotelPMS.S.staying?`<div class="pms-actions">${pmsButton('Chi tiết nghiệp vụ','open-stay',b.MaPDP)}</div>`:'');
document.addEventListener('click',e=>{
    const group=e.target.closest('[data-group]');if(group){operationTab=group.dataset.group;renderOperations();return;}
    const button=e.target.closest('[data-action]');if(!button)return;
    try{if(button.dataset.action==='open-stay'){operationTab='stay';chuyenTab('operations');}else pmsAction(button.dataset.action,button.dataset.id);}catch(error){alert(error.message);}
});
window.addEventListener('DOMContentLoaded',()=>{
    try{pms.recover();}catch(e){alert(e.message);return;}
    const roles=[['truongca','Trưởng tiền sảnh','Tiền sảnh'],['giamsattang','Giám sát tầng','Buồng phòng'],['phucvu','Nhân viên phục vụ','Dịch vụ'],['thungan','Thu ngân dịch vụ','Dịch vụ'],['kiemtoan','Kiểm toán đêm','Kế toán'],['hanhly','Nhân viên hành lý','Tiền sảnh']];
    const staff=docDuLieu('NhanVien');roles.forEach(([role,name,dept])=>{if(!staff.some(s=>s.ChucDanh===role))staff.push({MaNV:'NV_'+role,HoTen:name,PhongBan:dept,ChucDanh:role,pass:'123'});});luuDuLieu('NhanVien',staff);
    document.getElementById('sidebar-menu').insertAdjacentHTML('beforeend','<button id="btn-operations" class="role-all w-full text-left p-3 rounded sidebar-btn text-white" onclick="chuyenTab(\'operations\')">Các nghiệp vụ khác</button>');
    document.getElementById('tab-customers').insertAdjacentHTML('afterend','<div id="tab-operations" class="hidden"></div>');
    document.body.insertAdjacentHTML('beforeend','<dialog id="pms-dialog" class="pms-modal"></dialog>');
    document.querySelector('#login-screen>div').style.maxHeight='95vh';document.querySelector('#login-screen>div').style.overflowY='auto';
});
window.addEventListener('storage',e=>{if(currentStaff&&!document.getElementById('pms-dialog')?.open&&['Phong','PhieuDatPhong','SSA_Workflows_v1','SuCoKyThuat'].includes(e.key))refreshPms();});
