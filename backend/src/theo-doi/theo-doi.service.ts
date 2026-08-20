import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TheoDoiService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleTheoDoi(buyerId: number, sellerId: number) {
    if (buyerId === sellerId) {
      throw new BadRequestException('Không thể tự theo dõi chính mình');
    }

    const numericBuyerId = Number(buyerId);
    const numericSellerId = Number(sellerId);

    const existing = await this.prisma.theoDoiNguoiBan.findUnique({
      where: {
        buyer_id_seller_id: {
          buyer_id: numericBuyerId,
          seller_id: numericSellerId,
        },
      },
    });

    if (existing) {
      const updated = await this.prisma.theoDoiNguoiBan.update({
        where: { id: existing.id },
        data: { is_active: !existing.is_active },
      });
      return { success: true, is_active: updated.is_active };
    } else {
      const created = await this.prisma.theoDoiNguoiBan.create({
        data: {
          buyer_id: numericBuyerId,
          seller_id: numericSellerId,
          is_active: true,
        },
      });
      return { success: true, is_active: created.is_active };
    }
  }

  async getStatus(buyerId: number, sellerId: number) {
    const numericBuyerId = Number(buyerId);
    const numericSellerId = Number(sellerId);

    const subscription = await this.prisma.theoDoiNguoiBan.findUnique({
      where: {
        buyer_id_seller_id: {
          buyer_id: numericBuyerId,
          seller_id: numericSellerId,
        },
      },
    });

    // Check if buyer has purchased from seller
    const orderCount = await this.prisma.donHang.count({
      where: {
        nguoi_mua_id: numericBuyerId,
        nguoi_ban_id: numericSellerId,
      },
    });

    return {
      isSubscribed: subscription ? subscription.is_active : false,
      hasPurchased: orderCount > 0,
    };
  }

  async getPurchasedSellers(buyerId: number) {
    const numericBuyerId = Number(buyerId);

    // Get unique sellers the buyer has bought from
    const orders = await this.prisma.donHang.findMany({
      where: { nguoi_mua_id: numericBuyerId },
      select: { nguoi_ban_id: true, nguoiBan: { include: { user: true } } },
      distinct: ['nguoi_ban_id'],
    });

    const subscriptions = await this.prisma.theoDoiNguoiBan.findMany({
      where: { buyer_id: numericBuyerId },
    });

    const subMap = new Map();
    subscriptions.forEach((sub) => {
      subMap.set(sub.seller_id, sub.is_active);
    });

    return orders.map((order) => {
      const sellerId = order.nguoi_ban_id;
      return {
        seller_id: sellerId,
        seller: order.nguoiBan,
        is_active: subMap.has(sellerId) ? subMap.get(sellerId) : false,
      };
    });
  }
}
