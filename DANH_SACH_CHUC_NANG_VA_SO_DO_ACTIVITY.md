TỔNG HỢP DANH SÁCH CHỨC NĂNG HỆ THỐNG VÀ HƯỚNG DẪN VẼ SƠ ĐỒ ACTIVITY DIAGRAM (3 CỘT)

I. DANH SÁCH TÊN CÁC CHỨC NĂNG HỆ THỐNG

1. Đăng ký tài khoản người dùng
2. Đăng nhập hệ thống
3. Cập nhật hồ sơ người dùng
4. Nông dân đăng bài bán nông sản
5. Doanh nghiệp đăng nhu cầu thu mua nông sản
6. Nông dân gửi báo giá và thương lượng nhu cầu thu mua
7. Doanh nghiệp đặt hàng nông sản (Tạo đơn hàng B2B)
8. Xác nhận đơn hàng và thanh toán cọc / phí vận chuyển
9. Thanh toán trực tuyến qua VNPAY / MoMo
10. Quản lý vận chuyển và giao nhận hàng nông sản
11. Xác nhận hoàn tất đơn hàng và đánh giá đối tác
12. Gợi ý nông sản và đối tác bằng AI
13. Gửi và xử lý báo cáo khiếu nại giao dịch


II. HƯỚNG DẪN CHI TIẾT VẼ SƠ ĐỒ ACTIVITY DIAGRAM CHO TỪNG CHỨC NĂNG (3 CỘT)

Quy ước chung khi vẽ:
- 3 Cột tác nhân (Swimlanes): [Người dùng] | [Giao diện người dùng] | [Hệ thống xử lý]
- Luồng vẽ xuất phát từ nút [Bắt đầu] đi qua lần lượt các bước được đánh số 1, 2, 3...
- Đối với bước có phân nhánh xét đúng / sai:
  + X.1 (Nếu đúng / hợp lệ): Luồng đi tiếp theo khi thỏa mãn điều kiện.
  + X.2 (Nếu sai / không hợp lệ): Luồng đi tiếp theo khi không thỏa mãn điều kiện.
- Khi chạm nút [Kết thúc]: Bên dưới không còn đường đi nữa.


--------------------------------------------------------------------------------

CHỨC NĂNG 1: ĐĂNG KÝ TÀI KHOẢN NGƯỜI DÙNG
Hình 3.19: Giao diện chức năng đăng ký nông dân
Hình 3.20: Giao diện chức năng đăng ký doanh nghiệp

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Chọn loại tài khoản muốn đăng ký (Nông dân hoặc Doanh nghiệp) và truy cập trang Đăng ký.
2. Cột [Giao diện người dùng]: Hiển thị biểu mẫu đăng ký tương ứng với loại tài khoản đã chọn.
3. Cột [Người dùng]: Nhập đầy đủ thông tin (Họ tên, Số điện thoại, Email, Mật khẩu, CCCD/Mã số thuế, Giấy phép) và nhấn "Đăng ký".
4. Cột [Giao diện người dùng]: Thu thập dữ liệu biểu mẫu và gửi yêu cầu đăng ký lên hệ thống.
5. Cột [Hệ thống xử lý]: Kiểm tra tính hợp lệ của dữ liệu đầu vào (định dạng SĐT/Email, kiểm tra xem SĐT/Email đã tồn tại trong CSDL hay chưa).
   - 6.1 (Nếu dữ liệu hợp lệ): Cột [Hệ thống xử lý] -> Mã hóa mật khẩu, tạo tài khoản trong CSDL, sinh mã OTP xác nhận -> Chuyển sang bước 7.
   - 6.2 (Nếu dữ liệu không hợp lệ / bị trùng): Cột [Giao diện người dùng] -> Hiển thị thông báo lỗi (Số điện thoại hoặc Email đã tồn tại) -> Quay lại bước 3.
