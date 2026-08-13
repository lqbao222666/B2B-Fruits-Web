<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Account from "@/service/account.ts";
import { notify } from "@/utils/notifier.ts";

const router = useRouter();
const route = useRoute();
const loading = ref(false);

const form = reactive({
  email: "",
  token: "",
  newPassword: "",
  confirmPassword: "",
});

onMounted(() => {
  // Lấy dữ liệu từ URL (?token=...&email=...)
  form.token = (route.query.token as string) || "";
  form.email = (route.query.email as string) || "";

  if (!form.token || !form.email) {
    notify.error("Liên kết không hợp lệ hoặc đã hết hạn!");
    router.push("/login");
  }
});

const handleReset = async () => {
  if (form.newPassword !== form.confirmPassword) {
    notify.error("Mật khẩu xác nhận không khớp!");
    return;
  }

  loading.value = true;
  try {
    await Account.resetPasswordWithToken({
      email: form.email,
      token: form.token,
      newPassword: form.newPassword,
    });

    notify.success("Đổi mật khẩu thành công! Đang chuyển hướng...");
    setTimeout(() => router.push("/login"), 2000);
  } catch (err: any) {
    notify.error(err.response?.data?.message || "Có lỗi xảy ra!");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f1f5f9] p-4">
    <div
      class="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-slate-100"
    >
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-slate-900">Mật khẩu mới</h1>
        <p class="text-slate-500 text-sm mt-2">
          Nhập mật khẩu mới cho {{ form.email }}
        </p>
      </div>

      <form @submit.prevent="handleReset" class="space-y-6">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2"
            >Mật khẩu mới</label
          >
          <input
            v-model="form.newPassword"
            type="password"
            required
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#658a22]"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2"
            >Xác nhận mật khẩu</label
          >
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#658a22]"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-[#658a22] text-white py-3.5 rounded-xl font-bold hover:bg-[#58791d] transition-all disabled:opacity-50"
        >
          {{ loading ? "Đang cập nhật..." : "Cập nhật mật khẩu" }}
        </button>
      </form>
    </div>
  </div>
</template>
