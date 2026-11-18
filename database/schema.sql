-- =====================================================================
-- SSA HOTEL PMS — LƯỢC ĐỒ CƠ SỞ DỮ LIỆU QUAN HỆ (SQLite / Chuẩn SQL)
-- Tương ứng 10 thực thể Chương 3 báo cáo ĐACN + Bảng đồng bộ trạng thái
-- =====================================================================

PRAGMA foreign_keys = ON;

-- 1. Bảng Khách Hàng (KHACHHANG)
CREATE TABLE IF NOT EXISTS KhachHang (
    MaKH         TEXT PRIMARY KEY NOT NULL,
    HoTen        TEXT NOT NULL,
    NgaySinh     TEXT DEFAULT '1999-01-01',
    SoGiayTo     TEXT DEFAULT '079203001234',
    SDT          TEXT NOT NULL,
    Email        TEXT,
    TaiKhoan     TEXT,
    MatKhau      TEXT
);

-- 2. Bảng Nhân Viên (NHANVIEN)
CREATE TABLE IF NOT EXISTS NhanVien (
    MaNV         TEXT PRIMARY KEY NOT NULL,
    HoTen        TEXT NOT NULL,
    PhongBan     TEXT NOT NULL,
    ChucDanh     TEXT NOT NULL,
    MatKhau      TEXT DEFAULT '123'
);

-- 3. Bảng Loại Phòng (LOAIPHONG)
CREATE TABLE IF NOT EXISTS LoaiPhong (
    MaLoaiPhong  TEXT PRIMARY KEY NOT NULL,
    TenLoai      TEXT NOT NULL,
    SucChua      INTEGER NOT NULL CHECK (SucChua > 0),
    GiaSan       REAL NOT NULL DEFAULT 0 CHECK (GiaSan >= 0),
    GiaTieuChuan REAL NOT NULL CHECK (GiaTieuChuan >= GiaSan)
);

-- 4. Bảng Phòng (PHONG)
CREATE TABLE IF NOT EXISTS Phong (
    MaPhong         TEXT PRIMARY KEY NOT NULL,
    MaLoaiPhong     TEXT NOT NULL REFERENCES LoaiPhong(MaLoaiPhong),
    TrangThaiVeSinh TEXT NOT NULL
);

-- 5. Bảng Phiếu Đặt Phòng (PHIEUDATPHONG)
CREATE TABLE IF NOT EXISTS PhieuDatPhong (
    MaPDP            TEXT PRIMARY KEY NOT NULL,
    MaKH             TEXT NOT NULL REFERENCES KhachHang(MaKH),
    MaPhong          TEXT NOT NULL REFERENCES Phong(MaPhong),
    MaLoaiPhong      TEXT NOT NULL REFERENCES LoaiPhong(MaLoaiPhong),
    NgayNhanDuKien   TEXT NOT NULL,
    NgayTraDuKien    TEXT NOT NULL,
    SoDem            INTEGER NOT NULL CHECK (SoDem > 0),
    SoLuongKhach     INTEGER NOT NULL CHECK (SoLuongKhach > 0),
    DonGia           REAL NOT NULL DEFAULT 0 CHECK (DonGia >= 0),
    TongTienDuKien   REAL NOT NULL DEFAULT 0 CHECK (TongTienDuKien >= 0),
    TienCoc          REAL NOT NULL DEFAULT 0 CHECK (TienCoc >= 0),
    TrangThai        TEXT NOT NULL,
    GiayTo           TEXT,
    QuyenMoPhong     TEXT,
    KhaiBaoTamTru    TEXT,
    GhiChu           TEXT
);

-- 6. Bảng Phiếu Dịch Vụ POS (PHIEUDICHVU)
CREATE TABLE IF NOT EXISTS PhieuDichVu (
    MaPDV        TEXT PRIMARY KEY NOT NULL,
    MaPDP        TEXT NOT NULL REFERENCES PhieuDatPhong(MaPDP),
    ThoiGian     TEXT NOT NULL,
    TenDichVu    TEXT NOT NULL,
    SoLuong      INTEGER NOT NULL DEFAULT 1,
    DonGia       REAL NOT NULL DEFAULT 0,
    ThanhTien    REAL NOT NULL DEFAULT 0,
    KhachXacNhan TEXT
);

-- 7. Bảng Phiếu Tiêu Hao Minibar (PHIEUTIEUHAO)
CREATE TABLE IF NOT EXISTS PhieuTieuHao (
    MaPTH        TEXT PRIMARY KEY NOT NULL,
    MaPDP        TEXT NOT NULL REFERENCES PhieuDatPhong(MaPDP),
    MaSanPham    TEXT NOT NULL,
    SoLuong      INTEGER NOT NULL CHECK (SoLuong > 0),
    DonGia       REAL NOT NULL DEFAULT 0,
    ThanhTien    REAL NOT NULL DEFAULT 0,
    ThoiGian     TEXT NOT NULL
);

-- 8. Bảng Phiếu Bảo Trì / Sự Cố Kỹ Thuật (PHIEUBAOTRI)
CREATE TABLE IF NOT EXISTS PhieuBaoTri (
    MaPBT           TEXT PRIMARY KEY NOT NULL,
    MaPhong         TEXT,
    MaThietBi       TEXT NOT NULL DEFAULT 'Thiết bị phòng',
    MaNV            TEXT,
    MoTa            TEXT NOT NULL,
    ThoiGianBao     TEXT NOT NULL,
    ThoiGianHoanTat TEXT,
    TrangThai       TEXT NOT NULL
);

-- 9. Bảng Hóa Đơn Tổng (HOADONTONG)
CREATE TABLE IF NOT EXISTS HoaDonTong (
    MaHD                TEXT PRIMARY KEY NOT NULL,
    MaPDP               TEXT NOT NULL REFERENCES PhieuDatPhong(MaPDP),
    TongTienPhong       REAL NOT NULL DEFAULT 0,
    TongTienDichVu      REAL NOT NULL DEFAULT 0,
    Thue                REAL NOT NULL DEFAULT 0,
    TienCocCanTru       REAL NOT NULL DEFAULT 0,
    SoTienQuyetToan     REAL NOT NULL DEFAULT 0,
    PhuongThucThanhToan TEXT NOT NULL,
    MaGiaoDich          TEXT,
    NgayThanhToan       TEXT NOT NULL
);

-- 10. Bảng Báo Cáo Kiểm Toán Đêm (BAOCAOKIEMTOAN)
CREATE TABLE IF NOT EXISTS BaoCaoKiemToan (
    MaKy          TEXT PRIMARY KEY NOT NULL,
    NgayChotSo    TEXT NOT NULL UNIQUE,
    TongDoanhThu  REAL NOT NULL DEFAULT 0,
    DoanhThuPhong REAL NOT NULL DEFAULT 0,
    DoanhThuDV    REAL NOT NULL DEFAULT 0,
    ThucThu       REAL NOT NULL DEFAULT 0,
    TyLeLapDay    REAL NOT NULL DEFAULT 0 CHECK (TyLeLapDay >= 0 AND TyLeLapDay <= 100),
    TrangThai     TEXT NOT NULL DEFAULT 'Đã khóa sổ'
);

-- Bảng lưu trữ trạng thái đồng bộ thời gian thực giữa các trình duyệt
CREATE TABLE IF NOT EXISTS HeThongLuuTru (
    Khoa        TEXT PRIMARY KEY NOT NULL,
    GiaTriJson  TEXT NOT NULL,
    CapNhatLuc  TEXT NOT NULL
);
