import api from "./api";

export interface ChungLoai {
  chungloai_id: number;
  ten_chung_loai: string;
  slug: string;
  mo_ta?: string;
  icon_url?: string;
  thu_tu: number;
  is_active: boolean;
}

export const ChungLoaiService = {
  async getAll() {
    const res = await api.get("/chung-loai");
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get(`/chung-loai/${id}`);
    return res.data;
  },

  async create(data: Partial<ChungLoai>) {
    const res = await api.post("/chung-loai", data);
    return res.data;
  },

  async update(id: number, data: Partial<ChungLoai>) {
    const res = await api.patch(`/chung-loai/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    const res = await api.delete(`/chung-loai/${id}`);
    return res.data;
  },
};
