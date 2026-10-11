<template>
  <footer class="footer">
    <div class="footer__social-icons">
      <a
        href="https://github.com/Rezansrv"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="/images/social/git.png"
          alt="GitHub"
          width="35"
          height="35"
          loading="lazy"
        >
      </a>
      <a
        href="https://www.linkedin.com/in/reza-naserivand/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="/images/social/li.png"
          alt="LinkedIn"
          width="35"
          height="35"
          loading="lazy"
        >
      </a>
      <a
        href="https://instagram.com/rezansrv"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="/images/social/insta.png"
          alt="Instagram"
          width="35"
          height="35"
          loading="lazy"
        >
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

    <p>&copy; 2025 Reza Naserivand</p>
    <small>Made with Vue v2</small>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  padding: 30px 20px;
  background-color: #000;
  color: #fff;
  font-family: Barlow, sans-serif;
  text-align: center;

  &__social-icons {
    margin-bottom: 15px;

    a {
      margin: 0 8px;
    }

    img {
      display: inline;
      width: 35px;
      height: 35px;
      max-width: none;
    }
  }

  &__nav {
    margin-bottom: 15px;

    &-links {
      display: flex;
      gap: 25px;
      justify-content: center;
      padding: 0;
      list-style: none;

      li {
        a {
          color: #ededed;
          font-size: 18px;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }

        &:not(:last-child)::after {
          margin-left: 10px;
          color: #ededed;
          content: "|";
        }
      }
    }
  }

  p {
    margin-bottom: 5px;
    font-size: 16px;
  }

  small {
    color: #ccc;
    font-size: 12px;
  }
}
</style>
