<script setup lang="ts">
const { public: { releaseYear } } = useRuntimeConfig()
</script>

<template>
  <footer
    class="footer"
    lang="en"
    dir="ltr"
  >
    <div class="footer__social-icons">
      <a
        href="https://github.com/rezansrv"
        target="_blank"
        rel="noopener noreferrer"
      >
        <picture>
          <source srcset="/images/social/git-54.webp" type="image/webp">
          <img
            src="/images/social/git.png"
            alt="GitHub"
            width="35"
            height="35"
            loading="lazy"
            decoding="async"
          >
        </picture>
      </a>
      <a
        href="https://www.linkedin.com/in/reza-naserivand"
        target="_blank"
        rel="noopener noreferrer"
      >
        <picture>
          <source srcset="/images/social/li-54.webp" type="image/webp">
          <img
            src="/images/social/li.png"
            alt="LinkedIn"
            width="35"
            height="35"
            loading="lazy"
            decoding="async"
          >
        </picture>
      </a>
      <a
        href="https://instagram.com/rezansrv"
        target="_blank"
        rel="noopener noreferrer"
      >
        <picture>
          <source srcset="/images/social/insta-54.webp" type="image/webp">
          <img
            src="/images/social/insta.png"
            alt="Instagram"
            width="35"
            height="35"
            loading="lazy"
            decoding="async"
          >
        </picture>
      </a>
    </div>

    <nav
      class="footer__nav"
      aria-label="Footer navigation"
    >
      <ul class="footer__nav-links">
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/projects">Projects</NuxtLink></li>
        <li><NuxtLink to="/writing">Writing</NuxtLink></li>
      </ul>
    </nav>

    <p>&copy; {{ releaseYear }} Reza Naserivand</p>
    <small class="footer__signature">
      Made with Nuxt 4
      <span class="footer__nuxt" aria-hidden="true">
        <svg
          viewBox="0 0 512 512"
          width="16"
          height="16"
        >
          <path d="M281.44 397.667H438.32C443.326 397.667 448.118 395.908 452.453 393.427C456.789 390.946 461.258 387.831 463.76 383.533C466.262 379.236 468.002 374.36 468 369.399C467.998 364.437 466.266 359.563 463.76 355.268L357.76 172.947C355.258 168.65 352.201 165.534 347.867 163.053C343.532 160.573 337.325 158.813 332.32 158.813C327.315 158.813 322.521 160.573 318.187 163.053C313.852 165.534 310.795 168.65 308.293 172.947L281.44 219.587L227.733 129.13C225.229 124.834 222.176 120.307 217.84 117.827C213.504 115.346 208.713 115 203.707 115C198.701 115 193.909 115.346 189.573 117.827C185.238 120.307 180.771 124.834 178.267 129.13L46.8267 355.268C44.3208 359.563 44.0022 364.437 44 369.399C43.9978 374.36 44.3246 379.235 46.8267 383.533C49.3288 387.83 53.7979 390.946 58.1333 393.427C62.4688 395.908 67.2603 397.667 72.2667 397.667H171.2C210.401 397.667 238.934 380.082 258.827 346.787L306.88 263.4L332.32 219.587L410.053 352.44H306.88L281.44 397.667ZM169.787 352.44H100.533L203.707 174.36L256 263.4L221.361 323.784C208.151 345.387 193.089 352.44 169.787 352.44Z" />
        </svg>
      </span>
    </small>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  padding: 44px 24px 36px;
  background: #000;
  color: #fff;
  font-family: Barlow, sans-serif;
  text-align: center;

  &__social-icons {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 22px;

    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border: 1px solid rgb(255 255 255 / 12%);
      border-radius: 12px;
      background: rgb(255 255 255 / 4%);
      transition: border-color 180ms ease, background-color 180ms ease, transform 180ms ease;

      &:hover,
      &:focus-visible {
        border-color: rgb(240 53 134 / 70%);
        background: rgb(240 53 134 / 10%);
        outline: none;
        transform: translateY(-2px);
      }
    }

    img {
      display: block;
      width: 27px;
      height: 27px;
      max-width: none;
    }

    picture {
      display: block;
    }
  }

  &__nav {
    margin-bottom: 24px;

    &-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0;
      align-items: center;
      justify-content: center;
      padding: 0;
      list-style: none;

      li {
        display: inline-flex;
        align-items: center;

        a {
          padding: 5px 2px;
          color: #ddd9e3;
          font-size: 16px;
          letter-spacing: 0.025em;
          text-decoration: none;
          transition: color 160ms ease;

          &:hover,
          &:focus-visible {
            color: #fff;
            outline: none;
            text-decoration-color: #f03586;
            text-decoration-line: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 5px;
          }
        }

        &:not(:last-child)::after {
          width: 1px;
          height: 14px;
          margin: 0 16px;
          background: rgb(255 255 255 / 22%);
          content: "";
        }
      }
    }
  }

  p {
    margin-bottom: 8px;
    color: #f5f3f7;
    font-size: 16px;
    letter-spacing: 0.015em;
  }

  &__signature {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    color: #aaa4b0;
    font-size: 13px;
  }

  &__nuxt {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    svg {
      width: 16px;
      height: 16px;
      fill: #00dc82;
      filter: drop-shadow(0 0 7px rgb(0 220 130 / 24%));
    }
  }

  @media (max-width: 420px) {
    padding: 38px 18px 30px;

    &__nav-links li:not(:last-child)::after {
      margin: 0 11px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__social-icons a {
      transition: none;
    }
  }
}
</style>
