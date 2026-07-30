import api from './api.ts'

export const DonHang = {
  // Lấy tất cả đơn hàng (Admin xem hết, User xem của mình)
  async getAll() {
    const response = await api.get('/don-hang')
    return response.data
  },

  // Lấy chi tiết đơn hàng
  async getById(id: number) {
    const response = await api.get(`/don-hang/${id}`)
    return response.data
  },

  // Lấy đơn hàng theo user ID
  async getByUser(userId: number) {
    const response = await api.get(`/don-hang/user/${userId}`)
    return response.data
  },

  // Tạo đơn hàng (Doanh nghiệp mua)
  async create(data: any) {
    const response = await api.post('/don-hang', data)
    return response.data
  },

  // Cập nhật đơn hàng (Nông dân xác nhận, đổi trạng thái)
  async update(id: number, data: any) {
    const response = await api.patch(`/don-hang/${id}`, data)
    return response.data
  },

  // Xoá/Huỷ đơn hàng (Admin xoá, hoặc huỷ)
  async delete(id: number) {
    const response = await api.delete(`/don-hang/${id}`)
    return response.data
  }
}
