-- =====================================================================
-- SSA HOTEL PMS — SCRIPT TẠO CƠ SỞ DỮ LIỆU SQL SERVER (SSMS 22 / T-SQL)
-- Bám sát 10 thực thể, Từ điển dữ liệu và Ràng buộc toàn vẹn Chương 3
-- =====================================================================

IF DB_ID('SSA_Hotel_PMS') IS NULL
    CREATE DATABASE SSA_Hotel_PMS;
GO
USE SSA_Hotel_PMS;
GO

-- Xóa các bảng cũ theo thứ tự khóa ngoại nếu chạy lại script
IF OBJECT_ID('HOADONTONG', 'U') IS NOT NULL DROP TABLE HOADONTONG;
IF OBJECT_ID('PHIEUDICHVU', 'U') IS NOT NULL DROP TABLE PHIEUDICHVU;
IF OBJECT_ID('PHIEUTIEUHAO', 'U') IS NOT NULL DROP TABLE PHIEUTIEUHAO;
IF OBJECT_ID('PHIEUBAOTRI', 'U') IS NOT NULL DROP TABLE PHIEUBAOTRI;
IF OBJECT_ID('PHIEUDATPHONG', 'U') IS NOT NULL DROP TABLE PHIEUDATPHONG;
IF OBJECT_ID('PHONG', 'U') IS NOT NULL DROP TABLE PHONG;
IF OBJECT_ID('LOAIPHONG', 'U') IS NOT NULL DROP TABLE LOAIPHONG;
IF OBJECT_ID('NHANVIEN', 'U') IS NOT NULL DROP TABLE NHANVIEN;
IF OBJECT_ID('KHACHHANG', 'U') IS NOT NULL DROP TABLE KHACHHANG;
IF OBJECT_ID('BAOCAOKIEMTOAN', 'U') IS NOT NULL DROP TABLE BAOCAOKIEMTOAN;
IF OBJECT_ID('HETHONGLUUTRU', 'U') IS NOT NULL DROP TABLE HETHONGLUUTRU;
GO

-- 1. Bảng Khách Hàng (KHACHHANG)
CREATE TABLE KHACHHANG (
    MaKH      VARCHAR(20)   PRIMARY KEY NOT NULL,
    HoTen     NVARCHAR(50)  NOT NULL,
    NgaySinh  DATE          NOT NULL DEFAULT '1999-01-01',
    SoGiayTo  VARCHAR(20)   NOT NULL DEFAULT '079203001234',
    SDT       VARCHAR(15)   NOT NULL,
    Email     VARCHAR(100)  NULL,
    TaiKhoan  VARCHAR(50)   NULL,
    MatKhau   VARCHAR(100)  NULL
);

-- 2. Bảng Nhân Viên (NHANVIEN)
CREATE TABLE NHANVIEN (
    MaNV      VARCHAR(20)   PRIMARY KEY NOT NULL,
    HoTen     NVARCHAR(50)  NOT NULL,
    PhongBan  NVARCHAR(50)  NOT NULL,
    ChucDanh  NVARCHAR(50)  NOT NULL,
    MatKhau   VARCHAR(100)  NOT NULL DEFAULT '123'
);

-- 3. Bảng Loại Phòng (LOAIPHONG)
CREATE TABLE LOAIPHONG (
    MaLoaiPhong  VARCHAR(20)   PRIMARY KEY NOT NULL,
    TenLoai      NVARCHAR(100) NOT NULL,
    SucChua      INT           NOT NULL CHECK (SucChua > 0),
    GiaSan       DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (GiaSan >= 0),
    GiaTieuChuan DECIMAL(12,2) NOT NULL,
    CONSTRAINT CK_LoaiPhong_Gia CHECK (GiaTieuChuan >= GiaSan)
);

-- 4. Bảng Phòng (PHONG)
CREATE TABLE PHONG (
    MaPhong         VARCHAR(20)  PRIMARY KEY NOT NULL,
    MaLoaiPhong     VARCHAR(20)  NOT NULL FOREIGN KEY REFERENCES LOAIPHONG(MaLoaiPhong),
    TrangThaiVeSinh NVARCHAR(50) NOT NULL
);

