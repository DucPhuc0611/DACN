// ============================================================
// DU LIEU DUNG CHUNG USER / ADMIN
// ============================================================
const ROOM_READY = 'Sẵn Sàng Đón Khách';
const ROOM_USING = 'Đang sử dụng';
const ROOM_DIRTY = 'Chưa dọn';
const BOOKING_PENDING = 'Chờ nhận phòng';
const BOOKING_CHECKED_IN = 'Đã nhận phòng';
const BOOKING_CHECKED_OUT = 'Đã trả phòng';
const BOOKING_CANCELLED = 'Đã hủy';
const INCIDENT_REPORTED = 'Lễ tân đã báo kỹ thuật';
const INCIDENT_MANAGER_REPORTED = 'Kỹ thuật đã báo quản lý';
const INCIDENT_APPROVED = 'Quản lý đã duyệt sửa';
const INCIDENT_REPAIRING = 'Đang sửa chữa';
const INCIDENT_FIXED = 'Kỹ thuật báo đã sửa xong';
const INCIDENT_DONE = 'Quản lý xác nhận hoàn tất';

let currentStaff = null;
let activeTab = 'dashboard';
const ADMIN_SESSION_KEY = 'CurrentAdminTabSession';
const LEGACY_ADMIN_SESSION_KEY = 'CurrentAdmin';

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
    { MaLoaiPhong: 'LP_KING', TenLoai: 'Phòng Tiêu Chuẩn King', GiaTieuChuan: 150, SucChua: 2 },
    { MaLoaiPhong: 'LP_TWIN', TenLoai: 'Phòng Cao Cấp Twin', GiaTieuChuan: 280, SucChua: 4 },
    { MaLoaiPhong: 'LP_SUITE', TenLoai: 'SSA Executive Suite', GiaTieuChuan: 850, SucChua: 6 }
];

const DEFAULT_ROOMS = [
    { MaPhong: 'P101', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P102', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P103', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P104', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P105', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_DIRTY },
    { MaPhong: 'P106', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P201', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P202', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_USING },
    { MaPhong: 'P203', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P204', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P205', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_DIRTY },
    { MaPhong: 'P206', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P301', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P302', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P303', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_DIRTY },
    { MaPhong: 'P304', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P401', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P402', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P403', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P501', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: ROOM_READY },
    { MaPhong: 'P502', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: ROOM_READY }
];

// ============================================================
// TIEN ICH LOCALSTORAGE
// ============================================================
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

function docPhienAdmin() {
    try {
        return JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY));
    } catch {
        return null;
    }
}

function luuPhienAdmin(staff) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(staff));
    sessionStorage.removeItem(LEGACY_ADMIN_SESSION_KEY);
    localStorage.removeItem(LEGACY_ADMIN_SESSION_KEY);
}

function xoaPhienAdmin() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(LEGACY_ADMIN_SESSION_KEY);
    localStorage.removeItem(LEGACY_ADMIN_SESSION_KEY);
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

function initSharedDB() {
    if (!localStorage.getItem('KhachHang')) luuDuLieu('KhachHang', DEFAULT_CUSTOMERS);
    if (!localStorage.getItem('LoaiPhong')) luuDuLieu('LoaiPhong', DEFAULT_ROOM_TYPES);
    if (!localStorage.getItem('Phong')) luuDuLieu('Phong', DEFAULT_ROOMS);
    if (!localStorage.getItem('PhieuDatPhong')) luuDuLieu('PhieuDatPhong', []);
    if (!localStorage.getItem('SuCoKyThuat')) luuDuLieu('SuCoKyThuat', []);

    dongBoDanhSachTheoKhoa('KhachHang', DEFAULT_CUSTOMERS, 'MaKH');
    dongBoDanhSachTheoKhoa('LoaiPhong', DEFAULT_ROOM_TYPES, 'MaLoaiPhong');
    dongBoDanhSachTheoKhoa('Phong', DEFAULT_ROOMS, 'MaPhong');
}

function formatTien(value) {
    return `$${Number(value || 0).toLocaleString('en-US')}`;
}

