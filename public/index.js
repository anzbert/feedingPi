// const camImage = document.getElementById("webcam");

// camImage.onload = () => {
//   console.log("loaded");
//   let myImage = new Image(1280, 720);
//   myImage.src = "/webcam";
//   document.body.appendChild(myImage);
// };

let myImage = new Image(1280, 720);
  myImage.src = "/webcam" + new Date().getTime();
  document.body.appendChild(myImage);

myImage.onload = () => {
console.log("done");
    myImage.src = "/webcam"+ new Date().getTime();;

}
