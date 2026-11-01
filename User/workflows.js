const guestPms = HotelPMS.create(localStorage);
async function guestWrite(run){if(navigator.locks)return navigator.locks.request('ssa-pms-write',run);return run();}
// Keep the booking form and room cards, use the same inventory checks as the PMS.
demPhongTrongKhoangNgay=(type,a,b)=>docDuLieu('Phong').filter(r=>r.MaLoaiPhong===type&&guestPms.available(r.MaPhong,a,b)).length;
timNhieuPhongTrong=(type,a,b,n)=>docDuLieu('Phong').filter(r=>r.MaLoaiPhong===type&&guestPms.available(r.MaPhong,a,b)).slice(0,n);
const originalPrepareBooking=chuanBiDatPhong;
chuanBiDatPhong=function(type){
    document.getElementById('bk-promo').value='';
    originalPrepareBooking(type);if(!docDuLieu('CurrentUser',null))return;
    const start=document.getElementById('bk-checkin'),end=document.getElementById('bk-checkout'),date=guestPms.load().extra.businessDate;
    if(start.value<date){start.min=date;start.value=date;end.min=HotelPMS.nextDay(date);end.value=end.min;capNhatTomTatDatPhong();}
};
capNhatTomTatDatPhong=function(){
    const type=document.getElementById('booking-room-id').value,start=document.getElementById('bk-checkin').value,end=document.getElementById('bk-checkout').value,qty=document.getElementById('bk-rooms').value;
    const summary=document.getElementById('booking-summary'),button=document.querySelector('#booking-form button[type=submit]');
    try{const count=demPhongTrongKhoangNgay(type,start,end),q=guestPms.quote({type,start,end,count:qty,promo:document.getElementById('bk-promo').value});
        document.getElementById('summary-nights').textContent=q.nights+' đêm · '+q.quantity+' phòng';document.getElementById('summary-price').textContent=formatTien(q.rate)+' / đêm';document.getElementById('summary-total').textContent=formatTien(q.total)+' (thuế '+formatTien(q.tax)+')';
        document.getElementById('bk-deposit').value=Math.min(q.total,Math.max(100,Math.round(q.total*.2)));document.getElementById('bk-rooms-max').value=count;document.getElementById('bk-rooms').max=Math.max(1,count);
        summary.classList.remove('hidden');button.disabled=q.quantity>count;button.title=button.disabled?'Không đủ phòng trống':'';document.getElementById('booking-validation')?.remove();
    }catch(error){summary.classList.add('hidden');button.disabled=true;let box=document.getElementById('booking-validation');if(!box){box=document.createElement('p');box.id='booking-validation';box.className='pms-error';summary.after(box);}box.textContent=error.message;}
};
xuLyDatPhong=async function(e){
    e.preventDefault();const user=docDuLieu('CurrentUser',null);if(!user){moModal('login-modal');return;}
    const button=e.submitter;button.disabled=true;
    try{
        const ids=await guestWrite(()=>guestPms.reserve(user,{customer:user.MaKH,type:document.getElementById('booking-room-id').value,start:document.getElementById('bk-checkin').value,end:document.getElementById('bk-checkout').value,guests:document.getElementById('bk-guests').value,count:document.getElementById('bk-rooms').value,note:document.getElementById('bk-note').value,promo:document.getElementById('bk-promo').value}));
        alert('Đặt phòng thành công!\nMã phiếu: '+ids.join(', ')+'\nTiền cọc chưa thu; vui lòng liên hệ lễ tân.');
        dongModal('booking-modal');document.getElementById('booking-form').reset();document.getElementById('booking-summary').classList.add('hidden');renderRooms();taiDuLieuProfile();
    }catch(error){alert(error.message);}finally{button.disabled=false;}
};
taiDuLieuProfile=function(){
    const user=docDuLieu('CurrentUser',null),list=document.getElementById('history-list');if(!list)return;
    if(!user){list.innerHTML='<p>Vui lòng đăng nhập để xem lịch sử.</p>';return;}
    document.getElementById('prof-name').textContent=user.HoTen;document.getElementById('prof-phone').textContent=user.SDT;document.getElementById('prof-email').textContent=user.Email;
    const d=guestPms.load(),bs=d.bookings.filter(b=>b.MaKH===user.MaKH).reverse();
    list.innerHTML=bs.map(b=>{const bill=guestPms.bill(b.MaPDP),active=[HotelPMS.S.pending,HotelPMS.S.staying].includes(b.TrangThai);return `<article class="pms-panel"><strong>${escapeHTML(b.MaPhong)} · ${escapeHTML(b.TrangThai)}</strong><p class="pms-note">${escapeHTML(b.NgayNhanDuKien)} → ${escapeHTML(b.NgayTraDuKien)}</p><p>Tổng chi phí: ${formatTien(bill.total)} · Cọc đã thu: ${formatTien(bill.deposit)}</p><p>${bill.id?'Đã tất toán':'Cần thu / hoàn'}: ${formatTien(bill.due)}</p>${bill.lines.map(l=>`<p class="pms-note">${escapeHTML(l.label)}: ${formatTien(l.amount)}</p>`).join('')}<p class="pms-note">${escapeHTML(b.GhiChu||'')}</p>${active?`<button class="pms-btn" data-guest-request="${escapeHTML(b.MaPDP)}">Gửi yêu cầu cho khách sạn</button>`:''}${d.extra.requests.filter(q=>q.booking===b.MaPDP).map(q=>`<p class="pms-note">${escapeHTML(q.kind)}: ${escapeHTML(q.note)} — ${escapeHTML(q.status)}${q.response?' · '+escapeHTML(q.response):''}</p>`).join('')}</article>`;}).join('')||'<p>Chưa có lượt lưu trú.</p>';
};
document.addEventListener('click',e=>{
    const button=e.target.closest('[data-guest-request]');if(!button)return;
    const dialog=document.getElementById('guest-request-dialog');
    dialog.innerHTML='<h2>Gửi yêu cầu cho khách sạn</h2><form class="pms-form"><label>Loại yêu cầu<select name="kind"><option>Sửa / hủy đặt phòng</option><option>Đổi phòng</option><option>Dịch vụ</option><option>Trả phòng</option></select></label><label>Nội dung<textarea name="note" required maxlength="2000"></textarea></label><p role="alert" class="pms-error" hidden></p><div class="pms-actions"><button type="submit" class="pms-btn primary">Gửi yêu cầu</button><button type="button" class="pms-btn" id="guest-close">Đóng</button></div></form>';
    dialog.querySelector('#guest-close').onclick=()=>dialog.close();
    dialog.querySelector('form').onsubmit=async event=>{event.preventDefault();event.submitter.disabled=true;try{const data=Object.fromEntries(new FormData(event.target));await guestWrite(()=>guestPms.request(docDuLieu('CurrentUser',null),button.dataset.guestRequest,data.kind,data.note));dialog.close();taiDuLieuProfile();}catch(err){const box=event.target.querySelector('[role=alert]');box.hidden=false;box.textContent=err.message;}finally{event.submitter.disabled=false;}};
    dialog.showModal();
});
window.addEventListener('DOMContentLoaded',()=>{guestPms.recover();document.body.insertAdjacentHTML('beforeend','<dialog id="guest-request-dialog" class="pms-modal"></dialog>');['bk-promo','bk-rooms'].forEach(id=>document.getElementById(id).addEventListener('input',capNhatTomTatDatPhong));});
window.addEventListener('storage',e=>{if(['PhieuDatPhong','SSA_Workflows_v1'].includes(e.key))taiDuLieuProfile();});
