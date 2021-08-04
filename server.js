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
    "-i",
    "input_uvc.so --no_dynctrl -r 1280x720",
    "-o",
    "output_http.so -p 8080"
  ]);

  mjpgStreamer.stdout.on("data", (data) => {
    console.log(`MJPG out: ${data}`);
  });
  mjpgStreamer.stderr.on("data", (data) => {
    console.error(`MJPG log: ${data}`);
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

app.use(express.static(PUBLIC_FOLDER));

// START HTTP SERVER:
app.listen(PORT, () => {
  console.log('\n',`NODE SERVER - Listening on Port ${PORT}`,'\n');
});
