import api from "./api.ts";

export const AdminService = {
  async getStats() {
    try {
      // 1. Chỉ cần gọi duy nhất endpoint tổng hợp này
      // Backend đã xử lý gom: totalUsers, totalOrders, totalProducts, totalRevenue, monthlyRevenue...
      const response = await api.get("/order/stats");
      const data = response.data;

      // 2. Nếu bạn vẫn muốn lấy thêm inventory và sold (vì trong getStats chưa có)
      // Bạn có thể giữ lại hoặc bổ sung chúng vào hàm getStats ở Backend sau.
      const [inventoryRes, soldRes] = await Promise.all([
        api.get("/product/stats/inventory"),
        api.get("/product/stats/sold"),
      ]);

      return {
        totalUsers: data.totalUsers || 0,
        totalOrders: data.totalOrders || 0,
        totalProducts: data.totalProducts || 0,
        totalRevenue: data.totalRevenue || 0,
        monthlyRevenue: data.monthlyRevenue || Array(12).fill(0),
        statusCount: data.statusCount || {}, // Có thêm cái này để vẽ biểu đồ tròn cực đẹp
        totalInventory: inventoryRes.data || 0,
        totalSold: soldRes.data || 0,
      };
    } catch (error: any) {
      console.error("Admin stats error:", error.response?.data || error);
      return {
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        monthlyRevenue: Array(12).fill(0),
        totalInventory: 0,
        totalSold: 0,
        statusCount: {},
      };
    }
  },
};

export default AdminService;