7. Cột [Giao diện người dùng]: Hiển thị màn hình nhập mã OTP xác thực.
8. Cột [Người dùng]: Nhập mã OTP nhận được qua tin nhắn/email và bấm "Xác nhận OTP".
9. Cột [Hệ thống xử lý]: Kiểm tra mã OTP vừa nhập.
   - 10.1 (Nếu mã OTP đúng và còn thời hạn): Cột [Hệ thống xử lý] -> Đánh dấu xác thực thành công, kích hoạt tài khoản -> Chuyển sang bước 11.
   - 10.2 (Nếu mã OTP sai hoặc hết hạn): Cột [Giao diện người dùng] -> Hiển thị thông báo mã OTP không chính xác -> Quay lại bước 8.
11. Cột [Giao diện người dùng]: Hiển thị thông báo đăng ký thành công và chuyển hướng về trang Đăng nhập.
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 2: ĐĂNG NHẬP HỆ THỐNG
Hình 3.21: Giao diện chức năng đăng nhập nông dân
Hình 3.22: Giao diện chức năng đăng nhập doanh nghiệp
Hình 3.23: Giao diện chức năng đăng nhập admin

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Nhập thông tin đăng nhập (Số điện thoại / Email và Mật khẩu) tại trang Đăng nhập và nhấn "Đăng nhập".
2. Cột [Giao diện người dùng]: Thu thập thông tin tài khoản và gửi yêu cầu xác thực đến hệ thống.
3. Cột [Hệ thống xử lý]: Trích xuất tài khoản từ CSDL và kiểm tra mật khẩu đã mã hóa.
   - 4.1 (Nếu thông tin đăng nhập chính xác và tài khoản đang hoạt động): Cột [Hệ thống xử lý] -> Khởi tạo Token phiên làm việc (JWT), lưu phiên đăng nhập và kiểm tra Vai trò (Role) người dùng -> Chuyển sang bước 5.
   - 4.2 (Nếu thông tin sai hoặc tài khoản bị khóa): Cột [Giao diện người dùng] -> Hiển thị thông báo "Tên đăng nhập hoặc mật khẩu không chính xác" -> Quay lại bước 1.
5. Cột [Hệ thống xử lý]: Kiểm tra Vai trò (Role) của tài khoản vừa đăng nhập thành công.
   - 6.1 (Nếu Vai trò là Nông dân): Cột [Giao diện người dùng] -> Điều hướng đến Trang quản lý dành cho Nông dân -> [Kết thúc]
   - 6.2 (Nếu Vai trò là Doanh nghiệp): Cột [Giao diện người dùng] -> Điều hướng đến Trang quản lý dành cho Doanh nghiệp -> [Kết thúc]
   - 6.3 (Nếu Vai trò là Admin): Cột [Giao diện người dùng] -> Điều hướng đến Trang Dashboard Quản trị Admin -> [Kết thúc]
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 3: CẬP NHẬT HỒ SƠ NGƯỜI DÙNG
Hình 3.24: Giao diện chức năng cập nhật hồ sơ nông dân
Hình 3.25: Giao diện chức năng cập nhật hồ sơ doanh nghiệp

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Truy cập vào mục "Cập nhật hồ sơ cá nhân / doanh nghiệp".
2. Cột [Giao diện người dùng]: Hiển thị thông tin hồ sơ hiện tại được tải từ hệ thống.
3. Cột [Người dùng]: Chỉnh sửa các thông tin cần thay đổi (Họ tên, Địa chỉ trang trại/kho hàng, Tỉnh thành, Tải lên ảnh đại diện / Chứng nhận VietGAP, Số tài khoản nhận tiền) và nhấn "Lưu thay đổi".
4. Cột [Giao diện người dùng]: Kiểm tra sơ bộ định dạng và gửi dữ liệu cập nhật lên hệ thống.
5. Cột [Hệ thống xử lý]: Kiểm tra tính hợp lệ của dữ liệu cập nhật và các tệp hình ảnh tải lên.
   - 6.1 (Nếu dữ liệu hợp lệ): Cột [Hệ thống xử lý] -> Cập nhật thông tin mới vào CSDL PostgreSQL và lưu trữ tệp đính kèm -> Chuyển sang bước 7.
   - 6.2 (Nếu dữ liệu không hợp lệ): Cột [Giao diện người dùng] -> Hiển thị thông báo lỗi nhập liệu -> Quay lại bước 3.
