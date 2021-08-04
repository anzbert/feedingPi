// REQUIRE MODULES
const path = require("path");
const http = require("http");
const express = require("express");
const process = require("process");
const { spawn } = require("child_process");
const { createProxyMiddleware } = require("http-proxy-middleware");
const Gpio = require("onoff").Gpio;

const utils = require("./node_modules/http-auth/src/auth/utils");
const auth = require("http-auth");
const digest = auth.digest(
  {
    realm: "piFeeder",
  },
  (username, callback) => {
    // Expecting md5(username:realm:password) in callback.
    if (username === "feed") {
      callback(utils.md5("feed:piFeeder:mepie"));
    } else {
      callback();
    }
  }
);

// DEV OPTION TO LOG ALL ERRORS INSTEAD OF EXITING:
process.on("uncaughtException", function (error) {
  console.log(error.stack);
});

// DEFINE GLOBAL CONSTANTS:
const PORT = 3000;
const PUBLIC_FOLDER = path.join(__dirname, "public");

// LAUNCH AND LOG FROM MJPG STREAMER:
const mjpgStreamer = spawn("mjpg_streamer", [
  "-i",
  "input_uvc.so --no_dynctrl -r 1280x720",
  "-o",
  "output_http.so -p 8080",
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

// PROXY
const proxyOptions = {
  target: "http://127.0.0.1:8080", // target host
  ws: true, // proxy websockets
  pathRewrite: {
    "^/webcam": "/?action=stream", // rewrite path
  },
};
const proxy = createProxyMiddleware(proxyOptions);

// EXPRESS:
const app = express();

app.post("/button:number", (req, res) => {
  const number = req.params.number;
  console.log(`Button ${number} click received at ${new Date()}`);

  res.sendStatus(200); // respond to client with OK
});

app.use((req, res, next) => {
  console.log(`${req.ip} requesting: ${req.url}`);
  next();
});

app.use("/webcam", proxy);

app.use(express.static(PUBLIC_FOLDER));

// START HTTP SERVER:
// app.listen(PORT, () => {
//   console.log("\n", `NODE SERVER - Listening on Port ${PORT}`, "\n");
// });

http
  .createServer(
    digest.check(app)
  )
  .listen(PORT, () => {
    console.log("\n", `NODE SERVER - Listening on Port ${PORT}`, "\n");
  });

// CLOSING ACTIONS:
process.on("beforeExit", (code) => {
  // disconnect Gpio here:

  // button.unexport();

  // close mjpg_streamer:
  mjpgStreamer.kill();
});
