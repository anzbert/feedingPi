const feedButtons = document.querySelectorAll(".feed-button");

feedButtons.forEach((button, number) =>{
  button.addEventListener("click", () => {
    fetch(`/button${number}`, { method: "POST" })
      .then(function (response) {
        if (response.ok) {
          console.log(`Button ${number} click recorded`);
          return;
        }
        throw new Error(`Request from button ${number} failed.`);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

})


const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const button3 = document.getElementById("button3");

button.addEventListener("click", () => {
  fetch("/button1", { method: "POST" })
    .then(function (response) {
      if (response.ok) {
        console.log("Click was recorded");
        return;
      }
      throw new Error("Request failed.");
    })
    .catch(function (error) {
      console.log(error);
    });
});