function escapeHTML(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function timKhachHang(maKH) {
    return docDuLieu('KhachHang').find(customer => customer.MaKH === maKH);
}

function timLoaiPhong(maLoaiPhong) {
    return docDuLieu('LoaiPhong').find(roomType => roomType.MaLoaiPhong === maLoaiPhong);
}

function coQuyenLeTan() {
    return currentStaff && ['letan', 'admin'].includes(currentStaff.ChucDanh);
}

function coQuyenKyThuat() {
    return currentStaff && ['kythuat', 'admin'].includes(currentStaff.ChucDanh);
}

function coQuyenQuanLy() {
    return currentStaff?.ChucDanh === 'admin';
}

function formatNgayGio(value) {
    if (!value) return '---';
    return new Date(value).toLocaleString('vi-VN');
}

function mauBadge(status) {
    const map = {
        [BOOKING_PENDING]: 'bg-blue-100 text-blue-700',
        [BOOKING_CHECKED_IN]: 'bg-green-100 text-green-700',
        [BOOKING_CHECKED_OUT]: 'bg-gray-100 text-gray-600',
        [BOOKING_CANCELLED]: 'bg-red-100 text-red-700',
        [INCIDENT_REPORTED]: 'bg-amber-100 text-amber-700',
        [INCIDENT_MANAGER_REPORTED]: 'bg-blue-100 text-blue-700',
        [INCIDENT_APPROVED]: 'bg-indigo-100 text-indigo-700',
        [INCIDENT_REPAIRING]: 'bg-orange-100 text-orange-700',
        [INCIDENT_FIXED]: 'bg-purple-100 text-purple-700',
        [INCIDENT_DONE]: 'bg-green-100 text-green-700'
    };

    return map[status] || 'bg-gray-100 text-gray-600';
}

function taoDongTrong(colspan, message) {
    return `<tr><td colspan="${colspan}" class="p-6 text-center text-gray-400 italic">${message}</td></tr>`;
}

// ============================================================
// KHOI TAO TAI KHOAN NHAN VIEN
// ============================================================
function initAdminDB() {
    initSharedDB();

    if (!localStorage.getItem('NhanVien')) {
        luuDuLieu('NhanVien', [
            { MaNV: 'NV01', HoTen: 'Ban Giám Đốc', PhongBan: 'Quản Trị', ChucDanh: 'admin', pass: '123' },
            { MaNV: 'NV02', HoTen: 'Trưởng Ca Lễ Tân', PhongBan: 'Tiền Sảnh', ChucDanh: 'letan', pass: '123' },
            { MaNV: 'NV03', HoTen: 'Giám Sát Buồng', PhongBan: 'Buồng Phòng', ChucDanh: 'buongphong', pass: '123' },
            { MaNV: 'NV04', HoTen: 'Kỹ Sư Trưởng', PhongBan: 'Kỹ Thuật', ChucDanh: 'kythuat', pass: '123' }
        ]);
    }
}

// ============================================================
// DANG NHAP VA PHAN QUYEN
// ============================================================
function xuLyDangNhapAdmin(e) {
    e.preventDefault();

    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    const staffList = docDuLieu('NhanVien');
    const staff = staffList.find(item => item.ChucDanh === username && item.pass === password);

    if (!staff) {
        document.getElementById('login-error').classList.remove('hidden');
        return;
    }

    luuPhienAdmin(staff);
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('login-form').reset();
    apDungPhanQuyen();
}

function dangXuat() {
    xoaPhienAdmin();
    window.location.reload();
}

function apDungPhanQuyen() {
    currentStaff = docPhienAdmin();
    if (!currentStaff) return;

    document.getElementById('staff-name').innerText = currentStaff.HoTen;
    document.getElementById('staff-role').innerText = currentStaff.PhongBan;

    document.querySelectorAll('.role-admin, .role-letan, .role-buongphong, .role-kythuat').forEach(element => {
        if (!element.classList.contains('role-all')) element.classList.add('hidden');
    });
    document.querySelectorAll(`.role-${currentStaff.ChucDanh}`).forEach(element => element.classList.remove('hidden'));

    chuyenTab('dashboard');
}

function chuyenTab(tabName) {
    const tabs = ['dashboard', 'rooms', 'bookings', 'technical', 'customers'];
    if (!tabs.includes(tabName)) return;

    activeTab = tabName;
    tabs.forEach(tab => {
        document.getElementById(`tab-${tab}`)?.classList.add('hidden');
        document.getElementById(`btn-${tab}`)?.classList.remove('bg-gray-700', 'text-white');
    });

    document.getElementById(`tab-${tabName}`)?.classList.remove('hidden');
    document.getElementById(`btn-${tabName}`)?.classList.add('bg-gray-700', 'text-white');

    capNhatHeaderActions(tabName);

    const titles = {
        dashboard: 'Tổng quan',
        rooms: 'Sơ Đồ Trạng Thái Phòng',
        bookings: 'Hồ Sơ Lưu Trú',
        technical: 'Quản Lý Kỹ Thuật',
        customers: 'Hồ Sơ Khách Hàng'
    };
    document.getElementById('page-title').innerText = titles[tabName];

    if (tabName === 'dashboard') veDashboard();
    if (tabName === 'rooms') veSoDoPhong();
    if (tabName === 'bookings') veBangDatPhong();
    if (tabName === 'technical') veBangSuCoKyThuat();
    if (tabName === 'customers') veBangKhachHang();
}

function capNhatHeaderActions(tabName) {
    const headerActions = document.getElementById('header-actions');
    if (!headerActions) return;

    if (tabName === 'rooms') {
        headerActions.innerHTML = '<span class="room-header-note">Bảng vận hành phòng</span><button type="button" onclick="lamMoiTabHienTai()" class="room-refresh">Làm mới</button>';
        return;
    }

    headerActions.innerHTML = `
        <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200">Dữ liệu chung User/Admin</span>
        <button onclick="lamMoiTabHienTai()" class="px-3 py-1 bg-dark text-white rounded hover:bg-gold transition">Làm mới</button>
    `;
}

function lamMoiTabHienTai() {
    chuyenTab(activeTab);
}

// ============================================================
// DASHBOARD
// ============================================================
function layThongKe() {
    const rooms = docDuLieu('Phong');
    const bookings = docDuLieu('PhieuDatPhong');
    const customers = docDuLieu('KhachHang');
    const incidents = docDuLieu('SuCoKyThuat');

    const activeBookings = bookings.filter(booking => [BOOKING_PENDING, BOOKING_CHECKED_IN].includes(booking.TrangThai));
    const openIncidents = incidents.filter(incident => incident.TrangThai !== INCIDENT_DONE);
    const expectedRevenue = bookings
        .filter(booking => booking.TrangThai !== BOOKING_CANCELLED)
        .reduce((sum, booking) => sum + Number(booking.TongTienDuKien || 0), 0);

    return {
        totalRooms: rooms.length,
        readyRooms: rooms.filter(room => room.TrangThaiVeSinh === ROOM_READY).length,
        usingRooms: rooms.filter(room => room.TrangThaiVeSinh === ROOM_USING).length,
        dirtyRooms: rooms.filter(room => room.TrangThaiVeSinh === ROOM_DIRTY).length,
        pendingBookings: activeBookings.length,
        expectedRevenue,
        customers: customers.length,
        openIncidents: openIncidents.length
    };
}

function veDashboard() {
    const stats = layThongKe();

    document.getElementById('stat-total-rooms').innerText = stats.totalRooms;
    document.getElementById('stat-ready-rooms').innerText = stats.readyRooms;
    document.getElementById('stat-pending-bookings').innerText = stats.pendingBookings;
    document.getElementById('stat-expected-revenue').innerText = formatTien(stats.expectedRevenue);
    document.getElementById('stat-customers').innerText = stats.customers;
    document.getElementById('stat-open-incidents').innerText = stats.openIncidents;

    veDashboardBookings();
    veDashboardIncidents();
}

function veDashboardBookings() {
    const container = document.getElementById('dashboard-recent-bookings');
    const bookings = docDuLieu('PhieuDatPhong')
        .slice()
        .sort((a, b) => new Date(b.NgayTao || 0) - new Date(a.NgayTao || 0))
        .slice(0, 5);

    if (bookings.length === 0) {
        container.innerHTML = '<p class="text-gray-400 italic">Chưa có đặt phòng từ user.</p>';
        return;
    }

    container.innerHTML = bookings.map(booking => {
        const customer = timKhachHang(booking.MaKH);
        const roomType = timLoaiPhong(booking.MaLoaiPhong);

        return `
        <div class="flex justify-between gap-4 border border-gray-100 rounded p-3">
            <div>
                <p class="font-bold text-dark">${escapeHTML(customer?.HoTen || 'Khách Ẩn Danh')}</p>
                <p class="text-xs text-gray-500">${escapeHTML(roomType?.TenLoai || 'Phòng SSA')} · ${escapeHTML(booking.MaPhong)}</p>
                <p class="text-xs text-gray-500">${escapeHTML(booking.NgayNhanDuKien)} ➔ ${escapeHTML(booking.NgayTraDuKien)}</p>
            </div>
            <span class="shrink-0 h-fit px-2 py-1 rounded-full text-[10px] font-bold ${mauBadge(booking.TrangThai)}">${escapeHTML(booking.TrangThai)}</span>
        </div>`;
    }).join('');
}

function veDashboardIncidents() {
    const container = document.getElementById('dashboard-recent-incidents');
    const incidents = docDuLieu('SuCoKyThuat')
        .slice()
        .sort((a, b) => new Date(b.NgayTao || 0) - new Date(a.NgayTao || 0))
        .slice(0, 5);

    if (incidents.length === 0) {
        container.innerHTML = '<p class="text-gray-400 italic">Chưa có sự cố kỹ thuật.</p>';
        return;
    }

    container.innerHTML = incidents.map(incident => `
        <div class="flex justify-between gap-4 border border-gray-100 rounded p-3">
            <div>
                <p class="font-bold text-dark">${escapeHTML(incident.MaPhong || incident.KhuVuc || 'Khu vực chung')} · ${escapeHTML(incident.NhomSuCo)}</p>
                <p class="text-xs text-gray-500">${escapeHTML(incident.MoTa)}</p>
                <p class="text-xs text-gray-500">${escapeHTML(incident.MucDo)} · ${formatNgayGio(incident.NgayTao)}</p>
            </div>
            <span class="shrink-0 h-fit px-2 py-1 rounded-full text-[10px] font-bold ${mauBadge(incident.TrangThai)}">${escapeHTML(incident.TrangThai)}</span>
        </div>
    `).join('');
}

// ============================================================
// SO DO PHONG
// ============================================================
function veSoDoPhong() {
    renderRoomBoard();
}

// ============================================================
// QUAN LY LUU TRU
// ============================================================
function veBangDatPhong() {
    const bookings = docDuLieu('PhieuDatPhong').slice().reverse();
    const customers = docDuLieu('KhachHang');
    const table = document.getElementById('table-bookings');

    if (bookings.length === 0) {
        table.innerHTML = taoDongTrong(8, 'Chưa có booking nào từ website user.');
        return;
    }

    table.innerHTML = bookings.map(booking => {
        const customer = customers.find(item => item.MaKH === booking.MaKH);
        const roomType = timLoaiPhong(booking.MaLoaiPhong);
        const actionButton = taoNutDatPhong(booking);

        return `
        <tr class="border-b hover:bg-gray-50 align-top">
            <td class="p-3 font-bold">${escapeHTML(booking.MaPDP)}</td>
            <td class="p-3">
                <p class="font-bold text-dark">${escapeHTML(customer?.HoTen || 'Khách Ẩn Danh')}</p>
                <p class="text-xs text-gray-500">${escapeHTML(customer?.SDT || '')}</p>
            </td>
            <td class="p-3">
                <p class="font-bold text-blue-600">${escapeHTML(booking.MaPhong)}</p>
                <p class="text-xs text-gray-500">${escapeHTML(roomType?.TenLoai || 'Phòng SSA')}</p>
            </td>
            <td class="p-3 text-gray-500">${escapeHTML(booking.NgayNhanDuKien)} ➔ ${escapeHTML(booking.NgayTraDuKien)}<br><span class="text-xs">${escapeHTML(booking.SoDem || '')} đêm · ${escapeHTML(booking.SoKhach || 1)} khách</span></td>
            <td class="p-3 text-sm text-gray-600 max-w-xs">${booking.GhiChu ? escapeHTML(booking.GhiChu) : ''}</td>
            <td class="p-3 font-bold text-dark">${formatTien(booking.TongTienDuKien)}</td>
            <td class="p-3"><span class="px-2 py-1 rounded-full font-bold text-[10px] ${mauBadge(booking.TrangThai)}">${escapeHTML(booking.TrangThai)}</span></td>
            <td class="p-3">${actionButton}</td>
        </tr>`;
    }).join('');
}

function taoNutDatPhong(booking) {
    if (!coQuyenLeTan()) {
        return '<span class="text-gray-400 italic text-xs">Không có quyền xử lý</span>';
    }

    if (booking.TrangThai === BOOKING_PENDING) {
        return `
        <div class="flex flex-col gap-2">
            <button onclick="checkIn('${booking.MaPDP}', '${booking.MaPhong}')" class="bg-blue-600 text-white px-3 py-1 rounded text-xs shadow hover:bg-blue-700">Tiếp nhận Check-in</button>
            <button onclick="huyDatPhong('${booking.MaPDP}')" class="bg-red-50 text-red-600 px-3 py-1 rounded text-xs border border-red-200 hover:bg-red-100">Hủy booking</button>
        </div>`;
    }

    if (booking.TrangThai === BOOKING_CHECKED_IN) {
        return `<button onclick="checkOut('${booking.MaPhong}')" class="bg-red-600 text-white px-3 py-1 rounded text-xs shadow hover:bg-red-700">Check-out</button>`;
    }

    return '<span class="text-gray-400 italic text-xs">Đã xử lý</span>';
}

function checkIn(maPDP, maPhong) {
    const rooms = docDuLieu('Phong');
    const bookings = docDuLieu('PhieuDatPhong');
    const roomIndex = rooms.findIndex(room => room.MaPhong === maPhong);
    const bookingIndex = bookings.findIndex(booking => booking.MaPDP === maPDP);

    if (roomIndex < 0 || bookingIndex < 0) {
        alert('Không tìm thấy phòng hoặc phiếu đặt phòng.');
        return;
    }

    if (rooms[roomIndex].TrangThaiVeSinh !== ROOM_READY) {
        alert('Lỗi: Phòng này chưa sẵn sàng để check-in.');
        return;
    }

    rooms[roomIndex].TrangThaiVeSinh = ROOM_USING;
    bookings[bookingIndex].TrangThai = BOOKING_CHECKED_IN;
    bookings[bookingIndex].NgayCheckIn = new Date().toISOString();
    bookings[bookingIndex].MaNVCheckIn = currentStaff?.MaNV || '';

    luuDuLieu('Phong', rooms);
    luuDuLieu('PhieuDatPhong', bookings);

    alert(`Đã Check-in thành công cho phòng ${maPhong}.`);
    lamMoiTabHienTai();
}

function checkOut(maPhong) {
    const rooms = docDuLieu('Phong');
    const bookings = docDuLieu('PhieuDatPhong');
    const roomIndex = rooms.findIndex(room => room.MaPhong === maPhong);
    const bookingIndex = bookings.findIndex(booking => booking.MaPhong === maPhong && booking.TrangThai === BOOKING_CHECKED_IN);

    if (roomIndex < 0) {
        alert('Không tìm thấy phòng cần check-out.');
        return;
    }

    rooms[roomIndex].TrangThaiVeSinh = ROOM_DIRTY;
    if (bookingIndex > -1) {
        bookings[bookingIndex].TrangThai = BOOKING_CHECKED_OUT;
        bookings[bookingIndex].NgayCheckOut = new Date().toISOString();
        bookings[bookingIndex].MaNVCheckOut = currentStaff?.MaNV || '';
    }

    luuDuLieu('Phong', rooms);
    luuDuLieu('PhieuDatPhong', bookings);

    alert(`Đã Check-out phòng ${maPhong}. Phòng được chuyển sang trạng thái chờ dọn.`);
    lamMoiTabHienTai();
}

function huyDatPhong(maPDP) {
    if (!confirm('Xác nhận hủy booking này?')) return;

    const bookings = docDuLieu('PhieuDatPhong');
    const bookingIndex = bookings.findIndex(booking => booking.MaPDP === maPDP);
    if (bookingIndex < 0) return;

    bookings[bookingIndex].TrangThai = BOOKING_CANCELLED;
    bookings[bookingIndex].NgayHuy = new Date().toISOString();
    bookings[bookingIndex].MaNVHuy = currentStaff?.MaNV || '';
    luuDuLieu('PhieuDatPhong', bookings);

    alert('Đã hủy booking. User sẽ thấy trạng thái này trong hồ sơ.');
    lamMoiTabHienTai();
}

function donXong(maPhong) {
    const rooms = docDuLieu('Phong');
    const roomIndex = rooms.findIndex(room => room.MaPhong === maPhong);
    if (roomIndex < 0) return;

    rooms[roomIndex].TrangThaiVeSinh = ROOM_READY;
    rooms[roomIndex].NgayDonXong = new Date().toISOString();
    rooms[roomIndex].MaNVDon = currentStaff?.MaNV || '';
    luuDuLieu('Phong', rooms);

    alert(`Đã cập nhật phòng ${maPhong} sẵn sàng đón khách.`);
    lamMoiTabHienTai();
}

// ============================================================
// QUAN LY KY THUAT
// ============================================================
function taoMaSuCoMoi(incidents) {
    const maxNumber = incidents.reduce((max, incident) => {
        const match = String(incident.MaSC || '').match(/^SC(\d+)$/);
        return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    return `SC${String(maxNumber + 1).padStart(3, '0')}`;
}

function themLichSuSuCo(incident, trangThai, ghiChu = '') {
    if (!Array.isArray(incident.LichSu)) incident.LichSu = [];

    incident.LichSu.push({
        TrangThai: trangThai,
        GhiChu: ghiChu,
        MaNV: currentStaff?.MaNV || '',
        TenNV: currentStaff?.HoTen || '',
        ChucDanh: currentStaff?.ChucDanh || '',
        ThoiGian: new Date().toISOString()
    });
}

function renderPhongSuCoOptions() {
    const select = document.getElementById('incident-room');
    if (!select) return;

    const rooms = docDuLieu('Phong');
    const currentValue = select.value;
    const areaOptions = ['Sảnh chính', 'Nhà hàng', 'Sky Lounge Bar', 'Phòng họp', 'Hành lang', 'Khu vực khác'];
    const roomOptions = rooms.map(room => {
        const roomType = timLoaiPhong(room.MaLoaiPhong);
        return `<option value="${escapeHTML(room.MaPhong)}">${escapeHTML(room.MaPhong)} - ${escapeHTML(roomType?.TenLoai || 'Phòng SSA')}</option>`;
    }).join('');

    select.innerHTML = `
        <option value="">Chọn phòng / khu vực</option>
        ${areaOptions.map(area => `<option value="${escapeHTML(area)}">${escapeHTML(area)}</option>`).join('')}
        ${roomOptions}
    `;

    if ([...select.options].some(option => option.value === currentValue)) {
        select.value = currentValue;
    }
}

function taoBaoCaoSuCo(e) {
    e.preventDefault();

    if (!coQuyenLeTan()) {
        alert('Chỉ lễ tân hoặc quản lý mới được tạo báo cáo sự cố.');
        return;
    }

    const incidents = docDuLieu('SuCoKyThuat');
    const newIncident = {
        MaSC: taoMaSuCoMoi(incidents),
        MaPhong: document.getElementById('incident-room').value,
        NhomSuCo: document.getElementById('incident-category').value,
        MucDo: document.getElementById('incident-priority').value,
        MoTa: document.getElementById('incident-note').value.trim(),
        MaNVBao: currentStaff?.MaNV || '',
        TenNVBao: currentStaff?.HoTen || '',
        NgayTao: new Date().toISOString(),
        TrangThai: INCIDENT_REPORTED,
        LichSu: []
    };

    themLichSuSuCo(newIncident, INCIDENT_REPORTED, 'Lễ tân ghi nhận và gửi sự cố cho bộ phận kỹ thuật.');
    incidents.push(newIncident);
    luuDuLieu('SuCoKyThuat', incidents);

    document.getElementById('incident-form')?.reset();
    alert(`Đã gửi báo cáo sự cố ${newIncident.MaSC} cho kỹ thuật.`);
    veBangSuCoKyThuat();
}

function veBangSuCoKyThuat() {
    renderPhongSuCoOptions();

    const incidents = docDuLieu('SuCoKyThuat')
        .slice()
        .sort((a, b) => new Date(b.NgayTao || 0) - new Date(a.NgayTao || 0));
    const table = document.getElementById('table-incidents');

    if (!table) return;

    if (incidents.length === 0) {
        table.innerHTML = taoDongTrong(7, 'Chưa có sự cố kỹ thuật nào.');
        return;
    }

    table.innerHTML = incidents.map(incident => {
        const lastHistory = Array.isArray(incident.LichSu) && incident.LichSu.length
            ? incident.LichSu[incident.LichSu.length - 1]
            : null;
        const actionButton = taoNutSuCoKyThuat(incident);

        return `
        <tr class="border-b hover:bg-gray-50 align-top">
            <td class="p-3 font-bold">${escapeHTML(incident.MaSC)}</td>
            <td class="p-3">
                <p class="font-bold text-dark">${escapeHTML(incident.MaPhong || 'Khu vực chung')}</p>
                <p class="text-xs text-gray-500">${formatNgayGio(incident.NgayTao)}</p>
            </td>
            <td class="p-3">
                <p class="font-bold text-dark">${escapeHTML(incident.NhomSuCo)} · ${escapeHTML(incident.MucDo)}</p>
                <p class="text-xs text-gray-500 max-w-xs">${escapeHTML(incident.MoTa)}</p>
                ${lastHistory?.GhiChu ? `<p class="text-xs text-blue-600 mt-2">Ghi chú mới: ${escapeHTML(lastHistory.GhiChu)}</p>` : ''}
            </td>
            <td class="p-3">
                <p class="font-bold">${escapeHTML(incident.TenNVBao || 'Lễ tân')}</p>
                <p class="text-xs text-gray-500">${escapeHTML(incident.MaNVBao || '')}</p>
            </td>
            <td class="p-3">
                <p class="font-bold">${escapeHTML(incident.TenNVKyThuat || 'Chưa tiếp nhận')}</p>
                <p class="text-xs text-gray-500">${incident.NgayBaoQuanLy ? `Báo quản lý: ${formatNgayGio(incident.NgayBaoQuanLy)}` : 'Đang chờ kỹ thuật'}</p>
            </td>
            <td class="p-3"><span class="px-2 py-1 rounded-full font-bold text-[10px] ${mauBadge(incident.TrangThai)}">${escapeHTML(incident.TrangThai)}</span></td>
            <td class="p-3">${actionButton}</td>
        </tr>`;
    }).join('');
}

function taoNutSuCoKyThuat(incident) {
    if (incident.TrangThai === INCIDENT_REPORTED) {
        if (coQuyenKyThuat()) {
            return `<button onclick="baoQuanLySuCo('${incident.MaSC}')" class="bg-blue-600 text-white px-3 py-1 rounded text-xs shadow hover:bg-blue-700">Kỹ thuật báo quản lý</button>`;
        }

        return '<span class="text-gray-400 italic text-xs">Chờ kỹ thuật báo quản lý</span>';
    }

    if (incident.TrangThai === INCIDENT_MANAGER_REPORTED) {
        if (coQuyenQuanLy()) {
            return `<button onclick="duyetSuaChuaSuCo('${incident.MaSC}')" class="bg-indigo-600 text-white px-3 py-1 rounded text-xs shadow hover:bg-indigo-700">Quản lý duyệt sửa</button>`;
        }

        return '<span class="text-gray-400 italic text-xs">Chờ quản lý duyệt sửa</span>';
    }

    if (incident.TrangThai === INCIDENT_APPROVED) {
        if (coQuyenKyThuat()) {
            return `<button onclick="batDauSuaChuaSuCo('${incident.MaSC}')" class="bg-orange-600 text-white px-3 py-1 rounded text-xs shadow hover:bg-orange-700">Bắt đầu sửa chữa</button>`;
        }

        return '<span class="text-gray-400 italic text-xs">Đã duyệt, chờ kỹ thuật sửa</span>';
    }

    if (incident.TrangThai === INCIDENT_REPAIRING) {
        if (coQuyenKyThuat()) {
            return `<button onclick="baoDaSuaXongSuCo('${incident.MaSC}')" class="bg-purple-600 text-white px-3 py-1 rounded text-xs shadow hover:bg-purple-700">Báo đã sửa xong</button>`;
        }

        return '<span class="text-gray-400 italic text-xs">Kỹ thuật đang sửa</span>';
    }

    if (incident.TrangThai === INCIDENT_FIXED) {
        if (coQuyenQuanLy()) {
            return `<button onclick="xacNhanHoanTatSuCo('${incident.MaSC}')" class="bg-green-600 text-white px-3 py-1 rounded text-xs shadow hover:bg-green-700">Quản lý xác nhận</button>`;
        }

        return '<span class="text-gray-400 italic text-xs">Chờ quản lý xác nhận</span>';
    }

    return '<span class="text-gray-400 italic text-xs">Hoàn tất</span>';
}

function capNhatSuCoKyThuat(maSC, trangThaiMoi, ghiChu = '', extraData = {}) {
    const incidents = docDuLieu('SuCoKyThuat');
    const incidentIndex = incidents.findIndex(incident => incident.MaSC === maSC);
    if (incidentIndex < 0) return;

    incidents[incidentIndex] = {
        ...incidents[incidentIndex],
        ...extraData,
        TrangThai: trangThaiMoi,
        NgayCapNhat: new Date().toISOString()
    };
    themLichSuSuCo(incidents[incidentIndex], trangThaiMoi, ghiChu);
    luuDuLieu('SuCoKyThuat', incidents);

    alert(`Đã cập nhật sự cố ${maSC}: ${trangThaiMoi}.`);
    lamMoiTabHienTai();
}

function baoQuanLySuCo(maSC) {
    const note = prompt('Nội dung kỹ thuật báo lại cho quản lý:', 'Kỹ thuật đã kiểm tra sơ bộ và xin phép sửa chữa.');
    if (note === null) return;

    capNhatSuCoKyThuat(maSC, INCIDENT_MANAGER_REPORTED, note, {
        MaNVKyThuat: currentStaff?.MaNV || '',
        TenNVKyThuat: currentStaff?.HoTen || '',
        NgayBaoQuanLy: new Date().toISOString()
    });
}

function duyetSuaChuaSuCo(maSC) {
    const note = prompt('Ghi chú duyệt sửa chữa của quản lý:', 'Quản lý đồng ý cho kỹ thuật tiến hành sửa chữa.');
    if (note === null) return;

    capNhatSuCoKyThuat(maSC, INCIDENT_APPROVED, note, {
        MaNVQuanLyDuyet: currentStaff?.MaNV || '',
        TenNVQuanLyDuyet: currentStaff?.HoTen || '',
        NgayDuyetSua: new Date().toISOString()
    });
}

function batDauSuaChuaSuCo(maSC) {
    capNhatSuCoKyThuat(maSC, INCIDENT_REPAIRING, 'Kỹ thuật bắt đầu sửa chữa.', {
        MaNVKyThuat: currentStaff?.MaNV || '',
        TenNVKyThuat: currentStaff?.HoTen || '',
        NgayBatDauSua: new Date().toISOString()
    });
}

function baoDaSuaXongSuCo(maSC) {
    const note = prompt('Ghi chú sau khi sửa xong:', 'Kỹ thuật đã sửa chữa xong, chờ quản lý kiểm tra và xác nhận.');
    if (note === null) return;

    capNhatSuCoKyThuat(maSC, INCIDENT_FIXED, note, {
        NgaySuaXong: new Date().toISOString()
    });
}

function xacNhanHoanTatSuCo(maSC) {
    const note = prompt('Ghi chú xác nhận hoàn tất của quản lý:', 'Quản lý đã kiểm tra và xác nhận sự cố đã được xử lý.');
    if (note === null) return;

    capNhatSuCoKyThuat(maSC, INCIDENT_DONE, note, {
        MaNVQuanLyXacNhan: currentStaff?.MaNV || '',
        TenNVQuanLyXacNhan: currentStaff?.HoTen || '',
        NgayXacNhan: new Date().toISOString()
    });
}

// ============================================================
// KHACH HANG
// ============================================================
function veBangKhachHang() {
    const customers = docDuLieu('KhachHang');
    const bookings = docDuLieu('PhieuDatPhong');
    const table = document.getElementById('table-customers');

    if (customers.length === 0) {
        table.innerHTML = taoDongTrong(5, 'Chưa có khách hàng.');
        return;
    }

    table.innerHTML = customers.map(customer => {
        const customerBookings = bookings.filter(booking => booking.MaKH === customer.MaKH);
        const dates = customerBookings.map(booking => booking.NgayTao).filter(Boolean);
        const latestDate = dates.length
            ? new Date(Math.max(...dates.map(date => new Date(date).getTime()))).toLocaleString('vi-VN')
            : 'Chưa phát sinh';

        return `
        <tr class="border-b hover:bg-gray-50">
            <td class="p-3 font-bold">${escapeHTML(customer.MaKH)}</td>
            <td class="p-3">
                <p class="font-bold text-dark">${escapeHTML(customer.HoTen)}</p>
                <p class="text-xs text-gray-500">@${escapeHTML(customer.username || '')}</p>
            </td>
            <td class="p-3 text-gray-500">${escapeHTML(customer.SDT || '')}<br><span class="text-xs">${escapeHTML(customer.Email || '')}</span></td>
            <td class="p-3 font-bold">${customerBookings.length}</td>
            <td class="p-3 text-gray-500">${escapeHTML(latestDate)}</td>
        </tr>`;
    }).join('');
}

// ============================================================
// KHOI CHAY
// ============================================================
document.getElementById('login-form')?.addEventListener('submit', xuLyDangNhapAdmin);

window.addEventListener('DOMContentLoaded', () => {
    initAdminDB();

    if (docPhienAdmin()) {
        document.getElementById('login-screen').classList.add('hidden');
        apDungPhanQuyen();
        return;
    }

    chuyenTab('dashboard');
});
