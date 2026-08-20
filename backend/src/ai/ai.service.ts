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
  search_type?: 'bai_dang' | 'nhu_cau' | 'both';
  detected_category?: { id: number; name: string };
  detected_province?: string;
  detected_region?: string;
  detected_standard?: string;
  detected_price_range?: string;
  detected_price_min?: number;
  detected_price_max?: number;
  detected_min_quantity?: number;
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

  /**
   * Helper gọi Groq API với danh sách mô hình hoạt động liên tục (fallback tự động)
   */
  private async createGroqCompletion(messages: any[], isJson: boolean = false): Promise<string | null> {
    const activeModels = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ];

    for (const model of activeModels) {
      try {
        const completion = await this.groq.chat.completions.create({
          model,
          messages,
          temperature: isJson ? 0.3 : 0.6,
          max_tokens: isJson ? 800 : 1024,
          ...(isJson ? { response_format: { type: 'json_object' } } : {}),
        });

        const content = completion.choices[0]?.message?.content?.trim();
        if (content) {
          this.logger.debug(`Thành công gọi Groq API với model: ${model}`);
          return content;
        }
      } catch (err: any) {
        this.logger.warn(`Model Groq [${model}] chưa khả dụng: ${err?.message || err}. Đang thử model tiếp theo...`);
      }
    }

    return null;
  }

  async chat(dto: ChatDto): Promise<ChatResponse> {
    const { message, role_nguoi_dung, lich_su } = dto;

    // 1. Phân tích câu hỏi để trích xuất từ khoá & tiêu chí địa điểm, miền, giá, số lượng
    const {
      tuKhoa,
      tinhThanh,
      mien,
      tieuChuan,
      mucGia,
      giaMin,
      giaMax,
      soLuongMin,
      danhGia,
    } = await this.contextService.extractKeywords(message);

    // 2. Lấy dữ liệu thực từ DB dựa vào intent
    let baiDangs: any[] = [];
    let nhuCaus: any[] = [];
    const messageLower = message.toLowerCase();

    const isHoiVeMuaBan =
      messageLower.includes('mua') ||
      messageLower.includes('thu mua') ||
      messageLower.includes('doanh nghiệp') ||
      messageLower.includes('công ty') ||
      messageLower.includes('cần mua') ||
      messageLower.includes('nhu cầu') ||
      messageLower.includes('cần gì') ||
      messageLower.includes('thu mua gì') ||
      messageLower.includes('ai cần');

    const isHoiVeBan =
      messageLower.includes('bán') ||
      messageLower.includes('cung cấp') ||
      messageLower.includes('nông dân') ||
      messageLower.includes('nguồn hàng') ||
      messageLower.includes('có hàng') ||
      messageLower.includes('trái cây') ||
      messageLower.includes('hoa quả') ||
      messageLower.includes('nông sản') ||
      messageLower.includes('sản phẩm') ||
      messageLower.includes('có gì') ||
      messageLower.includes('trồng gì') ||
      messageLower.includes('trồng');

    // Kiểm tra xem câu hỏi có liên quan đến nông sản/sàn giao dịch không
    const hasSearchCriteria = !!(
      tuKhoa || tinhThanh || mien || tieuChuan || mucGia ||
      giaMin !== undefined || giaMax !== undefined ||
      soLuongMin !== undefined || danhGia !== undefined
    );
    const hasAgriIntent = isHoiVeBan || isHoiVeMuaBan || hasSearchCriteria;

    // CHỈ query DB khi có intent nông sản hoặc có tiêu chí tìm kiếm
    if (hasAgriIntent) {
      if (role_nguoi_dung === 'nong_dan' || isHoiVeMuaBan) {
        nhuCaus = await this.contextService.timDoanhNghiep(
          tuKhoa,
          tinhThanh,
          undefined,
          tieuChuan,
          mien,
          soLuongMin,
          giaMin,
          giaMax,
        );
      }
      if (role_nguoi_dung === 'doanh_nghiep' || isHoiVeBan || (!role_nguoi_dung && hasSearchCriteria)) {
        baiDangs = await this.contextService.timSanPham(
          tuKhoa,
          tinhThanh,
          undefined,
          tieuChuan,
          mucGia,
          danhGia,
          mien,
          soLuongMin,
          giaMin,
          giaMax,
        );
      }
      // Fallback: tìm cả hai nếu chưa có dữ liệu đủ
      if (baiDangs.length === 0 && nhuCaus.length === 0) {
        [baiDangs, nhuCaus] = await Promise.all([
          this.contextService.timSanPham(
            tuKhoa,
            tinhThanh,
            undefined,
            tieuChuan,
            mucGia,
            danhGia,
            mien,
            soLuongMin,
            giaMin,
            giaMax,
          ),
          this.contextService.timDoanhNghiep(
            tuKhoa,
            tinhThanh,
            undefined,
            tieuChuan,
            mien,
            soLuongMin,
            giaMin,
            giaMax,
          ),
        ]);
      }
    }
    // Nếu không có intent nông sản → bỏ qua DB, để AI tự xử lý (gợi ý chuyển hướng)

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
      '[DỮ LIỆU HỆ THỐNG]: Không có dữ liệu phù hợp với tiêu chí tìm kiếm trong hệ thống hiện tại.';

    const messages = this.promptService.buildMessages(
      systemPrompt,
      contextData,
      message,
      lich_su,
    );

    // 4. Gọi Groq API tự động với fallback
    let reply = await this.createGroqCompletion(messages, false);

    if (!reply) {
      // Rule-based Fallback nếu gọi Groq không khả dụng
      if (baiDangs.length > 0 || nhuCaus.length > 0) {
        reply = `Dưới đây là các kết quả tìm kiếm nông sản và nhu cầu thu mua phù hợp với yêu cầu "${message}" của bạn:`;
      } else {
        reply = `Xin chào! Hệ thống đã ghi nhận câu hỏi của bạn. Hiện tại hệ thống chưa tìm thấy nông sản hoặc doanh nghiệp khớp đúng tiêu chí "${message}". Bạn có thể xem thêm danh sách các mặt hàng đang bán hoặc đăng nhu cầu mới trên sàn nhé!`;
      }
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
          ? `${nguoiDang.full_name} — SĐT: ${nguoiDang.phone || nguoiDang.email || 'N/A'}`
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
          ? `${dn.user.full_name} — ${dn.ten_cong_ty || ''} — SĐT: ${dn.user.phone || 'N/A'}`
          : 'Liên hệ qua hệ thống',
        danhmuc_id: nc.danhmuc_id,
        ten_danh_muc: nc.danhMuc?.ten_danh_muc,
      });
    }

    // 6. Xác định action_hint & detected parameters
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

    // Determine search_type for frontend quick-links
    let search_type: ChatResponse['search_type'] = undefined;
    if (baiDangs.length > 0 && nhuCaus.length > 0) {
      search_type = 'both';
    } else if (baiDangs.length > 0) {
      search_type = 'bai_dang';
    } else if (nhuCaus.length > 0) {
      search_type = 'nhu_cau';
    }

    return {
      reply,
      suggestions,
      action_hint,
      search_type,
      detected_category,
      detected_province: Array.isArray(tinhThanh) ? tinhThanh.join(', ') : tinhThanh,
      detected_region: mien,
      detected_standard: tieuChuan,
      detected_price_range: mucGia,
      detected_price_min: giaMin,
      detected_price_max: giaMax,
      detected_min_quantity: soLuongMin,
      detected_rating: danhGia,
    };
  }

  async suggestPostDescription(
    dto: SuggestPostDto,
  ): Promise<{ tieu_de?: string; gia_per_kg?: number; mo_ta?: string }> {
    const { tieu_de, ten_nong_san, so_luong_co, don_vi_tinh, tinh_thanh } = dto;

    const systemPrompt = `Bạn là một chuyên gia marketing nông sản B2B. Nhiệm vụ của bạn là tạo tiêu đề và mô tả hấp dẫn nhất cho bài đăng bán nông sản.
Bạn phải trả về DUY NHẤT một chuỗi định dạng JSON hợp lệ với cấu trúc sau, tuyệt đối không có bất kỳ văn bản nào khác bên ngoài JSON:
{
  "tieu_de": "Tiêu đề thật giật tít, hấp dẫn, ngắn gọn nhưng đầy đủ ý (tối đa 15 từ)",
  "mo_ta": "Đoạn mô tả chi tiết khoảng 150-250 từ..."
}`;

    const userPrompt = `Hãy viết thông tin cho sản phẩm sau:
- Tên nông sản: ${ten_nong_san}
- Tiêu đề hiện tại: ${tieu_de || 'Chưa có'}
- Sản lượng: ${so_luong_co ? so_luong_co + ' ' + (don_vi_tinh || 'kg') : 'Số lượng lớn'}
- Khu vực: ${tinh_thanh}
`;

    try {
      const replyContent = await this.createGroqCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        true,
      );

      if (replyContent) {
        let parsed: any = {};
        try {
          parsed = JSON.parse(replyContent);
        } catch (e) {
          const startIndex = replyContent.indexOf('{');
          const endIndex = replyContent.lastIndexOf('}');
          if (startIndex !== -1 && endIndex !== -1) {
            parsed = JSON.parse(replyContent.substring(startIndex, endIndex + 1));
          }
        }
        if (parsed.tieu_de || parsed.mo_ta) {
          return {
            tieu_de: parsed.tieu_de,
            mo_ta: parsed.mo_ta,
          };
        }
      }
    } catch (error: any) {
      this.logger.error('Lỗi khi gọi Groq AI gợi ý bài đăng:', error?.message);
    }

    // Fallback thông minh nếu Groq không phản hồi
    const fallbackTitle = `${ten_nong_san} tươi ngon VietGAP giá sỉ từ ${tinh_thanh || 'nhà vườn'}`;
    const fallbackDesc = `${ten_nong_san} chất lượng cao được trồng và chăm sóc theo quy trình VietGAP an toàn tại ${tinh_thanh || 'nhà vườn'}.\n\nSản lượng hiện có: ${so_luong_co || 1000} ${don_vi_tinh || 'kg'}.\n\nĐiểm nổi bật của sản phẩm:\n- Trái mọng tươi ngon, hương vị tự nhiên đậm đà\n- Quy trình trồng sạch, đảm bảo an toàn vệ sinh thực phẩm\n- Giá cạnh tranh trực tiếp tại vườn cho doanh nghiệp mua sỉ\n- Hỗ trợ đóng gói và vận chuyển giao hàng tận nơi\n\nQuý doanh nghiệp và thương lái có nhu cầu mua sỉ vui lòng liên hệ trực tiếp để nhận báo giá tốt nhất!`;

    return {
      tieu_de: fallbackTitle,
      mo_ta: fallbackDesc,
    };
  }

  async suggestPrice(dto: SuggestPriceDto): Promise<{ gia_goi_y: number; khoang_gia: string }> {
    const { ten_nong_san, don_vi_tinh, tinh_thanh } = dto;

    const systemPrompt = `Bạn là một chuyên gia thẩm định giá nông sản tại Việt Nam.
Bạn phải dự báo giá sỉ dựa trên tình hình thị trường gần đây. Chú ý đến phân loại sản phẩm (Loại 1, Loại 2, Loại 3,...) được cung cấp. Loại chất lượng tốt hơn (như Loại 1) phải có giá cao hơn so với Loại 2, Loại 3.
Bạn phải trả về DUY NHẤT một chuỗi định dạng JSON hợp lệ với cấu trúc sau, tuyệt đối không có văn bản nào khác:
{
  "gia_goi_y": <một số nguyên biểu diễn giá sỉ gợi ý tốt nhất cho loại này, ví dụ: 45000>,
  "khoang_gia": "<chuỗi mô tả khoảng giá sỉ dự báo, ví dụ: '40.000 - 50.000 VNĐ'>"
}`;

    const userPrompt = `Dự báo và gợi ý giá sỉ cho 1 ${don_vi_tinh || 'kg'} nông sản: ${ten_nong_san} tại ${tinh_thanh || 'Việt Nam'}`;

    try {
      const replyContent = await this.createGroqCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        true,
      );

      if (replyContent) {
        let parsed: any = {};
        try {
          parsed = JSON.parse(replyContent);
        } catch (e) {
          const startIndex = replyContent.indexOf('{');
          const endIndex = replyContent.lastIndexOf('}');
          if (startIndex !== -1 && endIndex !== -1) {
            parsed = JSON.parse(replyContent.substring(startIndex, endIndex + 1));
          }
        }
        if (parsed.gia_goi_y && !isNaN(Number(parsed.gia_goi_y))) {
          return { 
            gia_goi_y: Number(parsed.gia_goi_y),
            khoang_gia: parsed.khoang_gia || ''
          };
        }
      }
    } catch (error: any) {
      this.logger.error('Lỗi khi gọi Groq AI gợi ý giá:', error?.message);
    }

    // Fallback thông minh dựa trên bảng giá thị trường thực tế
    let basePricePerKg = 30000;
    const text = (ten_nong_san || '').toLowerCase();

    if (text.includes('sầu riêng')) basePricePerKg = 85000;
    else if (text.includes('dâu tây')) basePricePerKg = 130000;
    else if (text.includes('dừa sáp')) basePricePerKg = 150000;
    else if (text.includes('cà phê')) basePricePerKg = 95000;
    else if (text.includes('măng cụt')) basePricePerKg = 60000;
    else if (text.includes('xoài')) basePricePerKg = 45000;
    else if (text.includes('bưởi')) basePricePerKg = 42000;
    else if (text.includes('bơ')) basePricePerKg = 40000;
    else if (text.includes('vú sữa')) basePricePerKg = 50000;
    else if (text.includes('chôm chôm')) basePricePerKg = 35000;
    else if (text.includes('mận')) basePricePerKg = 55000;
    else if (text.includes('vải')) basePricePerKg = 35000;
    else if (text.includes('nhãn')) basePricePerKg = 38000;
    else if (text.includes('cam')) basePricePerKg = 28000;
    else if (text.includes('thanh long')) basePricePerKg = 25000;
    else if (text.includes('ổi')) basePricePerKg = 18000;
    else if (text.includes('thơm') || text.includes('dứa')) basePricePerKg = 15000;
    else if (text.includes('dừa')) basePricePerKg = 15000;
    else if (text.includes('chuối')) basePricePerKg = 12000;
    else if (text.includes('dưa hấu')) basePricePerKg = 16000;

    // Điều chỉnh giá theo phân loại (loại 1, 2, 3...)
    let multiplier = 1;
    if (text.includes('loại 1') || text.includes('loai 1') || text.includes('vip')) {
      multiplier = 1.3;
    } else if (text.includes('loại 2') || text.includes('loai 2')) {
      multiplier = 1.0;
    } else if (text.includes('loại 3') || text.includes('loai 3')) {
      multiplier = 0.7;
    }

    basePricePerKg = Math.round((basePricePerKg * multiplier) / 1000) * 1000; // Làm tròn đến ngàn đồng

    const finalPrice = don_vi_tinh === 'tấn' ? basePricePerKg * 1000 : basePricePerKg;
    const khoangGiaMin = Math.round(finalPrice * 0.9 / 1000) * 1000;
    const khoangGiaMax = Math.round(finalPrice * 1.1 / 1000) * 1000;
    const khoangGiaStr = `${khoangGiaMin.toLocaleString('vi-VN')} - ${khoangGiaMax.toLocaleString('vi-VN')} VNĐ/${don_vi_tinh || 'kg'}`;

    return {
      gia_goi_y: finalPrice,
      khoang_gia: khoangGiaStr
    };
  }
}
