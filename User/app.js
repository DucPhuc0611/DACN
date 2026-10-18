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

function hienThiTrangKhachHang(chuyenFocus = false) {
    const dangDatPhong = ['#booking', '#rooms-section'].includes(window.location.hash);
    document.getElementById('home-section').classList.toggle('hidden', dangDatPhong);
    document.getElementById('rooms-section').classList.toggle('hidden', !dangDatPhong);
    ['nav-home', 'nav-booking'].forEach(id => {
        const active = (id === 'nav-booking') === dangDatPhong;
        const link = document.getElementById(id);
        link.classList.toggle('text-gold', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
    if (dangDatPhong) renderRooms();
    if (chuyenFocus) {
        document.getElementById(dangDatPhong ? 'booking-title' : 'home-title').focus({ preventScroll: true });
        window.scrollTo(0, 0);
    }
}

function tiepTucDatPhongSauDangNhap() {
    if (!loaiPhongChoDangNhap) return;
    const maLoaiPhong = loaiPhongChoDangNhap;
    loaiPhongChoDangNhap = null;
    chuanBiDatPhong(maLoaiPhong);
}

function renderRooms() {
    const container = document.getElementById('room-list-container');
    if (!container) return;

    const roomTypes = docDuLieu('LoaiPhong');
    container.innerHTML = roomTypes.map(roomType => {
        const availableCount = demPhongSanSang(roomType.MaLoaiPhong);
        const disabled = availableCount === 0;

        return `
        <div class="group cursor-pointer">
            <div class="overflow-hidden relative shadow-sm">
                <img onclick="openRoomModal('${roomType.MaLoaiPhong}')" src="${roomType.img}" alt="${roomType.TenLoai}" loading="lazy" class="w-full h-52 lg:h-64 object-cover transition duration-1000 group-hover:scale-105 cursor-pointer">
            </div>
            <div class="pt-6 text-center">
                <h4 class="text-2xl font-serif text-dark mb-2">${roomType.TenLoai}</h4>
                <p class="text-sm font-serif text-gray-500 mb-2 italic">
                    Giá: <span class="font-sans font-bold text-dark">${formatTien(roomType.GiaTieuChuan)}</span> / Đêm
                </p>
                <p class="text-xs text-gray-400 mb-4">Sức chứa ${roomType.SucChua || 2} khách · ${availableCount} phòng sẵn sàng</p>
                <div class="mt-3 flex justify-center gap-4">
                    <button onclick="chuanBiDatPhong('${roomType.MaLoaiPhong}')" ${disabled ? 'disabled' : ''} class="uppercase tracking-[0.2em] text-[10px] font-bold border-b pb-1 transition ${disabled ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-dark border-gold hover:text-gold'}">${disabled ? 'Tạm Hết Phòng' : 'Đặt Ngay'}</button>
                </div>
            </div>
        </div>`;
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

    document.getElementById('booking-room-id').value = maLoaiPhong;
    document.getElementById('booking-room-name').innerText = roomType.TenLoai;
    document.getElementById('bk-name').value = user.HoTen;
    document.getElementById('bk-phone').value = user.SDT;
    document.getElementById('bk-email').value = user.Email;
    document.getElementById('bk-note') && (document.getElementById('bk-note').value = '');
    const roomsInput = document.getElementById('bk-rooms');
    const roomsMaxField = document.getElementById('bk-rooms-max');
    if (roomsInput) {
        const avail = demPhongTrongKhoangNgay(maLoaiPhong, formatNgayISO(today), formatNgayISO(tomorrow));
        roomsInput.value = 1;
        roomsInput.max = Math.max(1, avail);
        if (roomsMaxField) roomsMaxField.value = avail;
    }

    const checkInInput = document.getElementById('bk-checkin');
    const checkOutInput = document.getElementById('bk-checkout');
    const guestsInput = document.getElementById('bk-guests');

    checkInInput.min = formatNgayISO(today);
    checkOutInput.min = formatNgayISO(tomorrow);
    checkInInput.value = formatNgayISO(today);
    checkOutInput.value = formatNgayISO(tomorrow);

    guestsInput.max = roomType.SucChua || 6;
    guestsInput.value = Math.min(Number(guestsInput.value || 2), roomType.SucChua || 6);

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
    renderRooms();
    checkLoginStatus();
    taiDuLieuProfile();
    ganSuKienForm();
    hienThiTrangKhachHang();
});

window.addEventListener('hashchange', () => hienThiTrangKhachHang(true));
