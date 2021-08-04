const feedButtons = document.querySelectorAll(".feed-buttons");

feedButtons.forEach((button, number) => {
  button.addEventListener("click", () => {
    fetch(`/button${number}`, { method: "POST" })
      .then(function (response) {
        if (response.ok) {
          console.log(`Button ${number} click recorded`);
          return;
        }
        console.log(`Request from button ${number} failed.`);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
});
