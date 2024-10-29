<template>
  <header class="header">
    <nav class="header--nav">
      <router-link class="header--nav--logo" to="/">REZA NASERIVAND</router-link>
      <ul class="header--nav--links">
        <li>
          <a href="https://github.com/Rezansrv" target="_blank" rel="noopener noreferrer">
            <img src="../../assets/images/social/git2.png" alt="GitHub"
                 style="width: 29px; height: 28px; margin-top: -3px;"/>
          </a>
        </li>
        <li>
          <router-link class="header--nav--link" to="/writing">writing</router-link>
        </li>
        <li>
          <router-link class="header--nav--link" to="/projects">projects</router-link>
        </li>
        <li>
          <router-link class="header--nav--link" to="/">Home</router-link>
        </li>
      </ul>
    </nav>
  </header>

</template>

<style lang="scss" scoped>

.header {
  background-color: #000000;

  &--nav {
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30px;
    padding-inline: 80px;
    color: #ededed;
    font-family: Barlow, Barlow fallback, sans-serif;
    @media (max-width: 740px) {
      flex-direction: column;
      text-align: center;
    }

    &--logo {
      text-decoration: none;
      color: #fff;
      font-size: 24px;
      font-weight: bold;
      white-space: nowrap;
    }

    &--links {
      list-style-type: none;
      display: flex;
      gap: 20px;
      margin: 0;
      @media (max-width: 740px) {
        padding-top: 25px;
      }
      @media (max-width: 600px) {
        padding-top: 25px;
        border: 2px white;
      }

      li {
        cursor: pointer;
        font-size: 20px;
      }

      li a {
        color: #ededed;
      }
    }

    &--link {
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }

      &.router-link-exact-active {
        text-decoration: underline;
      }
    }
  }
}
</style>
