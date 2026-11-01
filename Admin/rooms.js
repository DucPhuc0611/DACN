/* Live room inventory: presentation only; all mutations use the existing PMS workflows. */
const roomBoardFilters = { status: 'all', floor: 'all', search: '' };
const roomBoardStates = {
    ready: { label: 'Sẵn sàng', note: 'Phòng trống, đã sẵn sàng đón khách' },
    occupied: { label: 'Đang ở', note: 'Phòng đang được sử dụng' },
    dirty: { label: 'Chờ dọn', note: 'Cần vệ sinh trước khi nhận khách' },
    inspection: { label: 'Chờ kiểm tra', note: 'Đã dọn, cần nghiệm thu phòng' },
    maintenance: { label: 'Có sự cố', note: 'Cần xử lý sự cố trước khi nhận khách' },
    other: { label: 'Chưa xác định', note: 'Cần kiểm tra trạng thái phòng' }
};
const roomBoardIcon = (name) => {
    const paths = {
        search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
        arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
        floor: '<path d="M4 21V3h16v18M2 21h20M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3"/>',
        close: '<path d="m6 6 12 12M6 18 18 6"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};
function roomFloor(room) {
    const digits = String(room.MaPhong).match(/\d+/)?.[0];
    return digits?.length >= 3 ? String(Number(digits.slice(0, -2))) : 'other';
}
function roomFloorLabel(floor) { return floor === 'other' ? 'Khu vực khác' : 'Tầng ' + floor.padStart(2, '0'); }
function roomShortDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return 'Chưa có lịch';
    return value.slice(8, 10) + '/' + value.slice(5, 7);
}
function roomSearchText(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
}
function roomBoardData() {
    const data = pms.load();
    const date = data.extra.businessDate;
    const rooms = data.rooms.map(room => {
        const stay = data.bookings.find(b => b.MaPhong === room.MaPhong && b.TrangThai === BOOKING_CHECKED_IN);
        const arrivals = data.bookings.filter(b => b.MaPhong === room.MaPhong && b.TrangThai === BOOKING_PENDING)
            .sort((a, b) => a.NgayNhanDuKien.localeCompare(b.NgayNhanDuKien));
        const next = arrivals[0];
        const incidents = data.incidents.filter(i => i.MaPhong === room.MaPhong && i.TrangThai !== HotelPMS.S.done);
        let state = 'other';
        if (stay || room.TrangThaiVeSinh === ROOM_USING) state = 'occupied';
        else if (incidents.length) state = 'maintenance';
        else if (room.TrangThaiVeSinh === ROOM_READY) state = 'ready';
        else if (room.TrangThaiVeSinh === ROOM_DIRTY) state = 'dirty';
        else if (room.TrangThaiVeSinh === HotelPMS.S.inspect) state = 'inspection';
        return {
            ...room, state, floor: roomFloor(room), stay, next, incidents,
            customer: data.customers.find(c => c.MaKH === (stay || (room.TrangThaiVeSinh !== ROOM_USING ? next : null))?.MaKH),
            type: data.types.find(t => t.MaLoaiPhong === room.MaLoaiPhong)
        };
    }).sort((a, b) => a.MaPhong.localeCompare(b.MaPhong, 'vi', { numeric: true }));
    return { ...data, rooms, date };
}
function roomStateBadge(room) {
    return `<span class="room-status is-${room.state}"><span class="room-state-dot" aria-hidden="true"></span>${roomBoardStates[room.state].label}</span>`;
}
function roomCard(room, date) {
    let title = 'Chưa có lịch nhận phòng', detail = 'Có thể xem thông tin phòng';
    if (room.state === 'ready') detail = 'Sẵn sàng tiếp nhận khách';
    if (room.state === 'dirty') { title = 'Cần vệ sinh phòng'; detail = 'Chờ bộ phận buồng phòng'; }
    if (room.state === 'inspection') { title = 'Đã hoàn tất vệ sinh'; detail = 'Chờ giám sát nghiệm thu'; }
    if (room.state === 'maintenance') { title = `${room.incidents.length} sự cố đang mở`; detail = room.incidents[0].NhomSuCo || 'Chờ bộ phận kỹ thuật'; }
    if (room.state === 'occupied') { title = room.customer?.HoTen || 'Chưa liên kết hồ sơ khách'; detail = room.stay ? `${roomShortDate(room.stay.NgayNhanDuKien)} — ${roomShortDate(room.stay.NgayTraDuKien)} · ${room.stay.SoKhach || 1} khách` : 'Cần đối chiếu hồ sơ lưu trú'; }
    else if (room.next && room.state === 'ready') { title = room.customer?.HoTen || 'Khách đã đặt phòng'; detail = `Dự kiến đến ${roomShortDate(room.next.NgayNhanDuKien)} · ${room.next.SoKhach || 1} khách`; }
    const due = room.stay?.NgayTraDuKien <= date ? 'Đến hạn trả' : room.next?.NgayNhanDuKien === date ? 'Đến hôm nay' : '';
    return `<button type="button" class="room-card state-${room.state}" data-room-open="${esc(room.MaPhong)}" aria-label="Phòng ${esc(room.MaPhong)} · ${roomBoardStates[room.state].label} · Xem chi tiết">
        <span class="room-card-heading"><strong class="room-number">${esc(room.MaPhong)}</strong>${roomStateBadge(room)}</span>
        <span class="room-type">${esc(room.type?.TenLoai || 'Chưa phân hạng')}</span>
        <span class="room-card-stay"><span class="room-guest">${esc(title)}</span><span class="room-stay-detail">${esc(detail)}</span></span>
        <span class="room-card-bottom"><span>${room.incidents.length && room.state === 'occupied' ? '<span class="room-alert">Có sự cố</span>' : due ? `<span class="room-due">${due}</span>` : `${esc(room.type?.SucChua || '—')} khách tối đa`}</span><span class="room-open-label">Chi tiết ${roomBoardIcon('arrow')}</span></span>
    </button>`;
}
function renderRoomBoard() {
    const root = document.getElementById('tab-rooms');
    const data = roomBoardData();
    const floors = [...new Set(data.rooms.map(r => r.floor))].sort((a,b) => a.localeCompare(b, 'vi', { numeric: true }));
    root.innerHTML = `<div class="room-board">
        <div class="room-board-heading"><div><p class="room-eyebrow">Tiền sảnh & buồng phòng</p><h1>Sơ đồ phòng</h1><p class="room-subtitle">Tình trạng phòng, lịch lưu trú và công việc cần xử lý.</p></div><div class="room-board-heading-actions"><span class="room-business-date">Ngày kinh doanh<strong>${esc(data.date.split('-').reverse().join('/'))}</strong></span>${pmsButton('Đặt phòng mới', 'reserve', '', 'booking')}</div></div>
        <div class="room-overview" aria-label="Lọc theo trạng thái phòng">${[['all', 'Tất cả phòng'], ...Object.entries(roomBoardStates).filter(([k]) => k !== 'other' || data.rooms.some(r => r.state === 'other')).map(([k, v]) => [k, v.label])].map(([key, label]) => `<button type="button" data-room-status="${key}" class="room-metric ${key === roomBoardFilters.status ? 'is-selected' : ''}" aria-pressed="${key === roomBoardFilters.status}"><span class="room-metric-label">${key === 'all' ? '' : `<span class="room-state-dot is-${key}" aria-hidden="true"></span>`}${label}</span><strong>${key === 'all' ? data.rooms.length : data.rooms.filter(r => r.state === key).length}</strong></button>`).join('')}</div>
        <div class="room-toolbar"><label class="room-search">${roomBoardIcon('search')}<span class="sr-only">Tìm theo số phòng hoặc tên khách</span><input id="room-search" type="search" placeholder="Tìm số phòng, hạng phòng hoặc tên khách…" autocomplete="off" value="${esc(roomBoardFilters.search)}"></label><label class="room-floor-select"><span>Tầng</span><select id="room-floor" aria-label="Lọc theo tầng"><option value="all">Tất cả tầng</option>${floors.map(f => `<option value="${esc(f)}" ${roomBoardFilters.floor === f ? 'selected' : ''}>${roomFloorLabel(f)}</option>`).join('')}</select></label><span id="room-result-count" class="room-result-count" role="status" aria-live="polite"></span></div>
        <div id="room-floor-list"></div>
        <p class="room-board-footnote">Chọn một phòng để xem hồ sơ và các thao tác phù hợp với trạng thái hiện tại.</p>
    </div>`;
    renderRoomFloors(data);
}
function renderRoomFloors(data = roomBoardData()) {
    const search = roomSearchText(roomBoardFilters.search.trim());
    const matches = data.rooms.filter(r => (roomBoardFilters.status === 'all' || r.state === roomBoardFilters.status) && (roomBoardFilters.floor === 'all' || r.floor === roomBoardFilters.floor) && roomSearchText([r.MaPhong, r.type?.TenLoai, r.customer?.HoTen].join(' ')).includes(search));
    document.getElementById('room-result-count').textContent = `${matches.length} / ${data.rooms.length} phòng`;
    const groups = [...new Set(matches.map(r => r.floor))];
    document.getElementById('room-floor-list').innerHTML = groups.length ? groups.map(f => {
        const rooms = matches.filter(r => r.floor === f);
        return `<section class="room-floor-section" aria-label="${roomFloorLabel(f)}"><div class="room-floor-heading"><h2>${roomBoardIcon('floor')}${roomFloorLabel(f)}</h2><span>${rooms.length} phòng<span aria-hidden="true"> · </span>${rooms.filter(r => r.state === 'ready').length} sẵn sàng</span></div><div class="room-grid">${rooms.map(r => roomCard(r, data.date)).join('')}</div></section>`;
    }).join('') : '<div class="room-empty"><h2>Không tìm thấy phòng phù hợp</h2><p>Thử tìm bằng số phòng, tên khách hoặc thay đổi bộ lọc.</p><button type="button" class="pms-btn" data-room-reset>Bỏ bộ lọc</button></div>';
}
function openRoomDetails(id) {
    const data = roomBoardData(), room = data.rooms.find(r => r.MaPhong === id);
    if (!room) return;
    const dialog = document.getElementById('pms-dialog'), booking = room.stay || room.next;
    const rows = [['Hạng phòng', room.type?.TenLoai || '—'], ['Tầng', roomFloorLabel(room.floor)], ['Sức chứa', `${room.type?.SucChua || '—'} khách`], ['Trạng thái vệ sinh', room.TrangThaiVeSinh]];
    if (booking) rows.push([room.stay ? 'Khách đang ở' : 'Khách đặt phòng kế tiếp', data.customers.find(c => c.MaKH === booking.MaKH)?.HoTen || 'Chưa có hồ sơ'], [room.stay ? 'Lịch lưu trú' : 'Lịch đặt phòng kế tiếp', `${roomShortDate(booking.NgayNhanDuKien)} — ${roomShortDate(booking.NgayTraDuKien)}`], ['Số khách', String(booking.SoKhach || 1)]);
    let actions = '';
    if (room.state === 'ready' && room.next?.NgayNhanDuKien === data.date) actions += pmsButton('Nhận phòng', 'checkin', room.next.MaPDP, 'stay');
    if (room.stay) actions += pmsButton('Sổ chi phí', 'invoice', room.stay.MaPDP) + pmsButton('Đổi phòng', 'move', room.stay.MaPDP, 'stay') + pmsButton('Kiểm phòng trả', 'room-check', room.stay.MaPDP, 'clean') + pmsButton('Tất toán', 'checkout', room.stay.MaPDP, 'checkout');
    if (room.TrangThaiVeSinh === ROOM_DIRTY) actions += pmsButton('Báo dọn xong', 'clean', id, 'clean');
    if (room.TrangThaiVeSinh === HotelPMS.S.inspect) actions += pmsButton('Nghiệm thu phòng', 'inspect', id, 'inspect');
    const notes = room.incidents.length ? `<div class="room-detail-alert"><h3>Sự cố cần xử lý</h3>${room.incidents.map(i => `<p>${esc(i.MoTa)}<small>${esc(i.TrangThai)}</small></p>${pmsButton('Xem bước xử lý', 'incident', i.MaSC)}`).join('')}</div>` : '';
    dialog.classList.add('room-detail-dialog');
    dialog.setAttribute('aria-label', 'Thông tin và nghiệp vụ phòng');
    dialog.innerHTML = `<div class="room-detail-heading"><div><p class="room-eyebrow">Thông tin phòng</p><h2>${esc(id)}</h2>${roomStateBadge(room)}</div><button type="button" class="room-detail-close" aria-label="Đóng chi tiết phòng">${roomBoardIcon('close')}</button></div><dl class="room-detail-facts">${rows.map(([key,value])=>`<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${notes}${booking?.GhiChu ? `<div class="room-detail-note"><h3>Ghi chú lưu trú</h3><p>${esc(booking.GhiChu)}</p></div>` : ''}<div class="pms-actions">${actions}</div>`;
    dialog.querySelector('.room-detail-close').onclick = closePmsDialog;
    dialog.addEventListener('close', () => dialog.classList.remove('room-detail-dialog'), { once: true });
    if (!dialog.open) dialog.showModal();
}
document.addEventListener('input', event => {
    if (event.target.id !== 'room-search') return;
    roomBoardFilters.search = event.target.value;
    renderRoomFloors();
});
document.addEventListener('change', event => {
    if (event.target.id !== 'room-floor') return;
    roomBoardFilters.floor = event.target.value;
    renderRoomFloors();
});
document.addEventListener('click', event => {
    const status = event.target.closest('[data-room-status]');
    if (status) {
        roomBoardFilters.status = status.dataset.roomStatus;
        document.querySelectorAll('[data-room-status]').forEach(button => {
            const selected = button.dataset.roomStatus === roomBoardFilters.status;
            button.classList.toggle('is-selected', selected); button.setAttribute('aria-pressed', String(selected));
        });
        renderRoomFloors();
    }
    if (event.target.closest('[data-room-reset]')) { Object.assign(roomBoardFilters, { status: 'all', floor: 'all', search: '' }); renderRoomBoard(); }
    const card = event.target.closest('[data-room-open]');
    if (card) openRoomDetails(card.dataset.roomOpen);
});
