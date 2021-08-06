const feedButtons = document.querySelectorAll(".feed-buttons");

feedButtons.forEach((button, number) => {
  button.addEventListener("click", () => {
    fetch(`/button${number}`, { method: "POST" })
      .then(function (response) {
        if (response.ok) {
          console.log(`Button ${number} activation successful!`);
          return;
        }
        console.log(`Button ${number} not ready...`);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
});
