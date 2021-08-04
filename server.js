const process = require("process");
const { spawn } = require("child_process");
  // const mjpgStreamer = spawn("mjpg_streamer");
  const mjpgStreamer = spawn("mjpg_streamer", [
    "-i",
    "input_uvc.so",
    "-o",
    "output_http.so -p 8080"
  ]);
  mjpgStreamer.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  
  mjpgStreamer.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  mjpgStreamer.on('close', (code) => {
    console.log(`mjpgStreamer exited with code: ${code}`);
    process.exit();
  });


process.on("beforeExit", (code) => {
  mjpgStreamer.kill();
});

// dotenv for environment variables??
const path = require("path");

const express = require("express");
const app = express();

// CONSTANTS:
const PORT = 3000;
const PUBLIC_FOLDER = path.join(__dirname, "public");

// DEFINE MIDDLEWARE:
app.use((req, res, next) => {
  console.log(`${req.ip} requesting: ${req.url}`);
  next();
});

app.get("/webcam*", (req, res) => {
  res.redirect("http://192.168.1.202:8080/?action=stream");
});

app.use(express.static(PUBLIC_FOLDER));

// START SERVER:
app.listen(PORT, () => {
  console.info(`Listening on Port ${PORT}`);
});
