<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="footer-root">
    <!-- ===== NỘI DUNG CHÍNH ===== -->
    <div class="footer-main">
      <div class="footer-container">
        <div class="footer-grid">

          <!-- CỘT 1: Logo & mô tả -->
          <div class="footer-col footer-col--brand">
            <RouterLink to="/" class="footer-logo">
              <div class="footer-logo-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 8C8 10 5.9 16.17 3.82 19.7 3.46 20.34 4.09 21 4.82 21h12.69a1 1 0 0 0 .97-.76L20 14"/>
                  <path d="M9.25 14C9.25 14 8.5 11 9.5 9"/>
                  <path d="M14.75 14C14.75 14 15.5 11 14.5 9"/>
                  <path d="M12 6V3"/>
                  <path d="M20 4C20 4 20 8 16 10"/>
                  <path d="M4 4C4 4 4 8 8 10"/>
                </svg>
              </div>
              <div>
                <span class="footer-logo-brand">AgroMarket</span>
                <span class="footer-logo-sub">B2B Nông sản Việt</span>
              </div>
            </RouterLink>

            <p class="footer-desc">
              Sàn nguyên liệu thực phẩm giá sỉ. Kết nối trực tiếp nông dân và doanh nghiệp thu mua. Giao dịch minh bạch, an toàn.
            </p>

            <!-- Chứng nhận -->
            <div class="cert-badges">
              <div class="cert-badge">
                <span class="cert-badge-icon">✅</span>
                <span>HACCP</span>
              </div>
              <div class="cert-badge">
                <span class="cert-badge-icon">🏅</span>
                <span>ISO 22000</span>
              </div>
              <div class="cert-badge">
                <span class="cert-badge-icon">🇻🇳</span>
                <span>OCOP</span>
              </div>
            </div>
          </div>

          <!-- CỘT 2: Về chúng tôi -->
          <div class="footer-col">
            <h4 class="footer-col-title">Về chúng tôi</h4>
            <ul class="footer-links">
              <li><RouterLink to="/about" class="footer-link">
                <span class="link-arrow">›</span> Về AgroMarket
              </RouterLink></li>
              <li><RouterLink to="/auth/nong-dan" class="footer-link">
                <span class="link-arrow">›</span> Nhà người bán
              </RouterLink></li>
              <li><RouterLink to="/" class="footer-link">
                <span class="link-arrow">›</span> Điều khoản sử dụng
              </RouterLink></li>
              <li><RouterLink to="/" class="footer-link">
                <span class="link-arrow">›</span> Chính sách bảo mật
              </RouterLink></li>
              <li><RouterLink to="/" class="footer-link">
                <span class="link-arrow">›</span> Quy chế hoạt động
              </RouterLink></li>
              <li><RouterLink to="/" class="footer-link">
                <span class="link-arrow">›</span> Cơ chế giải quyết tranh chấp
              </RouterLink></li>
            </ul>
          </div>

          <!-- CỘT 3: Hỗ trợ -->
          <div class="footer-col">
            <h4 class="footer-col-title">Hỗ trợ</h4>
            <ul class="footer-links">
              <li><RouterLink to="/" class="footer-link">
                <span class="link-arrow">›</span> Trung tâm trợ giúp
              </RouterLink></li>
              <li><RouterLink to="/" class="footer-link">
                <span class="link-arrow">›</span> Hướng dẫn mua hàng
              </RouterLink></li>
              <li><RouterLink to="/" class="footer-link">
                <span class="link-arrow">›</span> Hướng dẫn bán hàng
              </RouterLink></li>
              <li><RouterLink to="/" class="footer-link">
                <span class="link-arrow">›</span> Giao hàng và nhận hàng
              </RouterLink></li>
              <li><RouterLink to="/" class="footer-link">
                <span class="link-arrow">›</span> Tra cứu hoàn tiền
              </RouterLink></li>
            </ul>
          </div>

          <!-- CỘT 4: Liên hệ -->
          <div class="footer-col">
            <h4 class="footer-col-title">Thông tin liên hệ</h4>

            <div class="contact-block">
              <div class="contact-hotline-label">Hotline miễn phí</div>
              <a href="tel:19009039" class="contact-hotline">1900 9039</a>
            </div>

            <div class="contact-block">
              <div class="contact-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <a href="mailto:contact@agromarket.vn" class="contact-email">contact@agromarket.vn</a>
              </div>
              <div class="contact-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>

            <!-- Mạng xã hội -->
            <div class="social-block">
              <p class="social-label">Theo dõi chúng tôi</p>
              <div class="social-icons">
                <a href="#" class="social-icon social-icon--fb" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" class="social-icon social-icon--tt" aria-label="TikTok">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.71a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/></svg>
                </a>
                <a href="#" class="social-icon social-icon--yt" aria-label="YouTube">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.94C18.88 4 12 4 12 4s-6.88 0-8.6.48A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 1.94C5.12 20 12 20 12 20s6.88 0 8.6-.48a2.78 2.78 0 0 0 1.94-1.94A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
                </a>
                <a href="#" class="social-icon social-icon--ig" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SVG Wave trang trí -->
      <div class="footer-wave">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#1B5E20"/>
        </svg>
      </div>
    </div>

    <!-- ===== BOTTOM BAR ===== -->
    <div class="footer-bottom">
      <div class="footer-container footer-bottom-inner">
        <p class="footer-copy">
          © {{ new Date().getFullYear() }} Copyright
          <strong>AgroMarket</strong> — Sàn giao dịch nông sản B2B Việt Nam. Thiết kế bởi
          <strong>AgroMarket Team</strong>
        </p>
        <div class="footer-bottom-links">
          <RouterLink to="/" class="footer-bottom-link">Chính sách bảo mật</RouterLink>
          <span class="bottom-sep">|</span>
          <RouterLink to="/" class="footer-bottom-link">Điều khoản</RouterLink>
          <span class="bottom-sep">|</span>
          <RouterLink to="/" class="footer-bottom-link">Cookies</RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* =================== ROOT =================== */
