<template>
  <div>
    <Head/>
    <Main/>
    <FooterApp/>
  </div>
</template>

<script>
import Head from '../components/utils/HeaderApp.vue';
import Main from '../components/writing/WritingMain.vue'
import FooterApp from '../components/utils/FooterApp.vue'

export default {
  name: 'App',
  components: {
    Head,
    Main,
    FooterApp
  }
}
</script>

