const bellBubble = document.querySelector(".bell-ring");
bellBubble.addEventListener("animationend", () => {
  bellBubble.classList.toggle("show-bell-ring", false);
});
const bellSound = new Audio("audio/boing.mp4");

const feedButtons = document.querySelectorAll(".feed-buttons");

feedButtons.forEach((button, number) => {
  button.addEventListener("click", () => {
    fetch(`/button${number}`, { method: "POST" })
      .then((response) => {
        if (response.ok) {
          console.log(`Button ${number} activation successful!`);

          // if bell button:
          if (number === 2) {
            bellSound.currentTime = 0; // immediately rewind to start
            bellSound.play();
            bellBubble.classList.toggle("show-bell-ring", true);
          }
          return;
        }

        console.log(`Button ${number} not ready...`);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

// SHUTDOWN BUTTON
const shutdownButton = document.querySelector(".shutdown-button");
shutdownButton.addEventListener("click", () => {
  let result = window.confirm("Really shut down the Server?");
  if (result) {
    fetch("/shutdown-pi", { method: POST })
      .then((response) => {
        console.log("Shutting down Raspberry Pi........");
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
