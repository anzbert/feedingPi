// REQUIRE MODULES
const path = require("path");
const express = require("express");
const process = require("process");
const { spawn } = require("child_process");
const { createProxyMiddleware } = require("http-proxy-middleware");

// DEV OPTION TO LOG ALL ERRORS INSTEAD OF EXITING:
process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

// DEFINE GLOBAL CONSTANTS:
const PORT = 3000;
const PUBLIC_FOLDER = path.join(__dirname, "public");

// LAUNCH AND KILL MJPG STREAMER:
  const mjpgStreamer = spawn("mjpg_streamer", [
    "--no_dynctrl",
    "-i",
    "input_uvc.so -r 1280x720",
    "-o",
    "output_http.so -p 8080"
  ]);

  mjpgStreamer.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });
  mjpgStreamer.stderr.on("data", (data) => {
    console.error(`stdlog: ${data}`);
  });
  mjpgStreamer.on("close", (code) => {
    console.log(`mjpgStreamer exited with code: ${code}`);
    process.exit();
  });

  process.on("beforeExit", (code) => {
    mjpgStreamer.kill();
  });


// PROXY
const proxyOptions = {
  target: "http://127.0.0.1:8080", // target host
  // changeOrigin: true, // needed for virtual hosted sites
  ws: true, // proxy websockets
  pathRewrite: {
    '^/webcam': '/?action=stream', // rewrite path
  }
};
const proxy = createProxyMiddleware(proxyOptions);

// EXPRESS:
const app = express();

app.use((req, res, next) => {
  console.log(`${req.ip} requesting: ${req.url}`);
  next();
});

app.use("/webcam", proxy);

// app.get("/webcam*", (req, res) => {
//   // res.redirect("http://192.168.1.202:8080/?action=stream");

// });

app.use(express.static(PUBLIC_FOLDER));

// START HTTP SERVER:
app.listen(PORT, () => {
  console.info(`NODE SERVER - Listening on Port ${PORT}`);
});
