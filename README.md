# SSA Hotel — DACS

Ứng dụng đồ án quản lý khách sạn bằng HTML/JavaScript. Bản mở rộng triển khai các luồng của 6 nhóm UC trên nền hiện tại, dùng chung dữ liệu giữa website khách hàng và PMS nhân viên.

## Chạy ứng dụng

Cần Node.js 20 trở lên. Không cần cài thư viện để chạy ứng dụng hoặc kiểm thử nghiệp vụ.

```sh
npm start
```

Mở `http://127.0.0.1:4173/`. Khách hàng: `User/index.html`. Nhân viên: `Admin/admin.html` → **Nghiệp vụ theo UC**.

Mở cả hai trang trên cùng địa chỉ máy chủ và cùng hồ sơ trình duyệt để dùng chung dữ liệu. Không mở bằng `file://` vì phạm vi lưu trữ giữa các trang có thể khác nhau.

## Tài khoản trình diễn

Mật khẩu các tài khoản mẫu: `123`. Tài khoản khách: `phuc`.

| Tài khoản nhân viên | Vai trò |
|---|---|
| `admin` | Ban giám đốc, đầy đủ quyền |
| `letan` | Đặt/nhận phòng, điều chỉnh lịch, thu cọc, trả phòng |
| `truongca` | Trưởng tiền sảnh, phê duyệt nâng hạng và điều chỉnh giá |
| `buongphong` | Dọn phòng, minibar, kiểm phòng trả, đồ thất lạc |
| `giamsattang` | Nghiệm thu, yêu cầu dọn lại, phân công |
| `kythuat` | Sự cố, sửa chữa, vật tư, bảo trì |
| `phucvu` | Ghi đơn dịch vụ, đặt bàn |
| `thungan` | Ghi nợ dịch vụ/minibar, tất toán |
| `kiemtoan` | Duyệt vật tư, kiểm toán đêm, báo cáo |
| `hanhly` | Điều phối, ký gửi và hoàn tất phiếu hành lý |

## Nghiệp vụ theo bộ UC

| Nhóm | Luồng đã triển khai |
|---|---|
| 1. Đặt và nhận phòng | Kiểm tra quỹ phòng, đặt nhiều phòng, sửa lịch, hủy/hoàn cọc, ghi nhận cọc thực thu, đối chiếu giấy tờ, cấp mã thẻ, ghi mã tiếp nhận khai báo, điều phối hành lý |
| 2. Điều chỉnh lưu trú | Đổi phòng trống đã nghiệm thu, tính giá theo từng giai đoạn, nâng hạng miễn phí có quyền duyệt, đổi ngày trả, điều chỉnh chi phí kèm lý do, nhật ký |
| 3. Dịch vụ/minibar | Danh mục và đơn giá, số lượng, xác nhận ký nợ, kiểm tra hạn mức, hạch toán đúng lượt ở; phiếu đặt bàn |
| 4. Buồng phòng/kỹ thuật | Dọn → chờ nghiệm thu → đạt/dọn lại; sự cố → báo quản lý → duyệt → sửa → báo xong → nghiệm thu; phiếu phân công, bảo trì, vật tư, đồ thất lạc |
| 5. Trả phòng/tất toán | Kiểm phòng, tổng hợp tiền phòng/dịch vụ/điều chỉnh/thuế, cấn trừ cọc, thu hoặc hoàn tiền, mã giao dịch thẻ/chuyển khoản, hóa đơn in, thu hồi mã thẻ và chuyển phòng chờ dọn |
| 6. Kiểm toán/quản trị | Rà soát hồ sơ chưa hoàn tất, khóa ngày một lần, báo cáo doanh thu và thực thu tách biệt, chuyển ngày, CSV, công suất dự kiến 7 ngày, cấu hình giá sàn/giá bán/thuế/hạn mức, tra nhật ký |

Khách hàng theo dõi trạng thái, sổ chi phí và gửi yêu cầu sửa/hủy, đổi phòng, dịch vụ, trả phòng. Nhân viên xử lý nghiệp vụ và trả lời trong mục đặt/nhận phòng.

## Kịch bản trình diễn

