import api from "./api";

export interface BaoGiaNhuCau {
  baogia_id: number;
  nhucau_id: number;
  nong_dan_id: number;
  so_luong_cung_cap: number;
  don_vi: string;
  gia_de_xuat: number;
  chenh_lech_gia: number;
  khoang_cach_km?: number;
  phi_van_chuyen?: number;
  ghi_chu?: string;
  lich_su_thuong_luong?: any[];
  trang_thai:
    | "cho_doanh_nghiep"
    | "cho_nong_dan"
    | "da_thong_nhat"
    | "tu_choi"
    | "da_huy";
  created_at: string;
  updated_at: string;
  nhuCau?: any;
  nongDan?: any;
}

export const BaoGiaService = {
  create: async (data: {
    nhucau_id: number;
    nong_dan_id: number;
    so_luong_cung_cap: number;
    don_vi: string;
    gia_de_xuat: number;
    chenh_lech_gia?: number;
    khoang_cach_km?: number;
    phi_van_chuyen?: number;
    ghi_chu?: string;
  }) => {
    const res = await api.post("/bao-gia", data);
    return res.data;
  },

  getByNhuCau: async (nhucauId: number) => {
    const res = await api.get(`/bao-gia/nhu-cau/${nhucauId}`);
    return res.data;
  },

  getByNongDan: async (nongDanId: number) => {
    const res = await api.get(`/bao-gia/nong-dan/${nongDanId}`);
    return res.data;
  },

  getByDoanhNghiep: async (doanhNghiepId: number) => {
    const res = await api.get(`/bao-gia/doanh-nghiep/${doanhNghiepId}`);
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get(`/bao-gia/${id}`);
    return res.data;
  },

  phanHoi: async (
    id: number,
    data: {
      so_luong_cung_cap?: number;
      gia_de_xuat?: number;
      chenh_lech_gia?: number;
      ghi_chu?: string;
      trang_thai?: string;
      sender_role: "nong_dan" | "doanh_nghiep";
    },
  ) => {
    const res = await api.patch(`/bao-gia/${id}/phan-hoi`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete(`/bao-gia/${id}`);
    return res.data;
  },
};