-- 5. Bảng Phiếu Đặt Phòng (PHIEUDATPHONG)
CREATE TABLE PHIEUDATPHONG (
    MaPDP          VARCHAR(50)    PRIMARY KEY NOT NULL,
    MaKH           VARCHAR(20)    NOT NULL FOREIGN KEY REFERENCES KHACHHANG(MaKH),
    MaPhong        VARCHAR(20)    NOT NULL FOREIGN KEY REFERENCES PHONG(MaPhong),
    MaLoaiPhong    VARCHAR(20)    NOT NULL FOREIGN KEY REFERENCES LOAIPHONG(MaLoaiPhong),
    NgayNhanDuKien DATE           NOT NULL,
    NgayTraDuKien  DATE           NOT NULL,
    SoDem          INT            NOT NULL DEFAULT 1 CHECK (SoDem > 0),
    SoLuongKhach   INT            NOT NULL CHECK (SoLuongKhach > 0),
    DonGia         DECIMAL(12,2)  NOT NULL DEFAULT 0 CHECK (DonGia >= 0),
    TongTienDuKien DECIMAL(12,2)  NOT NULL DEFAULT 0 CHECK (TongTienDuKien >= 0),
    TienCoc        DECIMAL(12,2)  NOT NULL DEFAULT 0 CHECK (TienCoc >= 0),
    TrangThai      NVARCHAR(50)   NOT NULL,
    GiayTo         NVARCHAR(100)  NULL,
    QuyenMoPhong   NVARCHAR(100)  NULL,
    KhaiBaoTamTru  NVARCHAR(500)  NULL,
    GhiChu         NVARCHAR(1000) NULL,
    CONSTRAINT CK_PDP_Ngay CHECK (NgayTraDuKien > NgayNhanDuKien)
);

-- 6. Bảng Phiếu Dịch Vụ POS (PHIEUDICHVU)
CREATE TABLE PHIEUDICHVU (
    MaPDV        VARCHAR(50)   PRIMARY KEY NOT NULL,
    MaPDP        VARCHAR(50)   NOT NULL FOREIGN KEY REFERENCES PHIEUDATPHONG(MaPDP),
    ThoiGian     DATE          NOT NULL,
    TenDichVu    NVARCHAR(100) NOT NULL,
    SoLuong      INT           NOT NULL CHECK (SoLuong > 0),
    DonGia       DECIMAL(12,2) NOT NULL DEFAULT 0,
    ThanhTien    DECIMAL(12,2) NOT NULL DEFAULT 0,
    KhachXacNhan NVARCHAR(100) NULL
);

-- 7. Bảng Phiếu Tiêu Hao Minibar (PHIEUTIEUHAO)
CREATE TABLE PHIEUTIEUHAO (
    MaPTH     VARCHAR(50)   PRIMARY KEY NOT NULL,
    MaPDP     VARCHAR(50)   NOT NULL FOREIGN KEY REFERENCES PHIEUDATPHONG(MaPDP),
    MaSanPham NVARCHAR(100) NOT NULL,
    SoLuong   INT           NOT NULL CHECK (SoLuong > 0),
    DonGia    DECIMAL(12,2) NOT NULL DEFAULT 0,
    ThanhTien DECIMAL(12,2) NOT NULL DEFAULT 0,
    ThoiGian  DATE          NOT NULL
);

-- 8. Bảng Phiếu Bảo Trì / Sự Cố Kỹ Thuật (PHIEUBAOTRI)
CREATE TABLE PHIEUBAOTRI (
    MaPBT           VARCHAR(50)   PRIMARY KEY NOT NULL,
    MaPhong         VARCHAR(20)   NULL,
    MaThietBi       NVARCHAR(100) NOT NULL,
    MaNV            VARCHAR(20)   NULL,
    MoTa            NVARCHAR(500) NOT NULL,
    ThoiGianBao     NVARCHAR(40)  NOT NULL,
    ThoiGianHoanTat NVARCHAR(40)  NULL,
    TrangThai       NVARCHAR(50)  NOT NULL
);

-- 9. Bảng Hóa Đơn Tổng (HOADONTONG)
CREATE TABLE HOADONTONG (
    MaHD                VARCHAR(50)   PRIMARY KEY NOT NULL,
    MaPDP               VARCHAR(50)   NOT NULL FOREIGN KEY REFERENCES PHIEUDATPHONG(MaPDP),
    TongTienPhong       DECIMAL(12,2) NOT NULL DEFAULT 0,
    TongTienDichVu      DECIMAL(12,2) NOT NULL DEFAULT 0,
    Thue                DECIMAL(12,2) NOT NULL DEFAULT 0,
    TienCocCanTru       DECIMAL(12,2) NOT NULL DEFAULT 0,
    SoTienQuyetToan     DECIMAL(12,2) NOT NULL DEFAULT 0,
    PhuongThucThanhToan NVARCHAR(50)  NOT NULL,
    MaGiaoDich          NVARCHAR(100) NULL,
    NgayThanhToan       NVARCHAR(40)  NOT NULL
);

-- 10. Bảng Báo Cáo Kiểm Toán Đêm (BAOCAOKIEMTOAN)
CREATE TABLE BAOCAOKIEMTOAN (
    MaKy          VARCHAR(50)   PRIMARY KEY NOT NULL,
    NgayChotSo    DATE          NOT NULL UNIQUE,
    TongDoanhThu  DECIMAL(14,2) NOT NULL DEFAULT 0,
    DoanhThuPhong DECIMAL(14,2) NOT NULL DEFAULT 0,
    DoanhThuDV    DECIMAL(14,2) NOT NULL DEFAULT 0,
    ThucThu       DECIMAL(14,2) NOT NULL DEFAULT 0,
    TyLeLapDay    DECIMAL(5,2)  NOT NULL DEFAULT 0 CHECK (TyLeLapDay >= 0 AND TyLeLapDay <= 100),
    TrangThai     NVARCHAR(50)  NOT NULL DEFAULT N'Đã khóa sổ'
);

