// const camImage = document.getElementById("webcam");

// camImage.onload = () => {
//   console.log("loaded");
//   let myImage = new Image(1280, 720);
//   myImage.src = "/webcam";
//   document.body.appendChild(myImage);
// };

// let myImage = new Image(1280, 720);
//   myImage.src = "/webcam" + new Date().getTime();
//   document.body.appendChild(myImage);

// myImage.onload = () => {
// console.log("done");
//     myImage.src = "/webcam"+ new Date().getTime();;

// }

// Selecting the iframe element
const frame = document.getElementById("cam-frame");
          
// Adjusting the iframe height onload event
frame.onload = function()
// function execute while load the iframe
{
  // set the height of the iframe as 
  // the height of the iframe content
  frame.style.height = 
  frame.contentWindow.document.body.scrollHeight + 'px';
   

 // set the width of the iframe as the 
 // width of the iframe content
 frame.style.width  = 
  frame.contentWindow.document.body.scrollWidth+'px';
      
}
