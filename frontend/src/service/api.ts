import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // Đảm bảo đúng base URL của bạn
});

// THÊM ĐOẠN NÀY: Interceptor giúp tự động đính Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
