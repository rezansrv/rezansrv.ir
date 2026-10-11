<script setup lang="ts">
import postsData from '~~/data/postsList.json'
import type { Post } from '~/types/content'

const posts = postsData satisfies Post[]
const canonicalUrl = 'https://rezansrv.ir/writing'
const description = 'Articles by Reza Naserivand about front-end development, security, and design patterns.'

useSeoMeta({
  title: 'Writing | Reza Naserivand',
  description,
  ogTitle: 'Writing | Reza Naserivand',
  ogDescription: description,
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary',
  twitterTitle: 'Writing | Reza Naserivand',
  twitterDescription: description,
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
</script>

<template>
  <main class="writings">
    <section class="projectheading animate__animated animate__zoomInUp">
      <h1>Writing</h1>
    </section>
    <WritingList :posts="posts" />
  </main>
</template>

<style scoped>
.writings {
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
  .writings {
    padding: 20px;
    margin-top: 35px;
  }

  .projectheading {
    position: static;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 345px;
    margin: 0 auto 64px;
    outline-style: double;
    transform: none;
  }
}
</style>
