<script setup lang="ts">
const canonicalUrl = 'https://rezansrv.ir/'
const description = 'رضا ناصری وند - Front End Developer. با تجربه در توسعه وب و طراحی رابط کاربری (UI/UX)'

useSeoMeta({
  title: 'Reza Naserivand | Front-End Developer',
  description,
  ogTitle: 'Reza Naserivand | Front-End Developer',
  ogDescription: description,
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary',
  twitterTitle: 'Reza Naserivand | Front-End Developer',
  twitterDescription: description,
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
</script>

<template>
  <main>
    <HomeHero />
    <HomeAbout />
  </main>
</template>
