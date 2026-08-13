import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { AiContextService } from './ai-context.service';
import { AiPromptService } from './ai-prompt.service';
import { ChatDto } from './dto/chat.dto';
import { SuggestPostDto } from './dto/suggest-post.dto';
import { SuggestPriceDto } from './dto/suggest-price.dto';

export interface SuggestionItem {
  type: 'bai_dang' | 'nhu_cau';
  id: number;
  ten: string;
  gia: string;
  dia_chi: string;
  lien_he: string;
  danhmuc_id?: number;
  ten_danh_muc?: string;
}

export interface ChatResponse {
  reply: string;
  suggestions: SuggestionItem[];
  action_hint: 'tin_nhan' | 'xem_chi_tiet' | null;
  detected_category?: { id: number; name: string };
  detected_province?: string;
  detected_standard?: string;
  detected_price_range?: string;
  detected_rating?: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly groq: Groq;

  constructor(
    private readonly configService: ConfigService,
    private readonly contextService: AiContextService,
    private readonly promptService: AiPromptService,
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY chưa được cấu hình trong .env');
    }
    this.groq = new Groq({ apiKey: apiKey || '' });
  }

  async chat(dto: ChatDto): Promise<ChatResponse> {
    const { message, role_nguoi_dung, lich_su } = dto;

    // 1. Phân tích câu hỏi để trích xuất từ khoá & địa điểm
    const { tuKhoa, tinhThanh, tieuChuan, mucGia, danhGia } =
      await this.contextService.extractKeywords(message);
    this.logger.debug(
      `Phân tích: tuKhoa="${tuKhoa}", tinhThanh="${tinhThanh}", tieuChuan="${tieuChuan}", mucGia="${mucGia}", danhGia="${danhGia}"`,
    );

    // 2. Lấy dữ liệu thực từ DB dựa vào intent
    let baiDangs: any[] = [];
    let nhuCaus: any[] = [];
    const messageLower = message.toLowerCase();

    const isHoiVeMuaBan =
      messageLower.includes('mua') ||
      messageLower.includes('thu mua') ||
      messageLower.includes('doanh nghiệp') ||
      messageLower.includes('công ty') ||
      messageLower.includes('thu mua');

    const isHoiVeBan =
      messageLower.includes('bán') ||
      messageLower.includes('cung cấp') ||
      messageLower.includes('nông dân') ||
      messageLower.includes('nguồn hàng') ||
      messageLower.includes('có hàng');

    // Nếu là nông dân → ưu tiên tìm nhu cầu thu mua
    // Nếu là doanh nghiệp → ưu tiên tìm bài đăng bán
    // Nếu không rõ → tìm cả hai
    if (role_nguoi_dung === 'nong_dan' || isHoiVeMuaBan) {
      nhuCaus = await this.contextService.timDoanhNghiep(tuKhoa, tinhThanh);
    }
    if (role_nguoi_dung === 'doanh_nghiep' || isHoiVeBan || !role_nguoi_dung) {
      baiDangs = await this.contextService.timSanPham(tuKhoa, tinhThanh);
    }
    // Fallback: tìm cả hai nếu không đủ dữ liệu
    if (baiDangs.length === 0 && nhuCaus.length === 0) {
      [baiDangs, nhuCaus] = await Promise.all([
        this.contextService.timSanPham(tuKhoa, tinhThanh),
        this.contextService.timDoanhNghiep(tuKhoa, tinhThanh),
      ]);
    }

    // 3. Xây dựng prompt
    const systemPrompt = this.promptService.buildSystemPrompt(role_nguoi_dung);
    const baiDangCtx =
      baiDangs.length > 0
        ? this.promptService.formatBaiDangContext(baiDangs)
        : '';
    const nhuCauCtx =
      nhuCaus.length > 0 ? this.promptService.formatNhuCauContext(nhuCaus) : '';
    const contextData =
      [baiDangCtx, nhuCauCtx].filter(Boolean).join('\n\n') ||
      '[DỮ LIỆU HỆ THỐNG]: Không có dữ liệu phù hợp trong hệ thống hiện tại.';

    const messages = this.promptService.buildMessages(
      systemPrompt,
      contextData,
      message,
      lich_su,
    );

    // 4. Gọi Groq API
    let reply = '';
    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.6,
        max_tokens: 1024,
      });
      reply =
        completion.choices[0]?.message?.content ??
        'Xin lỗi, tôi không thể xử lý yêu cầu này.';
    } catch (error: any) {
      this.logger.error('Lỗi khi gọi Groq API:', error?.message);
      throw new InternalServerErrorException(
        'Không thể kết nối đến dịch vụ AI. Vui lòng thử lại sau.',
      );
    }

    // 5. Xây dựng suggestions từ dữ liệu DB
    const suggestions: SuggestionItem[] = [];

    for (const bd of baiDangs.slice(0, 5)) {
      const nguoiDang = bd.nguoiDang?.user;
      suggestions.push({
        type: 'bai_dang',
        id: bd.baidang_id,
        ten: bd.tieu_de,
        gia: bd.gia_per_kg
          ? `${Number(bd.gia_per_kg).toLocaleString('vi-VN')} đ/kg`
          : 'Liên hệ để biết giá',
        dia_chi: `${bd.tinh_thanh}${bd.dia_chi_lay_hang ? ', ' + bd.dia_chi_lay_hang : ''}`,
        lien_he: nguoiDang
          ? `${nguoiDang.full_name} — ${nguoiDang.phone || nguoiDang.email || 'N/A'}`
          : 'Liên hệ qua hệ thống',
        danhmuc_id: bd.danhmuc_id,
        ten_danh_muc: bd.danhMuc?.ten_danh_muc,
      });
    }

    for (const nc of nhuCaus.slice(0, 5)) {
      const dn = nc.doanhNghiep;
      suggestions.push({
        type: 'nhu_cau',
        id: nc.nhucau_id,
        ten: `Thu mua: ${nc.ten_nong_san}`,
        gia: nc.gia_tham_khao
          ? `${Number(nc.gia_tham_khao).toLocaleString('vi-VN')} đ/${nc.don_vi}`
          : 'Thương lượng',
        dia_chi: nc.tinh_thanh_giao || 'Toàn quốc',
        lien_he: dn?.user
          ? `${dn.user.full_name} — ${dn.ten_cong_ty} — ${dn.user.phone || 'N/A'}`
          : 'Liên hệ qua hệ thống',
        danhmuc_id: nc.danhmuc_id,
        ten_danh_muc: nc.danhMuc?.ten_danh_muc,
      });
    }

    // 6. Xác định action_hint
    let action_hint: ChatResponse['action_hint'] = null;
    if (suggestions.length > 0) {
      action_hint = 'xem_chi_tiet';
    }
    if (
      messageLower.includes('liên hệ') ||
      messageLower.includes('nhắn tin') ||
      messageLower.includes('gửi tin')
    ) {
      action_hint = 'tin_nhan';
    }

    let detected_category: { id: number; name: string } | undefined = undefined;
    if (
      suggestions.length > 0 &&
      suggestions[0].danhmuc_id &&
      suggestions[0].ten_danh_muc
    ) {
      detected_category = {
        id: suggestions[0].danhmuc_id,
        name: suggestions[0].ten_danh_muc,
      };
    }

    return {
      reply,
      suggestions,
      action_hint,
      detected_category,
      detected_province: tinhThanh,
      detected_standard: tieuChuan,
      detected_price_range: mucGia,
      detected_rating: danhGia,
    };
  }

  async suggestPostDescription(
    dto: SuggestPostDto,
  ): Promise<{ tieu_de?: string; gia_per_kg?: number; mo_ta?: string }> {
    const { tieu_de, ten_nong_san, so_luong_co, don_vi_tinh, tinh_thanh } = dto;

    const systemPrompt = `Bạn là một chuyên gia marketing nông sản. Nhiệm vụ của bạn là tối ưu hóa và gợi ý các thông tin hấp dẫn nhất cho một bài đăng bán nông sản trên sàn thương mại điện tử B2B.
Bạn phải trả về DUY NHẤT một chuỗi định dạng JSON hợp lệ với cấu trúc sau, tuyệt đối không có bất kỳ văn bản nào khác bên ngoài JSON:
{
  "tieu_de": "Tiêu đề thật giật tít, hấp dẫn, ngắn gọn nhưng đầy đủ ý (tối đa 15 từ)",
  "mo_ta": "Đoạn mô tả chi tiết khoảng 150-250 từ..."
}

Lưu ý:
- "tieu_de": Phải tạo một tiêu đề thu hút sự chú ý của doanh nghiệp mua sỉ.
- "mo_ta": Nêu bật chất lượng, xuất xứ, quy trình trồng trọt (giả định VietGAP/sạch), khuyến khích liên hệ mua sỉ. Dùng gạch đầu dòng cho dễ đọc.`;

    const userPrompt = `Hãy viết thông tin cho sản phẩm sau:
- Tên nông sản: ${ten_nong_san}
- Tiêu đề hiện tại: ${tieu_de || 'Chưa có'}
- Sản lượng: ${so_luong_co ? so_luong_co + ' ' + (don_vi_tinh || 'kg') : 'Số lượng lớn'}
- Khu vực: ${tinh_thanh}
`;

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      const replyContent =
        completion.choices[0]?.message?.content?.trim() ?? '{}';

      let parsed: any = {};
      try {
        parsed = JSON.parse(replyContent);
      } catch (e) {
        const startIndex = replyContent.indexOf('{');
        const endIndex = replyContent.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
          parsed = JSON.parse(replyContent.substring(startIndex, endIndex + 1));
        } else {
          throw e;
        }
      }

      return {
        tieu_de: parsed.tieu_de,
        mo_ta: parsed.mo_ta,
      };
    } catch (error: any) {
      this.logger.error(
        'Lỗi khi gọi Groq API để gợi ý bài đăng:',
        error?.message,
      );
      throw new InternalServerErrorException(
        'Không thể kết nối đến dịch vụ AI để tạo gợi ý. Vui lòng thử lại sau.',
      );
    }
  }

  async suggestPrice(dto: SuggestPriceDto): Promise<{ gia_goi_y: number }> {
    const { ten_nong_san, don_vi_tinh, tinh_thanh } = dto;

    const systemPrompt = `Bạn là một chuyên gia thẩm định giá nông sản tại Việt Nam.
Bạn phải trả về DUY NHẤT một chuỗi định dạng JSON hợp lệ với cấu trúc sau, tuyệt đối không có bất kỳ văn bản nào khác:
{
  "gia_goi_y": 15000
}

Lưu ý:
- "gia_goi_y": BẮT BUỘC dự đoán một mức giá bán buôn hợp lý (bằng số nguyên, ví dụ: 25000, 45000) cho 1 ${don_vi_tinh || 'kg'} nông sản này ở thị trường Việt Nam, đặc biệt là tại ${tinh_thanh}.
- Cân nhắc giá cả thị trường sỉ hiện tại của loại nông sản này.
- TUYỆT ĐỐI KHÔNG để trống, nếu không có dữ liệu thực tế, hãy đưa ra một con số trung bình ước chừng.`;

    const userPrompt = `Gợi ý giá sỉ cho:
- Nông sản: ${ten_nong_san}
- Khu vực: ${tinh_thanh}
- Đơn vị tính: 1 ${don_vi_tinh || 'kg'}`;

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 100,
        response_format: { type: 'json_object' },
      });

      const replyContent =
        completion.choices[0]?.message?.content?.trim() ?? '{}';

      let parsed: any = {};
      try {
        parsed = JSON.parse(replyContent);
      } catch (e) {
        const startIndex = replyContent.indexOf('{');
        const endIndex = replyContent.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
          parsed = JSON.parse(replyContent.substring(startIndex, endIndex + 1));
        } else {
          throw e;
        }
      }

      return {
        gia_goi_y: parsed.gia_goi_y,
      };
    } catch (error: any) {
      this.logger.error('Lỗi khi gọi Groq API để gợi ý giá:', error?.message);
      throw new InternalServerErrorException(
        'Không thể lấy gợi ý giá từ AI lúc này.',
      );
    }
  }
}
