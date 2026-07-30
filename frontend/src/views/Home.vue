<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '@/service/api.ts'
import { ChungLoaiService } from '@/service/chungloai.ts'

const router = useRouter()
const chungLoais = ref<any[]>([])
const categories = ref<any[]>([])
const searchCategory = ref('')
const featuredSuppliers = ref<any[]>([])
const latestProducts = ref<any[]>([])
const isLoading = ref(true)
const userRole = ref<string | null>(null)

// ─── Fetch dữ liệu ───
const BACKEND_URL = 'http://localhost:3000'
const getImageUrl = (path: any) => {
  if (!path) return ''
  let imgPath = typeof path === 'object' && path.url ? path.url : path;
  if (typeof imgPath !== 'string') return ''
  if (imgPath.startsWith('http')) return imgPath
  return `${BACKEND_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`
}

const fetchData = async () => {
  try {
    isLoading.value = true
    const [clRes, catRes, prodRes, supRes] = await Promise.all([
      ChungLoaiService.getAll().catch(() => []),
      api.get('/danh-muc').catch(() => ({ data: [] })),
      api.get('/bai-dang').catch(() => ({ data: [] })),
      api.get('/users/featured-suppliers').catch(() => ({ data: [] }))
    ])
    chungLoais.value = clRes.value || clRes || []
    categories.value = catRes.data?.value || catRes.data || []
    const prods = prodRes.data?.value || prodRes.data || []
    latestProducts.value = Array.isArray(prods) ? prods.map(p => ({
      ...p,
      image: (Array.isArray(p.images) && p.images.length > 0 && p.images[0] && typeof p.images[0] === 'string' && p.images[0].startsWith('http')) ? p.images[0] : `${BACKEND_URL}/${p.images?.[0]}`
    })).slice(0, 8) : []
    const sups = supRes.data?.value || supRes.data || []
    featuredSuppliers.value = Array.isArray(sups) ? sups : []
  } catch (e) {
    console.error('Home fetch error:', e)
  } finally {
    isLoading.value = false
  }
}

const expandedCategory = ref<number | null>(null)

const toggleCategory = (id: number) => {
  if (expandedCategory.value === id) {
    expandedCategory.value = null
  } else {
    expandedCategory.value = id
  }
}

// Compute categories hierarchy
const getChildCategories = (chungloaiId: number) => {
  return categories.value.filter(c => c.chungloai_id === chungloaiId)
}

const filteredChungLoais = computed(() => {
  if (!searchCategory.value) return chungLoais.value
  const query = searchCategory.value.toLowerCase()
  return chungLoais.value.filter(cl => {
    const matchCL = cl.ten_chung_loai.toLowerCase().includes(query)
    const matchChild = getChildCategories(cl.chungloai_id).some(c => c.ten_danh_muc.toLowerCase().includes(query))
    return matchCL || matchChild
  })
})

// ─── Hero slider ───
const currentSlide = ref(0)
const heroSlides = [
  {
    tag: 'Ưu Đãi NCC VICOMI',
    title: 'Nông sản tươi\nThực phẩm Giá sỉ',
    sub: '100% Hữu cơ đến từ nông dân Việt',
    btn: 'Khám phá ngay',
    bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    accent: '#2E7D32',
    emoji: '🌿',
  },
  {
    tag: 'Thanh toán linh hoạt',
    title: 'Đặt hàng nhanh\nTrong 5 phút',
    sub: 'Giao dịch trực tiếp, minh bạch với nông dân',
    btn: 'Đăng ký bán hàng',
    bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    accent: '#1565C0',
    emoji: '⚡',
  },
]

const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % heroSlides.length }
const prevSlide = () => { currentSlide.value = (currentSlide.value - 1 + heroSlides.length) % heroSlides.length }

// Fake suppliers removed.

onMounted(() => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      userRole.value = user.role || null
    }
  } catch (e) {
    console.error('Lỗi khi lấy user từ localStorage:', e)
  }
  fetchData()
  setInterval(nextSlide, 5000)
})
</script>

