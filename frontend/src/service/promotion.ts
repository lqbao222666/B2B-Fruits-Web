import api from './api.ts'

export const Promotion = {
  // Lấy danh sách tất cả khuyến mãi
  async getAllPromotions() {
    try {
      const res = await api.get('/promotion')
      return res.data
    } catch (e) {
      console.error('Lỗi lấy danh sách khuyến mãi:', e)
      throw e
    }
  },

  // Tạo khuyến mãi mới
  async createPromotion(data: any) {
    // Chuẩn hóa dữ liệu trước khi gửi lên Backend
    const payload = {
      ...data,
      // Chuyển discountValue thành String nếu Backend yêu cầu String
      // Nếu Backend báo lỗi kiểu dữ liệu, hãy thử đổi lại thành Number(data.discountValue)
      discountValue: Number(data.discountValue),

      // Chuyển ngày về định dạng ISO để tránh lỗi 500
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
    }

    const res = await api.post('/promotion', payload)
    return res.data
  },

  // Cập nhật khuyến mãi theo ID
  async updatePromotion(id: number, data: any) {
    const payload = {
      ...data,
      discountValue: String(data.discountValue),
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
    }

    // Xóa trường ID trong body để tránh Backend hiểu lầm là đang sửa luôn cả ID
    delete (payload as any).id

    const res = await api.put(`/promotion/${id}`, payload)
    return res.data
  },

  // Xóa 1 khuyến mãi
  async deletePromotion(id: number) {
    const res = await api.delete(`/promotion/${id}`)
    return res.data
  },

  // Xóa hàng loạt khuyến mãi
  async deleteListPromotions(ids: number[]) {
    // Lưu ý: data: { Ids: ids } phải khớp với key "Ids" mà Backend định nghĩa
    const res = await api.delete('/promotion', { data: { Ids: ids } })
    return res.data
  },

  // Áp dụng khuyến mãi cho biến thể sản phẩm (Hàm bổ trợ)
  async applyPromotionToVariant(variantId: number, promotionId: number) {
    const res = await api.post(`/promotion/apply-variant`, {
      variantId,
      promotionId,
    })
    return res.data
  },
}

export default Promotion
