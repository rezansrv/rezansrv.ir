<script setup lang="ts">
import type { Project } from '~/types/content'

defineProps<{
  projects: readonly Project[]
}>()
</script>

<template>
  <section class="github animate__animated animate__zoomInUp">
    <h2>github</h2>
    <table class="github-table">
      <tbody>
        <tr
          v-for="project in projects"
          :key="project.name"
        >
          <td>
            <h3>
              <a :href="project.url">{{ project.name }}</a>
            </h3>
            <p>✩ {{ project.stars }}</p>
            <p>{{ project.description }}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.github {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 520px;
  margin: 0 auto;
}

.github h2 {
  color: #fff;
  font-family: "Gotham XNarrow A", "Gotham XNarrow B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 40px;
  font-style: normal;
  font-weight: 500;
  text-transform: uppercase;
}

.github-table {
  margin-top: 32px;
  border-collapse: collapse;
}

.github-table td {
  padding: 0.8rem 0.4rem;
  border-bottom: 1px solid #4b4a4a;
  text-align: left;
}

.github-table td:hover {
  filter: brightness(150%);
  transition: filter 0.7s ease;
}

.github-table tr:last-child td {
  border-bottom: none;
}

.github-table td h3 {
  padding-bottom: 5px;
  color: #fff;
  font-family: "Gotham XNarrow A", "Gotham XNarrow B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 25px;
  font-style: normal;
  font-weight: 500;
  text-transform: uppercase;
}

.github-table p {
  margin-bottom: 15px;
  color: #b5b3b3;
  font-size: 18px;
  line-height: 1.6;
}

.github h3 a,
.github h3 a:active,
.github h3 a:visited {
  color: #dcdbdb;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 780px) {
  .github {
    width: 100%;
    max-width: 345px;
  }
}
</style>