-- Bảng trạng thái đồng bộ JSON với giao diện Web
CREATE TABLE HETHONGLUUTRU (
    Khoa       VARCHAR(50)   PRIMARY KEY NOT NULL,
    GiaTriJson NVARCHAR(MAX) NOT NULL,
    CapNhatLuc NVARCHAR(40)  NOT NULL
);
GO

-- =====================================================================
-- DỮ LIỆU KHỞI TẠO MẪU (SEED DATA)
-- =====================================================================

INSERT INTO KHACHHANG (MaKH, HoTen, NgaySinh, SoGiayTo, SDT, Email, TaiKhoan, MatKhau) VALUES
('KH01', N'Hoàng Gia Đức Phúc', '2005-11-06', '079205001720', '0901234567', 'phuc@hutech.edu.vn', 'phuc', '123');

INSERT INTO NHANVIEN (MaNV, HoTen, PhongBan, ChucDanh, MatKhau) VALUES
('NV01',        N'Ban Giám Đốc',          N'Quản Trị',    'admin',       '123'),
('NV02',        N'Nhân Viên Lễ Tân',      N'Tiền Sảnh',   'letan',       '123'),
('NV03',        N'Nhân Viên Buồng Phòng', N'Buồng Phòng', 'buongphong',  '123'),
('NV04',        N'Kỹ Sư Kỹ Thuật',        N'Kỹ Thuật',    'kythuat',     '123'),
('truongca',    N'Trưởng Tiền Sảnh',      N'Tiền Sảnh',   'truongca',    '123'),
('giamsattang', N'Giám Sát Tầng',         N'Buồng Phòng', 'giamsattang', '123'),
('phucvu',      N'Nhân Viên Phục Vụ',     N'Ẩm Thực',     'phucvu',      '123'),
('thungan',     N'Thu Ngân Dịch Vụ',      N'Tài Chính',   'thungan',     '123'),
('kiemtoan',    N'Kiểm Toán Đêm',         N'Tài Chính',   'kiemtoan',    '123'),
('hanhly',      N'Nhân Viên Hành Lý',     N'Tiền Sảnh',   'hanhly',      '123');

INSERT INTO LOAIPHONG (MaLoaiPhong, TenLoai, SucChua, GiaSan, GiaTieuChuan) VALUES
('LP_KING',  N'Phòng Tiêu Chuẩn King', 2, 100, 150),
('LP_TWIN',  N'Phòng Cao Cấp Twin',    4, 200, 280),
('LP_SUITE', N'SSA Executive Suite',   6, 600, 850);

INSERT INTO PHONG (MaPhong, MaLoaiPhong, TrangThaiVeSinh) VALUES
('P101', 'LP_KING',  N'Sẵn Sàng Đón Khách'),
('P102', 'LP_KING',  N'Sẵn Sàng Đón Khách'),
('P103', 'LP_KING',  N'Sẵn Sàng Đón Khách'),
('P104', 'LP_KING',  N'Sẵn Sàng Đón Khách'),
('P105', 'LP_KING',  N'Chưa dọn'),
('P106', 'LP_KING',  N'Sẵn Sàng Đón Khách'),
('P201', 'LP_TWIN',  N'Sẵn Sàng Đón Khách'),
('P202', 'LP_TWIN',  N'Đang sử dụng'),
('P203', 'LP_TWIN',  N'Sẵn Sàng Đón Khách'),
('P204', 'LP_TWIN',  N'Sẵn Sàng Đón Khách'),
('P205', 'LP_TWIN',  N'Chưa dọn'),
('P206', 'LP_TWIN',  N'Sẵn Sàng Đón Khách'),
('P301', 'LP_SUITE', N'Sẵn Sàng Đón Khách'),
('P302', 'LP_SUITE', N'Sẵn Sàng Đón Khách'),
('P303', 'LP_SUITE', N'Chưa dọn'),
('P304', 'LP_SUITE', N'Sẵn Sàng Đón Khách'),
('P401', 'LP_SUITE', N'Sẵn Sàng Đón Khách'),
('P402', 'LP_SUITE', N'Sẵn Sàng Đón Khách'),
('P403', 'LP_SUITE', N'Sẵn Sàng Đón Khách'),
('P501', 'LP_KING',  N'Sẵn Sàng Đón Khách'),
('P502', 'LP_TWIN',  N'Sẵn Sàng Đón Khách');
GO
