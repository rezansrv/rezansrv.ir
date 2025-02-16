<template>
  <div class="welcome-container">
    <div class="center">
      <div class="card">
        <div class="image-container">
          <div class="profile-image">
            <img loading="lazy" src="../../assets/images/me.jpg" alt="profile-image">
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
  </div>
</template>

<style scoped>
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  font-family: Barlow, sans-serif;
  padding: 150px 50px 80px;
}

.center {
  max-width: 850px;
  color: #fff;
  align-items: center;
}

.card {
  position: relative;
  border-radius: 16px;
  border: 1px solid transparent;
  padding: 32px;
  background: #0F0620;
  color: #fff;
  isolation: isolate;
}


.image-container {
  position: relative;
}

.profile-image img {
  width: 220px;
  height: 220px;
  background-size: cover;
  border-radius: 50%;
  float: left;
  margin-right: 20px;
  text-align: left;
}

.text-container {
  flex: 1;
}

h1 {
  font-size: 36px;
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 15px;
  text-align: justify;
}

@media (max-width: 600px) {
  .welcome-container {
    flex-direction: column;
  }
  .image-container {
    display: flex;
    justify-content: center;
  }
  .profile-image {
    display: flex;
    text-align: center;
    margin: 25px 0;
  }
}
</style>