7. Cột [Giao diện người dùng]: Hiển thị thông báo "Cập nhật hồ sơ thành công" và cập nhật thông tin mới lên giao diện.
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 4: NÔNG DÂN ĐĂNG BÀI BÁN NÔNG SẢN
Hình 3.26: Giao diện chức năng đăng bài bán nông sản

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Chọn chức năng "Đăng bài bán nông sản".
2. Cột [Giao diện người dùng]: Hiển thị biểu mẫu nhập thông tin chi tiết bài đăng nông sản.
3. Cột [Người dùng]: Nhập thông tin sản phẩm (Tên nông sản, Danh mục loại trái cây, Số lượng có, Giá bán per kg, Địa chỉ lấy hàng, Tải hình ảnh/video, Chọn tiêu chuẩn chất lượng) và nhấn "Đăng bài".
4. Cột [Giao diện người dùng]: Kiểm tra các thông tin bắt buộc và gửi dữ liệu bài đăng tới hệ thống.
5. Cột [Hệ thống xử lý]: Kiểm tra hợp lệ dữ liệu và tự động chạy thuật toán kiểm tra biến động giá nông sản.
   - 6.1 (Nếu dữ liệu hợp lệ và mức giá nằm trong khoảng cho phép): Cột [Hệ thống xử lý] -> Lưu bài đăng vào CSDL với trạng thái "Đang bán" (dang_ban), đăng công khai lên chợ nông sản -> Chuyển sang bước 7.1.
   - 6.2 (Nếu thiếu thông tin hoặc giá phát hiện bất thường lớn): Cột [Hệ thống xử lý] -> Lưu bài đăng với trạng thái "Chờ duyệt" (cho_duyet) hoặc thông báo yêu cầu điều chỉnh -> Chuyển sang bước 7.2.
7.1. Cột [Giao diện người dùng]: Hiển thị thông báo "Đăng bài bán nông sản thành công, sản phẩm đã lên sàn" -> [Kết thúc]
7.2. Cột [Giao diện người dùng]: Hiển thị thông báo "Bài đăng đang được lưu ở hàng chờ kiểm duyệt giá" -> [Kết thúc]
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 5: DOANH NGHIỆP ĐĂNG NHU CẦU THU MUA NÔNG SẢN
Hình 3.27: Giao diện chức năng đăng nhu cầu thu mua

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Truy cập chức năng "Đăng nhu cầu thu mua nông sản".
2. Cột [Giao diện người dùng]: Hiển thị biểu mẫu nhập nhu cầu thu mua dành cho Doanh nghiệp.
3. Cột [Người dùng]: Nhập thông tin nhu cầu (Tên loại nông sản cần mua, Số lượng cần mua, Đơn vị tính, Mức giá tham khảo, Yêu cầu chứng nhận, Địa điểm giao hàng, Ngày bắt đầu và kết thúc thu mua) và bấm "Đăng nhu cầu".
4. Cột [Giao diện người dùng]: Thu thập dữ liệu và gửi yêu cầu lên hệ thống.
5. Cột [Hệ thống xử lý]: Kiểm tra tính đầy đủ và hợp lệ của dữ liệu nhu cầu thu mua.
   - 6.1 (Nếu dữ liệu hợp lệ): Cột [Hệ thống xử lý] -> Lưu nhu cầu vào CSDL với trạng thái "Đang thu mua" (dang_thu_mua), kích hoạt thuật toán gợi ý Nông dân phù hợp -> Chuyển sang bước 7.
   - 6.2 (Nếu thiếu dữ liệu bắt buộc): Cột [Giao diện người dùng] -> Hiển thị thông báo lỗi nhập thiếu thông tin -> Quay lại bước 3.
