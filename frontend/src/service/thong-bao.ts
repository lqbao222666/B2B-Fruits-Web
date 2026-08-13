import api from "./api.ts";

export const ThongBaoService = {
  async getByUser(userId: number) {
    const res = await api.get(`/thong-bao/user/${userId}`);
    return res.data;
  },

  async markAsRead(id: number) {
    const res = await api.patch(`/thong-bao/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.patch(`/thong-bao/read-all`);
    return res.data;
  },
};
