<template>
  <header class="header">
    <nav
      class="header--nav"
      aria-label="Primary navigation"
    >
      <NuxtLink
        class="header--nav--logo"
        to="/"
      >
        REZA NASERIVAND
      </NuxtLink>
      <ul class="header--nav--links">
        <li>
          <a
            href="https://github.com/Rezansrv"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/social/git2.png"
              alt="GitHub"
              width="29"
              height="28"
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
      color: #fff;
      font-size: 24px;
      font-weight: bold;
      text-decoration: none;
      white-space: nowrap;
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
      text-decoration: none;

      &:hover,
      &.router-link-exact-active {
        text-decoration: underline;
      }
    }
  }
}
</style>
