import api from "./api.ts";

export const Category = {
  async getAllCategories() {
    const response = await api.get("/danh-muc");
    return response.data;
  },

  async createCategory(data: { ten_danh_muc: string; slug: string }) {
    const response = await api.post("/danh-muc", data);
    return response.data;
  },

  // Nếu sau này cần thì bổ sung
  async updateCategory(id: number, data: any) {
    const response = await api.put(`/danh-muc/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number) {
    const response = await api.delete(`/danh-muc/${id}`);
    return response.data;
  },

  async deleteListCategory(ids: number[]) {
    const response = await api.delete("/danh-muc", { data: { Ids: ids } });
    return response.data;
  },
  async uploadImage(id: number, file: File) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post(`/danh-muc/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
