'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { DatabaseSync } = require('node:sqlite');

const DB_DIR = __dirname;
const DB_FILE = process.env.SSA_DB_PATH || path.join(DB_DIR, 'ssa_hotel.db');
const SCHEMA_FILE = path.join(DB_DIR, 'schema.sql');
const MSSQL_LIVE_FILE = path.join(DB_DIR, 'live_data_sqlserver.sql');
const MSSQL_SERVER = process.env.SSA_MSSQL_SERVER || '.\\SQLEXPRESS';

const ALLOWED_KEYS = new Set([
    'KhachHang',
    'NhanVien',
    'LoaiPhong',
    'Phong',
    'PhieuDatPhong',
    'SuCoKyThuat',
    'SSA_Workflows_v1',
    'SSA_Reviews_v1'
]);

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const SEED_DATA = () => ({
    KhachHang: [
        {
            MaKH: 'KH01',
            username: 'phuc',
            password: '123',
            HoTen: 'Hoàng Gia Đức Phúc',
            SDT: '0901234567',
            Email: 'phuc@hutech.edu.vn'
        }
    ],
    NhanVien: [
        { MaNV: 'NV01', HoTen: 'Ban Giám Đốc', PhongBan: 'Quản Trị', ChucDanh: 'admin', pass: '123' },
        { MaNV: 'NV02', HoTen: 'Nhân Viên Lễ Tân', PhongBan: 'Tiền Sảnh', ChucDanh: 'letan', pass: '123' },
        { MaNV: 'NV03', HoTen: 'Nhân Viên Buồng Phòng', PhongBan: 'Buồng Phòng', ChucDanh: 'buongphong', pass: '123' },
        { MaNV: 'NV04', HoTen: 'Kỹ Sư Kỹ Thuật', PhongBan: 'Kỹ Thuật', ChucDanh: 'kythuat', pass: '123' },
        { MaNV: 'truongca', HoTen: 'Trưởng Tiền Sảnh', PhongBan: 'Tiền Sảnh', ChucDanh: 'truongca', pass: '123' },
        { MaNV: 'giamsattang', HoTen: 'Giám Sát Tầng', PhongBan: 'Buồng Phòng', ChucDanh: 'giamsattang', pass: '123' },
        { MaNV: 'phucvu', HoTen: 'Nhân Viên Phục Vụ', PhongBan: 'Ẩm Thực', ChucDanh: 'phucvu', pass: '123' },
        { MaNV: 'thungan', HoTen: 'Thu Ngân Dịch Vụ', PhongBan: 'Tài Chính', ChucDanh: 'thungan', pass: '123' },
        { MaNV: 'kiemtoan', HoTen: 'Kiểm Toán Đêm', PhongBan: 'Tài Chính', ChucDanh: 'kiemtoan', pass: '123' },
        { MaNV: 'hanhly', HoTen: 'Nhân Viên Hành Lý', PhongBan: 'Tiền Sảnh', ChucDanh: 'hanhly', pass: '123' }
    ],
    LoaiPhong: [
        { MaLoaiPhong: 'LP_KING', TenLoai: 'Phòng Tiêu Chuẩn King', GiaSan: 100, GiaTieuChuan: 150, SucChua: 2 },
        { MaLoaiPhong: 'LP_TWIN', TenLoai: 'Phòng Cao Cấp Twin', GiaSan: 200, GiaTieuChuan: 280, SucChua: 4 },
        { MaLoaiPhong: 'LP_SUITE', TenLoai: 'SSA Executive Suite', GiaSan: 600, GiaTieuChuan: 850, SucChua: 6 }
    ],
    Phong: [
        { MaPhong: 'P101', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P102', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P103', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P104', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P105', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: 'Chưa dọn' },
        { MaPhong: 'P106', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P201', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P202', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: 'Đang sử dụng' },
        { MaPhong: 'P203', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P204', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P205', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: 'Chưa dọn' },
        { MaPhong: 'P206', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P301', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P302', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P303', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: 'Chưa dọn' },
        { MaPhong: 'P304', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P401', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P402', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P403', MaLoaiPhong: 'LP_SUITE', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P501', MaLoaiPhong: 'LP_KING', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' },
        { MaPhong: 'P502', MaLoaiPhong: 'LP_TWIN', TrangThaiVeSinh: 'Sẵn Sàng Đón Khách' }
    ],
    PhieuDatPhong: [],
    SuCoKyThuat: [],
    SSA_Workflows_v1: {
        version: 1,
        businessDate: todayStr(),
        lines: [],
        payments: [],
        logs: [],
        reports: [],
        tasks: [],
        requests: [],
        invoices: [],
        promotions: [],
        supplies: [],
        settings: { tax: 0, credit: 2000 },
        menu: [
            { id: 'WATER', name: 'Nước suối', price: 2, cost: 0.5, kind: 'minibar' },
            { id: 'BREAKFAST', name: 'Ăn sáng', price: 15, cost: 5, kind: 'service' }
        ]
    }
});

let db;
let stateVersion = 1;

function qN(v) {
    return "N'" + String(v ?? '').replaceAll("'", "''") + "'";
}

function qS(v) {
    return "'" + String(v ?? '').replaceAll("'", "''") + "'";
}

function qNum(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

function syncToSqlServer(data) {
    if (process.env.NODE_ENV === 'test') return;
    const { customers, staff, types, rooms, bookings, incidents, extra } = data;
    const lines = [
        'IF DB_ID(\'SSA_Hotel_PMS\') IS NOT NULL BEGIN',
        'USE SSA_Hotel_PMS;',
        'DELETE FROM HOADONTONG;',
        'DELETE FROM PHIEUDICHVU;',
        'DELETE FROM PHIEUTIEUHAO;',
        'DELETE FROM PHIEUBAOTRI;',
        'DELETE FROM PHIEUDATPHONG;',
        'DELETE FROM PHONG;',
        'DELETE FROM LOAIPHONG;',
        'DELETE FROM NHANVIEN;',
        'DELETE FROM KHACHHANG;',
        'DELETE FROM BAOCAOKIEMTOAN;'
    ];

    for (const c of customers) {
        lines.push(`INSERT INTO KHACHHANG (MaKH, HoTen, NgaySinh, SoGiayTo, SDT, Email, TaiKhoan, MatKhau) VALUES (${qS(c.MaKH)}, ${qN(c.HoTen)}, ${qS(c.NgaySinh || '1999-01-01')}, ${qS(c.SoGiayTo || '079203001234')}, ${qS(c.SDT || '0900000000')}, ${qS(c.Email || '')}, ${qS(c.username || '')}, ${qS(c.password || '')});`);
    }
    for (const s of staff) {
        lines.push(`INSERT INTO NHANVIEN (MaNV, HoTen, PhongBan, ChucDanh, MatKhau) VALUES (${qS(s.MaNV)}, ${qN(s.HoTen)}, ${qN(s.PhongBan || 'Vận Hành')}, ${qN(s.ChucDanh || 'letan')}, ${qS(s.pass || '123')});`);
    }
    for (const t of types) {
        const floor = qNum(t.GiaSan, 0);
        const rate = Math.max(floor, qNum(t.GiaTieuChuan, 100));
        lines.push(`INSERT INTO LOAIPHONG (MaLoaiPhong, TenLoai, SucChua, GiaSan, GiaTieuChuan) VALUES (${qS(t.MaLoaiPhong)}, ${qN(t.TenLoai)}, ${Math.max(1, qNum(t.SucChua, 2))}, ${floor}, ${rate});`);
    }
    for (const r of rooms) {
        lines.push(`INSERT INTO PHONG (MaPhong, MaLoaiPhong, TrangThaiVeSinh) VALUES (${qS(r.MaPhong)}, ${qS(r.MaLoaiPhong)}, ${qN(r.TrangThaiVeSinh || 'Sẵn Sàng Đón Khách')});`);
    }
    for (const b of bookings) {
        lines.push(`INSERT INTO PHIEUDATPHONG (MaPDP, MaKH, MaPhong, MaLoaiPhong, NgayNhanDuKien, NgayTraDuKien, SoDem, SoLuongKhach, DonGia, TongTienDuKien, TienCoc, TrangThai, GiayTo, QuyenMoPhong, KhaiBaoTamTru, GhiChu) VALUES (${qS(b.MaPDP)}, ${qS(b.MaKH)}, ${qS(b.MaPhong)}, ${qS(b.MaLoaiPhong)}, ${qS(b.NgayNhanDuKien || todayStr())}, ${qS(b.NgayTraDuKien || todayStr())}, ${Math.max(1, qNum(b.SoDem, 1))}, ${Math.max(1, qNum(b.SoKhach, 1))}, ${qNum(b.DonGia)}, ${qNum(b.TongTienDuKien)}, ${qNum(b.TienCoc)}, ${qN(b.TrangThai || 'Chờ nhận phòng')}, ${qN(b.GiayTo || '')}, ${qN(b.QuyenMoPhong || '')}, ${qN(b.KhaiBaoTamTru ? JSON.stringify(b.KhaiBaoTamTru) : '')}, ${qN(b.GhiChu || '')});`);
    }
    for (const line of (extra.lines || [])) {
        if (line.kind === 'minibar') {
            lines.push(`INSERT INTO PHIEUTIEUHAO (MaPTH, MaPDP, MaSanPham, SoLuong, DonGia, ThanhTien, ThoiGian) VALUES (${qS(line.id)}, ${qS(line.booking)}, ${qN(line.label)}, ${Math.max(1, qNum(line.quantity, 1))}, ${qNum(line.unitPrice ?? line.amount)}, ${qNum(line.amount)}, ${qS(line.date || todayStr())});`);
        } else {
            lines.push(`INSERT INTO PHIEUDICHVU (MaPDV, MaPDP, ThoiGian, TenDichVu, SoLuong, DonGia, ThanhTien, KhachXacNhan) VALUES (${qS(line.id)}, ${qS(line.booking)}, ${qS(line.date || todayStr())}, ${qN(line.label)}, ${Math.max(1, qNum(line.quantity, 1))}, ${qNum(line.unitPrice ?? line.amount)}, ${qNum(line.amount)}, ${qN(line.confirmedBy || '')});`);
        }
    }
    for (const i of incidents) {
        lines.push(`INSERT INTO PHIEUBAOTRI (MaPBT, MaPhong, MaThietBi, MaNV, MoTa, ThoiGianBao, ThoiGianHoanTat, TrangThai) VALUES (${qS(i.MaSC)}, ${i.MaPhong ? qS(i.MaPhong) : 'NULL'}, ${qN(i.NhomSuCo || i.KhuVuc || 'Thiết bị')}, ${qS(i.MaNVBao || 'NV01')}, ${qN(i.MoTa)}, ${qS(i.NgayTao || '')}, ${qS(i.NgayCapNhat || '')}, ${qN(i.TrangThai)});`);
    }
    for (const inv of (extra.invoices || [])) {
        lines.push(`INSERT INTO HOADONTONG (MaHD, MaPDP, TongTienPhong, TongTienDichVu, Thue, TienCocCanTru, SoTienQuyetToan, PhuongThucThanhToan, MaGiaoDich, NgayThanhToan) VALUES (${qS(inv.id)}, ${qS(inv.booking)}, ${qNum(inv.roomTotal)}, ${qNum(inv.service)}, ${qNum(inv.tax)}, ${qNum(inv.deposit)}, ${qNum(inv.due)}, ${qN(inv.payment?.method || 'Tiền mặt')}, ${qN(inv.payment?.ref || '')}, ${qS(inv.issuedAt || inv.date || todayStr())});`);
    }
    for (const r of (extra.reports || [])) {
        const roomRev = qNum(r.roomRevenue);
        const svcRev = qNum(r.services);
        lines.push(`INSERT INTO BAOCAOKIEMTOAN (MaKy, NgayChotSo, TongDoanhThu, DoanhThuPhong, DoanhThuDV, ThucThu, TyLeLapDay, TrangThai) VALUES (${qS(r.id)}, ${qS(r.date || todayStr())}, ${roomRev + svcRev}, ${roomRev}, ${svcRev}, ${qNum(r.receipts)}, ${Math.min(100, Math.max(0, qNum(r.occupancy)))}, N'Đã khóa sổ');`);
    }
    lines.push('END');

    try {
        fs.writeFileSync(MSSQL_LIVE_FILE, lines.join('\n'), 'utf8');
        const child = spawn('sqlcmd', ['-S', MSSQL_SERVER, '-C', '-E', '-f', '65001', '-i', MSSQL_LIVE_FILE], {
            stdio: 'ignore',
            windowsHide: true
        });
        child.on('error', () => {});
    } catch {}
}

function openDB() {
    if (db) return db;
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    db = new DatabaseSync(DB_FILE);
    db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = OFF;');
    db.exec(fs.readFileSync(SCHEMA_FILE, 'utf8'));
    const count = db.prepare('SELECT COUNT(*) AS c FROM HeThongLuuTru').get().c;
    if (!count) {
        resetToSeed();
    } else {
        syncRelationalTables();
    }
    return db;
}

function getAllStorage() {
    openDB();
    const rows = db.prepare('SELECT Khoa, GiaTriJson FROM HeThongLuuTru').all();
    const items = {};
    for (const r of rows) {
        items[r.Khoa] = r.GiaTriJson;
    }
    return { version: stateVersion, items };
}

function parseKey(key, fallback) {
    const row = db.prepare('SELECT GiaTriJson FROM HeThongLuuTru WHERE Khoa = ?').get(key);
    if (!row) return fallback;
    try {
        return JSON.parse(row.GiaTriJson);
    } catch {
        return fallback;
    }
}

function syncRelationalTables() {
    const customers = parseKey('KhachHang', []);
    const staff = parseKey('NhanVien', []);
    const types = parseKey('LoaiPhong', []);
    const rooms = parseKey('Phong', []);
    const bookings = parseKey('PhieuDatPhong', []);
    const incidents = parseKey('SuCoKyThuat', []);
    const extra = parseKey('SSA_Workflows_v1', {}) || {};

    db.exec('PRAGMA foreign_keys = OFF; BEGIN IMMEDIATE;');
    try {
        db.exec(`
            DELETE FROM HoaDonTong;
            DELETE FROM PhieuDichVu;
            DELETE FROM PhieuTieuHao;
            DELETE FROM PhieuBaoTri;
            DELETE FROM PhieuDatPhong;
            DELETE FROM Phong;
            DELETE FROM LoaiPhong;
            DELETE FROM NhanVien;
            DELETE FROM KhachHang;
            DELETE FROM BaoCaoKiemToan;
        `);

        const insKH = db.prepare('INSERT OR REPLACE INTO KhachHang (MaKH, HoTen, NgaySinh, SoGiayTo, SDT, Email, TaiKhoan, MatKhau) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        for (const c of customers) {
            insKH.run(String(c.MaKH || ''), String(c.HoTen || ''), String(c.NgaySinh || '1999-01-01'), String(c.SoGiayTo || '079203001234'), String(c.SDT || '0900000000'), String(c.Email || ''), String(c.username || ''), String(c.password || ''));
        }

        const insNV = db.prepare('INSERT OR REPLACE INTO NhanVien (MaNV, HoTen, PhongBan, ChucDanh, MatKhau) VALUES (?, ?, ?, ?, ?)');
        for (const s of staff) {
            insNV.run(String(s.MaNV || ''), String(s.HoTen || ''), String(s.PhongBan || 'Vận Hành'), String(s.ChucDanh || 'letan'), String(s.pass || '123'));
        }

        const insLP = db.prepare('INSERT OR REPLACE INTO LoaiPhong (MaLoaiPhong, TenLoai, SucChua, GiaSan, GiaTieuChuan) VALUES (?, ?, ?, ?, ?)');
        for (const t of types) {
            const rate = Number(t.GiaTieuChuan || 100);
            const floor = Number(t.GiaSan ?? 0);
            insLP.run(String(t.MaLoaiPhong || ''), String(t.TenLoai || ''), Math.max(1, Number(t.SucChua || 2)), floor, Math.max(floor, rate));
        }

        const insP = db.prepare('INSERT OR REPLACE INTO Phong (MaPhong, MaLoaiPhong, TrangThaiVeSinh) VALUES (?, ?, ?)');
        for (const r of rooms) {
            insP.run(String(r.MaPhong || ''), String(r.MaLoaiPhong || ''), String(r.TrangThaiVeSinh || 'Sẵn Sàng Đón Khách'));
        }

        const insPDP = db.prepare(`INSERT OR REPLACE INTO PhieuDatPhong
            (MaPDP, MaKH, MaPhong, MaLoaiPhong, NgayNhanDuKien, NgayTraDuKien, SoDem, SoLuongKhach, DonGia, TongTienDuKien, TienCoc, TrangThai, GiayTo, QuyenMoPhong, KhaiBaoTamTru, GhiChu)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const b of bookings) {
            insPDP.run(
                String(b.MaPDP || ''),
                String(b.MaKH || ''),
                String(b.MaPhong || ''),
                String(b.MaLoaiPhong || ''),
                String(b.NgayNhanDuKien || todayStr()),
                String(b.NgayTraDuKien || todayStr()),
                Math.max(1, Number(b.SoDem || 1)),
                Math.max(1, Number(b.SoKhach || 1)),
                Number(b.DonGia || 0),
                Number(b.TongTienDuKien || 0),
                Number(b.TienCoc || 0),
                String(b.TrangThai || 'Chờ nhận phòng'),
                String(b.GiayTo || ''),
                String(b.QuyenMoPhong || ''),
                b.KhaiBaoTamTru ? JSON.stringify(b.KhaiBaoTamTru) : '',
                String(b.GhiChu || '')
            );
        }

        const insPDV = db.prepare('INSERT OR REPLACE INTO PhieuDichVu (MaPDV, MaPDP, ThoiGian, TenDichVu, SoLuong, DonGia, ThanhTien, KhachXacNhan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        const insPTH = db.prepare('INSERT OR REPLACE INTO PhieuTieuHao (MaPTH, MaPDP, MaSanPham, SoLuong, DonGia, ThanhTien, ThoiGian) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const line of (extra.lines || [])) {
            if (line.kind === 'minibar') {
                insPTH.run(String(line.id || ''), String(line.booking || ''), String(line.label || ''), Math.max(1, Number(line.quantity || 1)), Number(line.unitPrice || line.amount || 0), Number(line.amount || 0), String(line.date || todayStr()));
            } else {
                insPDV.run(String(line.id || ''), String(line.booking || ''), String(line.date || todayStr()), String(line.label || ''), Math.max(1, Number(line.quantity || 1)), Number(line.unitPrice || line.amount || 0), Number(line.amount || 0), String(line.confirmedBy || ''));
            }
        }

        const insPBT = db.prepare('INSERT OR REPLACE INTO PhieuBaoTri (MaPBT, MaPhong, MaThietBi, MaNV, MoTa, ThoiGianBao, ThoiGianHoanTat, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        for (const i of incidents) {
            insPBT.run(String(i.MaSC || ''), String(i.MaPhong || ''), String(i.NhomSuCo || i.KhuVuc || 'Thiết bị'), String(i.MaNVBao || 'NV01'), String(i.MoTa || ''), String(i.NgayTao || ''), String(i.NgayCapNhat || ''), String(i.TrangThai || ''));
        }

        const insHD = db.prepare('INSERT OR REPLACE INTO HoaDonTong (MaHD, MaPDP, TongTienPhong, TongTienDichVu, Thue, TienCocCanTru, SoTienQuyetToan, PhuongThucThanhToan, MaGiaoDich, NgayThanhToan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        for (const inv of (extra.invoices || [])) {
            insHD.run(
                String(inv.id || ''),
                String(inv.booking || ''),
                Number(inv.roomTotal || 0),
                Number(inv.service || 0),
                Number(inv.tax || 0),
                Number(inv.deposit || 0),
                Number(inv.due || 0),
                String(inv.payment?.method || 'Tiền mặt'),
                String(inv.payment?.ref || ''),
                String(inv.issuedAt || inv.date || todayStr())
            );
        }

        const insBC = db.prepare('INSERT OR REPLACE INTO BaoCaoKiemToan (MaKy, NgayChotSo, TongDoanhThu, DoanhThuPhong, DoanhThuDV, ThucThu, TyLeLapDay, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        for (const r of (extra.reports || [])) {
            const roomRev = Number(r.roomRevenue || 0);
            const svcRev = Number(r.services || 0);
            insBC.run(String(r.id || ''), String(r.date || todayStr()), roomRev + svcRev, roomRev, svcRev, Number(r.receipts || 0), Math.min(100, Math.max(0, Number(r.occupancy || 0))), 'Đã khóa sổ');
        }

        db.exec('COMMIT;');
    } catch (err) {
        try { db.exec('ROLLBACK;'); } catch {}
        throw err;
    }

    syncToSqlServer({ customers, staff, types, rooms, bookings, incidents, extra });
}

function updateStorage(updates) {
    openDB();
    const now = new Date().toISOString();
    const upsert = db.prepare('INSERT OR REPLACE INTO HeThongLuuTru (Khoa, GiaTriJson, CapNhatLuc) VALUES (?, ?, ?)');
    const del = db.prepare('DELETE FROM HeThongLuuTru WHERE Khoa = ?');
    for (const [k, v] of Object.entries(updates || {})) {
        if (!ALLOWED_KEYS.has(k)) continue;
        if (v === null || v === undefined) {
            del.run(k);
        } else {
            const raw = typeof v === 'string' ? v : JSON.stringify(v);
            upsert.run(k, raw, now);
        }
    }
    syncRelationalTables();
    stateVersion += 1;
    return { version: stateVersion };
}

function resetToSeed() {
    openDB();
    const seed = SEED_DATA();
    const now = new Date().toISOString();
    const upsert = db.prepare('INSERT OR REPLACE INTO HeThongLuuTru (Khoa, GiaTriJson, CapNhatLuc) VALUES (?, ?, ?)');
    for (const [k, v] of Object.entries(seed)) {
        upsert.run(k, JSON.stringify(v), now);
    }
    syncRelationalTables();
    stateVersion += 1;
    return { version: stateVersion };
}

function getRelationalSummary() {
    openDB();
    const tables = ['KhachHang', 'NhanVien', 'LoaiPhong', 'Phong', 'PhieuDatPhong', 'PhieuDichVu', 'PhieuTieuHao', 'PhieuBaoTri', 'HoaDonTong', 'BaoCaoKiemToan'];
    const result = {};
    for (const t of tables) {
        result[t] = db.prepare(`SELECT * FROM ${t}`).all();
    }
    return { dbFile: path.basename(DB_FILE), sqlServer: MSSQL_SERVER, sqlDatabase: 'SSA_Hotel_PMS', version: stateVersion, tables: result };
}

module.exports = {
    openDB,
    getAllStorage,
    updateStorage,
    resetToSeed,
    getRelationalSummary,
    getVersion: () => stateVersion
};
