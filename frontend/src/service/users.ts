import api from './api.ts'

export const UsersAdmin = {
  // Admin lấy tất cả users
  async getAll() {
    const response = await api.get('/users/all') // API /users/all
    return response.data
  },

  // Thay đổi trạng thái tài khoản (Khóa / Mở khóa)
  async updateActive(id: number, isActive: boolean) {
    const response = await api.put(`/users/${id}/active`, { is_active: isActive })
    return response.data
  },

  // Đổi role
  async updateRole(id: number, roleId: number) {
    const response = await api.put(`/users/${id}/role`, { role_id: roleId })
    return response.data
  },

  // Xóa user
  async deleteUser(id: number) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  }
}
