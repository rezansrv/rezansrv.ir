<template  style="border-bottom: white">
  <header class="header">
    <div class="nav">
      <router-link class="logo" to="/">REZA NASERIVAND</router-link>
      <ul class="links">
        <li>
          <a href="https://github.com/Rezansrv" target="_blank" rel="noopener noreferrer">
            <img src="../../assets/images/social/git2.png" alt="GitHub" style="width: 29px; height: 28px; margin-top: -3px;" />
          </a>
        </li>
<!--        <li><router-link class="navLink" to="/speaking">speaking</router-link></li>-->
        <li><router-link class="navLink" to="/writing">writing</router-link></li>
        <li><router-link class="navLink" to="/projects">projects</router-link></li>
        <li><router-link class="navLink" to="/">Home</router-link></li>
      </ul>
      <router-view></router-view>
    </div>
  </header>

</template>

<style scoped>

.header{
  border: white;
}
.navLink {
  text-decoration: none;


}

.navLink:focus-visible{
}
.navLink:active {
  text-decoration: underline;
}


.navLink::after{
  text-decoration: underline;
}

.nav {
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  padding-inline: 80px;
  background-color: #111827;
  color: #ededed;
  font-family: Barlow, Barlow fallback, sans-serif;
}

.logo {
  text-decoration: none;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  white-space: nowrap;
}

.links {
  list-style-type: none;
  display: flex;
  gap: 20px;
  margin: 0;

}

.links li {
  cursor: pointer;
  font-size: 20px;
}

.links li a {
  color: #ededed;
}

.links li:hover a,
.links li:active a {
  text-decoration: underline;
}


@media (max-width: 740px) {

  .links {
    padding-top: 25px;
  }
  .links li{
    font-size: 20px;
  }

  .nav {
    flex-direction: column;
    text-align: center;
  }

}

@media (max-width: 600px) {
  .nav {
    flex-direction: column;
    text-align: center;
  }

  .links {
    padding-top: 25px;
    border: 2px white;
  }
  .links li{
    font-size: 5vw;
  }

  .logo{
    font-size: 6vw;
  }
}

</style>
<script setup>
</script>