<template>
  <div class="home-root">
    <!-- ═══════════ HERO SECTION ═══════════ -->
    <section class="home-hero">
      <!-- Left: Sidebar menu -->
      <div class="hero-sidebar flex flex-col h-full bg-white border-r border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div class="p-4 bg-white border-b border-slate-100">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input type="text" v-model="searchCategory" placeholder="Tìm danh mục..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#658a22] transition-colors" />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          <div
            v-for="cl in filteredChungLoais"
            :key="cl.chungloai_id"
            class="flex flex-col"
          >
            <!-- Parent Category Header -->
            <div 
              class="sidebar-item hover:bg-slate-50 rounded-xl px-4 py-3 transition-colors cursor-pointer flex items-center group"
              :class="{ 'bg-slate-50': expandedCategory === cl.chungloai_id }"
              @click="toggleCategory(cl.chungloai_id)"
            >
              <span class="sidebar-text flex-1 text-sm font-bold text-slate-800 group-hover:text-[#658a22]">{{ cl.ten_chung_loai }}</span>
              <span class="sidebar-arrow text-slate-400 group-hover:text-[#658a22] transition-transform duration-200" 
                    :class="{'rotate-90': expandedCategory === cl.chungloai_id}">›</span>
            </div>

            <!-- Child Categories (Accordion) -->
            <div v-show="expandedCategory === cl.chungloai_id" class="pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-300">
              <div
                class="hover:bg-slate-50/80 rounded-lg px-4 py-2 transition-colors cursor-pointer flex items-center text-sm text-slate-600 hover:text-[#658a22]"
                @click.stop="router.push(`/products?category=cl_${cl.chungloai_id}`)"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                Tất cả {{ cl.ten_chung_loai }}
              </div>
              <div
                v-for="child in getChildCategories(cl.chungloai_id).filter(c => !searchCategory || c.ten_danh_muc.toLowerCase().includes(searchCategory.toLowerCase()))"
                :key="child.danhmuc_id"
                class="hover:bg-slate-50/80 rounded-lg px-4 py-2 transition-colors cursor-pointer flex items-center text-sm text-slate-600 hover:text-[#658a22]"
                @click.stop="router.push(`/products?category=${child.danhmuc_id}`)"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                {{ child.ten_danh_muc }}
              </div>
            </div>
          </div>
          
          <div v-if="filteredChungLoais.length === 0" class="p-4 text-center text-sm text-slate-400">
            Không tìm thấy chủng loại
          </div>
        </div>
      </div>

      <!-- Center: Main banner -->
      <div class="hero-banner">
        <transition name="slide-fade" mode="out-in">
          <div
            :key="currentSlide"
            class="banner-slide"
            :style="{ background: heroSlides[currentSlide].bg }"
          >
            <!-- Decorative circles -->
            <div class="banner-deco-circle banner-circle-1"></div>
            <div class="banner-deco-circle banner-circle-2"></div>

            <div class="banner-content">
              <div class="banner-tag" :style="{ background: heroSlides[currentSlide].accent + '22', color: heroSlides[currentSlide].accent }">
                {{ heroSlides[currentSlide].tag }}
              </div>
              <h1 class="banner-title" :style="{ color: heroSlides[currentSlide].accent }">
                {{ heroSlides[currentSlide].title }}
              </h1>
              <p class="banner-sub">{{ heroSlides[currentSlide].sub }}</p>
              <RouterLink to="/products" class="banner-btn" :style="{ background: heroSlides[currentSlide].accent }">
                {{ heroSlides[currentSlide].btn }}
              </RouterLink>
            </div>

            <div class="banner-emoji-wrap">
              <span class="banner-emoji">{{ heroSlides[currentSlide].emoji }}</span>
            </div>

            <!-- Dots -->
            <div class="banner-dots">
              <button
                v-for="(_, i) in heroSlides"
                :key="i"
                class="banner-dot"
                :class="{ active: i === currentSlide }"
                @click="currentSlide = i"
              ></button>
            </div>

            <!-- Arrows -->
            <button class="banner-arrow banner-arrow-left" @click="prevSlide">‹</button>
            <button class="banner-arrow banner-arrow-right" @click="nextSlide">›</button>
          </div>
        </transition>
      </div>

      <!-- Right: Side banners -->
      <div class="hero-side-banners">
        <div class="side-banner side-banner-1">
          <div class="side-banner-inner">
            <span class="side-banner-emoji">🌿</span>
            <div>
              <div class="side-banner-tag">Sàn nguyên liệu</div>
              <div class="side-banner-title">Thực phẩm<br/>Giá sỉ</div>
              <div class="side-banner-sub">100% hữu cơ đến từ<br/>trang trại Việt Nam</div>
            </div>
          </div>
        </div>
        <div class="side-banner side-banner-2">
          <div class="side-banner-inner">
            <span class="side-banner-emoji">⚡</span>
            <div>
              <div class="side-banner-tag">Đặt hàng trong</div>
              <div class="side-banner-title">5 PHÚT</div>
              <div class="side-banner-sub">Thanh toán tiện lợi<br/>Giao hàng toàn quốc</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ DISCOVER SUPPLIERS ═══════════ -->
    <section class="home-section">
      <div class="section-header">
        <h2 class="section-title">
          Khám phá <span class="section-title-green">nhà cung cấp</span> dành riêng cho bạn!
        </h2>
      </div>

      <div class="suppliers-grid">
        <div v-for="(s, i) in featuredSuppliers" :key="i" class="supplier-card hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <!-- Supplier logo -->
          <div class="supplier-header flex items-center gap-4 mb-4">
            <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
              <img v-if="s.avatar" :src="getImageUrl(s.avatar)" class="w-full h-full object-cover" />
              <span v-else class="text-xl font-bold text-slate-400">{{ s.name.charAt(0) }}</span>
            </div>
            <div class="supplier-info flex-1">
              <div class="supplier-name font-bold text-slate-800 text-lg line-clamp-1">{{ s.name }}</div>
              <div class="supplier-link text-xs text-slate-500 flex items-center mt-1">Đồng giao sản phẩm chính ngạch <span class="arrow-link ml-1">›</span></div>
            </div>
          </div>

          <!-- Certifications -->
          <div class="supplier-certs flex flex-wrap gap-2 mb-4 h-[28px] overflow-hidden">
            <template v-if="s.certificates && s.certificates.length > 0">
              <span v-for="(cert, cIdx) in s.certificates" :key="cIdx" class="cert-badge text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
                <img v-if="cert.icon_url" :src="getImageUrl(cert.icon_url)" class="w-3 h-3 object-contain" />
                {{ cert.ten_tieu_chuan }}
              </span>
            </template>
            <span v-else class="text-xs text-slate-400 italic">Chưa có chứng nhận</span>
          </div>

          <!-- Recent Products -->
          <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sản phẩm nổi bật</div>
            <div class="flex gap-2 h-12">
              <template v-if="s.recentProducts && s.recentProducts.length > 0">
                <div v-for="(prod, pIdx) in s.recentProducts.slice(0, 3)" :key="pIdx" class="flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden relative group cursor-pointer max-w-[33%]" :title="prod.name">
                  <img v-if="prod.image" :src="getImageUrl(prod.image)" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center">
                    <span class="material-symbols-outlined text-slate-300 text-sm">image</span>
                  </div>
                  <!-- Tooltip -->
                  <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                    <span class="text-[10px] font-bold text-white leading-tight line-clamp-2">{{ prod.name }}</span>
                  </div>
                </div>
              </template>
              <div v-else class="flex-1 flex items-center justify-center text-xs text-slate-400">
                Chưa có sản phẩm
              </div>
            </div>
          </div>
        </div>

        <!-- Nav arrow right -->
        <button class="suppliers-nav-btn">›</button>
      </div>
    </section>

    <!-- ═══════════ SELLER CTA (Freso style) ═══════════ -->
    <section v-if="userRole === 'nong_dan' || userRole === 'NONG_DAN'" class="home-seller-cta">
      <!-- Left: Illustration -->
      <div class="cta-illustration">
        <!-- SVG inline illustration -->
        <svg viewBox="0 0 380 300" fill="none" xmlns="http://www.w3.org/2000/svg" class="cta-svg">
          <!-- Rolling hills background -->
          <ellipse cx="190" cy="280" rx="220" ry="80" fill="#C8E6C9" opacity="0.5"/>
          <ellipse cx="60" cy="260" rx="120" ry="60" fill="#A5D6A7" opacity="0.6"/>
          <ellipse cx="320" cy="265" rx="100" ry="55" fill="#81C784" opacity="0.5"/>
          <!-- Phone mockup -->
          <rect x="130" y="40" width="110" height="200" rx="18" fill="white" stroke="#388E3C" stroke-width="3"/>
          <rect x="140" y="55" width="90" height="160" rx="8" fill="#E8F5E9"/>
          <!-- Phone screen content -->
          <rect x="148" y="62" width="74" height="20" rx="4" fill="#4CAF50"/>
          <rect x="148" y="88" width="50" height="8" rx="2" fill="#A5D6A7"/>
          <rect x="148" y="100" width="74" height="8" rx="2" fill="#C8E6C9"/>
          <rect x="148" y="112" width="60" height="8" rx="2" fill="#C8E6C9"/>
          <rect x="148" y="128" width="74" height="30" rx="6" fill="#388E3C"/>
          <!-- Location pins -->
          <circle cx="90" cy="180" r="10" fill="#FF7043"/>
          <line x1="90" y1="190" x2="90" y2="230" stroke="#FF7043" stroke-width="2"/>
          <circle cx="280" cy="160" r="10" fill="#FF7043"/>
          <line x1="280" y1="170" x2="280" y2="220" stroke="#FF7043" stroke-width="2"/>
          <circle cx="185" cy="230" r="10" fill="#FF7043"/>
          <!-- Store icon -->
          <rect x="60" y="220" width="50" height="35" rx="4" fill="#FFF9C4" stroke="#F9A825" stroke-width="2"/>
          <path d="M55 220 L85 200 L115 220" fill="#F9A825"/>
          <!-- Leaf decorations -->
          <ellipse cx="320" cy="120" rx="25" ry="15" fill="#66BB6A" transform="rotate(-30 320 120)"/>
          <ellipse cx="50" cy="130" rx="20" ry="12" fill="#66BB6A" transform="rotate(20 50 130)"/>
        </svg>
      </div>

      <!-- Right: Text content -->
      <div class="cta-content">
        <h2 class="cta-title">
          Chào mừng đối tác nông dân!<br/>
          Tạo bài đăng để tiếp cận<br/>
          khách hàng ngay!
        </h2>
        <ul class="cta-list">
          <li>
            <span class="cta-check">✓</span>
            Đăng bán sản phẩm dễ dàng
          </li>
          <li>
            <span class="cta-check">✓</span>
            Tiếp cận hàng ngàn doanh nghiệp
          </li>
          <li>
            <span class="cta-check">✓</span>
            Giao dịch an toàn, minh bạch
          </li>
        </ul>
        <RouterLink to="/create-post" class="cta-btn">
          Tạo Bài Đăng Sản Phẩm
        </RouterLink>
      </div>
    </section>

    <section v-else class="home-seller-cta">
      <!-- Left: Illustration -->
      <div class="cta-illustration">
        <!-- SVG inline illustration -->
        <svg viewBox="0 0 380 300" fill="none" xmlns="http://www.w3.org/2000/svg" class="cta-svg">
          <!-- Rolling hills background -->
          <ellipse cx="190" cy="280" rx="220" ry="80" fill="#C8E6C9" opacity="0.5"/>
          <ellipse cx="60" cy="260" rx="120" ry="60" fill="#A5D6A7" opacity="0.6"/>
          <ellipse cx="320" cy="265" rx="100" ry="55" fill="#81C784" opacity="0.5"/>
          <!-- Phone mockup -->
          <rect x="130" y="40" width="110" height="200" rx="18" fill="white" stroke="#388E3C" stroke-width="3"/>
          <rect x="140" y="55" width="90" height="160" rx="8" fill="#E8F5E9"/>
          <!-- Phone screen content -->
          <rect x="148" y="62" width="74" height="20" rx="4" fill="#4CAF50"/>
          <rect x="148" y="88" width="50" height="8" rx="2" fill="#A5D6A7"/>
          <rect x="148" y="100" width="74" height="8" rx="2" fill="#C8E6C9"/>
          <rect x="148" y="112" width="60" height="8" rx="2" fill="#C8E6C9"/>
          <rect x="148" y="128" width="74" height="30" rx="6" fill="#388E3C"/>
          <!-- Location pins -->
          <circle cx="90" cy="180" r="10" fill="#FF7043"/>
          <line x1="90" y1="190" x2="90" y2="230" stroke="#FF7043" stroke-width="2"/>
          <circle cx="280" cy="160" r="10" fill="#FF7043"/>
          <line x1="280" y1="170" x2="280" y2="220" stroke="#FF7043" stroke-width="2"/>
          <circle cx="185" cy="230" r="10" fill="#FF7043"/>
          <!-- Store icon -->
          <rect x="60" y="220" width="50" height="35" rx="4" fill="#FFF9C4" stroke="#F9A825" stroke-width="2"/>
          <path d="M55 220 L85 200 L115 220" fill="#F9A825"/>
          <!-- Leaf decorations -->
          <ellipse cx="320" cy="120" rx="25" ry="15" fill="#66BB6A" transform="rotate(-30 320 120)"/>
          <ellipse cx="50" cy="130" rx="20" ry="12" fill="#66BB6A" transform="rotate(20 50 130)"/>
        </svg>
      </div>

      <!-- Right: Text content -->
      <div class="cta-content">
        <h2 class="cta-title">
          Bạn là nhà cung cấp?<br/>
          Mở rộng kinh doanh<br/>
          cùng AgroMarket ngay!
        </h2>
        <ul class="cta-list">
          <li>
            <span class="cta-check">✓</span>
            Kết nối khách hàng mới
          </li>
          <li>
            <span class="cta-check">✓</span>
            Đơn giản vận hành
          </li>
          <li>
            <span class="cta-check">✓</span>
            Giảm nỗi lo thanh toán
          </li>
        </ul>
        <RouterLink to="/auth/nong-dan" class="cta-btn">
          Đăng ký bán hàng ngay
        </RouterLink>
      </div>
    </section>

    <!-- ═══════════ LATEST PRODUCTS (nếu có) ═══════════ -->
    <section v-if="latestProducts.length > 0" class="home-section">
      <div class="section-header">
        <h2 class="section-title">
          Sản phẩm <span class="section-title-green">mới đăng</span>
        </h2>
        <RouterLink to="/products" class="section-see-all">Xem tất cả ›</RouterLink>
      </div>
      <div class="products-grid">
        <RouterLink
          v-for="p in latestProducts"
          :key="p.baidang_id || p.id"
          :to="`/product/${p.baidang_id || p.id}`"
          class="product-card"
        >
          <div class="product-img-wrap">
            <img
              v-if="p.images && p.images[0]"
              :src="getImageUrl(p.images[0])"
              :alt="p.tieu_de || p.ten_nong_san"
              class="product-img"
            />
            <div v-else class="product-img-placeholder">🌾</div>
            <span class="product-badge">MỚI</span>
          </div>
          <div class="product-info">
            <div class="product-name">{{ p.tieu_de || p.ten_nong_san }}</div>
            <div class="product-location" v-if="p.tinh_thanh">📍 {{ p.tinh_thanh }}</div>
            <div class="product-price">
              {{ Number(p.gia_per_kg || 0).toLocaleString('vi-VN') }}đ / {{ p.don_vi_tinh || 'kg' }}
            </div>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- ═══════════ FEATURES ═══════════ -->
    <section class="home-features">
      <div class="features-grid">
        <div class="feature-item" v-for="f in [
          { icon: '🚚', title: 'Giao hàng toàn quốc', desc: 'Vận chuyển đến tận kho nhà máy của bạn' },
          { icon: '🔒', title: 'Thanh toán an toàn', desc: 'Bảo vệ giao dịch với hệ thống escrow' },
          { icon: '✅', title: 'Chứng nhận chất lượng', desc: 'Sản phẩm đạt chuẩn HACCP, VietGAP, Organic' },
          { icon: '🤝', title: 'Hợp đồng minh bạch', desc: 'Giao dịch B2B có hợp đồng, bảo đảm pháp lý' },
        ]" :key="f.title">
          <div class="feature-icon">{{ f.icon }}</div>
          <div class="feature-title">{{ f.title }}</div>
          <div class="feature-desc">{{ f.desc }}</div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ═══════════ ROOT ═══════════ */
