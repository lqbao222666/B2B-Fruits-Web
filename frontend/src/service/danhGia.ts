import api from "./api";

export interface CreateDanhGiaInput {
  donhang_id: number;
  baidang_id: number;
  nguoi_duoc_dg_id: number;
  diem_tong: number;
  diem_chat_luong?: number;
  diem_dung_hen?: number;
  diem_thai_do?: number;
  nhan_xet?: string;
  images?: string[];
}

export interface ReplyDanhGiaInput {
  tra_loi: string;
}

export const DanhGiaService = {
  async create(data: CreateDanhGiaInput) {
    const res = await api.post("/danh-gia", data);
    return res.data;
  },

  async reply(danhgia_id: number, data: ReplyDanhGiaInput) {
    const res = await api.put(`/danh-gia/${danhgia_id}/reply`, data);
    return res.data;
  },

  async getByBaiDang(baidang_id: number) {
    const res = await api.get(`/danh-gia/bai-dang/${baidang_id}`);
    return res.data;
  },

  async getByNongDan(nongdan_id: number) {
    const res = await api.get(`/danh-gia/nong-dan/${nongdan_id}`);
    return res.data;
  },
};
