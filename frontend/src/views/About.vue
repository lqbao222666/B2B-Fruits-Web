<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <main class="mx-auto max-w-[1200px] px-4 py-12 bg-[#f8fafc] min-h-screen font-sans">

    <section class="text-center mb-20 animate-fade-in-up">
      <div class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#eef4e6] text-[#658a22] rounded-full font-bold text-sm mb-6 border border-[#658a22]/20">
        <span class="material-symbols-outlined text-lg">eco</span>
        Lối sống xanh - Sạch - Không rác thải
      </div>
      <h1 class="text-5xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tight mb-6">
        Về <span class="text-[#658a22]">Chúng Tôi</span>
      </h1>
      <p class="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
        Chào mừng bạn đến với <strong class="text-slate-800">Recycle Store</strong>. Chúng tôi không chỉ là một cửa hàng thương mại điện tử, mà là một cộng đồng những người yêu Trái Đất, hướng tới mục tiêu <strong class="text-[#658a22]">Zero Waste (Không Rác Thải)</strong>.
      </p>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24 animate-fade-in-up delay-100">
      <div class="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white relative group">
        <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop" alt="Eco friendly" class="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-700" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="absolute bottom-6 left-6 right-6 text-white">
          <p class="font-black text-2xl uppercase italic">Mỗi sản phẩm, Một mầm xanh</p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-[#658a22] text-white rounded-full flex items-center justify-center shadow-lg">
            <span class="material-symbols-outlined text-2xl">public</span>
          </div>
          <h2 class="text-3xl font-black text-slate-900 uppercase italic">Câu Chuyện Của Chúng Tôi</h2>
        </div>
        <p class="text-slate-600 leading-relaxed text-justify">
          Bắt đầu từ một dự án nhỏ với khao khát giảm thiểu lượng rác thải nhựa khổng lồ thải ra môi trường mỗi ngày. Chúng tôi nhận ra rằng, sự thay đổi lớn luôn bắt đầu từ những thói quen nhỏ nhất.
        </p>
        <p class="text-slate-600 leading-relaxed text-justify">
          Tại Recycle Store, từng chiếc túi canvas, từng chiếc ly thủy tinh hay túi đay đều được tuyển chọn kỹ lưỡng. Chúng tôi làm việc trực tiếp với các xưởng sản xuất thân thiện với môi trường để mang đến cho bạn những giải pháp thay thế hoàn hảo cho đồ nhựa dùng một lần.
        </p>
      </div>
    </section>

    <section class="mb-24">
      <h2 class="text-3xl font-black text-center text-slate-900 uppercase italic mb-12">Giá Trị <span class="text-[#658a22]">Cốt Lõi</span></h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-slate-100 hover:border-[#658a22] transition-colors group">
          <div class="w-16 h-16 bg-[#eef4e6] text-[#658a22] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-3xl">recycling</span>
          </div>
          <h3 class="text-xl font-black text-slate-900 uppercase mb-3">Tái Chế & Bền Vững</h3>
          <p class="text-slate-500 text-sm leading-relaxed">
            Ưu tiên các sản phẩm làm từ vật liệu tái chế, có khả năng phân hủy sinh học hoặc sử dụng được nhiều lần, giảm thiểu tối đa rác thải ra bãi chôn lấp.
          </p>
        </div>

        <div class="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-slate-100 hover:border-[#658a22] transition-colors group">
          <div class="w-16 h-16 bg-[#eef4e6] text-[#658a22] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-3xl">volunteer_activism</span>
          </div>
          <h3 class="text-xl font-black text-slate-900 uppercase mb-3">Trách Nhiệm Xã Hội</h3>
          <p class="text-slate-500 text-sm leading-relaxed">
            Mỗi đơn hàng của bạn không chỉ giúp bảo vệ môi trường mà còn đóng góp một phần lợi nhuận vào các quỹ trồng rừng và làm sạch đại dương.
          </p>
        </div>

        <div class="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-slate-100 hover:border-[#658a22] transition-colors group">
          <div class="w-16 h-16 bg-[#eef4e6] text-[#658a22] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-3xl">handshake</span>
          </div>
          <h3 class="text-xl font-black text-slate-900 uppercase mb-3">Đồng Hành Cùng Bạn</h3>
          <p class="text-slate-500 text-sm leading-relaxed">
            Hành trình Zero Waste không hề cô đơn. Chúng tôi ở đây để cung cấp kiến thức, truyền cảm hứng và cung cấp những sản phẩm tốt nhất cho bạn.
          </p>
        </div>
      </div>
    </section>

    <section class="bg-[#1e293b] rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
      <div class="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <span class="material-symbols-outlined text-[15rem] text-white">eco</span>
      </div>

      <div class="relative z-10">
        <h2 class="text-3xl md:text-5xl font-black text-white uppercase italic tracking-wide mb-6">
          Bắt đầu lối sống xanh ngay hôm nay!
        </h2>
        <p class="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
          Cùng Recycle Store tạo ra những thay đổi tích cực. Khám phá ngay bộ sưu tập sản phẩm thân thiện với môi trường của chúng tôi.
        </p>
        <RouterLink to="/products" class="inline-flex items-center gap-2 bg-[#658a22] hover:bg-[#52701b] text-white px-8 py-4 rounded-full font-black text-lg uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(101,138,34,0.3)]">
          Khám Phá Cửa Hàng
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
