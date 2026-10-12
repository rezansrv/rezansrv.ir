<template>
  <section
    class="hero"
    style="background-image: url('/images/backGround.jpg')"
    aria-labelledby="hero-heading"
  >
    <h2
      id="hero-heading"
      class="visually-hidden"
    >
      I make things
    </h2>
    <svg
      class="hero__canvas"
      viewBox="0 0 1440 810"
      role="img"
      aria-labelledby="hero-title hero-description"
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="hero-title">I make things</title>
      <desc id="hero-description">A temporary static version of the original animated network hero.</desc>
      <text
        class="text-glitch"
        x="50%"
        y="50%"
        text-anchor="middle"
      >I make things</text>
    </svg>
  </section>
</template>

<style scoped>
.hero {
  width: 100%;
  height: 90vh;
  min-height: 420px;
  overflow: hidden;
  background-repeat: no-repeat;
  background-position: 65% center;
  background-size: cover;
}

.hero__canvas {
  width: 100%;
  height: 100%;
}

.text-glitch {
  fill: #fff;
  font-family: "Gotham XNarrow A", "Gotham XNarrow B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 11.5vw;
  font-weight: bold;
  text-transform: uppercase;
  animation: glitch 2s steps(20) infinite;
}

@media (max-width: 600px) {
  .text-glitch {
    font-size: 12.25vw;
  }
}

@keyframes glitch {
  0%, 85%, 100% { text-shadow: 1px 0 0 red, -1px 0 0 blue; }
  88% { text-shadow: 5px 0 0 red, -5px 0 0 blue; }
  91% { text-shadow: -3px 0 0 blue, 3px 0 0 lime; }
  94% { text-shadow: 7px 0 0 blue, -7px 0 0 lime; }
  97% { text-shadow: -2px 0 0 red, 2px 0 0 blue; }
}
</style>
