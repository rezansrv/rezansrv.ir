<script setup lang="ts">
import { createPersonSchema } from '~/utils/profile'

const title = 'Reza Naserivand | Software Engineer'
const description = 'Reza Naserivand is a software engineer working across reliable web applications, data-intensive systems, and applied artificial intelligence.'

useSiteSeo({
  path: '/',
  title,
  description,
})

useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: '/images/backGround.jpg',
      type: 'image/jpeg',
      fetchpriority: 'high',
    },
  ],
  script: [
    {
      key: 'person-json-ld',
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        ...createPersonSchema(description),
      }),
    },
  ],
})
</script>

<template>
  <main>
    <HomeHero />
    <HomeAbout />
  </main>
</template>
