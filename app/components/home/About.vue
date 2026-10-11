<template>
  <section class="welcome-container">
    <div class="center">
      <div class="card">
        <div class="image-container">
          <div class="profile-image">
            <img
              src="/images/me.jpg"
              alt="Reza Naserivand"
              width="220"
              height="220"
              loading="lazy"
            >
          </div>
        </div>
        <div class="text-container">
          <h1>Hello!</h1>
          <p>
            I’m Reza Naserivand, a front-end developer with experience
            in creating immersive and user-friendly interfaces. My focus is on crafting visually
            appealing designs that deliver exceptional user experiences.
          </p>
          <p>
            I’m skilled in JavaScript, React, Vue.js, and Git, which allows me to build dynamic
            and engaging web applications with an emphasis on efficient deployment.
            I’m committed to staying up-to-date with the latest front-end technologies
            and industry best practices, ensuring that I can provide cutting-edge solutions.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.welcome-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 150px 50px 80px;
  background-color: #000;
  font-family: Barlow, sans-serif;
}

.center {
  max-width: 850px;
  color: #fff;
}

.card {
  position: relative;
  padding: 32px;
  border: 1px solid transparent;
  border-radius: 16px;
  isolation: isolate;
  background: #0f0620;
  color: #fff;
}

.profile-image img {
  float: left;
  width: 220px;
  height: 220px;
  margin-right: 20px;
  border-radius: 50%;
  object-fit: cover;
}

h1 {
  margin-bottom: 20px;
  font-size: 36px;
}

p {
  margin-bottom: 15px;
  font-size: 18px;
  line-height: 1.6;
  text-align: justify;
  hyphens: auto;
}

@media (max-width: 600px) {
  .welcome-container {
    flex-direction: column;
    padding: 80px 20px 60px;
  }

  .image-container,
  .profile-image {
    display: flex;
    justify-content: center;
  }

  .profile-image img {
    float: none;
    margin: 25px 0;
  }
}
</style>
