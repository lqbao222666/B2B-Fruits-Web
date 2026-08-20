import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DonHangCronService {
  private readonly logger = new Logger(DonHangCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Chạy lúc 00:01 mỗi ngày
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('Bắt đầu kiểm tra và cập nhật trạng thái đơn hàng đến hạn giao...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tìm các đơn hàng đã xác nhận, có ngày giao dự kiến <= hôm nay
    const donHangs = await this.prisma.donHang.findMany({
      where: {
        trang_thai_don: 'da_xac_nhan',
        ngay_giao_du_kien: {
          lte: today,
        },
      },
    });

    if (donHangs.length > 0) {
      for (const dh of donHangs) {
        await this.prisma.donHang.update({
          where: { donhang_id: dh.donhang_id },
          data: { trang_thai_don: 'dang_giao' },
        });

        // Cập nhật lại bài đăng thành có sẵn (nếu trước đó là dự kiến)
        if (dh.baidang_id) {
            await this.prisma.baiDang.update({
                where: { baidang_id: dh.baidang_id },
                data: { loai_cung_cap: 'lay_hang_ngay' }
            });
        }

        // Gửi thông báo
        await this.prisma.thongBao.create({
          data: {
            user_id: dh.nguoi_mua_id,
            tieu_de: `Đơn hàng #${dh.ma_don_hang} đang được giao`,
            noi_dung: `Đơn hàng của bạn đã đến ngày dự kiến giao và hiện đang trong trạng thái Đang giao.`,
            loai: 'he_thong',
          },
        });
        await this.prisma.thongBao.create({
          data: {
            user_id: dh.nguoi_ban_id,
            tieu_de: `Đơn hàng #${dh.ma_don_hang} đã chuyển sang Đang giao`,
            noi_dung: `Đơn hàng đã đến ngày dự kiến giao và hệ thống đã tự động chuyển sang Đang giao. Vui lòng tiến hành giao hàng.`,
            loai: 'he_thong',
          },
        });
      }
      this.logger.debug(`Đã cập nhật ${donHangs.length} đơn hàng sang trạng thái đang giao.`);
    } else {
      this.logger.debug('Không có đơn hàng nào cần cập nhật trạng thái giao.');
    }
  }
}
