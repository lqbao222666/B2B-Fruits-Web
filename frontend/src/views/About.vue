<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <main
    class="mx-auto max-w-[1200px] px-4 py-12 bg-[#f8fafc] min-h-screen font-sans"
  >
    <section class="text-center mb-20 animate-fade-in-up">
      <div
        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full font-bold text-sm mb-6 border border-[#2E7D32]/20"
      >
        <span class="material-symbols-outlined text-lg">handshake</span>
        Kết nối Nông Dân & Doanh Nghiệp
      </div>
      <h1
        class="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tight mb-6"
      >
        Sàn Giao Dịch <span class="text-[#2E7D32]">Nông Sản B2B</span>
      </h1>
      <p
        class="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed font-medium"
      >
        Chào mừng bạn đến với
        <strong class="text-slate-800">Sàn Giao Dịch B2B Fruits</strong>. Chúng
        tôi là cầu nối công nghệ giúp tối ưu hóa chuỗi cung ứng nông sản, mang
        lại giá trị thiết thực cho cả người trồng và đơn vị thu mua.
      </p>
    </section>

    <section
      class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24 animate-fade-in-up delay-100"
    >
      <div
        class="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white relative group"
      >
        <img
          src="https://images.unsplash.com/photo-1595856454722-16e788fb4067?q=80&w=2000&auto=format&fit=crop"
          alt="Nông sản Việt"
          class="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-700"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
        ></div>
        <div class="absolute bottom-6 left-6 right-6 text-white">
          <p class="font-black text-2xl uppercase italic">
            Nâng Tầm Nông Sản Việt
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-[#2E7D32] text-white rounded-full flex items-center justify-center shadow-lg"
          >
            <span class="material-symbols-outlined text-2xl">agriculture</span>
          </div>
          <h2 class="text-3xl font-black text-slate-900 uppercase">
            Mô Hình Hoạt Động
          </h2>
        </div>
        <p class="text-slate-600 leading-relaxed text-justify">
          Nền tảng của chúng tôi cung cấp giải pháp thu mua nông sản quy mô lớn
          một cách thông minh và minh bạch. Thay vì trải qua nhiều tầng thương
          lái trung gian, Doanh nghiệp có thể trực tiếp đưa ra yêu cầu thu mua
          số lượng lớn với các tiêu chuẩn khắt khe (VietGAP, GlobalGAP...).
        </p>
        <p class="text-slate-600 leading-relaxed text-justify">
          Đồng thời, Nông dân có thể chủ động tìm kiếm các đơn hàng phù hợp với
          sản lượng và chất lượng của nhà vườn, trực tiếp báo giá, đàm phán
          chênh lệch, và tự tổ chức giao hàng để tối ưu hóa lợi nhuận.
        </p>
      </div>
    </section>

    <section class="mb-24">
      <h2
        class="text-3xl font-black text-center text-slate-900 uppercase mb-12"
      >
        Giải Pháp <span class="text-[#2E7D32]">Vượt Trội</span>
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          class="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-slate-100 hover:border-[#2E7D32] transition-colors group"
        >
          <div
            class="w-16 h-16 bg-[#E8F5E9] text-[#2E7D32] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
          >
            <span class="material-symbols-outlined text-3xl">smart_toy</span>
          </div>
          <h3 class="text-xl font-black text-slate-900 uppercase mb-3">
            Chốt Đơn Tự Động
          </h3>
          <p class="text-slate-500 text-sm leading-relaxed">
            Hệ thống thông minh tự động đối chiếu mức giá đề xuất và tiêu chuẩn
            chứng nhận của nông dân so với yêu cầu của doanh nghiệp để khởi tạo
            đơn hàng ngay lập tức.
          </p>
        </div>

        <div
          class="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-slate-100 hover:border-[#2E7D32] transition-colors group"
        >
          <div
            class="w-16 h-16 bg-[#E8F5E9] text-[#2E7D32] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
          >
            <span class="material-symbols-outlined text-3xl"
              >account_balance_wallet</span
            >
          </div>
          <h3 class="text-xl font-black text-slate-900 uppercase mb-3">
            Thanh Toán An Toàn
          </h3>
          <p class="text-slate-500 text-sm leading-relaxed">
            Hỗ trợ thanh toán đặt cọc 15% trực tuyến và quản lý dòng tiền phân
            bổ phí vận chuyển tự động, an toàn minh bạch giữa Nông dân và Doanh
            nghiệp.
          </p>
        </div>

        <div
          class="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-slate-100 hover:border-[#2E7D32] transition-colors group"
        >
          <div
            class="w-16 h-16 bg-[#E8F5E9] text-[#2E7D32] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
          >
            <span class="material-symbols-outlined text-3xl"
              >local_shipping</span
            >
          </div>
          <h3 class="text-xl font-black text-slate-900 uppercase mb-3">
            Vận Chuyển Linh Hoạt
          </h3>
          <p class="text-slate-500 text-sm leading-relaxed">
            Tích hợp bản đồ tính toán khoảng cách và dự trù chi phí vận chuyển
            trực tiếp giúp nông dân dễ dàng cân nhắc lợi nhuận trước khi đưa ra
            quyết định báo giá.
          </p>
        </div>
      </div>
    </section>

    <section
      class="bg-gradient-to-r from-emerald-800 via-teal-700 to-green-900 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl"
    >
      <div class="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <span class="material-symbols-outlined text-[15rem] text-white"
          >storefront</span
        >
      </div>

      <div class="relative z-10">
        <h2
          class="text-3xl md:text-5xl font-black text-white uppercase tracking-wide mb-6"
        >
          Bắt đầu kết nối giao thương ngay hôm nay!
        </h2>
        <p class="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
          Dù bạn là Nhà vườn đang tìm kiếm đầu ra số lượng lớn hay Doanh nghiệp
          cần nguồn nguyên liệu đạt chuẩn, nền tảng của chúng tôi luôn sẵn sàng.
        </p>
        <RouterLink
          to="/products"
          class="inline-flex items-center gap-2 bg-white text-emerald-800 px-8 py-4 rounded-full font-black text-lg uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
        >
          Khám Phá Sàn Giao Dịch
          <span class="material-symbols-outlined">arrow_forward</span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Hiệu ứng mượt mà khi load trang */
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}

.delay-100 {
  animation-delay: 100ms;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
