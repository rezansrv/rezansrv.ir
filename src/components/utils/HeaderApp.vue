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