7. Cột [Giao diện người dùng]: Hiển thị thông báo "Đăng nhu cầu thu mua thành công, các Nông dân đã có thể xem và gửi báo giá cho bạn".
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 6: NÔNG DÂN GỬI BÁO GIÁ VÀ THƯƠNG LƯỢNG NHU CẦU THU MUA
Hình 3.28: Giao diện chức năng gửi báo giá nông sản
Hình 3.29: Giao diện chức năng thương lượng báo giá

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Nông dân xem thông tin nhu cầu thu mua của Doanh nghiệp và chọn "Báo giá / Thương lượng".
2. Cột [Giao diện người dùng]: Hiển thị biểu mẫu nhập đề xuất báo giá.
3. Cột [Người dùng]: Nông dân nhập số lượng có thể cung cấp, giá đề xuất per kg, địa chỉ kho hàng và bấm "Gửi báo giá".
4. Cột [Giao diện người dùng]: Gửi dữ liệu báo giá tới hệ thống.
5. Cột [Hệ thống xử lý]: Tính toán khoảng cách địa lý giữa kho và điểm nhận hàng, tự động ước tính phí vận chuyển, lưu bản ghi báo giá trạng thái "Chờ doanh nghiệp" (cho_doanh_nghiep) và thông báo tới Doanh nghiệp.
6. Cột [Người dùng]: Doanh nghiệp mở xem thông tin báo giá của Nông dân và lựa chọn hành động (Đồng ý / Thương lượng giá mới / Từ chối).
   - 7.1 (Nếu Doanh nghiệp nhấn "Đồng ý"): Cột [Hệ thống xử lý] -> Cập nhật trạng thái báo giá = "Đã thống nhất" (da_thong_nhat), tự động khởi tạo đơn hàng nháp -> Chuyển sang bước 8.1.
   - 7.2 (Nếu Doanh nghiệp nhấn "Thương lượng lại"): Cột [Hệ thống xử lý] -> Cập nhật trạng thái báo giá = "Chờ nông dân" (cho_nong_dan), lưu lịch sử thương lượng và gửi thông báo phản hồi cho Nông dân -> Chuyển sang bước 8.2.
   - 7.3 (Nếu Doanh nghiệp nhấn "Từ chối"): Cột [Hệ thống xử lý] -> Cập nhật trạng thái báo giá = "Từ chối" (tu_choi), gửi thông báo cho Nông dân -> Chuyển sang bước 8.3.
8.1. Cột [Giao diện người dùng]: Hiển thị thông báo "Thống nhất báo giá thành công, sẵn sàng chuyển sang bước tạo đơn hàng" -> [Kết thúc]
8.2. Cột [Giao diện người dùng]: Hiển thị mức giá phản hồi mới để Nông dân xem xét -> Quay lại bước 3.
8.3. Cột [Giao diện người dùng]: Hiển thị thông báo "Báo giá đã bị từ chối" -> [Kết thúc]
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 7: DOANH NGHIỆP ĐẶT HÀNG NÔNG SẢN (TẠO ĐƠN HÀNG B2B)
Hình 3.30: Giao diện chức năng đặt hàng nông sản

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Doanh nghiệp xem chi tiết bài đăng bán nông sản, chọn số lượng mua và bấm nút "Đặt hàng B2B".
2. Cột [Giao diện người dùng]: Hiển thị màn hình xác nhận thông tin đơn hàng (Tên nông sản, Số lượng đặt, Đơn giá, Địa chỉ giao hàng, Hình thức giao hàng).
3. Cột [Người dùng]: Doanh nghiệp chọn hình thức giao hàng (B2B Giao tận nơi / Tự đến lấy) và nhấn "Xác nhận đặt hàng".
4. Cột [Giao diện người dùng]: Gửi yêu cầu khởi tạo đơn hàng lên hệ thống backend.
5. Cột [Hệ thống xử lý]: Kiểm tra số lượng tồn kho khả dụng của bài đăng nông sản.
   - 6.1 (Nếu số lượng tồn kho đủ): Cột [Hệ thống xử lý] -> Tạo bản ghi đơn hàng với mã đơn duy nhất, trạng thái "Chờ xác nhận" (cho_xac_nhan), tính 15% tiền cọc và phí vận chuyển, tạm giữ số lượng sản phẩm -> Chuyển sang bước 7.
   - 6.2 (Nếu số lượng tồn kho không đủ): Cột [Giao diện người dùng] -> Hiển thị thông báo "Số lượng nông sản còn lại không đủ đáp ứng" -> Quay lại bước 1.
