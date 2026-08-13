import api from "./api.ts";

export const Account = {
  async createAccount(payload: any) {
    const response = await api.post("/users", payload);
    return response.data;
  },

  async getAccount(id: number) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // 3. Lấy tất cả tài khoản
  async getAllAccount() {
    const response = await api.get(`/users`); // Bỏ dấu / ở cuối cho đẹp
    return response.data;
  },

  async changePassword(
    id: number,
    payload: {
      old_password: string;
      new_password: string;
      confirm_password: string;
    },
  ) {
    const response = await api.put(`/users/${id}/password`, payload);
    return response.data;
  },

  async updateActive(id: number, isActive: boolean) {
    const response = await api.put(`/users/${id}/active`, { isActive });
    return response.data;
  },

  async updateRole(id: number, role: string) {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  async updateAvatar(id: number, avatar_url: string) {
    const response = await api.put(`/users/${id}/avatar`, { avatar_url });
    return response.data;
  },

  async deleteAccount(id: number) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async deleteAccountList(ids: number[]) {
    const response = await api.delete(`/users`, {
      data: { Ids: ids },
    });
    return response.data;
  },

  // 9. Lấy thống kê (Sửa URL thành '/users/stats/count' cho khớp Backend)
  async getStats() {
    const response = await api.get("/users/stats/count");
    return response.data;
  },

  async uploadAvatar(id: number, file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.patch(`/users/${id}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await api.post("/users/forgot-password", { email });
    return response.data;
  },

  async resetPasswordWithToken(payload: {
    email: string;
    token: string;
    newPassword: string;
  }) {
    const response = await api.post("/users/reset-password", payload);
    return response.data;
  },

  async getTopCustomers() {
    const response = await api.get("/users/stats/top-customers"); // Đảm bảo route này khớp với Controller NestJS
    return response.data;
  },
};

export default Account;
