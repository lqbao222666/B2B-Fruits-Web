import api from "./api.ts";

export const Auth = {
  // ─── Đăng ký chung (cũ) ───
  async Register(email: string, password: string, fullName: string) {
    const data = {
      email: email,
      password: password,
      role: "nong_dan",
      full_name: fullName,
    };
    const response = await api.post("auth/register", data);
    return response.data;
  },

  // ─── Đăng ký Nông Dân ───
  async RegisterNongDan(payload: {
    email: string;
    password: string;
    full_name: string;
    ho_ten: string;
    tinh_thanh: string;
    so_dien_thoai: string;
    ma_so_thue?: string;
    ten_co_so_kd?: string;
    doi_tuong_dang_ky?: string;
    huyen_xa?: string;
    dia_chi_cu_the?: string;
    thong_tin_xuat_hoa_don?: any;
    giay_phep_urls?: string[];
  }) {
    // 1. Tạo tài khoản User
    const regRes = await api.post("auth/register", {
      email: payload.email,
      password: payload.password,
      full_name: payload.full_name,
      role: "nong_dan",
    });

    // 2. Đăng nhập để lấy token
    const loginRes = await api.post("auth/login", {
      email: payload.email,
      password: payload.password,
    });
    const token = loginRes.data.token;
    const user_id = loginRes.data.user.user_id;

    // Lưu tạm token để api interceptor dùng
    localStorage.setItem("token", token);

    // 3. Tạo profile Nông Dân
    await api.post("nong-dan", {
      user_id: user_id,
      ho_ten: payload.ho_ten,
      tinh_thanh: payload.tinh_thanh,
      so_dien_thoai: payload.so_dien_thoai,
      ma_so_thue: payload.ma_so_thue,
      ten_co_so_kd: payload.ten_co_so_kd,
      doi_tuong_dang_ky: payload.doi_tuong_dang_ky,
      huyen_xa: payload.huyen_xa,
      dia_chi_cu_the: payload.dia_chi_cu_the,
      thong_tin_xuat_hoa_don: payload.thong_tin_xuat_hoa_don,
      giay_phep_urls: payload.giay_phep_urls,
    });

    // Xoá token tạm (bắt user đăng nhập lại)
    localStorage.removeItem("token");

    return regRes.data;
  },

  // ─── Đăng ký Doanh Nghiệp ───
  async RegisterDoanhNghiep(payload: {
    email: string;
    password: string;
    full_name: string;
    ten_cong_ty: string;
    tinh_thanh: string;
    dia_chi?: string;
    so_dien_thoai: string;
  }) {
    // 1. Tạo tài khoản User
    const regRes = await api.post("auth/register", {
      email: payload.email,
      password: payload.password,
      full_name: payload.full_name,
      role: "doanh_nghiep",
    });

    // 2. Đăng nhập để lấy token
    const loginRes = await api.post("auth/login", {
      email: payload.email,
      password: payload.password,
    });
    const token = loginRes.data.token;
    const user_id = loginRes.data.user.user_id;

    // Lưu tạm token để api interceptor dùng
    localStorage.setItem("token", token);

    // 3. Tạo profile Doanh Nghiệp
    await api.post("doanh-nghiep", {
      user_id: user_id,
      ten_cong_ty: payload.ten_cong_ty,
      tinh_thanh: payload.tinh_thanh,
      dia_chi: payload.dia_chi,
      so_dien_thoai: payload.so_dien_thoai,
    });

    // Xoá token tạm
    localStorage.removeItem("token");

    return regRes.data;
  },

  // ─── Đăng nhập ───
  async Login(email: string, password: string) {
    const data = {
      email: email,
      password: password,
    };
    const response = await api.post("auth/login", data);
    return response.data;
  },

  async LoginGoogle(role: string = 'nong_dan') {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/google?role=${role}`;
  },

  saveToken(token: string) {
    localStorage.setItem("token", token);
  },

  async logout(redirectUrl: string = "/") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = redirectUrl;
  },

  async forgotPassword(email: string) {
    const response = await api.post("auth/forgot-password", { email });
    return response.data;
  },

  async verifyOtp(email: string, otp: string) {
    const response = await api.post("auth/verify-otp", { email, otp });
    return response.data;
  },

  async resetPasswordWithOtp(payload: { email: string; otp: string; newPassword: string }) {
    const response = await api.post("auth/reset-password", payload);
    return response.data;
  },
};

export default Auth;
