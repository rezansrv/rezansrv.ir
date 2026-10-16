<script setup lang="ts">
const isPersian = ref(false)
const isHydrated = ref(false)

onMounted(() => {
  isHydrated.value = true
})

useHead({
  noscript: [
    {
      key: 'about-no-script',
      innerHTML: `<style>
        .home-about__language-toggle { display: none !important; }
        .home-about__content { display: block !important; }
        .home-about__panel { visibility: visible !important; opacity: 1 !important; pointer-events: auto !important; transform: none !important; }
        .home-about__panel--persian { margin-top: 2.5rem !important; padding-top: 2.5rem !important; border-top: 1px solid rgb(255 255 255 / 12%) !important; }
      </style>`,
    },
  ],
})
</script>

<template>
  <section
    class="home-about"
    aria-labelledby="home-about-title"
  >
    <div class="home-about__card">
      <button
        class="home-about__language-toggle"
        type="button"
        aria-controls="home-about-english home-about-persian"
        :aria-label="isPersian ? 'Show English introduction' : 'نمایش معرفی فارسی'"
        :aria-pressed="isPersian"
        @click="isPersian = !isPersian"
      >
        <svg
          class="home-about__language-icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="20"
          height="20"
        >
          <path d="M5 8l6 6" />
          <path d="M4 14l6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="M22 22l-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
        <span class="home-about__language-label">{{ isPersian ? 'EN' : 'فا' }}</span>
      </button>

      <div class="home-about__portrait">
        <div class="home-about__portrait-frame">
          <picture>
            <source
              type="image/webp"
              srcset="/images/me-560.webp 560w, /images/me-840.webp 840w"
              sizes="(max-width: 720px) 220px, 280px"
            >
            <img
              src="/images/me.jpg"
              alt="Portrait of Reza Naserivand"
              width="280"
              height="280"
              loading="lazy"
              decoding="async"
            >
          </picture>
        </div>
        <p
          :lang="isPersian ? 'fa' : 'en'"
          :dir="isPersian ? 'rtl' : 'ltr'"
        >
          {{ isPersian ? 'مهندس نرم‌افزار' : 'Software Engineer' }}
        </p>
      </div>

      <div class="home-about__content">
        <section
          id="home-about-english"
          class="home-about__panel"
          :class="{ 'home-about__panel--active': !isPersian }"
          lang="en"
          dir="ltr"
          :aria-hidden="isHydrated ? isPersian : false"
        >
          <p class="home-about__eyebrow">About Reza Naserivand</p>
          <h1 id="home-about-title">Software engineering across web, data, and AI.</h1>
          <p class="home-about__lede">
            I’m Reza Naserivand, a software engineer focused on building reliable systems and
            thoughtful digital experiences.
          </p>
          <p>
            My background began in frontend development with Vue, Nuxt, and React, and has since
            expanded to SQL Server–based data systems. I’m currently pursuing an M.Sc. in
            Artificial Intelligence, with interests in computer vision and medical image analysis.
          </p>
        </section>

        <section
          id="home-about-persian"
          class="home-about__panel home-about__panel--persian"
          :class="{ 'home-about__panel--active': isPersian }"
          lang="fa"
          dir="rtl"
          :aria-hidden="isHydrated ? !isPersian : false"
          aria-labelledby="home-about-persian-title"
        >
          <p class="home-about__eyebrow">درباره من</p>
          <h2 id="home-about-persian-title">من رضا ناصری‌وند هستم؛ مهندس نرم‌افزار.</h2>
          <p class="home-about__lede">
            نرم‌افزارهایی می‌سازم که استفاده از آن‌ها ساده باشد و پشت صحنه درست و قابل‌اعتماد کار
            کنند.
          </p>
          <p>
            مسیر کاری‌ام از فرانت‌اند و کار با Vue، Nuxt و React شروع شد و بعد به سیستم‌های
            داده‌محور و SQL Server گسترش پیدا کرد. در کنارش کارشناسی ارشد هوش مصنوعی می‌خوانم و
            بینایی ماشین و تحلیل تصاویر پزشکی را دنبال می‌کنم.
          </p>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-about {
  display: flex;
  justify-content: center;
  padding: 140px 40px 96px;
  background:
    radial-gradient(circle at 16% 48%, rgb(98 43 151 / 30%), transparent 30rem),
    radial-gradient(circle at 86% 30%, rgb(240 53 134 / 10%), transparent 24rem),
    #000;
  color: #fff;
  font-family: Barlow, "Barlow fallback", Arial, sans-serif;
}