7. Cột [Hệ thống xử lý]: Gửi thông báo đơn hàng mới tới Nông dân.
8. Cột [Giao diện người dùng]: Hiển thị thông báo "Tạo đơn hàng B2B thành công, đơn hàng đang chờ Nông dân xác nhận và thanh toán phí vận chuyển/tiền cọc".
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 8: XÁC NHẬN ĐƠN HÀNG VÀ THANH TOÁN CỌC / PHÍ VẬN CHUYỂN
Hình 3.31: Giao diện xác nhận đơn hàng nông dân
Hình 3.32: Giao diện thanh toán tiền cọc doanh nghiệp

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Nông dân mở quản lý đơn hàng bán, chọn đơn hàng ở trạng thái "Chờ xác nhận" và bấm "Xác nhận & Thanh toán phí vận chuyển".
2. Cột [Hệ thống xử lý]: Chuyển hướng Nông dân tới Cổng thanh toán để thực hiện nộp phí vận chuyển.
3. Cột [Hệ thống xử lý]: Kiểm tra kết quả thanh toán phí vận chuyển từ cổng thanh toán.
   - 4.1 (Nếu Nông dân thanh toán phí vận chuyển thành công): Cột [Hệ thống xử lý] -> Đánh dấu đã thanh toán phí vận chuyển, gửi thông báo yêu cầu Doanh nghiệp thanh toán tiền cọc 15% -> Chuyển sang bước 5.
   - 4.2 (Nếu thanh toán thất bại): Cột [Giao diện người dùng] -> Hiển thị thông báo thanh toán phí vận chuyển thất bại -> Quay lại bước 1.
5. Cột [Người dùng]: Doanh nghiệp mở chi tiết đơn hàng và chọn "Thanh toán tiền cọc (15%)".
6. Cột [Hệ thống xử lý]: Chuyển hướng Doanh nghiệp tới Cổng thanh toán trực tuyến.
7. Cột [Hệ thống xử lý]: Kiểm tra kết quả thanh toán tiền cọc.
   - 8.1 (Nếu Doanh nghiệp thanh toán tiền cọc thành công): Cột [Hệ thống xử lý] -> Đánh dấu đã nộp cọc, đổi trạng thái đơn hàng sang "Đã xác nhận" (da_xac_nhan), sinh mã QR/OTP xác nhận giao nhận -> Chuyển sang bước 9.
   - 8.2 (Nếu thanh toán tiền cọc thất bại): Cột [Giao diện người dùng] -> Hiển thị thông báo thanh toán tiền cọc thất bại -> Quay lại bước 5.
9. Cột [Giao diện người dùng]: Hiển thị thông báo "Đơn hàng đã được xác nhận thành công từ hai bên, sẵn sàng đóng gói và vận chuyển".
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 9: THANH TOÁN TRỰC TUYẾN QUA VNPAY / MOMO
Hình 3.33: Giao diện chọn phương thức thanh toán
Hình 3.34: Giao diện thanh toán cổng VNPAY/MoMo

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Tại màn hình thanh toán, chọn phương thức (VNPAY hoặc MoMo) và bấm "Thanh toán ngay".
2. Cột [Giao diện người dùng]: Gửi yêu cầu khởi tạo thanh toán tới hệ thống backend.
3. Cột [Hệ thống xử lý]: Tạo mã giao dịch duy nhất, sinh URL thanh toán an toàn (kèm chữ ký mã hóa HMAC SHA512) và trả về cho client.
4. Cột [Giao diện người dùng]: Chuyển hướng trình duyệt người dùng tới Cổng thanh toán VNPAY/MoMo.
5. Cột [Người dùng]: Thực hiện Quét mã QR hoặc Nhập mã OTP ngân hàng để xác thực giao dịch.
6. Cột [Hệ thống xử lý]: Cổng thanh toán gửi thông điệp Webhook/IPN phản hồi kết quả giao dịch về hệ thống backend.
7. Cột [Hệ thống xử lý]: Kiểm tra chữ ký bảo mật checksum và mã phản hồi giao dịch (Response Code = 00).
   - 8.1 (Nếu Chữ ký đúng & Mã giao dịch thành công): Cột [Hệ thống xử lý] -> Cập nhật trạng thái thanh toán = "Đã thanh toán" (da_thanh_toan), lưu lịch sử mã giao dịch cổng -> Chuyển sang bước 9.1.
   - 8.2 (Nếu Chữ ký sai hoặc Giao dịch bị lỗi/hủy): Cột [Hệ thống xử lý] -> Cập nhật trạng thái thanh toán = "Thất bại" (that_bai) -> Chuyển sang bước 9.2.
