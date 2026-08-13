import { Injectable, BadRequestException } from '@nestjs/common';
import { DonHangRepository } from './don-hang.repository';
import { CreateDonHangDto } from './dto/create-don-hang.dto';
import { UpdateDonHangDto } from './dto/update-don-hang.dto';
import { DatHangDto } from './dto/dat-hang.dto';
import { HinhThucGiaoHang } from '@prisma/client';

@Injectable()
export class DonHangService {
  constructor(private readonly repository: DonHangRepository) {}

  private calculateShippingFee(so_luong: number, khoang_cach: number): number {
    if (!khoang_cach || khoang_cach <= 0) return 0;

    let base_price = 0;
    let price_per_km = 0;

    if (so_luong < 1500) {
      // < 1.5 tan
      base_price = 200000;
      if (khoang_cach <= 50) price_per_km = 18000;
      else if (khoang_cach <= 200) price_per_km = 15000;
      else price_per_km = 12000;
    } else if (so_luong <= 3000) {
      // 1.5 - 3 tan
      base_price = 400000;
      if (khoang_cach <= 50) price_per_km = 19000;
      else if (khoang_cach <= 200) price_per_km = 17500;
      else price_per_km = 15500;
    } else if (so_luong <= 5000) {
      // 3 - 5 tan
      base_price = 700000;
      if (khoang_cach <= 50) price_per_km = 23000;
      else if (khoang_cach <= 200) price_per_km = 21000;
      else price_per_km = 18000;
    } else {
      // 5 - 10 tan (or more)
      base_price = 1250000;
      if (khoang_cach <= 50) price_per_km = 26000;
      else if (khoang_cach <= 200) price_per_km = 24500;
      else price_per_km = 22500;
    }

    let fee = base_price;
    if (khoang_cach > 4) {
      fee += (khoang_cach - 4) * price_per_km;
    }
    return fee;
  }

  async datHang(user_id: number, dto: DatHangDto) {
    let shippingFee = 0;
    if (dto.hinh_thuc_giao_hang !== HinhThucGiaoHang.tu_den_lay) {
      const dist =
        dto.khoang_cach !== undefined && dto.khoang_cach !== null
          ? Number(dto.khoang_cach)
          : 0;
      const totalSoLuong = (dto.items || []).reduce(
        (acc, item) => acc + Number(item.so_luong),
        0,
      );
      shippingFee = this.calculateShippingFee(totalSoLuong, dist);
    }

    return this.repository.datHang(user_id, dto, shippingFee);
  }

  async create(createDto: CreateDonHangDto) {
    try {
      const tong_tien_hang = createDto.so_luong * createDto.don_gia;

      // Generate 6-digit OTP for ALL orders
      createDto.ma_xac_nhan = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      if (createDto.hinh_thuc_giao_hang === HinhThucGiaoHang.tu_den_lay) {
        createDto.phi_van_chuyen = 0;
        createDto.tien_coc = tong_tien_hang * 0.15; // 15% deposit
        createDto.tong_tien = tong_tien_hang;
      } else {
        if (!createDto.khoang_cach) {
          throw new BadRequestException(
            'Vui lòng cung cấp khoảng cách giao hàng',
          );
        }
        createDto.phi_van_chuyen = this.calculateShippingFee(
          createDto.so_luong,
          createDto.khoang_cach,
        );
        createDto.tong_tien = tong_tien_hang + createDto.phi_van_chuyen;
        // Thu cọc 15% trên tổng tiền hàng (hoặc tổng tiền bao gồm ship? Lấy tổng tiền hàng cho giống tu_den_lay)
        createDto.tien_coc = createDto.tong_tien * 0.15;
      }

      // Tự động nhận là đã thanh toán cọc và đã xác nhận
      createDto.trang_thai_don = 'da_xac_nhan';
      createDto.trang_thai_tt = 'da_thanh_toan';

      return await this.repository.create(createDto);
    } catch (e) {
      require('fs').appendFileSync(
        'error.log',
        new Date().toISOString() + ': ' + e.message + '\n' + e.stack + '\n',
      );
      throw e;
    }
  }

  async xacNhanGiaoHang(id: number, ma_xac_nhan: string) {
    const order = await this.repository.findOne(id);
    if (!order) throw new BadRequestException('Đơn hàng không tồn tại');

    if (order.ma_xac_nhan !== ma_xac_nhan) {
      throw new BadRequestException('Mã xác nhận không hợp lệ');
    }

    // Update status
    return this.repository.update(id, {
      trang_thai_don: 'hoan_thanh',
      trang_thai_tt: 'da_thanh_toan', // Assume the rest is paid or will be paid outside, or handled by payment gateway later
    } as any);
  }

  findAll() {
    return this.repository.findAll();
  }

  findByUser(userId: number) {
    return this.repository.findByUser(userId);
  }

  findOne(id: number) {
    return this.repository.findOne(id);
  }

  async update(id: number, updateDto: UpdateDonHangDto) {
    await this.repository.findOne(id);
    return this.repository.update(id, updateDto);
  }

  async remove(id: number) {
    await this.repository.findOne(id);
    return this.repository.remove(id);
  }
}
