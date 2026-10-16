<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const isNotFound = computed(() => props.error.statusCode === 404)
const statusCode = computed(() => String(props.error.statusCode || 500))

useSeoMeta({
  title: () => `${isNotFound.value ? 'Page not found' : 'Something went wrong'} | Reza Naserivand`,
  description: () => isNotFound.value ? 'The requested page could not be found.' : 'The page could not be loaded.',
  robots: 'noindex, follow',
})

useHead({
  htmlAttrs: { lang: 'en', dir: 'ltr' },
})
</script>

<template>
  <main class="error-page">
    <div class="error-page__masthead">
      <NuxtLink class="error-page__brand" to="/" external no-prefetch>
        REZA NASERIVAND<span aria-hidden="true">.</span>
      </NuxtLink>
      <span class="error-page__status">{{ isNotFound ? 'Page not found' : 'An unexpected error' }}</span>
    </div>

    <section class="error-page__card" aria-labelledby="error-title">
      <div class="error-page__visual">
        <span class="error-page__cross error-page__cross--left" aria-hidden="true">+</span>
        <h1 class="error-page__code" :data-code="statusCode" :aria-label="statusCode">{{ statusCode }}</h1>
        <span class="error-page__cross error-page__cross--right" aria-hidden="true">+</span>
      </div>

      <div class="error-page__message">
        <p class="error-page__eyebrow">{{ isNotFound ? 'A detour, not a dead end' : 'A momentary interruption' }}</p>
        <h2 id="error-title">{{ isNotFound ? 'A little off the map.' : 'Something went wrong.' }}</h2>
        <p class="error-page__description">
          {{ isNotFound ? 'The page you are looking for could not be found.' : 'The page could not be loaded.' }}
          <span>Let’s get you somewhere familiar.</span>
        </p>

        <!-- A full document navigation also recovers from Nuxt's global error state. -->
        <NuxtLink class="error-page__home" to="/" external no-prefetch>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
            <path d="M19 12H5m6-6-6 6 6 6" />
          </svg>
          Return to home
        </NuxtLink>
      </div>

      <nav class="error-page__paths" aria-label="Explore the site">
        <span>Or explore</span>
        <NuxtLink to="/projects" external no-prefetch>Projects <span aria-hidden="true">↗</span></NuxtLink>
        <NuxtLink to="/writing" external no-prefetch>Writing <span aria-hidden="true">↗</span></NuxtLink>
      </nav>
    </section>

    <p class="error-page__signature">A wrong turn can still lead to something good.</p>
  </main>
</template>

<style scoped>
.error-page {
  box-sizing: border-box;
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  min-height: 100svh;
  gap: 40px;
  padding: 36px clamp(20px, 5.5vw, 80px) 28px;
  background:
    radial-gradient(ellipse at 50% 38%, rgb(94 35 132 / 22%), transparent 64%),
    #000;
  color: #fff;
  font-family: Arial, sans-serif;
}

.error-page__masthead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.error-page a {
  text-decoration: none;
}

.error-page__brand {
  color: #ededed;
  font-family: Barlow, "Barlow fallback", Arial, sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.035em;
}

.error-page__brand > span {
  color: #f03586;
}

.error-page__status {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #b8b0c2;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.error-page__status::before {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f03586;
  box-shadow: 0 0 14px rgb(240 53 134 / 45%);
  content: "";
}

.error-page__card {
  box-sizing: border-box;
  align-self: center;
  width: min(100%, 860px);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 13%);
  border-radius: 24px;
  background: linear-gradient(145deg, rgb(255 255 255 / 4%), rgb(255 255 255 / 1%));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 5%), 0 32px 100px rgb(0 0 0 / 24%);
  text-align: center;
}

.error-page__visual {
  position: relative;
  display: grid;
  place-items: center;
  padding: 42px 24px 20px;
  background:
    linear-gradient(rgb(196 159 223 / 4%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(196 159 223 / 4%) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: linear-gradient(#000 75%, transparent);
}

.error-page__code {
  position: relative;
  margin: 0;
  color: #eee8f4;
  font-size: clamp(140px, 24vw, 260px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.075em;
  text-indent: -0.075em;
}

.error-page__code::before,
.error-page__code::after {
  position: absolute;
  inset: 0;
  content: attr(data-code);
  pointer-events: none;
}

.error-page__code::before {
  clip-path: inset(29% 0 65%);
  transform: translateX(-5px);
  color: #41e8ff;
}

.error-page__code::after {
  clip-path: inset(62% 0 33%);
  transform: translateX(5px);
  color: #f03586;
}

.error-page__cross {
  position: absolute;
  top: 50%;
  color: #776784;
  font-family: monospace;
  font-size: 20px;
  font-weight: 400;
}

.error-page__cross--left {
  left: 9%;
}

.error-page__cross--right {
  right: 9%;
}

.error-page__message {
  padding: 8px 24px 40px;
}

.error-page__eyebrow {
  margin-bottom: 14px;
  color: #f77cb2;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.17em;
  line-height: 1.6;
  text-transform: uppercase;
}

.error-page h2 {
  margin: 0 0 18px;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.error-page__description {
  color: #bdb5c8;
  font-size: 16px;
  line-height: 1.8;
}

.error-page__description > span {
  display: block;
}

.error-page__home {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 24px;
  margin-top: 28px;
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 10px;
  background: #f03586;
  color: #100710;
  font-size: 14px;
  font-weight: 700;
  transition: background-color 180ms ease, transform 180ms ease;
}

.error-page__home svg {
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.error-page__home:hover {
  transform: translateY(-2px);
  background: #ff69a9;
}

.error-page__paths {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 26px;
  padding: 22px 20px;
  border-top: 1px solid rgb(255 255 255 / 9%);
  font-size: 13px;
}

.error-page__paths > span {
  color: #a59aaf;
}

.error-page__paths a {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  color: #e2dce9;
  transition: color 180ms ease;
}

.error-page__paths a > span {
  color: #f77cb2;
}

.error-page__paths a:hover {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 5px;
}

.error-page a:focus-visible {
  outline: 2px solid #41e8ff;
  outline-offset: 5px;
}

.error-page__signature {
  color: #a59aaf;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

@media (max-width: 600px) {
  .error-page {
    gap: 32px;
    padding-top: 24px;
    padding-bottom: 22px;
  }

  .error-page__brand {
    font-size: 15px;
  }

  .error-page__status {
    gap: 6px;
    font-size: 9px;
    letter-spacing: 0.04em;
  }

  .error-page__card {
    border-radius: 18px;
  }

  .error-page__visual {
    padding: 40px 16px 24px;
    background-size: 28px 28px;
  }

  .error-page__message {
    padding: 8px 20px 32px;
  }

  .error-page__description {
    font-size: 15px;
  }

  .error-page__paths {
    gap: 20px;
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .error-page__home,
  .error-page__paths a {
    transition: none;
  }

  .error-page__home:hover {
    transform: none;
  }
}
</style>
