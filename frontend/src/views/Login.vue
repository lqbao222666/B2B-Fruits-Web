<script setup lang="ts">
import { RouterLink, useRouter, useRoute } from "vue-router";
import { reactive, ref, onMounted } from "vue";
import auth from "../service/auth.ts";
import { notify } from "@/utils/notifier.ts";

const router = useRouter();
const route = useRoute();
const showPassword = ref(false);
const loading = ref(false);

const form = reactive({
  email: "",
  password: "",
});

onMounted(() => {
  const { token, id, email, role } = route.query;
  if (token) {
    auth.saveToken(token as string);
    localStorage.setItem("user", JSON.stringify({ id, email, role }));
    notify.success(`Chào mừng ${email}! Đăng nhập thành công.`);
    router.replace({ query: {} });
    setTimeout(() => router.push(role === "admin" ? "/admin" : "/"), 500);
  }
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    const response = await auth.Login(form.email, form.password);
    if (response && response.token) {
      auth.saveToken(response.token);
      const userData = response.user || response;
      localStorage.setItem("user", JSON.stringify(userData));

      notify.success(`Chào mừng bạn quay trở lại, ${userData.email}!`);

      setTimeout(() => {
        if (userData.role?.toLowerCase() === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }, 1000);
    }
  } catch (err: any) {
    let message =
      err.response?.data?.message || "Email hoặc mật khẩu không chính xác";
    if (Array.isArray(message)) message = message.join(", ");
    notify.error(message);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-root">
    <div class="login-box">
      <div class="login-header">
        <div class="logo-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2E7D32"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M17 8C8 10 5.9 16.17 3.82 19.7 3.46 20.34 4.09 21 4.82 21h12.69a1 1 0 0 0 .97-.76L20 14"
            />
            <path d="M9.25 14C9.25 14 8.5 11 9.5 9" />
            <path d="M14.75 14C14.75 14 15.5 11 14.5 9" />
            <path d="M12 6V3" />
            <path d="M20 4C20 4 20 8 16 10" />
            <path d="M4 4C4 4 4 8 8 10" />
          </svg>
        </div>
        <h1>AgroMarket Admin</h1>
        <p>Đăng nhập hệ thống quản trị</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label>Email đăng nhập</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="admin@agromarket.vn"
          />
        </div>

        <div class="form-group">
          <label>Mật khẩu</label>
          <div class="input-wrap">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              class="eye-btn"
              @click="showPassword = !showPassword"
            >
              <span class="material-symbols-outlined">{{
                showPassword ? "visibility_off" : "visibility"
              }}</span>
            </button>
          </div>
          <div class="forgot-pass-link">
            <RouterLink to="/forgot-password">Quên mật khẩu?</RouterLink>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? "Đang xử lý..." : "Đăng nhập Admin" }}
        </button>
      </form>

      <div class="back-home">
        <RouterLink to="/">Trở về trang chủ AgroMarket</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.login-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f5e9;
  font-family: "Inter", sans-serif;
}

.login-box {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid #c8e6c9;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.logo-icon {
  width: 64px;
  height: 64px;
  background: #f1f8e9;
  border: 2px solid #a5d6a7;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.login-header h1 {
  font-size: 22px;
  font-weight: 800;
  color: #1b5e20;
  margin: 0 0 6px;
}
.login-header p {
  color: #546e7a;
  font-size: 14px;
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 8px;
}
.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #cfd8dc;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}
.form-group input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
}
.input-wrap {
  position: relative;
}
.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #90a4ae;
  cursor: pointer;
  padding: 0;
  display: flex;
}
.eye-btn:hover {
  color: #2e7d32;
}

.forgot-pass-link {
  text-align: right;
  margin-top: 6px;
}
.forgot-pass-link a {
  font-size: 12.5px;
  color: #2e7d32;
  text-decoration: none;
  font-weight: 600;
}
.forgot-pass-link a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  background: #2e7d32;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
  margin-top: 10px;
}
.submit-btn:hover:not(:disabled) {
  background: #1b5e20;
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.back-home {
  text-align: center;
  margin-top: 24px;
}
.back-home a {
  color: #546e7a;
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}
.back-home a:hover {
  color: #2e7d32;
  text-decoration: underline;
}
</style>
