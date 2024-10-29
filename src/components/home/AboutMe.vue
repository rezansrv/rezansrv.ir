<template>
  <div class="welcome-container">
    <div class="center">
      <div class="image-container">
        <div class="profile-image" ></div>
      </div>
      <div class="text-container">
        <h1>Welcome!</h1>
        <p>
          Reza Naserivand is a dedicated and highly skilled front-end developer with
          approximately 1 year of hands-on experience in crafting immersive and
          user-friendly interfaces. His primary focus is on creating visually
          captivating designs that provide exceptional user experiences.
        </p>
        <p>
          His technical proficiency includes JavaScript, React, Vue.js, and Git,
          empowering him to build dynamic and engaging web applications with a strong
          emphasis on efficient deployment. Reza remains committed to keeping pace
          with the latest front-end technologies and industry best practices,
          ensuring he can provide cutting-edge solutions.
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
  padding: 50px;
  padding-top: 80px;
}

.center {
  max-width: 800px;
  color: #ffffff;
  align-items: center;
}

.image-container {
  position: relative;
}

.profile-image {
  width: 220px;
  height: 220px;
  background-image: url("../../assets/images/me.jpg");
  background-size: cover;
  border-radius: 50%;
  shape-outside: circle(50%);
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
