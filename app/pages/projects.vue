<script setup lang="ts">
import projectsData from '~~/data/projectsList.json'
import type { Project } from '~/types/content'

const projects = projectsData satisfies Project[]
const canonicalUrl = 'https://rezansrv.ir/projects'
const description = 'Selected open-source projects by Reza Naserivand.'

useSeoMeta({
  title: 'Projects | Reza Naserivand',
  description,
  ogTitle: 'Projects | Reza Naserivand',
  ogDescription: description,
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary',
  twitterTitle: 'Projects | Reza Naserivand',
  twitterDescription: description,
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
</script>

<template>
  <main class="projects">
    <section class="projectheading animate__animated animate__zoomInUp">
      <h1>Projects</h1>
    </section>
    <ProjectsList :projects="projects" />
  </main>
</template>

<style scoped>
.projects {
  margin-top: 64px;
}

.projectheading {
  position: fixed;
  top: 55%;
  left: 10px;
  z-index: 999;
  margin-bottom: 30px;
  transform: translateY(-50%) rotate(90deg);
  color: #fff;
  font-family: "Gotham XNarrow A", "Gotham XNarrow B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 5vmin;
  font-style: normal;
  font-weight: 500;
  text-transform: uppercase;
}

@media (max-width: 780px) {
  .projects {
    padding: 20px;
    margin-top: 35px;
  }

  .projectheading {
    position: static;
    display: flex;
    justify-content: center;
    max-width: 345px;
    margin: 0 auto 64px;
    outline-style: double;
    transform: none;
  }
}
</style>
