const bellBubble = document.querySelector(".bell-ring");
bellBubble.addEventListener("animationend", () => {
  bellBubble.classList.toggle("show-bell-ring", false);
});
const bellSound = new Audio("audio/anime_boing.mp4");
// console.log(bellSound);

const feedButtons = document.querySelectorAll(".feed-buttons");

feedButtons.forEach((button, number) => {
  button.addEventListener("click", () => {
    fetch(`/button${number}`, { method: "POST" })
      .then(function (response) {
        if (response.ok) {
          console.log(`Button ${number} activation successful!`);

          // if bell button:
          if (number === 2) {
            bellSound.currentTime=0;
            bellSound.play();
            bellBubble.classList.toggle("show-bell-ring", true);
          }
          return;
        }
        
        console.log(`Button ${number} not ready...`);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
});

// maybe shutdown button?
