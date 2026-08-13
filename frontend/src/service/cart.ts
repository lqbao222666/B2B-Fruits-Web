import api from "./api.ts";

export const Cart = {
  async create(payload: {
    baidang_id: number;
    phanloai_id: number;
    so_luong: number;
  }) {
    const response = await api.post("/gio-hang", payload);
    return response.data;
  },

  async update(id: number, payload: { so_luong: number }) {
    const response = await api.patch(`/gio-hang/${id}`, payload);
    return response.data;
  },

  async getByUser(_accountId?: number) {
    const response = await api.get(`/gio-hang`);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/gio-hang/${id}`);
    return response.data;
  },

  async deleteList(ids: number[]) {
    // Note: The backend currently doesn't have a delete multiple endpoint,
    // it only has clearCart for deleting all. But let's leave it as is if unused.
    const response = await api.delete("/gio-hang", {
      data: {
        Ids: ids,
      },
    });
    return response.data;
  },
};

export default Cart;
