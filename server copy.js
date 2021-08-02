// dotenv for environment variables??
const path = require("path");

const express = require("express");
const app = express();

const NodeWebcam = require("node-webcam");
const { resolve } = require("path");
const { get } = require("https");

// CONSTANTS:
const PORT = 3000;
const PUBLIC_FOLDER = path.join(__dirname, "public");
let time = performance.now();
let lastTime = 0;

let options = {
  //Picture related
  width: 1280,
  height: 720,
  quality: 20,

  // Number of frames to capture
  // More the frames, longer it takes to capture
  // Use higher framerate for quality. Ex: 60
  frames: 1,

  //Save shots in memory
  saveShots: true,

  // [jpeg, png] support varies
  // Webcam.OutputTypes
  output: "jpeg",

  //Which camera to use
  //Use Webcam.list() for results
  //false for default device
  device: false,

  // [location, buffer, base64]
  // Webcam.CallbackReturnTypes
  callbackReturn: "location",

  //Logging
  verbose: false,
};

const webcam = new NodeWebcam.create(options);

function getImage() {
  return new Promise((resolve, reject) => {
    webcam.capture("image", function (err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

// DEFINE MIDDLEWARE:
app.use((req, res, next) => {
  console.log(`${req.ip} requesting: ${req.url}`);
  next();
});

app.get("/webcam*", async (req, res) => {
  if (performance.now() - lastTime > 1000) {
    await getImage().then(() => {
      console.log("captured");
      res.sendFile(path.join(__dirname, "image.jpg"));
    });
    lastTime = performance.now();
  } else {
    res.sendFile(path.join(__dirname, "image.jpg"));
  }
});

app.use(express.static(PUBLIC_FOLDER));

// START SERVER:
app.listen(PORT, () => {
  console.info(`Listening on Port ${PORT}`);
});
