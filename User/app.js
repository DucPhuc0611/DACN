// ==========================================
// 1. KHOI TAO DATABASE
// ==========================================
const ROOM_READY = 'Sẵn Sàng Đón Khách';
const BOOKING_ACTIVE_STATUSES = ['Chờ nhận phòng', 'Đã nhận phòng'];
const ONE_DAY = 24 * 60 * 60 * 1000;

const DEFAULT_CUSTOMERS = [
    {
        MaKH: 'KH01',
        username: 'phuc',
        password: '123',
        HoTen: 'Hoàng Gia Đức Phúc',
        SDT: '0901234567',
        Email: 'phuc@hutech.edu.vn'
    }
];

const DEFAULT_ROOM_TYPES = [
    {
        MaLoaiPhong: 'LP_KING',
        TenLoai: 'Phòng Tiêu Chuẩn King',
        GiaTieuChuan: 150,
        SucChua: 2,
        MoTa: 'Phòng King sang trọng với giường lớn, không gian ấm cúng và tầm nhìn thành phố. Thích hợp cho cặp đôi và khách công tác ngắn ngày.',
        DienTich: '34 m²',
        TienNghi: [
            'Giường King cao cấp',
            'Vòi sen đứng áp lực lớn',
            'Máy sấy tóc Dyson',
            'Smart TV 50"',
            'Mini bar và két an toàn',
            'Bàn làm việc',
            'Wifi tốc độ cao'
        ],
        img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=80'
    },
    {
        MaLoaiPhong: 'LP_TWIN',
        TenLoai: 'Phòng Cao Cấp Twin',
        GiaTieuChuan: 280,
        SucChua: 4,
        MoTa: 'Phòng Twin rộng rãi, hai giường độc lập, phù hợp gia đình nhỏ hoặc nhóm bạn.',
        DienTich: '42 m²',
        TienNghi: [
            'Hai giường Twin thoải mái',
            'Bàn làm việc riêng',
            'Tủ lạnh mini',
            'TV LED 48"',
            'Bàn ăn nhỏ',
            'Phòng tắm với bồn và vòi sen'
        ],
        img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80'
    },
    {
        MaLoaiPhong: 'LP_SUITE',
        TenLoai: 'SSA Executive Suite',
        GiaTieuChuan: 850,
        SucChua: 6,
        MoTa: 'Executive Suite cao cấp với phòng khách riêng, khu vực tiếp khách và các tiện ích VIP, phù hợp khách VIP hoặc đoàn gia đình.',
        DienTich: '85 m²',
        TienNghi: [
            'Phòng khách riêng',
            'Minibar cao cấp',
            'Dịch vụ phòng 24/7',
            'Bồn tắm nằm + vòi sen riêng',
            'Hệ thống âm thanh Bose',
            'Bàn làm việc lớn',
            'Két sắt cỡ lớn'
        ],
        img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80'
    }
];