.home-root {
  font-family: 'Inter', sans-serif;
  background: #fff;
  min-height: 100vh;
}

/* ═══════════ HERO ═══════════ */
.home-hero {
  display: flex;
  gap: 12px;
  padding: 12px 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 380px;
}

/* Sidebar */
.hero-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  border: 1px solid #e8f5e9;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f1f8e9;
  transition: background 0.15s;
  font-size: 13px;
  color: #333;
}
.sidebar-item:hover { background: #f1f8e9; }
.sidebar-icon { font-size: 16px; width: 20px; text-align: center; }
.sidebar-text { flex: 1; font-weight: 500; }
.sidebar-arrow { color: #aaa; font-size: 14px; }

/* Banner */
.hero-banner {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  min-height: 360px;
}
.banner-slide {
  width: 100%;
  height: 100%;
  min-height: 360px;
  display: flex;
  align-items: center;
  padding: 32px 40px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}
.banner-deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
}
.banner-circle-1 {
  width: 300px; height: 300px;
  background: rgba(255,255,255,0.5);
  right: -60px; top: -60px;
}
.banner-circle-2 {
  width: 200px; height: 200px;
  background: rgba(255,255,255,0.3);
  right: 80px; bottom: -40px;
}
.banner-content { position: relative; z-index: 2; max-width: 50%; }
.banner-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 99px;
  margin-bottom: 12px;
}
.banner-title {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.25;
  margin-bottom: 10px;
  white-space: pre-line;
}
.banner-sub { font-size: 0.9rem; color: #555; margin-bottom: 20px; line-height: 1.5; }
.banner-btn {
  display: inline-block;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 10px 24px;
  border-radius: 8px;
  text-decoration: none;
  transition: opacity 0.2s, transform 0.2s;
}
.banner-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.banner-emoji-wrap {
  position: absolute;
  right: 60px; top: 50%;
  transform: translateY(-50%);
  font-size: 7rem;
  z-index: 1;
  opacity: 0.85;
}
.banner-dots {
  position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 6px; z-index: 2;
}
.banner-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(0,0,0,0.2); border: none; cursor: pointer; transition: all 0.2s;
}
.banner-dot.active { background: #2E7D32; width: 20px; border-radius: 4px; }
.banner-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.1);
  font-size: 1.2rem; cursor: pointer; z-index: 2;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.banner-arrow:hover { background: white; }
