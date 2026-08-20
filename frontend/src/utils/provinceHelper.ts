/**
 * Hàm lấy tên Tỉnh/Thành phố ngắn gọn từ một địa chỉ đầy đủ
 * Ví dụ: "Xã Ea Yông, Huyện Krông Pắc, Tỉnh Đắk Lắk" -> "Đắk Lắk"
 * Ví dụ: "Đường Mã Lò, P. Bình Trị Đông A, Q. Bình Tân, TP.HCM" -> "TP.HCM"
 */
export function extractProvinceName(addressStr?: string | null): string {
  if (!addressStr || !addressStr.trim()) return "Toàn quốc";

  const text = addressStr.trim();

  // Kiểm tra tên các Tỉnh/Thành phổ biến
  if (text.includes("Tiền Giang")) return "Tiền Giang";
  if (text.includes("Bến Tre")) return "Bến Tre";
  if (text.includes("Đắk Lắk") || text.includes("Dak Lak")) return "Đắk Lắk";
  if (text.includes("Lâm Đồng")) return "Lâm Đồng";
  if (text.includes("Cần Thơ")) return "Cần Thơ";
  if (text.includes("Bình Thuận")) return "Bình Thuận";
  if (text.includes("Đồng Nai")) return "Đồng Nai";
  if (text.includes("Vĩnh Long")) return "Vĩnh Long";
  if (text.includes("Hòa Bình")) return "Hòa Bình";
  if (text.includes("Bắc Giang")) return "Bắc Giang";
  if (text.includes("Hồ Chí Minh") || text.includes("TP.HCM") || text.includes("HCM"))
    return "TP. Hồ Chí Minh";
  if (text.includes("Bình Dương")) return "Bình Dương";
  if (text.includes("Long An")) return "Long An";
  if (text.includes("Hà Nội")) return "Hà Nội";
  if (text.includes("Đà Nẵng")) return "Đà Nẵng";
  if (text.includes("Hải Phòng")) return "Hải Phòng";

  // Nếu chuỗi chứa dấu phẩy, lấy cụm từ cuối cùng (thường là tên Tỉnh)
  const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 0) {
    let last = parts[parts.length - 1];
    last = last.replace(/^(Tỉnh|TP\.|TP|Thành phố)\s+/i, "").trim();
    return last || text;
  }

  return text;
}
