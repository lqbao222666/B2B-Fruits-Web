import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiContextService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tìm bài đăng nông sản đang bán dựa theo từ khoá, tỉnh thành, danh mục
   */
  async timSanPham(
    tuKhoa?: string,
    tinhThanh?: string,
    danhmucId?: number,
    tieuChuan?: string,
    mucGia?: string,
    danhGia?: number
  ) {
    let giaMin: number | undefined;
    let giaMax: number | undefined;
    if (mucGia === 'under-50') giaMax = 49999;
    else if (mucGia === '50-100') { giaMin = 50000; giaMax = 100000; }
    else if (mucGia === 'over-100') giaMin = 100001;

    return this.prisma.baiDang.findMany({
      where: {
        trang_thai: 'dang_ban',
        ...(tuKhoa && {
          OR: [
            { ten_nong_san: { contains: tuKhoa, mode: 'insensitive' } },
            { tieu_de: { contains: tuKhoa, mode: 'insensitive' } },
          ],
        }),
        ...(tinhThanh && { tinh_thanh: { contains: tinhThanh, mode: 'insensitive' } }),
        ...(danhmucId && { danhmuc_id: danhmucId }),
        ...(giaMin !== undefined && { gia_per_kg: { gte: giaMin } }),
        ...(giaMax !== undefined && { gia_per_kg: { lte: giaMax } }),
        ...(tieuChuan && {
          tieuChuans: { some: { ten_tieu_chuan: { equals: tieuChuan, mode: 'insensitive' } } }
        }),
        ...(danhGia !== undefined && {
          nguoiDang: { diem_trung_binh: { gte: danhGia } }
        })
      },
      include: {
        nguoiDang: {
          include: {
            user: { select: { full_name: true, phone: true, email: true } },
          },
        },
        danhMuc: { select: { ten_danh_muc: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 8,
    });
  }

  /**
   * Tìm doanh nghiệp đang thu mua nông sản
   */
  async timDoanhNghiep(tuKhoa?: string, tinhThanh?: string) {
    return this.prisma.nhuCauThuMua.findMany({
      where: {
        trang_thai: 'dang_thu_mua',
        ...(tuKhoa && {
          ten_nong_san: { contains: tuKhoa, mode: 'insensitive' },
        }),
        ...(tinhThanh && {
          tinh_thanh_giao: { contains: tinhThanh, mode: 'insensitive' },
        }),
      },
      include: {
        doanhNghiep: {
          include: {
            user: { select: { full_name: true, phone: true, email: true } },
          },
        },
        danhMuc: { select: { ten_danh_muc: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 8,
    });
  }

  /**
   * Lấy chi tiết một bài đăng cụ thể
   */
  async layThongTinBaiDang(baidang_id: number) {
    return this.prisma.baiDang.findUnique({
      where: { baidang_id },
      include: {
        nguoiDang: {
          include: {
            user: { select: { full_name: true, phone: true, email: true } },
          },
        },
        danhMuc: true,
      },
    });
  }

  /**
   * Lấy chi tiết một nhu cầu thu mua cụ thể
   */
  async layThongTinDoanhNghiep(nhucau_id: number) {
    return this.prisma.nhuCauThuMua.findUnique({
      where: { nhucau_id },
      include: {
        doanhNghiep: {
          include: {
            user: { select: { full_name: true, phone: true, email: true } },
          },
        },
        danhMuc: true,
      },
    });
  }

  private cachedNongSans: string[] = [];

  /**
   * Phân tích câu hỏi để trích xuất từ khoá và địa điểm
   */
  async extractKeywords(message: string): Promise<{
    tuKhoa?: string;
    tinhThanh?: string;
    tieuChuan?: string;
    mucGia?: string;
    danhGia?: number;
  }> {
    const tinhThanhs = [
      'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh',
      'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cần Thơ',
      'Cao Bằng', 'Đà Nẵng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
      'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng',
      'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
      'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình',
      'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi',
      'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình',
      'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh',
      'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
      'Hồ Chí Minh', 'TP.HCM', 'TP HCM', 'Sài Gòn', 'Bà Rịa', 'Huế'
    ];

    if (this.cachedNongSans.length === 0) {
      const danhmucs = await this.prisma.danhMuc.findMany({ select: { ten_danh_muc: true } });
      let allNongSans = danhmucs.map(d => d.ten_danh_muc.toLowerCase());
      const defaultNongSans = [
        'xoài', 'sầu riêng', 'chôm chôm', 'nhãn', 'vải', 'bưởi', 'cam',
        'quýt', 'dứa', 'thanh long', 'dưa hấu', 'dưa lưới', 'mít', 'ổi',
        'chuối', 'đu đủ', 'chanh', 'táo', 'lê', 'nho', 'lựu', 'sung',
        'lúa', 'gạo', 'ngô', 'khoai', 'sắn', 'rau', 'cải', 'cà', 'dưa',
        'hành', 'tỏi', 'gừng', 'nghệ', 'sả', 'ớt', 'tiêu', 'cà phê',
        'cao su', 'điều', 'mía', 'bông', 'đậu', 'lạc', 'vừng', 'mận', 'măng cụt', 'bơ'
      ];
      allNongSans.push(...defaultNongSans);
      this.cachedNongSans = [...new Set(allNongSans)].sort((a, b) => b.length - a.length);
    }

    const messageLower = message.toLowerCase();

    let tinhThanh: string | undefined;
    for (const tt of tinhThanhs) {
      if (messageLower.includes(tt.toLowerCase())) {
        tinhThanh = tt;
        break;
      }
    }

    let tuKhoa: string | undefined;
    for (const ns of this.cachedNongSans) {
      if (messageLower.includes(ns)) {
        tuKhoa = ns;
        break;
      }
    }

    let tieuChuan: string | undefined;
    const stds = [
      { key: 'vietgap', val: 'VietGAP' },
      { key: 'globalgap', val: 'GlobalGAP' },
      { key: 'hữu cơ', val: 'Hữu cơ (Organic)' },
      { key: 'organic', val: 'Hữu cơ (Organic)' },
      { key: 'ocop 3 sao', val: 'OCOP 3 Sao' },
      { key: 'ocop 4 sao', val: 'OCOP 4 Sao' },
      { key: 'ocop 5 sao', val: 'OCOP 5 Sao' },
      { key: 'iso 22000', val: 'ISO 22000' }
    ];
    for (const s of stds) {
      if (messageLower.includes(s.key)) {
        tieuChuan = s.val;
        break;
      }
    }

    let mucGia: string | undefined;
    if (messageLower.includes('dưới 50') || messageLower.includes('rẻ')) {
      mucGia = 'under-50';
    } else if (messageLower.includes('50 đến 100') || messageLower.includes('50-100')) {
      mucGia = '50-100';
    } else if (messageLower.includes('trên 100') || messageLower.includes('cao cấp')) {
      mucGia = 'over-100';
    }

    let danhGia: number | undefined;
    if (messageLower.includes('5 sao')) danhGia = 5;
    else if (messageLower.includes('4 sao') || messageLower.includes('uy tín') || messageLower.includes('tốt')) danhGia = 4;
    else if (messageLower.includes('3 sao')) danhGia = 3;

    return { tuKhoa, tinhThanh, tieuChuan, mucGia, danhGia };
  }
}
