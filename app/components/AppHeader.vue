<template>
  <header
    class="header"
    lang="en"
    dir="ltr"
  >
    <nav
      class="header--nav"
      aria-label="Primary navigation"
    >
      <NuxtLink
        class="header--nav--logo"
        data-text="REZA NASERIVAND"
        to="/"
      >
        REZA NASERIVAND<span class="header--nav--logo-dot" aria-hidden="true">.</span>
      </NuxtLink>
      <ul class="header--nav--links">
        <li>
          <a
            class="header--nav--github"
            href="https://github.com/rezansrv"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/social/git2.png"
              alt="GitHub"
              width="29"
              height="28"
              decoding="async"
            >
          </a>
        </li>
        <li>
          <NuxtLink
            class="header--nav--link"
            to="/writing"
          >
            writing
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            class="header--nav--link"
            to="/projects"
          >
            projects
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            class="header--nav--link"
            to="/"
          >
            Home
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
.header {
  background-color: #000;

  &--nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px 80px;
    color: #ededed;
    font-family: Barlow, "Barlow fallback", sans-serif;
    text-transform: uppercase;

    @media (max-width: 740px) {
      flex-direction: column;
      text-align: center;
    }

    &--logo {
      position: relative;
      isolation: isolate;
      color: #fff;
      font-size: 24px;
      font-weight: bold;
      text-decoration: none;
      text-shadow: none;
      white-space: nowrap;

      &::before,
      &::after {
        position: absolute;
        inset: 0;
        z-index: -1;
        content: attr(data-text);
        opacity: 0;
        pointer-events: none;
      }

      &::before {
        color: #41e8ff;
        animation: header-logo-glitch-cyan 7s steps(1, end) infinite;
      }

      &::after {
        color: #f03586;
        animation: header-logo-glitch-pink 7s 80ms steps(1, end) infinite;
      }

      &:hover::before,
      &:focus-visible::before {
        animation-duration: 720ms;
      }

      &:hover::after,
      &:focus-visible::after {
        animation-duration: 720ms;
      }

      &:focus-visible {
        border-radius: 4px;
        outline: 2px solid #f03586;
        outline-offset: 5px;
      }
    }

    &--logo-dot {
      color: #f03586;
    }

    &--links {
      display: flex;
      gap: 20px;
      padding: 0;
      margin: 0;
      list-style-type: none;

      @media (max-width: 740px) {
        padding-top: 25px;
      }

      li {
        font-size: 20px;
      }

      img {
        display: inline;
        width: 29px;
        height: 28px;
        margin-top: -3px;
        max-width: none;
      }

      a {
        color: #ededed;
      }
    }

    &--link {
      position: relative;
      text-decoration: none;
      transition: color 160ms ease;

      &::after {
        position: absolute;
        right: 0;
        bottom: -5px;
        left: 0;
        height: 2px;
        border-radius: 999px;
        background: #f03586;
        content: "";
        opacity: 0;
        transform: scaleX(0.5);
        transition: opacity 160ms ease, transform 160ms ease;
      }

      &:hover,
      &.router-link-exact-active {
        color: #fff;
      }

      &:hover::after,
      &.router-link-exact-active::after {
        opacity: 1;
        transform: scaleX(1);
      }

      &:focus-visible {
        border-radius: 4px;
        outline: 2px solid #f03586;
        outline-offset: 5px;
      }
    }

    &--github:focus-visible {
      border-radius: 4px;
      outline: 2px solid #f03586;
      outline-offset: 4px;
    }
  }
}

@keyframes header-logo-glitch-cyan {
  0%,
  89%,
  94%,
  100% {
    clip-path: inset(0 0 100% 0);
    opacity: 0;
    transform: translate(0);
  }

  90% {
    clip-path: inset(8% 0 66% 0);
    opacity: 0.52;
    transform: translate(-2px, 1px);
  }

  91% {
    clip-path: inset(58% 0 16% 0);
    opacity: 0.42;
    transform: translate(2px, -1px);
  }

  92% {
    clip-path: inset(32% 0 44% 0);
    opacity: 0.5;
    transform: translate(-1px);
  }
}

@keyframes header-logo-glitch-pink {
  0%,
  90%,
  95%,
  100% {
    clip-path: inset(100% 0 0 0);
    opacity: 0;
    transform: translate(0);
  }

  91% {
    clip-path: inset(64% 0 8% 0);
    opacity: 0.48;
    transform: translate(2px, 1px);
  }

  92% {
    clip-path: inset(18% 0 56% 0);
    opacity: 0.44;
    transform: translate(-2px, -1px);
  }

  93% {
    clip-path: inset(46% 0 28% 0);
    opacity: 0.52;
    transform: translate(1px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .header--nav--logo,
  .header--nav--link,
  .header--nav--link::after {
    transition: none;
  }

  .header--nav--logo::before,
  .header--nav--logo::after {
    animation: none;
  }
}
</style>
