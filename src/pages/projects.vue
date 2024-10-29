<template>
  <div>
    <Head/>
    <main class="projects">
      <section class="projectheading animate__animated animate__zoomInUp">
        <h1 class="">Projects</h1>
      </section>
      <section class="github animate__animated animate__zoomInUp">
        <h2>github</h2>
        <table class="github-table">
          <tbody class="">
          <tr class="">
            <td class=""><h3 class=""><a class="" href="https://github.com/rezansrv/G2-Intership">G2-Intership</a> <!----></h3>
              <p data-v-0fea1b4d="">✩ 5</p>
              <p data-v-0fea1b4d="">A site to display courses written with Nuxt2,Vue class based component,Typescript,Tailwindcss
              </p></td>
          </tr>
          <tr class="">
            <td class=""><h3 class=""><a class="" href="https://github.com/rezansrv/online-shop">online-shop</a> <!----></h3>
              <p data-v-0fea1b4d="">✩ 4</p>
              <p data-v-0fea1b4d="">Online shop with api that has a shopping cart section and is written with vue, pinia ,vuetify,vite;
              </p></td>
          </tr>
          <tr class="">
            <td class=""><h3 class=""><a class="" href="https://github.com/rezansrv/Foodi">Foodi</a> <!----></h3>
              <p data-v-0fea1b4d="">✩ 8</p>
              <p data-v-0fea1b4d="">Foodi (landingPage) with data base (MySQL) and back end with php for register and login users
              </p></td>
          </tr>
          <tr class="">
            <td class=""><h3 class=""><a class="" href="https://github.com/rezansrv/Employees-List-Vue">Employees-List-Vue</a> <!----></h3>
              <p data-v-0fea1b4d="">✩ 4</p>
              <p data-v-0fea1b4d="">Employees List with Vue2 and api with Json Server have login and registry pages with routing and have task Todo list with using vuex
              </p></td>
          </tr>
          <tr class="">
            <td class=""><h3 class=""><a class="" href="https://github.com/rezansrv/Reza_photo_gallery">Reza_photo_gallery</a> <!----></h3>
              <p data-v-0fea1b4d="">✩ 4</p>
              <p data-v-0fea1b4d="">Building a personal site to display and download photos taken by myself with lazy loading photos
              </p></td>
          </tr>
          <tr class="">
            <td class=""><h3 class=""><a class="" href="https://github.com/rezansrv/Admin-Dashboard">Admin-Dashboard</a> <!----></h3>
              <p data-v-0fea1b4d="">✩ 4</p>
              <p data-v-0fea1b4d="">Responsive Admin Dashboard Using HTML CSS & JavaScript with Light & Dark Mode
              </p></td>
          </tr>
          <tr class="">
            <td class=""><h3 class=""><a class="" href="https://github.com/rezansrv/weatherApp">weatherApp</a> <!----></h3>
              <p data-v-0fea1b4d="">✩ 3</p>
              <p data-v-0fea1b4d="">Weather app with openweather API
              </p></td>
          </tr>
          <tr class="">
            <td class=""><h3 class=""><a class="" href="https://github.com/rezansrv/DFA-Minimizetion-JS">DFA-Minimizetion-JS</a> <!----></h3>
              <p data-v-0fea1b4d="">✩ 3</p>
              <p data-v-0fea1b4d="">A tool that minimizes deterministic finite automata with a visual interactive graph.
                start drawing and minimizing DFAs!
              </p></td>
          </tr>
          <tr class="">
            <td class=""><h3 class=""><a class="" href="https://github.com/rezansrv/Natural-language-processing-NLP-">Natural-language-processing-NLP-</a> <!----></h3>
              <p data-v-0fea1b4d="">✩ 3</p>
              <p data-v-0fea1b4d="">Multilingual NLP Text Processing in Python
              </p></td>
          </tr>
          <tr class="">
            <td class=""><h3 class=""><a class="" href="https://github.com/rezansrv/website-health-check">website-health-check</a> <!----></h3>
              <p data-v-0fea1b4d="">✩ 4</p>
              <p data-v-0fea1b4d="">A simple version of checking the health of websites with bash script.
              </p></td>
          </tr>
          </tbody>
        </table>
      </section>
    </main>
    <FooterApp/>
  </div>
</template>

<script>
import Head from '../components/utils/HeaderApp.vue';
import FooterApp from '../components/utils/FooterApp.vue'

export default {
  name: 'App',
  components: {
    Head,
    FooterApp
  }
}
</script>

<style scoped>
.projects{
  margin-top: 64px;
}
.projectheading{
  position: fixed;
  top: 55%;
  left: 10px;
  transform: translateY(-50%) rotate(90deg);
  font-family: 'Gotham XNarrow A', 'Gotham XNarrow B', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif;
  text-transform: uppercase;
  font-weight: 500;
  font-style: normal;
  font-size: 5vmin;
 margin-bottom: 30px;
  color: #fff;
  z-index: 999;
}

.github{
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  width: 520px;
}
.github h2{
  font-size: 40px;
  font-family: Gotham XNarrow A,Gotham XNarrow B,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;
  text-transform: uppercase;
  font-weight: 500;
  font-style: normal;
  color: #fff;
}

.github-table{
  border-collapse: collapse;
  margin-top: 32px;
}
.github-table td p{
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 15px;
}
.github-table td:hover{
  filter: brightness(150%);
  transition: all .7s ease;
}
.github-table td{
  border-bottom: 1px solid #4b4a4a;
  padding:0.8rem 0.4rem 0.8rem 0.4rem;
  text-align: left;
}
.github-table td h3 {
  padding-bottom: 5px;
  font-size: 25px;
  font-family: Gotham XNarrow A,Gotham XNarrow B,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;
  text-transform: uppercase;
  font-weight: 500;
  font-style: normal;
  color: #fff;
}
.github h3 a {
  color: #dcdbdb;
  font-weight: 700;
}

a, a:active, a:visited, p a, p a:active, p a:visited {
  text-decoration: none;
  color: #fff;
  font-weight: 700;
}

li[data-v-0fea1b4d], p[data-v-0fea1b4d] {
  color: #b5b3b3;
  font-size: 18px;
}
@media (max-width: 780px) {
  .projects{
    margin-top: 35px;
    padding: 20px;
  }
  .github{
    max-width: 345px;
  }
  .projectheading{
    display: flex;
    transform: none;
    position: static;
    justify-content: center;
    margin:0 auto 64px auto;
    outline-style: double;
    max-width: 345px;
  }
}
</style>
