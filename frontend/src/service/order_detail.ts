import api from "./api.ts"; // Đảm bảo đường dẫn này trỏ đúng tới file api.ts của bạn

export const OrderDetailService = {
  // 1. Tạo mới một chi tiết đơn hàng (POST /order-detail)
  async createOrderDetail(data: any) {
    // data tương ứng với OrderDetailRequestDto (variantId, quantity, bundleId...)
    const response = await api.post("order-detail", data);
    return response.data;
  },

  // 2. Cập nhật một chi tiết đơn hàng (PUT /order-detail/:id)
  async updateOrderDetail(id: number, data: any) {
    const response = await api.put(`order-detail/${id}`, data);
    return response.data;
  },

  // 3. Lấy thông tin 1 chi tiết đơn hàng theo ID (GET /order-detail/:id)
  async getOrderDetailById(id: number) {
    const response = await api.get(`order-detail/${id}`);
    return response.data;
  },

  // 4. Lấy tất cả chi tiết của một Đơn hàng cụ thể (GET /order-detail/order/:orderId)
  async getOrderDetailsByOrder(orderId: number) {
    const response = await api.get(`order-detail/order/${orderId}`);
    return response.data;
  },

  // 5. Xóa 1 chi tiết đơn hàng (DELETE /order-detail/:id)
  async deleteOrderDetail(id: number) {
    const response = await api.delete(`order-detail/${id}`);
    return response.data;
  },

  // 6. Xóa nhiều chi tiết đơn hàng cùng lúc (DELETE /order-detail)
  async deleteListOrderDetails(ids: number[]) {
    // Lưu ý cực kỳ quan trọng: Với Axios, method DELETE muốn gửi body thì phải bọc trong object `data`
    const response = await api.delete("order-detail", {
      data: { Ids: ids }, // Chữ 'Ids' này phải viết y hệt như khai báo trong DeleteListOrderDetailDto của backend nhé
    });
    return response.data;
  },
};

export default OrderDetailService;
