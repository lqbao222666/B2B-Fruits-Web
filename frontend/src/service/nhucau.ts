import api from "./api";

export interface NhuCauThuMua {
  nhucau_id: number;
  doanh_nghiep_id: number;
  danhmuc_id?: number;
  ten_nong_san: string;
  mo_ta?: string;
  so_luong_can: number;
  don_vi: string;
  gia_tham_khao?: number;
  cho_thuong_luong: boolean;
  yeu_cau_chung_nhan?: string;
  tinh_thanh_giao?: string;
  dia_chi_giao?: string;
  latitude?: number;
  longitude?: number;
  ngay_bat_dau?: string;
  ngay_ket_thuc?: string;
  trang_thai: "dang_thu_mua" | "du_so_luong" | "tam_ngung" | "da_dong";
  luot_xem: number;
  da_thong_bao: boolean;
  created_at: string;
  updated_at: string;
  doanhNghiep?: any;
  danhMuc?: any;
  baoGiaList?: any[];
  _count?: { baoGiaList: number };
}

export const NhuCauService = {
  getAll: async (params?: {
    ten_nong_san?: string;
    tinh_thanh_giao?: string;
    danhmuc_id?: number;
    trang_thai?: string;
  }) => {
    const res = await api.get("/nhu-cau", { params });
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get(`/nhu-cau/${id}`);
    return res.data;
  },

  getByDoanhNghiep: async (doanhNghiepId: number) => {
    const res = await api.get(`/nhu-cau/doanh-nghiep/${doanhNghiepId}`);
    return res.data;
  },

  create: async (data: Partial<NhuCauThuMua>) => {
    const res = await api.post("/nhu-cau", data);
    return res.data;
  },

  update: async (id: number, data: Partial<NhuCauThuMua>) => {
    const res = await api.patch(`/nhu-cau/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete(`/nhu-cau/${id}`);
    return res.data;
  },
};