1. Đăng nhập `admin`, lập phiếu nhận hôm nay và trả ngày mai; nhập cọc **đã thu** hoặc để 0.
2. Nhận phòng, nhập giấy tờ/quốc tịch/mã thẻ. Sau khi khai báo qua kênh bên ngoài, ghi mã tiếp nhận vào lượt ở.
3. Ghi ăn sáng/minibar với xác nhận ký nợ. Có thể đổi phòng hoặc điều chỉnh chi phí.
4. Khóa ngày trong Kiểm toán/quản trị để chuyển sang ngày trả. Màn hình liệt kê hồ sơ cần xử lý nếu chưa đủ điều kiện.
5. Kiểm phòng trả; nếu bổ sung minibar thì kiểm phòng lại. Mở sổ chi phí, tất toán đúng số tiền, xác nhận giao dịch thực tế.
6. Phòng chuyển sang chờ dọn. Báo dọn xong rồi nghiệm thu; sự cố chưa đóng sẽ chặn nghiệm thu.

Tiền trên giao diện giữ đơn vị **USD** của dự án gốc. Tiền âm ở bước tất toán là hoàn tiền. Thay đổi giá bán chỉ ảnh hưởng đặt phòng mới; khi đổi phòng, đơn giá mới áp dụng từ ngày kinh doanh hiện tại. Ngày đã khóa không được sửa lùi. Báo cáo kiểm toán ghi doanh thu theo đêm, không cộng tiền phòng thêm lần nữa vào hóa đơn.

## Dữ liệu và giới hạn của bản trình diễn

- Giữ các bảng cũ `Phong`, `LoaiPhong`, `KhachHang`, `PhieuDatPhong`, `SuCoKyThuat`; phần mở rộng nằm ở `SSA_Workflows_v1`. Không xóa dữ liệu cũ khi nâng cấp. Cọc đã có trong phiếu cũ được giữ theo dữ liệu trước đó.
- `shared/pms.js` xử lý kiểm tra quyền, trạng thái, tồn phòng, tính tiền và ghi nhật ký. Có nhật ký khôi phục khi thao tác lưu bị gián đoạn; các màn hình mới dùng Web Locks khi trình duyệt hỗ trợ để tuần tự hóa thao tác giữa các tab.
- Đây là ứng dụng **localStorage**, không có backend. Tài khoản, quyền và nhật ký trên trình duyệt không chống được người dùng sửa dữ liệu bằng DevTools, không phải xác thực hay nhật ký bất biến dùng cho vận hành thật. Dữ liệu không đồng bộ giữa các máy.
- Giấy tờ, khai báo tạm trú, mã thẻ mở phòng, chuẩn chi và chuyển khoản được **nhập/xác nhận thủ công**. Chưa tích hợp OCR, cơ quan tiếp nhận, thiết bị khóa hoặc ngân hàng; ứng dụng không tự gửi hồ sơ hay chuyển tiền.
- Phiếu vật tư/bảo trì/đồ thất lạc/hành lý lưu nội dung, người phụ trách, chi phí, ngày và trạng thái. Có định mức vật tư mỗi phòng và báo cáo giá vốn dịch vụ theo đơn giá nguyên liệu khai báo; chưa có sổ kho nhập/xuất. Công suất dự kiến tính từ đặt phòng hiện có, không phải mô hình AI dự báo.
- Trưởng ca lập chiến dịch theo hạng phòng/khoảng ngày, giám đốc phê duyệt; khách nhập mã khi đặt phòng. Giá khuyến mãi phải đạt giá sàn. Thuế và giá đặt được lưu theo từng phiếu để cấu hình mới không sửa số tiền đã thỏa thuận.
- Font và Tailwind của giao diện gốc dùng CDN, cần mạng khi tải giao diện lần đầu.

## Kiểm thử

```sh
npm test
npm run check
```

Kiểm thử nghiệp vụ bao gồm chuỗi lưu trú, trùng lịch, phân quyền, tiền cọc, hạn mức, thu/hoàn tiền, khóa ngày, sửa chữa và khôi phục khi lưu lỗi.

Kiểm thử trình duyệt: cài Playwright vào môi trường kiểm thử, có Microsoft Edge, chạy `npm start` rồi `node tests/browser.cjs`. Có thể đặt `PLAYWRIGHT_MODULE` thành đường dẫn gói Playwright đã cài. Bài kiểm thử dùng hồ sơ trình duyệt riêng và ghi ảnh vào `test-results/`, không sử dụng dữ liệu đang mở của người dùng.