9.1. Cột [Giao diện người dùng]: Hiển thị màn hình "Thanh toán thành công" và hiển thị hóa đơn thanh toán -> [Kết thúc]
9.2. Cột [Giao diện người dùng]: Hiển thị màn hình "Giao dịch thất bại, vui lòng kiểm tra lại tài khoản và thử lại" -> [Kết thúc]
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 10: QUẢN LÝ VẬN CHUYỂN VÀ GIAO NHẬN HÀNG NÔNG SẢN
Hình 3.35: Giao diện theo dõi vận chuyển đơn hàng

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Hệ thống xử lý]: Khi đơn hàng ở trạng thái "Đã xác nhận", tự động phân công lịch trình xe B2B đến kho Nông dân lấy hàng.
2. Cột [Hệ thống xử lý]: Cập nhật trạng thái đơn hàng = "Đang giao" (dang_giao), gửi thông báo lộ trình vận chuyển cho cả Nông dân và Doanh nghiệp.
3. Cột [Giao diện người dùng]: Hiển thị trạng thái "Đang vận chuyển nông sản" và thông tin tuyến đường trên ứng dụng.
4. Cột [Người dùng]: Tài xế/Đội xe B2B vận chuyển nông sản tới địa chỉ Doanh nghiệp, cùng kiểm đếm số lượng thực tế và thực hiện quét mã QR / nhập OTP giao hàng.
5. Cột [Hệ thống xử lý]: Kiểm tra tính hợp lệ của mã QR / OTP giao nhận.
   - 6.1 (Nếu mã QR/OTP chính xác): Cột [Hệ thống xử lý] -> Cập nhật trạng thái đơn hàng = "Đã giao hàng" (da_giao_hang), phát thông báo yêu cầu Doanh nghiệp nghiệm thu và thanh toán 85% giá trị còn lại -> Chuyển sang bước 7.
   - 6.2 (Nếu mã QR/OTP không đúng): Cột [Giao diện người dùng] -> Báo lỗi mã xác thực giao nhận không chính xác -> Quay lại bước 4.
7. Cột [Giao diện người dùng]: Hiển thị thông báo "Giao hàng thành công, chờ Doanh nghiệp nghiệm thu và thanh toán hoàn tất".
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 11: XÁC NHẬN HOÀN TẤT ĐƠN HÀNG VÀ ĐÁNH GIÁ ĐỐI TÁC
Hình 3.36: Giao diện xác nhận nhận hàng và đánh giá

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Doanh nghiệp nghiệm thu nông sản nhận được, mở chi tiết đơn hàng và bấm "Xác nhận nhận đủ hàng & Thanh toán 85% còn lại".
2. Cột [Hệ thống xử lý]: Cập nhật trạng thái đơn hàng = "Hoàn tất" (hoan_thanh), tự động trừ chính thức số lượng nông sản còn lại trong bài đăng.
3. Cột [Giao diện người dùng]: Hiển thị biểu mẫu "Đánh giá đối tác giao dịch" (Đánh giá 1-5 sao, điểm chất lượng nông sản, điểm đúng hẹn, điểm thái độ, nhập nhận xét và tải ảnh).
4. Cột [Người dùng]: Nhập nội dung đánh giá và bấm "Gửi đánh giá".
5. Cột [Hệ thống xử lý]: Kiểm tra tính hợp lệ của nội dung đánh giá.
   - 6.1 (Nếu nội dung hợp lệ): Cột [Hệ thống xử lý] -> Lưu bản ghi đánh giá, tính toán lại Điểm trung bình uy tín (diem_trung_binh) và Cập nhật Tổng số giao dịch cho người dùng -> Chuyển sang bước 7.
   - 6.2 (Nếu vi phạm quy chuẩn từ ngữ): Cột [Giao diện người dùng] -> Hiển thị cảnh báo nội dung đánh giá không phù hợp -> Quay lại bước 4.
