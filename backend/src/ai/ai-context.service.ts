import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getProvincesByRegion } from '../common/regions';

@Injectable()
export class AiContextService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tìm bài đăng nông sản đang bán dựa theo từ khoá (hoặc mảng từ khoá), tỉnh thành (hoặc mảng tỉnh thành)
   */
  async timSanPham(
    tuKhoa?: string | string[],
    tinhThanh?: string | string[],
    danhmucId?: number,
    tieuChuan?: string,
    mucGia?: string,
    danhGia?: number,
    mien?: string,
    soLuongMin?: number,
    giaMin?: number,
    giaMax?: number,
  ) {
    let computedGiaMin = giaMin;
    let computedGiaMax = giaMax;

    if (computedGiaMin === undefined && computedGiaMax === undefined) {
      if (mucGia === 'under-50') computedGiaMax = 49999;
      else if (mucGia === '50-100') {
        computedGiaMin = 50000;
        computedGiaMax = 100000;
      } else if (mucGia === 'over-100') computedGiaMin = 100001;
    }

    const regionProvinces = mien ? getProvincesByRegion(mien) : [];

    const listTuKhoa = Array.isArray(tuKhoa)
      ? tuKhoa.filter(Boolean)
      : tuKhoa
        ? [tuKhoa]
        : [];
    const listTinhThanh = Array.isArray(tinhThanh)
      ? tinhThanh.filter(Boolean)
      : tinhThanh
        ? [tinhThanh]
        : [];

    const andConditions: any[] = [{ trang_thai: 'dang_ban' }];

    if (listTuKhoa.length > 0) {
      andConditions.push({
        OR: listTuKhoa.flatMap((tk) => [
          { ten_nong_san: { contains: tk, mode: 'insensitive' as const } },
          { tieu_de: { contains: tk, mode: 'insensitive' as const } },
        ]),
      });
    }

    if (listTinhThanh.length > 0) {
      andConditions.push({
        OR: listTinhThanh.map((tt) => ({
          tinh_thanh: { contains: tt, mode: 'insensitive' as const },
        })),
      });
    }

    if (mien && regionProvinces.length > 0) {
      andConditions.push({ tinh_thanh: { in: regionProvinces } });
    }
    if (danhmucId) {
      andConditions.push({ danhmuc_id: danhmucId });
    }
    if (computedGiaMin !== undefined) {
      andConditions.push({ gia_per_kg: { gte: computedGiaMin } });
    }
    if (computedGiaMax !== undefined) {
      andConditions.push({ gia_per_kg: { lte: computedGiaMax } });
    }
    if (soLuongMin !== undefined) {
      andConditions.push({ so_luong_con_lai: { gte: soLuongMin } });
    }
    if (tieuChuan) {
      andConditions.push({
        tieuChuans: {
          some: {
            ten_tieu_chuan: { equals: tieuChuan, mode: 'insensitive' as const },
          },
        },
      });
    }
    if (danhGia !== undefined) {
      andConditions.push({
        nguoiDang: { diem_trung_binh: { gte: danhGia } },
      });
    }

    return this.prisma.baiDang.findMany({
      where: {
        AND: andConditions,
      },
      include: {
        nguoiDang: {
          include: {
            user: { select: { full_name: true, phone: true, email: true } },
          },
        },
        danhMuc: { select: { ten_danh_muc: true } },
        tieuChuans: { select: { ten_tieu_chuan: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 12,
    });
  }

  /**
   * Tìm doanh nghiệp đang thu mua nông sản theo từ khoá (hoặc mảng từ khoá), tỉnh thành (hoặc mảng tỉnh thành)
   */
  async timDoanhNghiep(
    tuKhoa?: string | string[],
    tinhThanh?: string | string[],
    danhmucId?: number,
    tieuChuan?: string,
    mien?: string,
    soLuongMin?: number,
    giaMin?: number,
    giaMax?: number,
  ) {
    const regionProvinces = mien ? getProvincesByRegion(mien) : [];

    const listTuKhoa = Array.isArray(tuKhoa)
      ? tuKhoa.filter(Boolean)
      : tuKhoa
        ? [tuKhoa]
        : [];
    const listTinhThanh = Array.isArray(tinhThanh)
      ? tinhThanh.filter(Boolean)
      : tinhThanh
        ? [tinhThanh]
        : [];

    const andConditions: any[] = [{ trang_thai: 'dang_thu_mua' }];

    if (listTuKhoa.length > 0) {
      andConditions.push({
        OR: listTuKhoa.map((tk) => ({
          ten_nong_san: { contains: tk, mode: 'insensitive' as const },
        })),
      });
    }

    if (listTinhThanh.length > 0) {
      andConditions.push({
        OR: listTinhThanh.map((tt) => ({
          tinh_thanh_giao: { contains: tt, mode: 'insensitive' as const },
        })),
      });
    }

    if (mien && regionProvinces.length > 0) {
      andConditions.push({ tinh_thanh_giao: { in: regionProvinces } });
    }
    if (danhmucId) {
      andConditions.push({ danhmuc_id: danhmucId });
    }
    if (tieuChuan) {
      andConditions.push({
        yeu_cau_chung_nhan: { contains: tieuChuan, mode: 'insensitive' as const },
      });
    }
    if (soLuongMin !== undefined) {
      andConditions.push({ so_luong_can: { gte: soLuongMin } });
    }
    if (giaMin !== undefined) {
      andConditions.push({ gia_tham_khao: { gte: giaMin } });
    }
    if (giaMax !== undefined) {
      andConditions.push({ gia_tham_khao: { lte: giaMax } });
    }

    return this.prisma.nhuCauThuMua.findMany({
      where: {
        AND: andConditions,
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
      take: 12,
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
        tieuChuans: true,
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
   * Phân tích câu hỏi để trích xuất từ khoá, địa điểm, miền, tiêu chuẩn, số lượng, khoảng giá, đánh giá
   */
  async extractKeywords(message: string): Promise<{
    tuKhoa?: string | string[];
    tinhThanh?: string | string[];
    mien?: string;
    tieuChuan?: string;
    mucGia?: string;
    giaMin?: number;
    giaMax?: number;
    soLuongMin?: number;
    danhGia?: number;
  }> {
    const tinhThanhs = [
      'An Giang',
      'Bà Rịa - Vũng Tàu',
      'Bắc Giang',
      'Bắc Kạn',
      'Bạc Liêu',
      'Bắc Ninh',
      'Bến Tre',
      'Bình Định',
      'Bình Dương',
      'Bình Phước',
      'Bình Thuận',
      'Cà Mau',
      'Cần Thơ',
      'Cao Bằng',
      'Đà Nẵng',
      'Đắk Lắk',
      'Đắk Nông',
      'Điện Biên',
      'Đồng Nai',
      'Đồng Tháp',
      'Gia Lai',
      'Hà Giang',
      'Hà Nam',
      'Hà Nội',
      'Hà Tĩnh',
      'Hải Dương',
      'Hải Phòng',
      'Hậu Giang',
      'Hòa Bình',
      'Hưng Yên',
      'Khánh Hòa',
      'Kiên Giang',
      'Kon Tum',
      'Lai Châu',
      'Lâm Đồng',
      'Lạng Sơn',
      'Lào Cai',
      'Long An',
      'Nam Định',
      'Nghệ An',
      'Ninh Bình',
      'Ninh Thuận',
      'Phú Thọ',
      'Phú Yên',
      'Quảng Bình',
      'Quảng Nam',
      'Quảng Ngãi',
      'Quảng Ninh',
      'Quảng Trị',
      'Sóc Trăng',
      'Sơn La',
      'Tây Ninh',
      'Thái Bình',
      'Thái Nguyên',
      'Thanh Hóa',
      'Thừa Thiên Huế',
      'Tiền Giang',
      'Trà Vinh',
      'Tuyên Quang',
      'Vĩnh Long',
      'Vĩnh Phúc',
      'Yên Bái',
      'Hồ Chí Minh',
      'TP.HCM',
      'TP HCM',
      'Sài Gòn',
      'Bà Rịa',
      'Huế',
    ];

    if (this.cachedNongSans.length === 0) {
      const danhmucs = await this.prisma.danhMuc.findMany({
        select: { ten_danh_muc: true },
      });
      const allNongSans = danhmucs.map((d) => d.ten_danh_muc.toLowerCase());
      const defaultNongSans = [
        'xoài',
        'sầu riêng',
        'chôm chôm',
        'nhãn',
        'vải',
        'bưởi',
        'cam',
        'quýt',
        'dứa',
        'thanh long',
        'dưa hấu',
        'dưa lưới',
        'mít',
        'ổi',
        'chuối',
        'đu đủ',
        'chanh',
        'táo',
        'lê',
        'nho',
        'lựu',
        'sung',
        'lúa',
        'gạo',
        'ngô',
        'khoai',
        'sắn',
        'rau',
        'cải',
        'cà',
        'dưa',
        'hành',
        'tỏi',
        'gừng',
        'nghệ',
        'sả',
        'ớt',
        'tiêu',
        'cà phê',
        'cao su',
        'điều',
        'mía',
        'bông',
        'đậu',
        'lạc',
        'vừng',
        'mận',
        'măng cụt',
        'bơ',
        'vú sữa',
        'chanh dây',
        'hồng',
        'nấm',
      ];
      allNongSans.push(...defaultNongSans);
      this.cachedNongSans = [...new Set(allNongSans)].sort(
        (a, b) => b.length - a.length,
      );
    }

    const messageLower = message.toLowerCase();

    // 1. Trích xuất Tỉnh thành (Hỗ trợ nhiều tỉnh thành)
    const foundTinhThanhs: string[] = [];
    for (const tt of tinhThanhs) {
      if (messageLower.includes(tt.toLowerCase())) {
        if (
          !foundTinhThanhs.some(
            (existing) =>
              existing.toLowerCase().includes(tt.toLowerCase()) ||
              tt.toLowerCase().includes(existing.toLowerCase()),
          )
        ) {
          foundTinhThanhs.push(tt);
        }
      }
    }
    const tinhThanh: string | string[] | undefined =
      foundTinhThanhs.length > 0
        ? foundTinhThanhs.length === 1
          ? foundTinhThanhs[0]
          : foundTinhThanhs
        : undefined;

    // 2. Trích xuất Miền
    let mien: string | undefined;
    if (
      messageLower.includes('miền bắc') ||
      messageLower.includes('mien bac') ||
      messageLower.includes('phía bắc')
    ) {
      mien = 'bac';
    } else if (
      messageLower.includes('miền trung') ||
      messageLower.includes('mien trung') ||
      messageLower.includes('tây nguyên')
    ) {
      mien = 'trung';
    } else if (
      messageLower.includes('miền nam') ||
      messageLower.includes('mien nam') ||
      messageLower.includes('miền tây') ||
      messageLower.includes('mien tay') ||
      messageLower.includes('đông nam bộ')
    ) {
      mien = 'nam';
    }

    // 3. Trích xuất Từ khóa nông sản (Hỗ trợ nhiều loại nông sản)
    const foundTuKhoas: string[] = [];
    for (const ns of this.cachedNongSans) {
      if (messageLower.includes(ns)) {
        if (
          !foundTuKhoas.some(
            (existing) => existing.includes(ns) || ns.includes(existing),
          )
        ) {
          foundTuKhoas.push(ns);
        }
      }
    }
    const tuKhoa: string | string[] | undefined =
      foundTuKhoas.length > 0
        ? foundTuKhoas.length === 1
          ? foundTuKhoas[0]
          : foundTuKhoas
        : undefined;

    // 4. Trích xuất Tiêu chuẩn
    let tieuChuan: string | undefined;
    const stds = [
      { key: 'vietgap', val: 'VietGAP' },
      { key: 'globalgap', val: 'GlobalGAP' },
      { key: 'hữu cơ', val: 'Hữu cơ (Organic)' },
      { key: 'organic', val: 'Hữu cơ (Organic)' },
      { key: 'ocop 3 sao', val: 'OCOP 3 Sao' },
      { key: 'ocop 4 sao', val: 'OCOP 4 Sao' },
      { key: 'ocop 5 sao', val: 'OCOP 5 Sao' },
      { key: 'ocop', val: 'OCOP' },
      { key: 'iso 22000', val: 'ISO 22000' },
      { key: 'iso', val: 'ISO 22000' },
    ];
    for (const s of stds) {
      if (messageLower.includes(s.key)) {
        tieuChuan = s.val;
        break;
      }
    }

    // 5. Trích xuất Số lượng tối thiểu (min quantity)
    let soLuongMin: number | undefined;
    // Regex hỗ trợ: "từ 5 tấn", "10 tấn trở lên", "trên 500kg", "500 kg trở lên"
    const qtyTonMatch = messageLower.match(
      /(?:từ|trên|tối thiểu|≥|>|\+)?\s*(\d+(?:[.,]\d+)?)\s*tấn/i,
    );
    if (qtyTonMatch) {
      soLuongMin = parseFloat(qtyTonMatch[1].replace(',', '.')) * 1000;
    } else {
      const qtyKgMatch = messageLower.match(
        /(?:từ|trên|tối thiểu|≥|>|\+)?\s*(\d+(?:[.,]\d+)?)\s*(?:kg|kí|ký)/i,
      );
      if (qtyKgMatch) {
        soLuongMin = parseFloat(qtyKgMatch[1].replace(',', '.'));
      }
    }

    // 6. Trích xuất Khoảng giá / Mức giá (Price Bounds)
    let giaMin: number | undefined;
    let giaMax: number | undefined;
    let mucGia: string | undefined;

    // Pattern khoảng giá: "giá từ 25k đến 40k", "25k-40k"
    const rangeMatch = messageLower.match(
      /(?:giá\s*)?(?:từ\s*)?(\d+(?:[.,]\d+)?)\s*(k|ngàn|đ|triệu)?\s*(?:đến|-|tới)\s*(\d+(?:[.,]\d+)?)\s*(k|ngàn|đ|triệu)?/i,
    );
    if (rangeMatch && messageLower.includes('giá')) {
      const v1 = parseFloat(rangeMatch[1].replace(',', '.'));
      const u1 = (rangeMatch[2] || rangeMatch[4] || '').toLowerCase();
      const v2 = parseFloat(rangeMatch[3].replace(',', '.'));
      const u2 = (rangeMatch[4] || rangeMatch[2] || '').toLowerCase();

      const parseVal = (v: number, u: string) => {
        if (u === 'k' || u === 'ngàn') return v * 1000;
        if (u === 'triệu') return v * 1000000;
        if (v < 1000) return v * 1000;
        return v;
      };

      giaMin = parseVal(v1, u1);
      giaMax = parseVal(v2, u2);
    } else {
      // Pattern giá tối đa: "dưới 30k", "30k trở xuống", "tối đa 30k", "giá < 30.000"
      const maxPriceMatch =
        messageLower.match(
          /(?:giá\s*)?(?:dưới|trở xuống|tối đa|<=|<)\s*(\d+(?:[.,]\d+)?)\s*(k|ngàn|ngàn đ|đ|tr|triệu)/i,
        ) ||
        messageLower.match(
          /(\d+(?:[.,]\d+)?)\s*(k|ngàn|ngàn đ|đ|tr|triệu)\s*trở xuống/i,
        );

      if (maxPriceMatch) {
        const val = parseFloat(maxPriceMatch[1].replace(',', '.'));
        const unit = (maxPriceMatch[2] || '').toLowerCase();
        if (unit === 'k' || unit === 'ngàn' || unit === 'ngàn đ') {
          giaMax = val * 1000;
        } else if (unit === 'tr' || unit === 'triệu') {
          giaMax = val * 1000000;
        } else if (val < 1000) {
          giaMax = val * 1000;
        } else {
          giaMax = val;
        }
      }

      // Pattern giá tối thiểu: "giá từ 70k", "trên 70k", "từ 70k trở lên"
      const minPriceMatch =
        messageLower.match(
          /(?:giá\s*)(?:trên|từ|tối thiểu|>=|>)\s*(\d+(?:[.,]\d+)?)\s*(k|ngàn|ngàn đ|đ|tr|triệu)?(?:\s*trở lên)?/i,
        ) ||
        messageLower.match(
          /(?:trên|tối thiểu|>=|>)\s*(\d+(?:[.,]\d+)?)\s*(k|ngàn|ngàn đ|đ|tr|triệu)(?:\s*trở lên)?/i,
        );

      if (minPriceMatch && !maxPriceMatch) {
        const val = parseFloat(minPriceMatch[1].replace(',', '.'));
        const unit = (minPriceMatch[2] || '').toLowerCase();
        if (unit === 'k' || unit === 'ngàn' || unit === 'ngàn đ') {
          giaMin = val * 1000;
        } else if (unit === 'tr' || unit === 'triệu') {
          giaMin = val * 1000000;
        } else if (val < 1000 && unit) {
          giaMin = val * 1000;
        } else if (val >= 1000) {
          giaMin = val;
        }
      }
    }

    // Fallback mucGia tương thích cũ
    if (messageLower.includes('dưới 50') || messageLower.includes('rẻ')) {
      mucGia = 'under-50';
    } else if (
      messageLower.includes('50 đến 100') ||
      messageLower.includes('50-100')
    ) {
      mucGia = '50-100';
    } else if (
      messageLower.includes('trên 100') ||
      messageLower.includes('cao cấp')
    ) {
      mucGia = 'over-100';
    }

    // 7. Trích xuất Đánh giá
    let danhGia: number | undefined;
    if (messageLower.includes('5 sao')) danhGia = 5;
    else if (
      messageLower.includes('4 sao') ||
      messageLower.includes('uy tín') ||
      messageLower.includes('tốt')
    )
      danhGia = 4;
    else if (messageLower.includes('3 sao')) danhGia = 3;

    return {
      tuKhoa,
      tinhThanh,
      mien,
      tieuChuan,
      mucGia,
      giaMin,
      giaMax,
      soLuongMin,
      danhGia,
    };
  }
}
