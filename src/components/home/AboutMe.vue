<template>
  <div class="welcome-container">
    <div class="center">
      <div class="image-container">
        <div class="profile-image" >
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
</template>

<style scoped>
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000000;
  font-family: Barlow, Barlow fallback, sans-serif;
  padding: 80px 50px 50px;
}

.center {
  max-width: 800px;
  color: #ffffff;
  align-items: center;
}

.image-container {
  position: relative;
}

.profile-image img {
  width: 220px;
  height: 220px;
  //background-image: url("../../assets/images/me.jpg");
  background-size: cover;
  border-radius: 50%;
  //shape-outside: circle(50%);
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
}
@media (max-width: 600px) {
  .welcome-container {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;

  }
  .image-container {
    position: relative;
    display: flex;
    justify-items: center;
    justify-content: center;
  }
  .profile-image{
    display: flex;
    shape-outside: none;
    text-align: center;
    margin: 25px 25px 64px;
  }
}
</style>
