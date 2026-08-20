import { Injectable } from '@nestjs/common';

@Injectable()
export class AiPromptService {
  /**
   * Tạo system prompt theo vai trò người dùng
   */
  buildSystemPrompt(role?: 'nong_dan' | 'doanh_nghiep' | 'admin'): string {
    const today = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const basePrompt = `Bạn là trợ lý AI thông minh của sàn giao dịch nông sản B2B — chuyên kết nối Nông Dân và Doanh Nghiệp tại Việt Nam.
Ngày hôm nay: ${today}.

QUY TẮC TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.
- Khi có dữ liệu từ hệ thống, hãy trình bày rõ ràng: tên sản phẩm, giá, địa chỉ, số lượng, thông tin liên hệ.
- NẾU TÌM KIẾM CÓ NHIỀU TỈNH THÀNH HOẶC NHIỀU LOẠI NÔNG SẢN: Tự động chia kết quả thành từng phần/tiêu đề rõ ràng theo từng Tỉnh Thành (Ví dụ: ### 📍 Tại Tiền Giang, ### 📍 Tại Bến Tre) hoặc từng loại Nông Sản (Ví dụ: ### 🥭 Xoài, ### 🍈 Sầu Riêng).
- NẾU NGƯỜI DÙNG HỎI CHUNG CHUNG VỀ MỘT TỈNH THÀNH (ví dụ: "trái cây ở Tiền Giang", "nông sản bán ở Bến Tre", "nhu cầu thu mua ở Đồng Nai"): Hãy liệt kê TẤT CẢ các loại nông sản/nhu cầu tìm thấy tại tỉnh đó, phân nhóm theo loại sản phẩm để dễ theo dõi. Ví dụ: "Hiện tại ở Tiền Giang có các sản phẩm sau đang bán: ### 🍈 Sầu Riêng RI6 ... ### 🥭 Xoài Cát Hòa Lộc ...".
- Ưu tiên trình bày kết quả bằng danh sách gạch đầu dòng rõ ràng, trực quan để người dùng đọc dễ dàng trên khung chat.
- Nếu không tìm thấy dữ liệu phù hợp ở tỉnh thành nào, hãy nêu rõ tỉnh đó chưa có bài đăng và gợi ý mở rộng phạm vi.
- KHÔNG bịa đặt thông tin. Chỉ sử dụng dữ liệu được cung cấp trong [DỮ LIỆU HỆ THỐNG].
- NẾU NGƯỜI DÙNG HỎI CÂU HỎI NGOÀI PHẠM VI (thời tiết, tin tức, kiến thức chung, giải trí, v.v.) mà bạn KHÔNG CÓ DỮ LIỆU:
  + Trả lời lịch sự rằng bạn là trợ lý chuyên về nông sản B2B nên không thể trả lời trực tiếp.
  + Gợi ý người dùng CỤ THỂ nơi có thể tra cứu. Ví dụ:
    * Thời tiết → "Bạn có thể tra cứu thời tiết tại [weather.com](https://weather.com) hoặc tìm trên Google: **thời tiết [tỉnh thành] hôm nay**"
    * Giá cả thị trường chung → "Bạn có thể tham khảo giá nông sản tại [giacaphe.com](https://giacaphe.com) hoặc [nongsanviet.gov.vn](https://nongsanviet.gov.vn)"
    * Kiến thức nông nghiệp → "Bạn có thể hỏi trợ lý AI khác như **ChatGPT** (chat.openai.com) hoặc **Google Gemini** (gemini.google.com) để được giải đáp chi tiết"
    * Câu hỏi chung → "Bạn có thể tìm kiếm trên Google hoặc hỏi ChatGPT/Gemini AI để được hỗ trợ nhanh nhất"
  + Sau đó, LUÔN gợi ý quay lại chức năng chính: "Tuy nhiên, nếu bạn cần **tìm nguồn cung nông sản**, **kết nối doanh nghiệp**, hoặc **đăng bán sản phẩm**, tôi sẵn sàng hỗ trợ bạn ngay! 🌾"
  + Gợi ý các trang trên sàn phù hợp: trang Sản Phẩm (/products), trang Nhu Cầu Thu Mua (/nhu-cau), trang Đăng Bài (/bai-dang/tao-moi), trang Tin Nhắn (/tin-nhan).
- Cuối câu trả lời, hãy gợi ý hành động tiếp theo phù hợp.`;

    const rolePrompts: Record<string, string> = {
      nong_dan: `
VAI TRÒ NGƯỜI DÙNG: Nông Dân
Bạn hỗ trợ nông dân:
- Tìm doanh nghiệp đang thu mua nông sản
- Hỏi về giá thu mua, yêu cầu chất lượng
- Tìm đầu ra cho sản phẩm theo mùa vụ
- Thông tin liên hệ doanh nghiệp thu mua`,

      doanh_nghiep: `
VAI TRÒ NGƯỜI DÙNG: Doanh Nghiệp
Bạn hỗ trợ doanh nghiệp:
- Tìm nguồn cung nông sản tươi theo tỉnh thành, loại sản phẩm
- Hỏi giá, số lượng, tiêu chuẩn chứng nhận
- Tìm nông dân uy tín để đặt hàng
- Thông tin liên hệ nông dân cung cấp hàng`,

      admin: `
VAI TRÒ NGƯỜI DÙNG: Quản Trị Viên
Bạn có thể truy cập toàn bộ dữ liệu hệ thống: bài đăng, nhu cầu thu mua, người dùng.
Hỗ trợ admin tổng quan hệ thống và điều phối giao dịch.`,
    };

    return basePrompt + (role ? (rolePrompts[role] ?? '') : '');
  }

