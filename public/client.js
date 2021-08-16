"use strict";

const confirmBubble = document.querySelector(".confirm");
confirmBubble.addEventListener("animationend", () => {
  confirmBubble.classList.toggle("show-confirm", false);
});
const confirmSound = new Audio("audio/boing.mp4");

const feedButtons = document.querySelectorAll(".feed-buttons");
feedButtons.forEach((button, number) => {
  button.addEventListener("click", () => {
    fetch(`/button${number}`, { method: "POST" })
      .then((response) => {
        if (response.ok) {
          console.log(`Button ${number} activation successful!`);

          confirmSound.currentTime = 0; // immediately rewind sound to start
          confirmSound.play();

          confirmBubble.classList.toggle("show-confirm", true);
          confirmBubble.style.animation = "none";
          confirmBubble.offsetWidth; // reset animation by triggering DOM reflow
          confirmBubble.style.animation = "wobble-hor-top 0.8s both";

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
    fetch("/shutdown-pi", { method: "POST" })
      .then((response) => {
        if (response.ok) console.log("Shutting down Raspberry Pi........");
        else console.log("Shut down signal failed");
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
