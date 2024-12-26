<template>
  <div>
    <Head />
    <main class="projects">
      <section class="projectheading animate__animated animate__zoomInUp">
        <h1>Projects</h1>
      </section>
      <ProjectList :projects="projects" />
    </main>
    <FooterApp />
  </div>
</template>

<script>
import Head from '../components/utils/HeaderApp.vue';
import FooterApp from '../components/utils/FooterApp.vue';
import ProjectList from '../components/projects/ProjectsMain.vue';
import projects from '../../data/projectsList';

export default {
  name: 'App',
  components: {
    Head,
    FooterApp,
    ProjectList
  },
  data() {
    return {
      projects
    };
  }
};
</script>

<style scoped>
.projects {
  margin-top: 64px;
}

.projectheading {
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

@media (max-width: 780px) {
  .projects {
    margin-top: 35px;
    padding: 20px;
  }

  .projectheading {
    display: flex;
    transform: none;
    position: static;
    justify-content: center;
    margin: 0 auto 64px auto;
    outline-style: double;
    max-width: 345px;
  }
}
</style>