  /**
   * Inject dữ liệu bài đăng thực từ DB vào context
   */
  formatBaiDangContext(baiDangs: any[]): string {
    if (!baiDangs || baiDangs.length === 0) {
      return '[DỮ LIỆU HỆ THỐNG - BÀI ĐĂNG BÁN]: Không tìm thấy bài đăng nào phù hợp trong hệ thống.';
    }

    const items = baiDangs
      .map((bd, i) => {
        const giaPerKg = bd.gia_per_kg
          ? `${Number(bd.gia_per_kg).toLocaleString('vi-VN')} đ/kg`
          : 'Chờ định giá';
        const giaTongLo = bd.gia_admin
          ? `${Number(bd.gia_admin).toLocaleString('vi-VN')} đ/lô`
          : '';
        const soLuong = `${Number(bd.so_luong_co)} ${bd.don_vi_tinh}`;
        const nguoiDang = bd.nguoiDang?.user;
        const lienHe = nguoiDang
          ? `${nguoiDang.full_name} — SĐT: ${nguoiDang.phone || 'N/A'}`
          : 'N/A';
        const ngayThuHoach = bd.ngay_thu_hoach
          ? new Date(bd.ngay_thu_hoach).toLocaleDateString('vi-VN')
          : 'Không có';
        const danhMuc = bd.danhMuc?.ten_danh_muc ?? '';

        return `${i + 1}. [ID:${bd.baidang_id}] ${bd.tieu_de}
   - Sản phẩm: ${bd.ten_nong_san}${danhMuc ? ` (${danhMuc})` : ''}
   - Số lượng: ${soLuong}
   - Giá: ${giaPerKg}${giaTongLo ? ` | Tổng lô: ${giaTongLo}` : ''}
   - Địa điểm: ${bd.tinh_thanh}${bd.dia_chi_lay_hang ? `, ${bd.dia_chi_lay_hang}` : ''}
   - Ngày thu hoạch: ${ngayThuHoach}
   - Chứng nhận: ${bd.chung_nhan || 'Chưa có'}
   - Liên hệ: ${lienHe}`;
      })
      .join('\n\n');

    return `[DỮ LIỆU HỆ THỐNG - BÀI ĐĂNG BÁN NÔNG SẢN]:\n${items}`;
  }

  /**
   * Inject dữ liệu nhu cầu thu mua thực từ DB vào context
   */
  formatNhuCauContext(nhuCaus: any[]): string {
    if (!nhuCaus || nhuCaus.length === 0) {
      return '[DỮ LIỆU HỆ THỐNG - NHU CẦU THU MUA]: Không tìm thấy doanh nghiệp nào đang thu mua phù hợp.';
    }

    const items = nhuCaus
      .map((nc, i) => {
        const gia = nc.gia_tham_khao
          ? `${Number(nc.gia_tham_khao).toLocaleString('vi-VN')} đ${nc.don_vi ? `/${nc.don_vi}` : ''}`
          : 'Thương lượng';
        const soLuong = `${Number(nc.so_luong_can)} ${nc.don_vi}`;
        const dn = nc.doanhNghiep;
        const lienHe = dn?.user
          ? `${dn.user.full_name} — ${dn.ten_cong_ty} — SĐT: ${dn.user.phone || 'N/A'}`
          : 'N/A';
        const ngayKetThuc = nc.ngay_ket_thuc
          ? new Date(nc.ngay_ket_thuc).toLocaleDateString('vi-VN')
          : 'Không có';
        const danhMuc = nc.danhMuc?.ten_danh_muc ?? '';

        return `${i + 1}. [ID:${nc.nhucau_id}] Thu mua: ${nc.ten_nong_san}${danhMuc ? ` (${danhMuc})` : ''}
   - Số lượng cần: ${soLuong}
   - Giá tham khảo: ${gia}${nc.cho_thuong_luong ? ' (có thể thương lượng)' : ''}
   - Khu vực giao: ${nc.tinh_thanh_giao || 'Toàn quốc'}${nc.dia_chi_giao ? `, ${nc.dia_chi_giao}` : ''}
   - Yêu cầu chứng nhận: ${nc.yeu_cau_chung_nhan || 'Không yêu cầu'}
   - Hạn thu mua: ${ngayKetThuc}
   - Liên hệ: ${lienHe}`;
      })
      .join('\n\n');

    return `[DỮ LIỆU HỆ THỐNG - NHU CẦU THU MUA CỦA DOANH NGHIỆP]:\n${items}`;
  }

  /**
   * Xây dựng toàn bộ messages gửi lên Groq
   */
  buildMessages(
    systemPrompt: string,
    contextData: string,
    message: string,
    lichSu?: { role: 'user' | 'assistant'; content: string }[],
  ) {
    const systemContent = `${systemPrompt}\n\n${contextData}`;

    const messages: {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }[] = [{ role: 'system', content: systemContent }];

    // Thêm lịch sử hội thoại (tối đa 10 tin nhắn gần nhất)
    if (lichSu && lichSu.length > 0) {
      const recentHistory = lichSu.slice(-10);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: message });

    return messages;
  }
}