const DEFAULT_ROOMS = [
    { MaPhong: 'P101', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P102', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P103', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P104', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P105', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: 'Chưa dọn' },
    { MaPhong: 'P106', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P201', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P202', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: 'Đang sử dụng' },
    { MaPhong: 'P203', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P204', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P205', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: 'Chưa dọn' },
    { MaPhong: 'P206', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P301', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P302', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P303', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: 'Chưa dọn' },
    { MaPhong: 'P304', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P401', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P402', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P403', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P501', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P502', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_READY }
];

function docDuLieu(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function luuDuLieu(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function initDB() {
    if (!localStorage.getItem('KhachHang')) luuDuLieu('KhachHang', DEFAULT_CUSTOMERS);
    if (!localStorage.getItem('LoaiPhong')) luuDuLieu('LoaiPhong', DEFAULT_ROOM_TYPES);
    if (!localStorage.getItem('Phong')) luuDuLieu('Phong', DEFAULT_ROOMS);
    if (!localStorage.getItem('PhieuDatPhong')) luuDuLieu('PhieuDatPhong', []);

    dongBoDuLieuMau();
}

function dongBoDanhSachTheoKhoa(storageKey, defaults, idField) {
    const currentItems = docDuLieu(storageKey);
    const mergedItems = defaults.map(defaultItem => {
        const currentItem = currentItems.find(item => item[idField] === defaultItem[idField]);
        return currentItem ? { ...defaultItem, ...currentItem } : defaultItem;
    });

    currentItems.forEach(currentItem => {
        if (!mergedItems.some(item => item[idField] === currentItem[idField])) {
            mergedItems.push(currentItem);
        }
    });

    luuDuLieu(storageKey, mergedItems);
}

function dongBoDuLieuMau() {
    dongBoDanhSachTheoKhoa('LoaiPhong', DEFAULT_ROOM_TYPES, 'MaLoaiPhong');
    dongBoDanhSachTheoKhoa('Phong', DEFAULT_ROOMS, 'MaPhong');
}

// ==========================================
// 2. HAM TIEN ICH
// ==========================================
function formatTien(value) {
    return `$${Number(value || 0).toLocaleString('en-US')}`;
}

function parseNgay(value) {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function formatNgayISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function tinhSoDem(checkIn, checkOut) {
    const start = parseNgay(checkIn);
    const end = parseNgay(checkOut);
    if (!start || !end || end <= start) return 0;
    return Math.round((end - start) / ONE_DAY);
}

function coTrungLich(lichAStart, lichAEnd, lichBStart, lichBEnd) {
    const aStart = parseNgay(lichAStart);
    const aEnd = parseNgay(lichAEnd);
    const bStart = parseNgay(lichBStart);
    const bEnd = parseNgay(lichBEnd);
    if (!aStart || !aEnd || !bStart || !bEnd) return false;
    return aStart < bEnd && bStart < aEnd;
}

function timLoaiPhong(maLoaiPhong) {
    return docDuLieu('LoaiPhong').find(roomType => roomType.MaLoaiPhong === maLoaiPhong);
}

function phongBiGiuTrongKhoangNgay(maPhong, checkIn, checkOut, bookings = docDuLieu('PhieuDatPhong')) {
    return bookings.some(booking => {
        const laPhieuDangHieuLuc = BOOKING_ACTIVE_STATUSES.includes(booking.TrangThai);
        return (
            booking.MaPhong === maPhong &&
            laPhieuDangHieuLuc &&
            coTrungLich(checkIn, checkOut, booking.NgayNhanDuKien, booking.NgayTraDuKien)
        );
    });
}

function demPhongSanSang(maLoaiPhong) {
    const rooms = docDuLieu('Phong');
    return rooms.filter(room => room.MaLoaiPhong === maLoaiPhong && room.TrangThaiVeSinh === ROOM_READY).length;
}

function demPhongTrongKhoangNgay(maLoaiPhong, checkIn, checkOut) {
    const rooms = docDuLieu('Phong');
    const bookings = docDuLieu('PhieuDatPhong');
    return rooms.filter(room => (
        room.MaLoaiPhong === maLoaiPhong &&
        room.TrangThaiVeSinh === ROOM_READY &&
        !phongBiGiuTrongKhoangNgay(room.MaPhong, checkIn, checkOut, bookings)
    )).length;
}

function timNhieuPhongTrong(maLoaiPhong, checkIn, checkOut, count) {
    const rooms = docDuLieu('Phong');
    const bookings = docDuLieu('PhieuDatPhong');
    return rooms.filter(room => (
        room.MaLoaiPhong === maLoaiPhong &&
        room.TrangThaiVeSinh === ROOM_READY &&
        !phongBiGiuTrongKhoangNgay(room.MaPhong, checkIn, checkOut, bookings)
    )).slice(0, count);
}

// ==========================================
// 3. GIAO DIEN & TAI KHOAN
// ==========================================
let loaiPhongChoDangNhap = null;
let boLocHangPhong = 'all';

function hienThiTrangKhachHang() {
    const bookingTop = document.getElementById('booking').getBoundingClientRect().top;
    const navHeight = document.querySelector('.site-nav').offsetHeight;
    const dangDatPhong = bookingTop <= navHeight + 30;
    ['nav-home', 'nav-booking'].forEach(id => {
        const active = (id === 'nav-booking') === dangDatPhong;
        const link = document.getElementById(id);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function renderHomeRooms() {
    const container = document.getElementById('home-room-list');
    if (!container) return;
    container.replaceChildren();

    docDuLieu('LoaiPhong').slice(0, 3).forEach((roomType, index) => {
        const card = document.createElement('article');
        card.className = 'home-room-card';

        const image = document.createElement('img');
        image.src = roomType.img || 'assets/hotel-hero.webp';
        image.alt = roomType.TenLoai || 'Hạng phòng SSA Hotel';
        image.loading = 'lazy';
        card.append(image);

        const copy = document.createElement('div');
        copy.className = 'home-room-copy';
        const label = document.createElement('span');
        label.className = 'eyebrow';
        label.textContent = `Không gian 0${index + 1}`;
        const title = document.createElement('h3');
        title.textContent = roomType.TenLoai;
        const detail = document.createElement('p');
        detail.textContent = `${roomType.DienTich || 'Phòng nghỉ'} · Tối đa ${roomType.SucChua || 2} khách`;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'text-link';
        const available = demPhongSanSang(roomType.MaLoaiPhong) > 0;
        button.textContent = available ? 'Xem hạng phòng ↗' : 'Xem các lựa chọn khác ↗';
        button.addEventListener('click', () => {
            window.location.hash = 'booking';
            document.getElementById('booking')?.scrollIntoView();
        });
        copy.append(label, title, detail, button);
        card.append(copy);
        container.append(card);
    });
}

function tiepTucDatPhongSauDangNhap() {
    if (!loaiPhongChoDangNhap) return;
    const maLoaiPhong = loaiPhongChoDangNhap;
    loaiPhongChoDangNhap = null;
    chuanBiDatPhong(maLoaiPhong);
}

function ngayKeTiep(value) {
    if (!value) return '';
    const date = parseNgay(value);
    date.setDate(date.getDate() + 1);
    return formatNgayISO(date);
}

function khoiTaoTimPhong() {
    const today = formatNgayISO(new Date());
    const businessDate = typeof guestPms !== 'undefined' ? guestPms.load().extra.businessDate : today;
    const start = businessDate > today ? businessDate : today;
    const checkIn = document.getElementById('search-checkin');
    const checkOut = document.getElementById('search-checkout');
    checkIn.min = start;
    checkIn.value = start;
    checkOut.min = ngayKeTiep(start);
    checkOut.value = ngayKeTiep(start);

    checkIn.addEventListener('change', () => {
        checkOut.min = ngayKeTiep(checkIn.value);
        if (checkOut.value <= checkIn.value) checkOut.value = checkOut.min;
        renderRooms();
    });
    ['search-checkout', 'search-rooms', 'search-adults', 'search-children'].forEach(id => {
        document.getElementById(id).addEventListener('change', renderRooms);
    });
    document.getElementById('stay-search').addEventListener('submit', event => {
        event.preventDefault();
        renderRooms();
        document.getElementById('room-list-container').scrollIntoView({ block: 'start' });
    });
    document.querySelector('.room-category-tabs').addEventListener('click', event => {
        const button = event.target.closest('[data-room-category]');
        if (!button) return;
        boLocHangPhong = button.dataset.roomCategory;
        document.querySelectorAll('[data-room-category]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
        renderRooms();
    });
    document.getElementById('room-list-container').addEventListener('click', event => {
        const bookButton = event.target.closest('[data-book-room]');
        const detailButton = event.target.closest('[data-room-detail]');
        if (bookButton) chuanBiDatPhong(bookButton.dataset.bookRoom);
        if (detailButton) openRoomModal(detailButton.dataset.roomDetail);
    });
}

function layTieuChiTimPhong() {
    const start = document.getElementById('search-checkin').value;
    const end = document.getElementById('search-checkout').value;
    const rooms = Number(document.getElementById('search-rooms').value);
    const adults = Number(document.getElementById('search-adults').value);
    const children = Number(document.getElementById('search-children').value);
    const nights = tinhSoDem(start, end);
    const minDate = document.getElementById('search-checkin').min;
    const valid = Boolean(start && end && start >= minDate && nights > 0 && rooms >= 1 && rooms <= 5 && adults >= 1 && adults <= 6 && children >= 0 && children <= 5);
    return { start, end, rooms, adults, children, nights, valid };
}

function renderRooms() {
    const container = document.getElementById('room-list-container');
    if (!container) return;

    const search = layTieuChiTimPhong();
    const feedback = document.getElementById('search-feedback');
    if (!search.valid) {
        feedback.textContent = 'Vui lòng chọn ngày trả sau ngày nhận và nhập số phòng, số khách hợp lệ.';
        container.replaceChildren();
        return;
    }
    const roomTypes = docDuLieu('LoaiPhong').filter(roomType => {
        const isSuite = roomType.MaLoaiPhong === 'LP_SUITE' || /suite/i.test(roomType.TenLoai || '');
        return boLocHangPhong === 'all' || (boLocHangPhong === 'suite') === isSuite;
    });
    feedback.textContent = `${roomTypes.length} hạng phòng · ${search.nights} đêm · ${search.rooms} phòng · ${search.adults + search.children} khách/phòng`;
    if (!roomTypes.length) {
        container.innerHTML = '<p class="room-empty-message">Chưa có hạng phòng trong nhóm này. Vui lòng chọn nhóm khác.</p>';
        return;
    }
    container.innerHTML = roomTypes.map(roomType => {
        const availableCount = demPhongTrongKhoangNgay(roomType.MaLoaiPhong, search.start, search.end);
        const disabled = availableCount < search.rooms || search.adults + search.children > Number(roomType.SucChua || 2);
        const amenities = Array.isArray(roomType.TienNghi) ? roomType.TienNghi.slice(0, 3) : [];
        const maLoaiPhong = escapeHTML(roomType.MaLoaiPhong);

        return `
        <article class="booking-room-card" data-room-id="${maLoaiPhong}">
            <div class="booking-room-photo">
                <img src="${escapeHTML(roomType.img || 'assets/hotel-hero.webp')}" alt="${escapeHTML(roomType.TenLoai)}" loading="lazy">
            </div>
            <div class="booking-room-content">
                <span class="eyebrow">${escapeHTML(roomType.DienTich || 'Phòng nghỉ')} · tối đa ${Number(roomType.SucChua || 2)} khách/phòng</span>
                <h3>${escapeHTML(roomType.TenLoai)}</h3>
                <p class="booking-room-description">${escapeHTML(roomType.MoTa || 'Không gian lưu trú tại SSA Hotel.')}</p>
                <ul class="booking-room-amenities">${amenities.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
                <button type="button" class="booking-details-link" data-room-detail="${maLoaiPhong}">Xem chi tiết phòng <span aria-hidden="true">↗</span></button>
            </div>
            <div class="booking-room-rate">
                <span class="eyebrow">Giá tiêu chuẩn</span>
                <strong>${formatTien(roomType.GiaTieuChuan)}</strong><small>/ phòng / đêm</small>
                <p>${availableCount} phòng sẵn sàng trong ngày đã chọn</p>
                <button type="button" data-book-room="${maLoaiPhong}" ${disabled ? 'disabled' : ''}>${disabled ? 'Không phù hợp / hết phòng' : 'Chọn hạng phòng'}</button>
                <span class="rate-note">Thuế và ưu đãi được tính ở bước tiếp theo.</span>
                </div>
        </article>`;
    }).join('');
}

function moModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    if (id === 'profile-modal') taiDuLieuProfile();
    if (id === 'login-modal') document.getElementById('login-error')?.classList.add('hidden');
    if (id === 'register-modal') document.getElementById('register-error')?.classList.add('hidden');

    modal.classList.remove('hidden');
}

function dongModal(id) {
    document.getElementById(id)?.classList.add('hidden');
}

function moDangKyTuDangNhap() {
    dongModal('login-modal');
    moModal('register-modal');
}

function moDangNhapTuDangKy() {
    dongModal('register-modal');
    moModal('login-modal');
}

function checkLoginStatus() {
    const currentUser = docDuLieu('CurrentUser', null);
    const guestMenu = document.getElementById('menu-guest');
    const userMenu = document.getElementById('menu-user');
    const displayName = document.getElementById('display-name');

    if (currentUser) {
        guestMenu?.classList.add('hidden');
        userMenu?.classList.remove('hidden');
        if (displayName) displayName.innerText = currentUser.HoTen.split(' ').pop();
    } else {
        guestMenu?.classList.remove('hidden');
        userMenu?.classList.add('hidden');
        if (displayName) displayName.innerText = '';
    }
    window.dispatchEvent(new Event('ssa-auth-change'));
}

function xuLyDangNhap(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const users = docDuLieu('KhachHang');
    const user = users.find(item => String(item.username || '').toLowerCase() === username && item.password === password);

    if (!user) {
        document.getElementById('login-error')?.classList.remove('hidden');
        return;
    }

    const { password: _matKhau, ...safeUser } = user;
    luuDuLieu('CurrentUser', safeUser);
    document.getElementById('login-form')?.reset();
    document.getElementById('login-error')?.classList.add('hidden');
    dongModal('login-modal');
    checkLoginStatus();
    taiDuLieuProfile();
    tiepTucDatPhongSauDangNhap();
}

function taoMaKhachHangMoi(users) {
    const maxNumber = users.reduce((max, user) => {
        const match = String(user.MaKH || '').match(/^KH(\d+)$/);
        return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    return `KH${String(maxNumber + 1).padStart(2, '0')}`;
}

function hienLoiDangKy(message) {
    const error = document.getElementById('register-error');
    if (!error) return;

    error.innerText = message;
    error.classList.remove('hidden');
}

function xuLyDangKy(e) {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const username = document.getElementById('reg-username').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-password-confirm').value;
    const error = document.getElementById('register-error');
    const users = docDuLieu('KhachHang');

    error?.classList.add('hidden');

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        hienLoiDangKy('Tên đăng nhập chỉ dùng chữ, số, dấu gạch dưới và dài 3-20 ký tự.');
        return;
    }

    if (password !== confirmPassword) {
        hienLoiDangKy('Mật khẩu nhập lại chưa khớp.');
        return;
    }

    const isUsernameUsed = users.some(user => String(user.username || '').toLowerCase() === username);
    if (isUsernameUsed) {
        hienLoiDangKy('Tên đăng nhập này đã tồn tại. Vui lòng chọn tên khác.');
        return;
    }

    const newUser = {
        MaKH: taoMaKhachHangMoi(users),
        username,
        password,
        HoTen: name,
        SDT: phone,
        Email: email
    };

    users.push(newUser);
    luuDuLieu('KhachHang', users);

    const { password: _matKhau, ...safeUser } = newUser;
    luuDuLieu('CurrentUser', safeUser);

    document.getElementById('register-form')?.reset();
    dongModal('register-modal');
    checkLoginStatus();
    taiDuLieuProfile();

    alert(`Đăng ký thành công! Chào mừng ${name} đến với SSA Hotel.`);
    tiepTucDatPhongSauDangNhap();
}

function xuLyDangXuat() {
    loaiPhongChoDangNhap = null;
    localStorage.removeItem('CurrentUser');
    checkLoginStatus();
    taiDuLieuProfile();
    alert('Đã đăng xuất thành công!');
}

function taiDuLieuProfile() {
    const user = docDuLieu('CurrentUser', null);
    const historyList = document.getElementById('history-list');

    if (!user) {
        if (document.getElementById('prof-name')) document.getElementById('prof-name').innerText = '---';
        if (document.getElementById('prof-phone')) document.getElementById('prof-phone').innerText = '---';
        if (document.getElementById('prof-email')) document.getElementById('prof-email').innerText = '---';
        if (historyList) historyList.innerHTML = '<p class="text-sm text-gray-400 italic mt-4">Vui lòng đăng nhập để xem lịch sử lưu trú.</p>';
        return;
    }

    document.getElementById('prof-name').innerText = user.HoTen;
    document.getElementById('prof-phone').innerText = user.SDT;
    document.getElementById('prof-email').innerText = user.Email;

    const bookings = docDuLieu('PhieuDatPhong')
        .filter(booking => booking.MaKH === user.MaKH)
        .reverse();

    if (bookings.length === 0) {
        historyList.innerHTML = '<p class="text-sm text-gray-400 italic mt-4">Chưa có giao dịch lưu trú nào.</p>';
    } else {
        historyList.innerHTML = bookings.map(booking => {
            const roomType = timLoaiPhong(booking.MaLoaiPhong);
            const nights = booking.SoDem || tinhSoDem(booking.NgayNhanDuKien, booking.NgayTraDuKien);
            const total = booking.TongTienDuKien || (roomType?.GiaTieuChuan || 0) * nights;

            return `
            <div class="bg-gray-50 p-4 border flex justify-between items-center gap-4 mb-2">
                <div>
                    <p class="font-serif text-lg text-dark">${roomType?.TenLoai || 'Phòng SSA'} (Phòng ${booking.MaPhong})</p>
                    <p class="text-xs text-gray-500">Nhận: ${booking.NgayNhanDuKien} - Trả: ${booking.NgayTraDuKien}</p>
                    <p class="text-xs text-gray-500">${nights} đêm · ${booking.SoKhach || 1} khách · Tổng dự kiến ${formatTien(total)}</p>
                    ${booking.GhiChu ? `<p class="text-xs text-gray-500 mt-2">Ghi chú: ${booking.GhiChu}</p>` : ''}
                </div>
                <span class="shrink-0 text-[10px] font-bold uppercase text-gold border border-gold px-2 py-1">${booking.TrangThai}</span>
            </div>`;
        }).join('');
    }
}

// ==========================================
// 4. NGHIEP VU DAT PHONG
// ==========================================
function chuanBiDatPhong(maLoaiPhong) {
    const user = docDuLieu('CurrentUser', null);
    if (!user) {
        loaiPhongChoDangNhap = maLoaiPhong;
        alert('Vui lòng đăng nhập để đặt phòng!');
        moModal('login-modal');
        return;
    }

    const roomType = timLoaiPhong(maLoaiPhong);
    if (!roomType) {
        alert('Không tìm thấy hạng phòng này.');
        return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const search = layTieuChiTimPhong();
    const checkInDate = search.valid ? search.start : formatNgayISO(today);
    const checkOutDate = search.valid ? search.end : formatNgayISO(tomorrow);

    document.getElementById('booking-room-id').value = maLoaiPhong;
    document.getElementById('booking-room-name').innerText = roomType.TenLoai;
    const roomImage = document.getElementById('booking-room-image');
    roomImage.src = roomType.img || 'assets/hotel-hero.webp';
    roomImage.alt = roomType.TenLoai;
    document.getElementById('booking-room-facts').textContent = `${roomType.DienTich || 'Phòng nghỉ'} · Tối đa ${roomType.SucChua || 2} khách/phòng`;
    document.getElementById('booking-room-description').textContent = roomType.MoTa || '';
    document.getElementById('booking-room-amenities').replaceChildren(...(Array.isArray(roomType.TienNghi) ? roomType.TienNghi.slice(0, 5) : []).map(item => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
    }));
    document.getElementById('bk-name').value = user.HoTen;
    document.getElementById('bk-phone').value = user.SDT;
    document.getElementById('bk-email').value = user.Email;
    document.getElementById('bk-note') && (document.getElementById('bk-note').value = '');
    const roomsInput = document.getElementById('bk-rooms');
    const roomsMaxField = document.getElementById('bk-rooms-max');
    if (roomsInput) {
        const avail = demPhongTrongKhoangNgay(maLoaiPhong, checkInDate, checkOutDate);
        roomsInput.value = search.valid ? search.rooms : 1;
        roomsInput.max = Math.max(1, avail);
        if (roomsMaxField) roomsMaxField.value = avail;
    }

    const checkInInput = document.getElementById('bk-checkin');
    const checkOutInput = document.getElementById('bk-checkout');
    const guestsInput = document.getElementById('bk-guests');

    checkInInput.min = formatNgayISO(today);
    checkOutInput.min = ngayKeTiep(checkInDate);
    checkInInput.value = checkInDate;
    checkOutInput.value = checkOutDate;

    guestsInput.max = roomType.SucChua || 6;
    guestsInput.value = Math.min(search.valid ? search.adults + search.children : 2, roomType.SucChua || 6);

    capNhatTomTatDatPhong();
    moModal('booking-modal');
}

function capNhatTomTatDatPhong() {
    const maLoaiPhong = document.getElementById('booking-room-id')?.value;
    const roomType = timLoaiPhong(maLoaiPhong);
    const checkIn = document.getElementById('bk-checkin')?.value;
    const checkOut = document.getElementById('bk-checkout')?.value;
    const summary = document.getElementById('booking-summary');

    if (!roomType || !summary) return;

    const nights = tinhSoDem(checkIn, checkOut);
    if (nights <= 0) {
        summary.classList.add('hidden');
        return;
    }

    const perRoomTotal = nights * Number(roomType.GiaTieuChuan || 0);
    const roomsRequested = Number(document.getElementById('bk-rooms')?.value || 1);
    const availableCount = demPhongTrongKhoangNgay(maLoaiPhong, checkIn, checkOut);
    const roomsToUse = Math.min(Math.max(1, roomsRequested), Math.max(0, availableCount));
    const totalAll = perRoomTotal * roomsToUse;

    document.getElementById('summary-nights').innerText = `${nights} đêm`;
    document.getElementById('summary-price').innerText = `${formatTien(roomType.GiaTieuChuan)} / đêm`;
    document.getElementById('summary-total').innerText = formatTien(totalAll);
    document.getElementById('bk-deposit').value = Math.min(totalAll, Math.max(100, Math.round(totalAll * 0.2)));
    document.getElementById('bk-rooms-max') && (document.getElementById('bk-rooms-max').value = availableCount);
    document.getElementById('bk-rooms') && (document.getElementById('bk-rooms').max = Math.max(1, availableCount));
    summary.classList.remove('hidden');
}

function timPhongTrong(maLoaiPhong, checkIn, checkOut) {
    const rooms = docDuLieu('Phong');
    const bookings = docDuLieu('PhieuDatPhong');

    return rooms.find(room => (
        room.MaLoaiPhong === maLoaiPhong &&
        room.TrangThaiVeSinh === ROOM_READY &&
        !phongBiGiuTrongKhoangNgay(room.MaPhong, checkIn, checkOut, bookings)
    ));
}

function xuLyDatPhong(e) {
    e.preventDefault();

    const user = docDuLieu('CurrentUser', null);
    if (!user) {
        alert('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại!');
        dongModal('booking-modal');
        moModal('login-modal');
        return;
    }

    const maLoaiPhong = document.getElementById('booking-room-id').value;
    const roomType = timLoaiPhong(maLoaiPhong);
    const checkIn = document.getElementById('bk-checkin').value;
    const checkOut = document.getElementById('bk-checkout').value;
    const guests = Number(document.getElementById('bk-guests').value || 1);
    const nights = tinhSoDem(checkIn, checkOut);
    const today = parseNgay(formatNgayISO(new Date()));

    if (!roomType) {
        alert('Không tìm thấy hạng phòng cần đặt.');
        return;
    }

    if (parseNgay(checkIn) < today) {
        alert('Ngày nhận phòng không được nhỏ hơn ngày hiện tại.');
        return;
    }

    if (nights <= 0) {
        alert('Lỗi: Ngày trả phòng phải sau ngày nhận phòng!');
        return;
    }

    if (guests < 1 || guests > (roomType.SucChua || 6)) {
        alert(`Số khách của ${roomType.TenLoai} phải từ 1 đến ${roomType.SucChua || 6}.`);
        return;
    }

    const roomsCount = Number(document.getElementById('bk-rooms')?.value || 1);
    const availableRooms = timNhieuPhongTrong(maLoaiPhong, checkIn, checkOut, roomsCount);
    if (!availableRooms || availableRooms.length < roomsCount) {
        alert('Số lượng phòng yêu cầu vượt quá số phòng trống trong khoảng ngày đã chọn. Vui lòng giảm số phòng hoặc đổi ngày.');
        return;
    }

    const perRoomTotal = nights * Number(roomType.GiaTieuChuan || 0);
    const totalAll = perRoomTotal * roomsCount;
    const deposit = Number(document.getElementById('bk-deposit').value || 0);
    const bookings = docDuLieu('PhieuDatPhong');
    const note = String(document.getElementById('bk-note')?.value || '').trim();

    availableRooms.forEach((room, idx) => {
        const newBooking = {
            MaPDP: `PDP${Date.now()}${idx}`,
            MaKH: user.MaKH,
            MaLoaiPhong: maLoaiPhong,
            MaPhong: room.MaPhong,
            NgayNhanDuKien: checkIn,
            NgayTraDuKien: checkOut,
            SoKhach: guests,
            SoDem: nights,
            DonGia: Number(roomType.GiaTieuChuan || 0),
            TienCoc: Math.round(deposit / roomsCount),
            GhiChu: note,
            TongTienDuKien: perRoomTotal,
            NgayTao: new Date().toISOString(),
            TrangThai: 'Chờ nhận phòng'
        };

        bookings.push(newBooking);
    });

    luuDuLieu('PhieuDatPhong', bookings);

    alert(`ĐẶT PHÒNG THÀNH CÔNG!\n\nHệ thống đã giữ ${roomsCount} phòng.\nMã tham chiếu (ví dụ): PDP${Date.now()}\nSố đêm: ${nights}\nTổng dự kiến: ${formatTien(totalAll)}\nTiền cọc: ${formatTien(deposit)}`);
    dongModal('booking-modal');
    document.getElementById('booking-form').reset();
    document.getElementById('booking-summary')?.classList.add('hidden');
    renderRooms();
    taiDuLieuProfile();
}

// =============================
// Room detail modal & carousel
// =============================
const roomModalState = { images: [], idx: 0, currentType: null };

function escapeHTML(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function openRoomModal(maLoaiPhong) {
    const roomType = timLoaiPhong(maLoaiPhong);
    if (!roomType) return alert('Không tìm thấy hạng phòng');

    const imgs = Array.isArray(roomType.img) ? roomType.img : String(roomType.img || '').split(',').map(s => s.trim()).filter(Boolean);
    roomModalState.images = imgs.length ? imgs : [''];
    roomModalState.idx = 0;
    roomModalState.currentType = roomType;

    document.getElementById('detail-room-name').innerText = roomType.TenLoai || '';
    document.getElementById('detail-room-price').innerText = formatTien(roomType.GiaTieuChuan || 0);
    document.getElementById('detail-room-cap').innerText = roomType.SucChua || 1;
    document.getElementById('detail-room-area').innerText = roomType.DienTich ? `Diện tích: ${escapeHTML(roomType.DienTich)}` : 'Diện tích: -';
    document.getElementById('detail-room-short').innerText = roomType.MoTa || '';

    updateRoomModalImages();

    // populate amenities (use provided list or fallback)
    const amenitiesEl = document.getElementById('detail-room-amenities');
    const defaultAmenities = ['Khu vực làm việc', 'TV màn hình', 'Bàn làm việc', 'Tủ lạnh', 'Máy sấy tóc', 'Wi-Fi miễn phí', 'Két sắt', 'Loa Bluetooth'];
    const amenities = Array.isArray(roomType.TienNghi) && roomType.TienNghi.length ? roomType.TienNghi : defaultAmenities;
    amenitiesEl.innerHTML = amenities.map(a => `<li>${escapeHTML(a)}</li>`).join('');

    // fetch extended description from internet (fallback to MoTa)
    const longEl = document.getElementById('detail-room-long');
    longEl.innerHTML = '<p class="text-xs text-gray-400">Đang tải nội dung mở rộng...</p>';
    fetch('https://loripsum.net/api/2/short/plaintext').then(r => {
        if (!r.ok) throw new Error('fetch failed');
        return r.text();
    }).then(txt => {
        longEl.innerHTML = `<p>${escapeHTML(txt.trim())}</p>`;
    }).catch(() => {
        longEl.innerHTML = `<p>${escapeHTML(roomType.MoTa || 'Không có mô tả chi tiết.')}</p>`;
    });

    moModal('room-detail-modal');
}

function updateRoomModalImages() {
    const imgs = roomModalState.images;
    const idx = roomModalState.idx || 0;
    const main = document.getElementById('detail-main-img');
    const thumbs = document.getElementById('detail-thumbnails');
    if (main) main.src = imgs[idx] || '';
    if (thumbs) {
        thumbs.innerHTML = imgs.map((u, i) => `
            <img src="${escapeHTML(u)}" onclick="(function(){roomModalState.idx=${i}; updateRoomModalImages();})();" class="w-20 h-14 object-cover rounded cursor-pointer border ${i===idx ? 'border-gold' : 'border-gray-200'}">`
        ).join('');
    }
}

function roomCarouselNext() {
    if (!roomModalState.images.length) return;
    roomModalState.idx = (roomModalState.idx + 1) % roomModalState.images.length;
    updateRoomModalImages();
}

function roomCarouselPrev() {
    if (!roomModalState.images.length) return;
    roomModalState.idx = (roomModalState.idx - 1 + roomModalState.images.length) % roomModalState.images.length;
    updateRoomModalImages();
}

function ganSuKienForm() {
    document.getElementById('bk-checkin')?.addEventListener('change', () => {
        const checkInInput = document.getElementById('bk-checkin');
        const checkOutInput = document.getElementById('bk-checkout');
        const checkInDate = parseNgay(checkInInput.value);

        if (checkInDate) {
            const minCheckout = new Date(checkInDate);
            minCheckout.setDate(checkInDate.getDate() + 1);
            checkOutInput.min = formatNgayISO(minCheckout);

            if (!checkOutInput.value || parseNgay(checkOutInput.value) <= checkInDate) {
                checkOutInput.value = formatNgayISO(minCheckout);
            }
        }

        capNhatTomTatDatPhong();
    });

    document.getElementById('bk-checkout')?.addEventListener('change', capNhatTomTatDatPhong);
    document.getElementById('bk-guests')?.addEventListener('change', capNhatTomTatDatPhong);
}

window.addEventListener('DOMContentLoaded', () => {
    initDB();
    khoiTaoTimPhong();
    renderRooms();
    renderHomeRooms();
    checkLoginStatus();
    taiDuLieuProfile();
    ganSuKienForm();
    hienThiTrangKhachHang();
});

window.addEventListener('scroll', hienThiTrangKhachHang, { passive: true });
window.addEventListener('hashchange', () => requestAnimationFrame(hienThiTrangKhachHang));