.banner-arrow-left { left: 12px; }
.banner-arrow-right { right: 12px; }

/* Side banners */
.hero-side-banners {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.side-banner {
  flex: 1;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
  overflow: hidden;
  position: relative;
}
.side-banner:hover { transform: scale(1.02); }
.side-banner-1 { background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); }
.side-banner-2 { background: linear-gradient(135deg, #FFF9C4 0%, #FFF176 100%); }
.side-banner-inner { display: flex; align-items: center; gap: 10px; }
.side-banner-emoji { font-size: 1.8rem; }
.side-banner-tag { font-size: 10px; color: #666; font-weight: 600; text-transform: uppercase; }
.side-banner-title { font-size: 1rem; font-weight: 800; color: #1B5E20; line-height: 1.2; }
.side-banner-sub { font-size: 10px; color: #555; margin-top: 4px; line-height: 1.4; }

/* Slide transition */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.4s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateX(30px); }
.slide-fade-leave-to { opacity: 0; transform: translateX(-30px); }

/* ═══════════ SECTION COMMON ═══════════ */
.home-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
}
.section-title-green { color: #2E7D32; }
.section-see-all {
  font-size: 0.85rem;
  color: #2E7D32;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.section-see-all:hover { color: #1B5E20; }

/* ═══════════ SUPPLIERS ═══════════ */
.suppliers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  position: relative;
}
.supplier-card {
  background: white;
  border: 1px solid #e8f5e9;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s, transform 0.2s;
}
.supplier-card:hover { box-shadow: 0 4px 16px rgba(46,125,50,0.1); transform: translateY(-2px); }
.supplier-header { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
.supplier-logo { font-size: 2.5rem; }
.supplier-name { font-weight: 700; font-size: 1rem; color: #1a1a1a; }
.supplier-link { font-size: 0.78rem; color: #2E7D32; cursor: pointer; }
.arrow-link { font-size: 1rem; }
.supplier-certs { display: flex; gap: 6px; margin-bottom: 12px; }
.cert-badge {
  font-size: 10px; font-weight: 700;
  border: 1.5px solid #2E7D32; color: #2E7D32;
  padding: 2px 8px; border-radius: 4px;
}
.supplier-stats {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid #f1f1f1;
  border-bottom: 1px solid #f1f1f1;
  margin-bottom: 10px;
}
.stat-item { text-align: center; }
.stat-num { display: block; font-weight: 800; font-size: 1rem; color: #1a1a1a; }
.stat-label { font-size: 10px; color: #888; }
.supplier-sub { font-size: 11px; color: #666; }
.suppliers-nav-btn {
  position: absolute; right: -16px; top: 50%; transform: translateY(-50%);
  width: 32px; height: 32px; border-radius: 50%;
  background: white; border: 1px solid #ddd;
  font-size: 1.2rem; cursor: pointer; z-index: 2;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: background 0.2s;
}
.suppliers-nav-btn:hover { background: #f1f8e9; }

/* ═══════════ SELLER CTA ═══════════ */
.home-seller-cta {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f9fbe7 0%, #e8f5e9 40%, #c8e6c9 100%);
  padding: 48px 60px;
  gap: 40px;
  position: relative;
  overflow: hidden;
}
.home-seller-cta::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 80px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 80'%3E%3Cpath fill='%23ffffff' d='M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z'/%3E%3C/svg%3E") bottom/cover no-repeat;
}
.cta-illustration {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 420px;
}
.cta-svg { width: 100%; max-width: 380px; height: auto; }
.cta-content { flex: 1; max-width: 480px; }
.cta-title {
  font-size: 1.9rem;
  font-weight: 800;
  color: #1B5E20;
  line-height: 1.3;
  margin-bottom: 20px;
}
.cta-list { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 10px; }
.cta-list li { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; color: #333; font-weight: 500; }
.cta-check {
  width: 24px; height: 24px; border-radius: 50%;
  background: #2E7D32; color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; flex-shrink: 0;
}
.cta-btn {
  display: inline-block;
  background: #2E7D32;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 12px 28px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 4px 14px rgba(46,125,50,0.3);
}
.cta-btn:hover { background: #1B5E20; transform: translateY(-2px); }

/* ═══════════ PRODUCTS ═══════════ */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.product-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  transition: box-shadow 0.2s, transform 0.2s;
}
.product-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
.product-img-wrap { position: relative; aspect-ratio: 1; background: #f9f9f9; }
.product-img { width: 100%; height: 100%; object-fit: cover; }
.product-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; min-height: 160px; }
.product-badge {
  position: absolute; top: 8px; left: 8px;
  background: #2E7D32; color: white;
  font-size: 9px; font-weight: 800;
  padding: 2px 8px; border-radius: 4px;
  letter-spacing: 1px;
}
.product-info { padding: 10px 12px; }
.product-name { font-weight: 600; font-size: 0.88rem; color: #1a1a1a; margin-bottom: 4px; line-clamp: 2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-location { font-size: 0.75rem; color: #888; margin-bottom: 4px; }
.product-price { font-weight: 800; font-size: 1rem; color: #2E7D32; }

/* ═══════════ FEATURES ═══════════ */
.home-features {
  background: #f9fbe7;
  border-top: 1px solid #dcedc8;
  padding: 32px 24px;
}
.features-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
.feature-item { text-align: center; padding: 16px; }
.feature-icon { font-size: 2rem; margin-bottom: 10px; }
.feature-title { font-weight: 700; font-size: 0.95rem; color: #1a1a1a; margin-bottom: 6px; }
.feature-desc { font-size: 0.82rem; color: #666; line-height: 1.5; }

/* ═══════════ RESPONSIVE ═══════════ */
@media (max-width: 1024px) {
  .hero-sidebar { display: none; }
  .hero-side-banners { display: none; }
  .home-seller-cta { flex-direction: column; padding: 32px 24px; }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .home-hero { padding: 8px 12px; }
  .suppliers-grid { flex-direction: column; }
  .features-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .home-seller-cta { padding: 24px 16px; }
  .cta-title { font-size: 1.4rem; }
}
</style>