.home-about__card {
  position: relative;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: clamp(36px, 6vw, 72px);
  width: min(100%, 1040px);
  padding: clamp(30px, 5vw, 58px);
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 19%);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 10%), rgb(255 255 255 / 2%) 48%),
    rgb(19 9 35 / 66%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 12%),
    0 32px 90px rgb(0 0 0 / 48%);
  backdrop-filter: blur(20px) saturate(125%);
}

.home-about__language-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
  display: inline-flex;
  gap: 7px;
  align-items: center;
  min-height: 42px;
  padding: 8px 11px;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 999px;
  background: rgb(8 4 15 / 48%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 8%);
  backdrop-filter: blur(12px);
  color: #fff;
  cursor: pointer;
  transition: border-color 180ms ease, background-color 180ms ease, transform 180ms ease;
}

.home-about__language-toggle:hover {
  border-color: #f03586;
  background: rgb(240 53 134 / 14%);
  transform: translateY(-1px);
}

.home-about__language-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.home-about__language-label {
  min-width: 1.4em;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
}

.home-about__portrait {
  align-self: start;
}

.home-about__portrait-frame {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 10%),
    0 18px 44px rgb(0 0 0 / 26%);
}

.home-about__portrait-frame picture {
  display: block;
  width: 100%;
  height: 100%;
}

.home-about__portrait img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.08) translateX(1.4%);
}

.home-about__portrait p {
  margin-top: 16px;
  color: #f03586;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-align: center;
  text-transform: uppercase;
}

.home-about__portrait p[lang="fa"] {
  font-family: Tahoma, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.8;
  letter-spacing: 0;
  text-transform: none;
}

.home-about__content {
  display: grid;
  min-width: 0;
  padding-top: 18px;
}

.home-about__panel {
  grid-area: 1 / 1;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px);
  transition:
    opacity 240ms ease,
    transform 360ms ease,
    visibility 0s linear 360ms;
}

.home-about__panel--active {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
  transition-delay: 0s;
}

.home-about__panel--persian {
  font-family: Tahoma, Arial, sans-serif;
}

.home-about__eyebrow {
  margin-bottom: 10px;
  color: #f03586;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.home-about__panel--persian .home-about__eyebrow {
  letter-spacing: 0;
  text-transform: none;
}

.home-about h1,
.home-about h2 {
  margin-bottom: 24px;
  font-size: clamp(34px, 5vw, 54px);
  line-height: 1.08;
  letter-spacing: -0.035em;
}

.home-about__panel--persian h2 {
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.5;
  letter-spacing: -0.025em;
}

.home-about__panel > p:not(.home-about__eyebrow) {
  margin-bottom: 16px;
  color: #d8d4df;
  font-size: 18px;
  line-height: 1.7;
}

.home-about__panel--persian > p:not(.home-about__eyebrow) {
  line-height: 2;
}

.home-about__lede {
  color: #fff !important;
  font-size: 20px !important;
}

@media (max-width: 720px) {
  .home-about {
    padding: 88px 20px 72px;
  }

  .home-about__card {
    grid-template-columns: 1fr;
    padding: 64px 24px 26px;
    border-radius: 18px;
  }

  .home-about__language-toggle {
    top: 14px;
    right: 14px;
  }

  .home-about__portrait {
    width: min(220px, 72vw);
    margin: 0 auto;
  }

  .home-about__content {
    padding-top: 0;
  }

  .home-about h1,
  .home-about h2 {
    font-size: clamp(32px, 10vw, 44px);
  }

  .home-about__panel > p:not(.home-about__eyebrow) {
    font-size: 17px;
  }

  .home-about__lede {
    font-size: 18px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-about__language-toggle,
  .home-about__panel {
    transition: none;
  }
}
</style>
