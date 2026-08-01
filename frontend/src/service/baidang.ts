import api from './api.ts'

export const BaiDang = {
  // Lấy tất cả bài đăng (công khai)
  async getAll(params = {}) {
    const response = await api.get('/bai-dang', { params })
    return response.data
  },

  // Admin lấy tất cả bài đăng (gồm cả ẩn, chờ duyệt)
  async getAllForAdmin(params = {}) {
    const response = await api.get('/bai-dang/admin/all', { params })
    return response.data
  },

  // Lấy chi tiết bài đăng
  async getById(id: number) {
    const response = await api.get(`/bai-dang/${id}`)
    return response.data
  },

  // Nông dân xem bài đăng của mình
  async getByNongDan(id: number) {
    const response = await api.get(`/bai-dang/nong-dan/${id}`)
    return response.data
  },

  // Nông dân tạo bài đăng
  async create(data: any) {
    const response = await api.post('/bai-dang', data)
    return response.data
  },

  // Nông dân cập nhật bài đăng
  async update(id: number, data: any) {
    const response = await api.patch(`/bai-dang/${id}`, data)
    return response.data
  },

  // Admin ẩn bài đăng
  async anBaiDang(id: number, lyDo: string) {
    const response = await api.patch(`/bai-dang/${id}/an`, { ly_do_tu_choi: lyDo })
    return response.data
  },

  // Nông dân / Admin mở lại bài đăng đang ẩn
  async moLaiBaiDang(id: number) {
    const response = await api.patch(`/bai-dang/${id}/mo-lai`)
    return response.data
  },

  // Admin duyệt bài đăng (từ chờ duyệt -> đang bán)
  async duyetBaiDang(id: number) {
    const response = await api.patch(`/bai-dang/${id}`, { trang_thai: 'dang_ban', ly_do_tu_choi: null })
    return response.data
  },

  // Xoá bài đăng
  async delete(id: number) {
    const response = await api.delete(`/bai-dang/${id}`)
    return response.data
  },

  // Ngừng cung cấp
  async ngungCungCap(id: number) {
    const response = await api.put(`/bai-dang/${id}/ngung-cung-cap`)
    return response.data
  }
}
