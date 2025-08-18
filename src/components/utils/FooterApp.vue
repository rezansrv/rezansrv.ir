<template>
  <footer class="footer">
    <div class="footer__social-icons">
      <a href="https://github.com/Rezansrv" target="_blank" rel="noopener noreferrer">
        <img src="../../assets/images/social/git.png" alt="GitHub" loading="lazy" />
      </a>
      <a
        href="https://www.linkedin.com/in/reza-naserivand/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="../../assets/images/social/li.png" alt="LinkedIn" loading="lazy" />
      </a>
      <a href="https://instagram.com/rezansrv" target="_blank" rel="noopener noreferrer">
        <img src="../../assets/images/social/insta.png" alt="Instagram" loading="lazy" />
      </a>
    </div>

    <nav class="footer__nav">
      <ul class="footer__nav-links">
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/projects">Projects</router-link></li>
        <li><router-link to="/writing">Writing</router-link></li>
      </ul>
    </nav>

    <p>&copy; 2025 Reza Naserivand</p>
    <small>Made with Vue v2</small>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  background-color: #000;
  color: #fff;
  font-family: Barlow, sans-serif;
  text-align: center;
  padding: 30px 20px;

  &__social-icons {
    margin-bottom: 15px;

    a {
      margin: 0 8px;

      img {
        width: 35px;
        height: 35px;
      }
    }
  }

  &__nav {
    margin-bottom: 15px;

    &-links {
      list-style: none;
      display: flex;
      justify-content: center;
      gap: 25px;
      padding: 0;

      li {
        a {
          color: #ededed;
          text-decoration: none;
          font-size: 18px;

          &:hover {
            text-decoration: underline;
          }
        }

        &:not(:last-child)::after {
          content: "|";
          color: #ededed;
          margin-left: 10px;
        }
      }
    }
  }

  p {
    font-size: 16px;
    margin-bottom: 5px;
  }

  small {
    font-size: 12px;
    color: #ccc;
  }
}
</style>