7. Cột [Giao diện người dùng]: Hiển thị đánh giá công khai trên trang hồ sơ đối tác và thông báo "Giao dịch hoàn tất thành công".
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 12: GỢI Ý NÔNG SẢN VÀ ĐỐI TÁC BẰNG AI
Hình 3.37: Giao diện gợi ý nông sản và đối tác AI

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Người dùng truy cập Trang chủ hoặc mục "Gợi ý thông minh AI".
2. Cột [Giao diện người dùng]: Gửi User ID và lịch sử tương tác gần nhất tới mô hình AI backend.
3. Cột [Hệ thống xử lý]: Thuật toán AI phân tích dữ liệu lịch sử tìm kiếm, loại nông sản đã xem, vị trí địa lý để tính toán điểm phù hợp (diem_phu_hop từ 0.0000 đến 1.0000).
   - 4.1 (Nếu tìm thấy sản phẩm / đối tác có điểm phù hợp cao): Cột [Hệ thống xử lý] -> Trả về danh sách gợi ý kèm nhãn lý do gợi ý (Ví dụ: "Nông sản VietGAP gần bạn", "Doanh nghiệp thường thu mua sầu riêng") -> Chuyển sang bước 5.1.
   - 4.2 (Nếu là người dùng mới / chưa có dữ liệu lịch sử): Cột [Hệ thống xử lý] -> Trả về danh sách nông sản nổi bật/xu hướng theo mùa vụ hiện tại -> Chuyển sang bước 5.2.
5.1. Cột [Giao diện người dùng]: Hiển thị danh mục "Gợi ý thông minh bởi AI" kèm lý do chi tiết -> [Kết thúc]
5.2. Cột [Giao diện người dùng]: Hiển thị danh mục "Nông sản phổ biến theo mùa vụ" -> [Kết thúc]
[Kết thúc]


--------------------------------------------------------------------------------

CHỨC NĂNG 13: GỬI VÀ XỬ LÝ BÁO CÁO KHIẾU NẠI GIAO DỊCH
Hình 3.38: Giao diện gửi báo cáo khiếu nại
Hình 3.39: Giao diện admin xử lý khiếu nại

Các bước vẽ sơ đồ Activity Diagram (3 Cột):
[Bắt đầu]
1. Cột [Người dùng]: Người dùng chọn đơn hàng hoặc bài đăng có sự cố, bấm nút "Gửi báo cáo / Khiếu nại".
2. Cột [Giao diện người dùng]: Hiển thị biểu mẫu gửi khiếu nại (Chọn loại vi phạm: nông sản giả/sai mô tả, nghi ngờ lừa đảo...; nhập mô tả; tải hình ảnh/video bằng chứng).
3. Cột [Người dùng]: Nhập đầy đủ thông tin và bấm "Gửi khiếu nại".
4. Cột [Hệ thống xử lý]: Lưu báo cáo khiếu nại vào CSDL với trạng thái "Chờ xử lý" (cho_xu_ly), đồng thời phát thông báo cảnh báo đến Dashboard Admin.
5. Cột [Người dùng]: Admin truy cập danh sách khiếu nại trên Dashboard, xem xét bằng chứng và thông tin giao dịch của hai bên.
6. Cột [Người dùng]: Admin đưa ra kết luận xử lý (Chấp nhận khiếu nại / Từ chối khiếu nại).
   - 7.1 (Nếu Chấp nhận khiếu nại): Cột [Hệ thống xử lý] -> Đổi trạng thái báo cáo = "Đã xử lý" (da_xu_ly), tiến hành đóng băng đơn hàng / hoàn tiền, xử lý chế tài khóa tài khoản vi phạm -> Chuyển sang bước 8.1.
   - 7.2 (Nếu Từ chối khiếu nại): Cột [Hệ thống xử lý] -> Đổi trạng thái báo cáo = "Đóng lại" (dong_lai), lưu lý do từ chối -> Chuyển sang bước 8.2.
8.1. Cột [Giao diện người dùng]: Hiển thị thông báo "Khiếu nại đã được Admin giải quyết, đơn hàng/tài khoản đã được xử lý" -> [Kết thúc]
8.2. Cột [Giao diện người dùng]: Hiển thị thông báo "Khiếu nại đã bị từ chối do không đủ bằng chứng" -> [Kết thúc]
[Kết thúc]
