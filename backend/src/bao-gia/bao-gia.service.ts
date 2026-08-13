import { Injectable, NotFoundException } from '@nestjs/common';
import { BaoGiaRepository } from './bao-gia.repository';
import { CreateBaoGiaDto } from './dto/create-bao-gia.dto';
import { PhanHoiBaoGiaDto } from './dto/phan-hoi-bao-gia.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoaiThongBao } from '@prisma/client';

@Injectable()
export class BaoGiaService {
  constructor(
    private readonly repository: BaoGiaRepository,
    private readonly prisma: PrismaService,
  ) {}

  private async createDonHangFromNhuCau(
    tx: any,
    nhuCau: any,
    nongDanId: number,
    soLuong: number,
    giaDeXuat: number,
    tinhThanhCungCap?: string,
    diaChiCungCap?: string,
    khoangCachKm?: number,
    phiVanChuyen?: number,
    ghiChu?: string,
  ) {
    const buyerId = nhuCau.doanh_nghiep_id;
    const sellerId = nongDanId;

    // Ensure profile records exist
    const dn = await tx.doanhNghiep.findUnique({ where: { user_id: buyerId } });
    if (!dn) {
      const u = await tx.users.findUnique({ where: { user_id: buyerId } });
      if (u) {
        await tx.doanhNghiep.create({
          data: {
            user_id: buyerId,
            ten_cong_ty: u.full_name || 'Doanh Nghiệp',
            tinh_thanh: nhuCau.tinh_thanh_giao || 'Cần Thơ',
            trang_thai: 'active',
          },
        });
      }
    }
    const nd = await tx.nongDan.findUnique({ where: { user_id: sellerId } });
    if (!nd) {
      const u = await tx.users.findUnique({ where: { user_id: sellerId } });
      if (u) {
        await tx.nongDan.create({
          data: {
            user_id: sellerId,
            ho_ten: u.full_name || 'Nông Dân',
            tinh_thanh: tinhThanhCungCap || 'Cần Thơ',
            trang_thai: 'active',
          },
        });
      }
    }

    let danhmucId = nhuCau.danhmuc_id;
    if (!danhmucId) {
      const firstDm = await tx.danhMuc.findFirst();
      danhmucId = firstDm ? firstDm.danhmuc_id : 1;
    }

    let sampleBaiDang = await tx.baiDang.findFirst({
      where: {
        nguoi_dang_id: sellerId,
        tieu_de: `Giao dịch B2B - ${nhuCau.ten_nong_san || 'Nông sản'}`,
      },
    });

    if (!sampleBaiDang) {
      sampleBaiDang = await tx.baiDang.create({
        data: {
          nguoi_dang_id: sellerId,
          danhmuc_id: danhmucId,
          tieu_de: `Giao dịch B2B - ${nhuCau.ten_nong_san || 'Nông sản'}`,
          ten_nong_san: nhuCau.ten_nong_san || 'Nông sản',
          mo_ta: `Bài đăng B2B tự động khởi tạo phục vụ giao dịch B2B từ Nhu Cầu Thu Mua: ${nhuCau.ten_nong_san}`,
          don_vi_tinh: nhuCau.don_vi || 'kg',
          so_luong_co: 0,
          so_luong_con_lai: 0,
          gia_per_kg: Number(giaDeXuat),
          tinh_thanh: nhuCau.tinh_thanh_giao || 'Cần Thơ',
          trang_thai: 'an',
          images: nhuCau.hinh_anh ? [nhuCau.hinh_anh] : [],
        },
      });
    }

    let samplePhanLoai = await tx.phanLoaiSanPham.findFirst({
      where: {
        baidang_id: sampleBaiDang.baidang_id,
        ten_phan_loai: 'Loại Chuẩn B2B',
      },
    });

    if (!samplePhanLoai) {
      samplePhanLoai = await tx.phanLoaiSanPham.create({
        data: {
          baidang_id: sampleBaiDang.baidang_id,
          ten_phan_loai: 'Loại Chuẩn B2B',
          so_luong_co: 0,
          so_luong_con_lai: 0,
          gia: Number(giaDeXuat),
        },
      });
    }

    const baiDangId = sampleBaiDang.baidang_id;
    const phanLoaiId = samplePhanLoai.phanloai_id;

    const tongTien = Number(soLuong) * Number(giaDeXuat);
    const tienCoc = tongTien * 0.15; // 15% deposit
    const maDonHang = `B2B-NC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const donHang = await tx.donHang.create({
      data: {
        nguoi_mua_id: buyerId,
        nguoi_ban_id: sellerId,
        baidang_id: baiDangId,
        ma_don_hang: maDonHang,
        tong_tien: tongTien,
        tien_coc: tienCoc,
        dia_chi_giao:
          nhuCau.dia_chi_giao || nhuCau.tinh_thanh_giao || 'Thỏa thuận',
        tinh_thanh_giao: nhuCau.tinh_thanh_giao || 'Cần Thơ',
        khoang_cach: khoangCachKm || undefined,
        phi_van_chuyen: phiVanChuyen || undefined,
        trang_thai_don: 'cho_xac_nhan',
        trang_thai_tt: 'chua_thanh_toan',
        ghi_chu: `Đơn hàng B2B tạo từ nhu cầu thu mua: ${nhuCau.ten_nong_san}. [NHUCAU_ID: ${nhuCau.nhucau_id}] ${ghiChu || ''}`,
      },
    });

    await tx.donHangChiTiet.create({
      data: {
        donhang_id: donHang.donhang_id,
        phanloai_id: phanLoaiId,
        so_luong: soLuong,
        don_gia: giaDeXuat,
        thanh_tien: tongTien,
      },
    });

    return donHang;
  }

  async create(dto: CreateBaoGiaDto) {
    const nhuCau = await this.prisma.nhuCauThuMua.findUnique({
      where: { nhucau_id: dto.nhucau_id },
      include: { doanhNghiep: { include: { user: true } } },
    });

    if (!nhuCau) {
      throw new NotFoundException('Nhu cầu thu mua không tồn tại');
    }

    const refPrice = Number(nhuCau.gia_tham_khao) || 0;
    const offerPrice = Number(dto.gia_de_xuat) || 0;
    const isPriceUnchanged = Math.abs(offerPrice - refPrice) < 1;

    let isStandardMatched = true;
    if (nhuCau.yeu_cau_chung_nhan && nhuCau.yeu_cau_chung_nhan.trim() !== '') {
      const yeuCau = nhuCau.yeu_cau_chung_nhan.toLowerCase().trim();
      const nongDanCo = (dto as any).tieu_chuan_nong_dan?.toLowerCase() || '';
      isStandardMatched = nongDanCo.includes(yeuCau);
    }

    if (isPriceUnchanged && isStandardMatched) {
      // LUỒNG GIÁ KHÔNG THAY ĐỔI: Tự động chốt đơn & tạo DonHang + Đặt cọc 15%
      return await this.prisma.$transaction(async (tx) => {
        const baoGia = await this.repository.create({
          ...dto,
          trang_thai: 'da_thong_nhat',
        });

        const donHang = await this.createDonHangFromNhuCau(
          tx,
          nhuCau,
          dto.nong_dan_id,
          dto.so_luong_cung_cap,
          dto.gia_de_xuat,
          dto.tinh_thanh_cung_cap,
          dto.dia_chi_cung_cap,
          dto.khoang_cach_km,
          dto.phi_van_chuyen,
          dto.ghi_chu,
        );

        const dnUserId = nhuCau.doanhNghiep?.user_id || nhuCau.doanh_nghiep_id;
        const nongDanUser = await tx.users.findUnique({
          where: { user_id: dto.nong_dan_id },
        });
        const farmerName = nongDanUser?.full_name || 'Nông Dân';

        await tx.thongBao.create({
          data: {
            user_id: dnUserId,
            loai: LoaiThongBao.don_hang,
            tieu_de: '🎉 Nông dân đã chào hàng đúng giá niêm yết!',
            noi_dung: `Nông dân ${farmerName} đã xác nhận chào bán ${dto.so_luong_cung_cap} ${nhuCau.don_vi} với đúng giá ${offerPrice.toLocaleString('vi-VN')} đ cho nhu cầu "${nhuCau.ten_nong_san}". Đơn hàng #${donHang.ma_don_hang} đã được tạo. Vui lòng thanh toán cọc 15% (${Number(donHang.tien_coc).toLocaleString('vi-VN')} đ) để xe B2B đến lấy hàng!`,
            ref_id: donHang.donhang_id,
            ref_type: 'don_hang',
          },
        });

        return {
          ...baoGia,
          is_instant_order: true,
          don_hang: donHang,
        };
      });
    }

    // LUỒNG CÓ THAY ĐỔI GIÁ / TĂNG GIẢM GIÁ: Gửi thương lượng cho Doanh nghiệp
    const result = await this.repository.create(dto);
    const dnUserId =
      result.nhuCau?.doanhNghiep?.user_id || result.nhuCau?.doanh_nghiep_id;
    if (dnUserId) {
      const nongDanName = result.nongDan?.user?.full_name || 'Nông Dân';
      await this.prisma.thongBao.create({
        data: {
          user_id: dnUserId,
          loai: LoaiThongBao.bai_dang,
          tieu_de: '📩 Báo giá chào hàng có điều chỉnh giá từ Nông dân',
          noi_dung: `Nông dân ${nongDanName} đã đề xuất mức giá mới ${offerPrice.toLocaleString('vi-VN')} đ cho số lượng ${result.so_luong_cung_cap} ${result.don_vi} nhu cầu "${result.nhuCau.ten_nong_san}". Vui lòng xem phản hồi thương lượng!`,
          ref_id: result.baogia_id,
          ref_type: 'bao_gia',
        },
      });
    }

    return result;
  }

  async findByNhuCau(nhucau_id: number) {
    return this.repository.findByNhuCau(nhucau_id);
  }

  async findByNongDan(nong_dan_id: number) {
    return this.repository.findByNongDan(nong_dan_id);
  }

  async findByDoanhNghiep(doanh_nghiep_id: number) {
    return this.repository.findByDoanhNghiep(doanh_nghiep_id);
  }

  async findOne(id: number) {
    return this.repository.findOne(id);
  }

  async phanHoi(baogia_id: number, dto: PhanHoiBaoGiaDto) {
    const result = await this.repository.phanHoi(baogia_id, dto);

    if (dto.trang_thai === 'da_thong_nhat') {
      // Khi 2 bên thống nhất giá thương lượng -> Tạo đơn hàng DonHang & trừ số lượng cần!
      await this.prisma.$transaction(async (tx) => {
        const baoGiaFull = await tx.baoGiaNhuCau.findUnique({
          where: { baogia_id },
          include: {
            nhuCau: { include: { doanhNghiep: { include: { user: true } } } },
            nongDan: { include: { user: true } },
          },
        });

        if (baoGiaFull && baoGiaFull.nhuCau) {
          const donHang = await this.createDonHangFromNhuCau(
            tx,
            baoGiaFull.nhuCau,
            baoGiaFull.nong_dan_id,
            Number(baoGiaFull.so_luong_cung_cap),
            Number(baoGiaFull.gia_de_xuat),
            baoGiaFull.tinh_thanh_cung_cap || undefined,
            baoGiaFull.dia_chi_cung_cap || undefined,
            baoGiaFull.khoang_cach_km
              ? Number(baoGiaFull.khoang_cach_km)
              : undefined,
            baoGiaFull.phi_van_chuyen
              ? Number(baoGiaFull.phi_van_chuyen)
              : undefined,
            baoGiaFull.ghi_chu || undefined,
          );

          // Thông báo cho Doanh nghiệp
          const dnUserId =
            baoGiaFull.nhuCau.doanhNghiep?.user_id ||
            baoGiaFull.nhuCau.doanh_nghiep_id;
          await tx.thongBao.create({
            data: {
              user_id: dnUserId,
              loai: LoaiThongBao.don_hang,
              tieu_de: '🎉 Đã chốt thương lượng thành công!',
              noi_dung: `Bạn đã thống nhất mức giá ${Number(baoGiaFull.gia_de_xuat).toLocaleString('vi-VN')} đ cho nhu cầu "${baoGiaFull.nhuCau.ten_nong_san}". Đơn hàng #${donHang.ma_don_hang} đã được tạo, vui lòng thanh toán cọc 15% (${Number(donHang.tien_coc).toLocaleString('vi-VN')} đ) để xe B2B đến lấy hàng!`,
              ref_id: donHang.donhang_id,
              ref_type: 'don_hang',
            },
          });

          // Thông báo cho Nông dân
          const ndUserId =
            baoGiaFull.nongDan?.user_id || baoGiaFull.nong_dan_id;
          await tx.thongBao.create({
            data: {
              user_id: ndUserId,
              loai: LoaiThongBao.don_hang,
              tieu_de: '🎉 Thương lượng báo giá đã được thống nhất!',
              noi_dung: `Doanh nghiệp đã chấp nhận mức giá ${Number(baoGiaFull.gia_de_xuat).toLocaleString('vi-VN')} đ. Đơn hàng #${donHang.ma_don_hang} đang chờ Doanh nghiệp thanh toán cọc 15%, hệ thống xe vận chuyển B2B sẽ đến lấy hàng!`,
              ref_id: donHang.donhang_id,
              ref_type: 'don_hang',
            },
          });
        }
      });
    } else {
      // Thông báo phản hồi thương lượng thông thường
      let recipientUserId: number | null = null;
      let title = 'Cập nhật thương lượng báo giá';
      let bodyText = `Có cập nhật mới cho báo giá nhu cầu "${result.nhuCau?.ten_nong_san}".`;

      if (dto.sender_role === 'doanh_nghiep') {
        recipientUserId = result.nongDan?.user_id || result.nong_dan_id;
        if (dto.trang_thai === 'tu_choi') {
          title = 'Doanh nghiệp từ chối báo giá';
          bodyText = `Doanh nghiệp ${result.nhuCau?.doanhNghiep?.user?.full_name || ''} đã từ chối báo giá chào hàng nhu cầu "${result.nhuCau?.ten_nong_san}".`;
        } else {
          title = 'Doanh nghiệp đã phản hồi thương lượng!';
          bodyText = `Doanh nghiệp đã điều chỉnh thương lượng cho nhu cầu "${result.nhuCau?.ten_nong_san}". Vui lòng xem và phản hồi lại.`;
        }
      } else if (dto.sender_role === 'nong_dan') {
        recipientUserId =
          result.nhuCau?.doanhNghiep?.user_id || result.nhuCau?.doanh_nghiep_id;
        title = 'Nông dân đã điều chỉnh báo giá!';
        bodyText = `Nông dân ${result.nongDan?.user?.full_name || ''} vừa cập nhật báo giá cho nhu cầu "${result.nhuCau?.ten_nong_san}".`;
      }

      if (recipientUserId) {
        await this.prisma.thongBao.create({
          data: {
            user_id: recipientUserId,
            loai: LoaiThongBao.bai_dang,
            tieu_de: title,
            noi_dung: bodyText,
            ref_id: result.baogia_id,
            ref_type: 'bao_gia',
          },
        });
      }
    }

    return result;
  }

  async remove(id: number) {
    return this.repository.remove(id);
  }
}
