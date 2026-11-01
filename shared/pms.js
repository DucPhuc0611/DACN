/* Shared, framework-free hotel workflows. Storage is local to this browser/origin. */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.HotelPMS = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
    'use strict';
    const S = { pending: 'Chờ nhận phòng', staying: 'Đã nhận phòng', closed: 'Đã trả phòng', cancelled: 'Đã hủy', ready: 'Sẵn Sàng Đón Khách', using: 'Đang sử dụng', dirty: 'Chưa dọn', inspect: 'Chờ nghiệm thu', done: 'Quản lý xác nhận hoàn tất' };
    const permissions = {
        booking: ['letan', 'truongca'], stay: ['letan', 'truongca'], approve: ['truongca'],
        service: ['phucvu', 'thungan', 'letan'], minibar: ['buongphong', 'thungan'],
        clean: ['buongphong', 'giamsattang'], inspect: ['giamsattang'],
        repair: ['kythuat'], incident: ['letan', 'buongphong', 'giamsattang', 'kythuat'],
        checkout: ['letan', 'thungan', 'truongca'], audit: ['kiemtoan'], report: ['kiemtoan', 'truongca'],
        luggage: ['hanhly', 'letan'], lost: ['buongphong', 'giamsattang'], manage: []
    };
    const keys = { rooms: 'Phong', types: 'LoaiPhong', customers: 'KhachHang', bookings: 'PhieuDatPhong', incidents: 'SuCoKyThuat', extra: 'SSA_Workflows_v1' };
    const money = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
    const day = value => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) !== value) throw Error('Ngày không hợp lệ.');
        return Date.parse(value + 'T00:00:00Z');
    };
    const nights = (a, b) => { const n = (day(b) - day(a)) / 86400000; if (n <= 0) throw Error('Ngày trả phải sau ngày nhận.'); return n; };
    const overlap = (a, b, c, d) => day(a) < day(d) && day(c) < day(b);
    const nextDay = d => new Date(day(d) + 86400000).toISOString().slice(0, 10);
    const text = (v, label) => { const s = String(v ?? '').trim(); if (!s || s.length > 2000) throw Error('Cần nhập ' + label + ' (tối đa 2000 ký tự).'); return s; };
    const amount = (v, allowNegative = false) => { if (v === '' || v === null || !Number.isFinite(Number(v)) || (!allowNegative && Number(v) < 0) || Math.abs(Number(v)) > 1e9) throw Error('Số tiền không hợp lệ.'); return money(v); };
    const count = v => { if (!Number.isInteger(Number(v)) || Number(v) < 1 || Number(v) > 1000) throw Error('Số lượng phải là số nguyên dương.'); return Number(v); };
    function create(storage, clock = () => new Date()) {
        const today = () => { const d = clock(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
        const id = prefix => prefix + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
        const read = (key, fallback) => { const raw = storage.getItem(key); if (raw === null) return fallback; try { return JSON.parse(raw); } catch { throw Error('Dữ liệu lưu trữ bị lỗi: ' + key + '. Hãy khôi phục bản sao lưu.'); } };
        function load() {
            const data = Object.fromEntries(Object.entries(keys).filter(([k]) => k !== 'extra').map(([k, v]) => [k, read(v, [])]));
            data.extra = read(keys.extra, { version: 1, businessDate: today(), lines: [], payments: [], logs: [], reports: [], tasks: [], requests: [], invoices: [], settings: { tax: 0, credit: 2000 }, menu: [{ id: 'WATER', name: 'Nước suối', price: 2, kind: 'minibar' }, { id: 'BREAKFAST', name: 'Ăn sáng', price: 15, kind: 'service' }] });
            data.extra.promotions ||= []; data.extra.supplies ||= [];
            return data;
        }
        function can(actor, action) { return !!actor && (actor.ChucDanh === 'admin' || (permissions[action] || []).includes(actor.ChucDanh)); }
        function requireRole(actor, action) { if (!can(actor, action)) throw Error('Tài khoản không có quyền thực hiện nghiệp vụ này.'); }
        function booking(d, bid, status) { const b = d.bookings.find(x => x.MaPDP === bid); if (!b || (status && b.TrangThai !== status)) throw Error('Phiếu lưu trú không tồn tại hoặc trạng thái không phù hợp.'); return b; }
        function room(d, rid) { const r = d.rooms.find(x => x.MaPhong === rid); if (!r) throw Error('Không tìm thấy phòng.'); return r; }
        function blocked(d, rid) { return d.incidents.some(x => x.MaPhong === rid && x.TrangThai !== S.done); }
        function quote(d,p){
            const type=d.types.find(t=>t.MaLoaiPhong===p.type);if(!type)throw Error('Hạng phòng không tồn tại.');
            const n=nights(p.start,p.end),qty=count(p.count||1);let rate=amount(type.GiaTieuChuan);
            const code=String(p.promo||'').trim().toUpperCase();
            if(code){const promo=d.extra.promotions.find(x=>x.code===code&&x.status==='Đã duyệt');
                if(!promo||p.start<promo.start||p.end>promo.end||promo.type!==p.type)throw Error('Mã khuyến mãi chưa duyệt hoặc không áp dụng cho lịch/hạng phòng này.');
                rate=money(rate*(1-promo.percent/100));if(rate<(type.GiaSan||0))throw Error('Giá khuyến mãi thấp hơn giá sàn.');}
            const net=money(rate*n),tax=money(net*d.extra.settings.tax/100);
            return {rate,nights:n,quantity:qty,net:money(net*qty),tax:money(tax*qty),total:money((net+tax)*qty)};
        }
        function available(d, rid, start, end, except) {
            nights(start, end);
            const r = room(d, rid);
            return !blocked(d, rid) && r.TrangThaiVeSinh === S.ready && !d.bookings.some(b => b.MaPDP !== except && b.MaPhong === rid && [S.pending, S.staying].includes(b.TrangThai) && overlap(start, end, b.NgayNhanDuKien, b.NgayTraDuKien));
        }
        function schedule(b) { return b.LichGia || [{ start: b.NgayNhanDuKien, end: b.NgayTraDuKien, rate: Number(b.DonGia || 0), room: b.MaPhong }]; }
        function roomTotal(b) { return money(schedule(b).reduce((s, p) => s + nights(p.start, p.end) * p.rate, 0)); }
        function bill(d, bid) {
            const b = booking(d, bid);
            const fixed = d.extra.invoices.find(x => x.booking === bid);
            if (fixed) return fixed;
            const lines = d.extra.lines.filter(x => x.booking === bid);
            const base = roomTotal(b);
            const service = money(lines.reduce((s, x) => s + x.amount, 0));
            const subtotal = money(base + service);
            const taxRate = b.ThueSuat ?? d.extra.settings.tax;
            const tax = money(Math.max(0, subtotal) * taxRate / 100);
            const deposit = money(b.TienCoc || 0);
            return { booking: bid, room: b.MaPhong, customer: b.MaKH, periods: schedule(b), roomTotal: base, service, lines, tax, taxRate, total: money(subtotal + tax), deposit, due: money(subtotal + tax - deposit), date: d.extra.businessDate };
        }
        function log(d, actor, action, target, details, date) { d.extra.logs.push({ id: id('LOG-'), at: clock().toISOString(), date, actor: actor.MaNV || actor.MaKH, name: actor.HoTen, role: actor.ChucDanh || 'khachhang', action, target, details }); }
        function transaction(actor, action, target, run, permission = action) {
            if (permission) requireRole(actor, permission);
            const d = load(), actionDate=d.extra.businessDate;
            const result = run(d);
            log(d, actor, action, target, result || '', actionDate);
            // Write a recovery journal first: a failed quota write never leaves half a checkout.
            const previous = Object.fromEntries(Object.values(keys).map(k => [k, storage.getItem(k)]));
            storage.setItem('SSA_TransactionBackup', JSON.stringify(previous));
            try { for (const [k, name] of Object.entries(keys)) storage.setItem(name, JSON.stringify(d[k])); }
            catch (error) { for (const [k, v] of Object.entries(previous)) { if (v === null) storage.removeItem(k); else storage.setItem(k, v); } storage.removeItem('SSA_TransactionBackup'); throw error; }
            storage.removeItem('SSA_TransactionBackup');
            return result;
        }
        function recover() { const backup = read('SSA_TransactionBackup', null); if (backup) { for (const [k, v] of Object.entries(backup)) { if (v === null) storage.removeItem(k); else storage.setItem(k, v); } storage.removeItem('SSA_TransactionBackup'); } }
        function addLine(d, bid, label, value, kind, extra = {}) { const line = { id: id('CP-'), booking: bid, label, amount: money(value), kind, date: d.extra.businessDate, ...extra }; d.extra.lines.push(line); return line; }
        const api = { load, can, today, recover, available: (rid, a, b, except) => available(load(), rid, a, b, except), bill: bid => bill(load(), bid), quote:p=>quote(load(),p) };
        api.reserve = (actor, p) => transaction(actor, 'Đặt phòng', p.customer, d => {
            const customer = d.customers.find(x => x.MaKH === p.customer); if (!customer) throw Error('Khách hàng không tồn tại.');
            if (actor.MaKH && actor.MaKH !== p.customer) throw Error('Không được đặt thay tài khoản khác.');
            if (p.start < today() || p.start < d.extra.businessDate) throw Error('Ngày nhận phòng đã qua.');
            const n = nights(p.start, p.end), qty = count(p.count || 1), guests = count(p.guests);
            const type = d.types.find(x => x.MaLoaiPhong === p.type); if (!type || guests > type.SucChua) throw Error('Số khách mỗi phòng vượt sức chứa.');
            const rooms = d.rooms.filter(r => r.MaLoaiPhong === p.type && available(d, r.MaPhong, p.start, p.end)); if (rooms.length < qty) throw Error('Không đủ phòng trống trong thời gian đã chọn.');
            const deposit = actor.MaKH ? 0 : amount(p.deposit || 0), cents = Math.round(deposit * 100);
            const {rate}=quote(d,p);
            const bids = rooms.slice(0, qty).map((r, i) => {
                const bid = id('PDP-');
                d.bookings.push({ MaPDP: bid, MaKH: p.customer, MaPhong: r.MaPhong, MaLoaiPhong: p.type, NgayNhanDuKien: p.start, NgayTraDuKien: p.end, SoDem: n, SoKhach: guests, DonGia: rate, TongTienDuKien: money(n * rate), TienCoc: (Math.floor(cents / qty) + (i < cents % qty ? 1 : 0)) / 100, GhiChu: String(p.note || '').slice(0,2000), TrangThai: S.pending, NgayTao: clock().toISOString() });
                d.bookings.at(-1).ThueSuat = d.extra.settings.tax;
                d.bookings.at(-1).MaKhuyenMai=String(p.promo||'').trim().toUpperCase();
                if(d.bookings.at(-1).TienCoc>0)d.extra.payments.push({id:id('COC-'),booking:bid,date:d.extra.businessDate,amount:d.bookings.at(-1).TienCoc,method:'Tiền cọc',ref:''});
                return bid;
            });
            return bids;
        }, actor?.MaKH ? null : 'booking');
        api.editBooking = (actor, bid, p) => transaction(actor, 'Sửa đặt phòng', bid, d => {
            const b = booking(d, bid, S.pending); if (p.start < today() || p.start < d.extra.businessDate) throw Error('Ngày nhận phòng đã qua.');
            const n = nights(p.start, p.end); if (!available(d, b.MaPhong, p.start, p.end, bid)) throw Error('Phòng không khả dụng cho lịch mới.');
            if(b.MaKhuyenMai)quote(d,{type:b.MaLoaiPhong,start:p.start,end:p.end,promo:b.MaKhuyenMai});
            b.NgayNhanDuKien = p.start; b.NgayTraDuKien = p.end; b.SoDem = n; b.TongTienDuKien = money(n * b.DonGia); b.GhiChu = String(p.note || '').slice(0,2000);
        }, 'booking');
        api.cancel = (actor, bid, refund = 0) => transaction(actor, 'Hủy đặt phòng', bid, d => {
            const b = booking(d, bid, S.pending); if (amount(refund) !== money(b.TienCoc || 0)) throw Error('Phải xác nhận hoàn đúng tiền cọc đã thu.');
            b.TrangThai = S.cancelled; b.NgayHuy = clock().toISOString(); b.TienCocDaHoan = amount(refund);
            if (refund > 0) d.extra.payments.push({ id: id('TT-'), booking: bid, date: d.extra.businessDate, amount: -amount(refund), method: 'Hoàn cọc', ref: '' });
        }, 'booking');
        api.deposit = (actor, bid, value) => transaction(actor, 'Thu tiền cọc', bid, d => {
            const b = booking(d, bid); if (![S.pending, S.staying].includes(b.TrangThai)) throw Error('Phiếu đã đóng.');
            const v = amount(value); if (!v) throw Error('Tiền cọc phải lớn hơn 0.'); b.TienCoc = money(Number(b.TienCoc || 0) + v);
            d.extra.payments.push({ id: id('COC-'), booking: bid, date: d.extra.businessDate, amount: v, method: 'Tiền cọc', ref: '' }); return v;
        }, 'booking');
        api.checkIn = (actor, bid, p) => transaction(actor, 'Nhận phòng', bid, d => {
            const b = booking(d, bid, S.pending), r = room(d, b.MaPhong);
            if (d.extra.businessDate !== b.NgayNhanDuKien) throw Error('Ngày nhận phòng phải trùng ngày kinh doanh. Hãy sửa lịch đặt phòng trước.');
            if (!available(d, b.MaPhong, b.NgayNhanDuKien, b.NgayTraDuKien, bid)) throw Error('Phòng chưa sẵn sàng hoặc đang có sự cố/lịch trùng.');
            b.GiayTo = text(p.identity, 'số giấy tờ tùy thân'); b.KhaiBaoTamTru = { status: 'Chờ gửi', reference: '', nationality: text(p.nationality, 'quốc tịch') };
            b.QuyenMoPhong = text(p.key, 'mã thẻ/quyền mở phòng'); b.TrangThai = S.staying; b.NgayCheckIn = clock().toISOString(); b.LichGia = schedule(b); r.TrangThaiVeSinh = S.using;
            d.extra.tasks.push({ id: id('HL-'), kind: 'hanhly', booking: bid, room: r.MaPhong, note: 'Điều phối hành lý khi nhận phòng', status: 'Chờ xử lý' });
        }, 'stay');
        api.residence = (actor, bid, ref) => transaction(actor, 'Xác nhận khai báo tạm trú', bid, d => {
            const b = booking(d, bid, S.staying); b.KhaiBaoTamTru = { ...b.KhaiBaoTamTru, status: 'Đã gửi', reference: text(ref, 'mã tiếp nhận khai báo') };
        }, 'stay');
        api.move = (actor, bid, p) => transaction(actor, 'Đổi phòng lưu trú', bid, d => {
            const b = booking(d, bid, S.staying), old = room(d, b.MaPhong), dest = room(d, p.room), date = d.extra.businessDate;
            if (date < b.NgayNhanDuKien || date >= b.NgayTraDuKien || old.MaPhong === dest.MaPhong || !available(d, p.room, date, b.NgayTraDuKien, bid)) throw Error('Phòng mới không khả dụng cho thời gian còn lại.');
            const type = d.types.find(t => t.MaLoaiPhong === dest.MaLoaiPhong); if (b.SoKhach > type.SucChua) throw Error('Phòng mới không đủ sức chứa.');
            if (p.free) requireRole(actor, 'approve');
            const rate = p.free ? schedule(b).at(-1).rate : Number(type.GiaTieuChuan);
            b.LichGia = schedule(b).filter(s => s.start < date).map(s => ({ ...s, end: s.end > date ? date : s.end }));
            b.LichGia.push({ start: date, end: b.NgayTraDuKien, room: p.room, rate });
            const before = b.MaPhong; b.MaPhong = p.room; b.MaLoaiPhong = dest.MaLoaiPhong; b.DonGia = rate; b.TongTienDuKien = roomTotal(b); b.QuyenMoPhong = text(p.key, 'quyền mở phòng mới'); b.KiemPhong = null;
            old.TrangThaiVeSinh = S.dirty; dest.TrangThaiVeSinh = S.using; return { from: before, to: p.room, free: !!p.free, reason: text(p.reason, 'lý do đổi phòng') };
        }, 'stay');
        api.adjust = (actor, bid, value, reason) => transaction(actor, 'Điều chỉnh chi phí', bid, d => {
            booking(d, bid, S.staying); const v = amount(value, true),invoice=bill(d,bid); if (!v || money(invoice.roomTotal+invoice.service+v) < 0) throw Error('Điều chỉnh làm tổng chi phí không hợp lệ.');
            return addLine(d, bid, text(reason, 'lý do điều chỉnh'), v, 'adjustment');
        }, 'approve');
        api.departure = (actor, bid, end, reason) => transaction(actor, 'Đổi ngày trả phòng', bid, d => {
            const b=booking(d,bid,S.staying); nights(b.NgayNhanDuKien,end);
            if(end<d.extra.businessDate)throw Error('Không được thay đổi ngày đã khóa sổ.');
            if(d.bookings.some(x=>x.MaPDP!==bid&&x.MaPhong===b.MaPhong&&[S.pending,S.staying].includes(x.TrangThai)&&overlap(b.NgayNhanDuKien,end,x.NgayNhanDuKien,x.NgayTraDuKien)))throw Error('Lịch mới trùng đặt phòng khác.');
            const segments=schedule(b),oldEnd=b.NgayTraDuKien;
            b.LichGia=segments.filter(s=>s.start<end).map(s=>({...s,end:s.end>end?end:s.end}));
            if(end>oldEnd)b.LichGia.push({start:oldEnd,end,room:b.MaPhong,rate:segments.at(-1).rate});
            b.NgayTraDuKien=end;b.SoDem=nights(b.NgayNhanDuKien,end);b.TongTienDuKien=roomTotal(b);b.KiemPhong=null;
            if(bill(d,bid).roomTotal+bill(d,bid).service<0)throw Error('Ngày trả mới làm chi phí âm; hãy sửa khoản giảm trừ trước.');
            return {oldEnd,end,reason:text(reason,'lý do đổi ngày trả')};
        }, 'stay');
        api.service = (actor, bid, p) => transaction(actor, 'Ghi nợ dịch vụ', bid, d => {
            const b = booking(d, bid, S.staying), item = d.extra.menu.find(x => x.id === p.item); if (!item) throw Error('Dịch vụ không tồn tại.');
            requireRole(actor, item.kind === 'minibar' ? 'minibar' : 'service');
            const qty = count(p.quantity), v = money(item.price * qty);
            if (!p.confirmed) throw Error('Cần khách xác nhận ký nợ.');
            if (money(bill(d, bid).due + v * (1+(b.ThueSuat??d.extra.settings.tax)/100)) > (b.HanMuc ?? d.extra.settings.credit)) throw Error('Vượt hạn mức tín dụng của lượt lưu trú.');
            b.KiemPhong = null;
            return addLine(d, bid, item.name, v, item.kind, { quantity: qty, unitPrice: item.price, cost:money((item.cost||0)*qty), confirmedBy: text(p.customer, 'tên khách xác nhận') });
        }, null);
        api.clean = (actor, rid) => transaction(actor, 'Báo dọn xong', rid, d => { const r = room(d, rid); if (r.TrangThaiVeSinh !== S.dirty) throw Error('Phòng không ở trạng thái chờ dọn.'); r.TrangThaiVeSinh = S.inspect; }, 'clean');
        api.inspect = (actor, rid, passed, note) => transaction(actor, 'Nghiệm thu phòng', rid, d => {
            const r = room(d, rid); if (r.TrangThaiVeSinh !== S.inspect) throw Error('Phòng chưa báo dọn xong.');
            if (passed && blocked(d, rid)) throw Error('Phải đóng các sự cố trước khi nghiệm thu.');
            r.TrangThaiVeSinh = passed ? S.ready : S.dirty; r.NghiemThu = { by: actor.MaNV, at: clock().toISOString(), note: text(note, 'kết quả kiểm tra'), passed }; return r.NghiemThu;
        }, 'inspect');
        api.roomCheck = (actor, bid, note) => transaction(actor, 'Kiểm phòng trả', bid, d => { const b = booking(d, bid, S.staying); b.KiemPhong = { at: clock().toISOString(), by: actor.MaNV, note: text(note, 'kết quả kiểm phòng') }; }, 'clean');
        api.checkout = (actor, bid, p) => transaction(actor, 'Tất toán và trả phòng', bid, d => {
            const b = booking(d, bid, S.staying); if (!b.KiemPhong) throw Error('Chưa có kết quả kiểm phòng trả.');
            if (b.NgayTraDuKien !== d.extra.businessDate) throw Error('Chỉ tất toán vào ngày trả đã thỏa thuận.');
            const invoice = bill(d, bid); if (amount(p.amount, true) !== invoice.due) throw Error('Số tiền thu/hoàn không khớp công nợ.');
            if (!['Tiền mặt', 'Thẻ', 'Chuyển khoản'].includes(p.method)) throw Error('Phương thức thanh toán không hợp lệ.');
            if (!p.confirmed) throw Error('Chưa xác nhận đã thu/hoàn tiền thành công.');
            const ref = p.method === 'Tiền mặt' ? '' : text(p.ref, 'mã chuẩn chi/giao dịch');
            const pay = { id: id('TT-'), booking: bid, date: d.extra.businessDate, amount: invoice.due, method: p.method, ref };
            d.extra.payments.push(pay); d.extra.invoices.push({ ...invoice, id: id('HD-'), payment: pay, issuedAt: clock().toISOString() });
            b.TrangThai = S.closed; b.NgayCheckOut = clock().toISOString(); b.QuyenMoPhong = null; room(d, b.MaPhong).TrangThaiVeSinh = S.dirty; return invoice;
        }, 'checkout');
        api.reportIncident = (actor, p) => transaction(actor, 'Báo sự cố', p.room, d => {
            if(p.room)room(d,p.room);else text(p.area,'khu vực sự cố');
            const i = { MaSC: id('SC-'), MaPhong: p.room||'', KhuVuc:p.room?'':p.area, NhomSuCo:p.category||'Thiết bị', MoTa: text(p.note, 'mô tả sự cố'), MucDo:p.priority||'Cần xử lý', MaNVBao:actor.MaNV, TenNVBao:actor.HoTen, TrangThai: 'Lễ tân đã báo kỹ thuật', NgayTao: clock().toISOString(), LichSu: [] }; d.incidents.push(i); return i.MaSC;
        }, 'incident');
        api.incident = (actor, iid, to, note) => transaction(actor, 'Xử lý sự cố', iid, d => {
            const i = d.incidents.find(x => x.MaSC === iid); if (!i) throw Error('Không tìm thấy sự cố.');
            const chain = ['Lễ tân đã báo kỹ thuật','Kỹ thuật đã báo quản lý','Quản lý đã duyệt sửa','Đang sửa chữa','Kỹ thuật báo đã sửa xong',S.done];
            if (chain.indexOf(to) !== chain.indexOf(i.TrangThai) + 1) throw Error('Không thể bỏ qua bước xử lý sự cố.');
            requireRole(actor, [chain[2],chain[5]].includes(to) ? 'approve' : 'repair');
            i.TrangThai = to; i.NgayCapNhat = clock().toISOString(); (i.LichSu ||= []).push({ TrangThai: to, GhiChu: text(note, 'ghi chú xử lý'), MaNV: actor.MaNV, NgayTao: clock().toISOString() });
            if (to === S.done && i.MaPhong && room(d,i.MaPhong).TrangThaiVeSinh !== S.using) room(d,i.MaPhong).TrangThaiVeSinh = S.dirty;
        }, null);
        api.task = (actor, p) => transaction(actor, 'Lập phiếu nghiệp vụ', p.kind, d => {
            const rights = { hanhly:'luggage', thatlac:'lost', donphong:'inspect', baotri:'repair', vattu:'repair', datban:'service' };
            if (!rights[p.kind]) throw Error('Loại phiếu không hợp lệ.'); requireRole(actor, rights[p.kind]);
            if (p.room) room(d,p.room); if (p.booking) booking(d,p.booking);
            const t = { id: id('YC-'), kind: p.kind, room: p.room || '', booking: p.booking || '', note: text(p.note,'nội dung phiếu'), assignee: text(p.assignee,'người phụ trách'), date: p.date || d.extra.businessDate, cost: amount(p.cost || 0), status: 'Chờ xử lý' }; day(t.date); d.extra.tasks.push(t); return t.id;
        }, null);
        api.completeTask = (actor, tid) => transaction(actor, 'Hoàn tất phiếu', tid, d => {
            const t=d.extra.tasks.find(x=>x.id===tid); if (!t || t.status !== 'Chờ xử lý') throw Error('Phiếu đã đóng hoặc không tồn tại.');
            requireRole(actor, { hanhly:'luggage',thatlac:'lost',donphong:'inspect',baotri:'repair',vattu:'audit',datban:'service' }[t.kind]); t.status='Hoàn tất'; t.completedAt=clock().toISOString();
        }, null);
        api.menu = (actor, p) => transaction(actor, 'Cập nhật thực đơn', p.name, d => {
            if (!['service','minibar'].includes(p.kind)) throw Error('Nhóm dịch vụ không hợp lệ.');
            const item = { id: p.id || id('DV-'), name: text(p.name,'tên dịch vụ'), price: amount(p.price), cost:amount(p.cost||0), kind: p.kind };
            const idx=d.extra.menu.findIndex(x=>x.id===item.id); if(idx<0)d.extra.menu.push(item);else d.extra.menu[idx]=item;
        }, 'manage');
        api.promotion=(actor,p)=>transaction(actor,'Lập chiến dịch khuyến mãi',p.code,d=>{
            nights(p.start,p.end);if(p.start<d.extra.businessDate)throw Error('Ngày bắt đầu đã qua.');
            const code=text(p.code,'mã khuyến mãi').toUpperCase();if(!/^[A-Z0-9_-]{3,30}$/.test(code)||d.extra.promotions.some(x=>x.code===code))throw Error('Mã khuyến mãi trùng hoặc không hợp lệ (3–30 chữ/số).');
            const percent=amount(p.percent);if(percent<=0||percent>100)throw Error('Mức giảm phải lớn hơn 0 và tối đa 100%.');
            if(!d.types.some(x=>x.MaLoaiPhong===p.type))throw Error('Hạng phòng không tồn tại.');
            d.extra.promotions.push({id:id('KM-'),code,type:p.type,start:p.start,end:p.end,percent,status:'Chờ duyệt',createdBy:actor.MaNV});
        },'approve');
        api.approvePromotion=(actor,pid)=>transaction(actor,'Duyệt chiến dịch khuyến mãi',pid,d=>{
            const p=d.extra.promotions.find(x=>x.id===pid);if(!p||p.status!=='Chờ duyệt')throw Error('Chiến dịch không ở trạng thái chờ duyệt.');
            const t=d.types.find(x=>x.MaLoaiPhong===p.type);if(money(t.GiaTieuChuan*(1-p.percent/100))<(t.GiaSan||0))throw Error('Giá sau giảm thấp hơn giá sàn.');
            p.status='Đã duyệt';p.approvedBy=actor.MaNV;p.approvedAt=clock().toISOString();
        },'manage');
        api.supply=(actor,p)=>transaction(actor,'Thiết lập định mức vật tư',p.name,d=>{
            const name=text(p.name,'tên vật tư'),par=count(p.par),unit=text(p.unit,'đơn vị');
            const item={id:p.id||id('VT-'),name,par,unit,cost:amount(p.cost||0)};const i=d.extra.supplies.findIndex(x=>x.id===item.id);if(i<0)d.extra.supplies.push(item);else d.extra.supplies[i]=item;
        },'inspect');
        api.settings = (actor, p) => transaction(actor, 'Cấu hình giá và hạn mức', '', d => {
            const tax=amount(p.tax); if(tax>100)throw Error('Thuế phải từ 0 đến 100%.'); d.extra.settings={tax,credit:amount(p.credit)};
            if(p.type){ const t=d.types.find(x=>x.MaLoaiPhong===p.type); if(!t)throw Error('Hạng phòng không tồn tại.'); const floor=amount(p.floor),rate=amount(p.rate); if(rate<floor)throw Error('Giá bán phải từ giá sàn trở lên.'); t.GiaSan=floor;t.GiaTieuChuan=rate; }
        }, 'manage');
        api.auditIssues = () => {
            const d=load(),date=d.extra.businessDate,issues=[];
            for(const b of d.bookings){if(b.TrangThai===S.pending&&b.NgayNhanDuKien<=date)issues.push(b.MaPDP+': chưa nhận phòng/hủy');if(b.TrangThai===S.staying&&b.NgayTraDuKien<=date)issues.push(b.MaPDP+': chưa trả phòng');if(b.TrangThai===S.staying&&b.KhaiBaoTamTru?.status!=='Đã gửi')issues.push(b.MaPDP+': chưa xác nhận khai báo tạm trú');}
            return issues;
        };
        api.nightAudit = actor => transaction(actor, 'Kiểm toán đêm', '', d => {
            const issues=api.auditIssues(); if(issues.length)throw Error('Chưa thể khóa ngày: '+issues.join('; '));
            const date=d.extra.businessDate;if(d.extra.reports.some(x=>x.date===date))throw Error('Ngày này đã khóa sổ.');
            const staying=d.bookings.filter(b=>b.TrangThai===S.staying&&b.NgayNhanDuKien<=date&&b.NgayTraDuKien>date);
            let roomRevenue=0;
            for(const b of staying){const seg=schedule(b).find(s=>s.start<=date&&s.end>date);if(!seg)throw Error('Thiếu lịch giá: '+b.MaPDP);roomRevenue+=seg.rate;}
            const services=d.extra.lines.filter(x=>x.date===date).reduce((s,x)=>s+x.amount,0),payments=d.extra.payments.filter(x=>x.date===date).reduce((s,x)=>s+x.amount,0);
            const report={id:id('BC-'),date,roomRevenue:money(roomRevenue),services:money(services),receipts:money(payments),occupied:staying.length,totalRooms:d.rooms.length,occupancy:d.rooms.length?money(staying.length/d.rooms.length*100):0,by:actor.MaNV,at:clock().toISOString()};
            d.extra.reports.push(report);d.extra.businessDate=nextDay(date);return report;
        }, 'audit');
        api.request = (actor, bid, kind, note) => transaction(actor, 'Khách gửi yêu cầu', bid, d => {
            const b=booking(d,bid);if(!actor?.MaKH||b.MaKH!==actor.MaKH||![S.pending,S.staying].includes(b.TrangThai))throw Error('Không được gửi yêu cầu cho lượt lưu trú này.');
            if(!['Sửa / hủy đặt phòng','Đổi phòng','Dịch vụ','Trả phòng'].includes(kind))throw Error('Loại yêu cầu không hợp lệ.');
            const req={id:id('KHYC-'),booking:bid,kind,note:text(note,'nội dung yêu cầu'),status:'Chờ xử lý',at:clock().toISOString()};d.extra.requests.push(req);return req.id;
        }, null);
        api.resolveRequest = (actor, rid, response) => transaction(actor, 'Phản hồi yêu cầu khách', rid, d => {const req=d.extra.requests.find(x=>x.id===rid);if(!req||req.status!=='Chờ xử lý')throw Error('Yêu cầu đã được xử lý.');req.status='Đã phản hồi';req.response=text(response,'phản hồi');req.by=actor.MaNV;},'stay');
        return api;
    }
    return { create, S, nights, nextDay, money };
});
