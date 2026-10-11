<script setup lang="ts">
import type { Post } from '~/types/content'

defineProps<{
  posts: readonly Post[]
}>()
</script>

<template>
  <section class="posts-head animate__animated animate__zoomInUp">
    <h2>Blog Post</h2>
    <table class="posts-table">
      <tbody>
        <tr
          v-for="post in posts"
          :key="post.id"
        >
          <td>
            <h3>
              <a :href="post.link">{{ post.title }}</a>
            </h3>
            <p class="post-publish">
              Published on {{ post.publishDate }}, on
              <a :href="post.source">{{ post.source }}</a>.
              <span class="post-publish__time">time: {{ post.readingTime }}</span>
            </p>
            <p class="post-describe">
              {{ post.description }}
            </p>
            <a
              :href="post.link"
              class="seepost"
            >see post ⟶</a>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.posts-head {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 520px;
  margin: 0 auto;
}

.posts-head h2 {
  color: #fff;
  font-family: "Gotham XNarrow A", "Gotham XNarrow B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 40px;
  font-style: normal;
  font-weight: 500;
  text-transform: uppercase;
}

.posts-table {
  margin-top: 32px;
  border-collapse: collapse;
}

.posts-table td {
  padding: 0.8rem 0.4rem;
  border-bottom: 1px solid #4b4a4a;
  text-align: left;
}

.posts-table td:hover {
  filter: brightness(150%);
  transition: filter 0.7s ease;
}

.posts-table tr:last-child td {
  border-bottom: none;
}

.posts-table td h3 {
  padding-bottom: 5px;
  color: #fff;
  font-family: "Gotham XNarrow A", "Gotham XNarrow B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 25px;
  font-style: normal;
  font-weight: 500;
  text-transform: uppercase;
}

.posts-table a,
.posts-table a:active,
.posts-table a:visited {
  color: #fff;
  font-weight: 700;
  text-decoration: none;
}

.post-publish {
  margin-bottom: 15px;
  color: #fff;
  font-family: "Gotham XNarrow A", "Gotham XNarrow B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

.post-publish__time {
  margin-left: 8px;
}

.post-describe {
  margin-bottom: 15px;
  color: #b5b3b3;
  font-size: 17px;
  line-height: 1.6;
}

.posts-table .seepost {
  display: flex;
  align-items: center;
  width: 110px;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 20px;
  background: #aa0753;
  box-shadow: 2px 5px 10px 2px #000;
  color: #fff;
  font-family: "Gotham XNarrow A", "Gotham XNarrow B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 13px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transition: all 0.35s ease;
}

.posts-table .seepost:hover {
  margin-left: 10px;
  background: #dcdbdb;
  color: #aa0753;
}

@media (max-width: 780px) {
  .posts-head {
    width: 100%;
    max-width: 345px;
  }
}
</style>