.footer-root {
  font-family: 'Inter', sans-serif;
  margin-top: auto;
}

/* =================== MAIN SECTION =================== */
.footer-main {
  background: linear-gradient(180deg, #f8fafc 0%, #ecfdf5 100%);
  border-top: 1px solid rgba(16, 185, 129, 0.2);
  position: relative;
  overflow: hidden;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 48px;
  padding: 56px 0 80px;
}

/* =================== COLUMNS =================== */
.footer-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ---- BRAND COLUMN ---- */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.footer-logo:hover {
  transform: translateY(-1px);
}

.footer-logo-icon {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid rgba(16, 185, 129, 0.3);
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.footer-logo:hover .footer-logo-icon {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.footer-logo:hover .footer-logo-icon svg {
  stroke: #fff;
}

.footer-logo-icon svg {
  transition: stroke 0.2s;
}

.footer-logo-brand {
  display: block;
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.footer-logo-sub {
  display: block;
  font-size: 10px;
  color: #66BB6A;
  font-weight: 500;
}

.footer-desc {
  font-size: 13.5px;
  line-height: 1.7;
  color: #546E7A;
  max-width: 280px;
}

/* Cert badges */
.cert-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cert-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #fff;
  border: 1.5px solid #A5D6A7;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
  color: #2E7D32;
  letter-spacing: 0.04em;
}

.cert-badge-icon {
  font-size: 13px;
}

/* ---- LINKS COLUMNS ---- */
.footer-col-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #1B5E20;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding-bottom: 10px;
  border-bottom: 2px solid #A5D6A7;
  margin: 0;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 500;
  color: #546E7A;
  text-decoration: none;
  transition: color 0.15s, transform 0.15s;
}

.footer-link:hover {
  color: #2E7D32;
  transform: translateX(3px);
}

.link-arrow {
  color: #81C784;
  font-weight: 700;
  font-size: 16px;
  line-height: 1;
}

/* ---- CONTACT COLUMN ---- */
.contact-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contact-hotline-label {
  font-size: 11px;
  font-weight: 700;
  color: #81C784;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.contact-hotline {
  font-size: 26px;
  font-weight: 900;
  color: #2E7D32;
  text-decoration: none;
  letter-spacing: -0.5px;
  line-height: 1.1;
  transition: color 0.15s;
}

.contact-hotline:hover {
  color: #1B5E20;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #546E7A;
}

.contact-email {
  color: #2E7D32;
  text-decoration: none;
  font-weight: 600;
}

.contact-email:hover {
  text-decoration: underline;
}

/* Social */
.social-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-label {
  font-size: 11px;
  font-weight: 700;
  color: #81C784;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

.social-icons {
  display: flex;
  gap: 8px;
}

.social-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-decoration: none;
  transition: transform 0.15s, opacity 0.15s;
}

.social-icon:hover {
  transform: translateY(-3px);
  opacity: 0.9;
}

.social-icon--fb { background: #1877F2; }
.social-icon--tt { background: #010101; }
.social-icon--yt { background: #FF0000; }
.social-icon--ig { background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }

/* =================== SVG WAVE =================== */
.footer-wave {
  width: 100%;
  line-height: 0;
  margin-top: -2px;
}

.footer-wave svg {
  width: 100%;
  height: 60px;
  display: block;
}

/* =================== BOTTOM BAR =================== */
.footer-bottom {
  background: #1B5E20;
  padding: 14px 0;
}

.footer-bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-copy {
  font-size: 12.5px;
  color: rgba(255,255,255,0.75);
  margin: 0;
}

.footer-copy strong {
  color: #A5D6A7;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-bottom-link {
  font-size: 12px;
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  transition: color 0.15s;
}

.footer-bottom-link:hover {
  color: #fff;
}

.bottom-sep {
  color: rgba(255,255,255,0.25);
  font-size: 11px;
}

/* =================== RESPONSIVE =================== */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    padding-bottom: 70px;
  }
  .footer-col--brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 40px 0 70px;
  }

  .footer-col--brand {
    grid-column: auto;
  }

  .contact-hotline {
    font-size: 22px;
  }

  .footer-bottom-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
