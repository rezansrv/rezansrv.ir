<template>
  <div>
    <Header/>
    <Glitch/>
    <AboutME/>
    <Footer/>
  </div>
</template>

<script>
import Glitch from '../components/home/GlitchApp.vue';
import Header from '../components/utils/HeaderApp.vue';
import AboutME from '../components/home/AboutMe.vue';
import Footer from '../components/utils/FooterApp.vue'

export default {
  name: 'App',
  components: {
    Glitch,
    Header,
    AboutME,
    Footer
  }}
</script>

<style>

</style>
