// NODE MODULES
const path = require("path");
const http = require("http");
const process = require("process");
const { spawn } = require("child_process");

// 3rd PARTY MODULES
const auth = require("http-auth"); // https://github.com/gevorg/http-auth
const express = require("express"); // https://expressjs.com/
const { createProxyMiddleware } = require("http-proxy-middleware"); // https://github.com/chimurai/http-proxy-middleware
const Gpio = require("onoff").Gpio; // https://github.com/fivdi/onoff

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

// GPIO
const led = new Gpio(4, "out");
const rotateFeeder = new Gpio(2, "out");

const ledReady = 1;
const rotateFeederReady = 1;

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
  const number = parseInt(req.params.number);
  console.log(
    `${new Date().toTimeString()}:: ${req.ip} Clicked Button: ${number}`
  );

  switch (number) {
    case 0:
      if (ledReady === 1) {
        ledReady = 0;
        led.write(1);
        setTimeout(() => {
          led.write(0);
          ledReady = 1;
        }, 1000);
      } else console.log("led not ready");
      break;
    case 1:
      if (rotateFeederReady === 1) {
        rotateFeederReady = 0;
        solenoid.write(1);
        setTimeout(() => {
          solenoid.write(0);
          rotateFeederReady = 1;
        }, 200);
      } else console.log("rotateFeeder not ready");
      break;
  }

  res.sendStatus(200); // respond to client with OK
});

app.use((req, res, next) => {
  console.log(
    `${new Date().toTimeString()}:: ${req.ip} Requesting: ${req.url}`
  );
  next();
});

app.use("/webcam", proxy);

app.use(express.static(PUBLIC_FOLDER));

// START HTTP SERVER with DIGEST AUTH:
// Digest auth file made with htdigest (https://github.com/gevorg/htdigest/)
// Install globally with `npm -g install htdigest` and create file:
//      htdigest -c [path]/data/users.htdigest [realm] [username]
const digest = auth.digest({
  realm: "piFeeder",
  file: path.join(__dirname, "data", "users.htdigest"),
});

http.createServer(digest.check(app)).listen(PORT, () => {
  console.log("\n", `NODE SERVER - Listening on Port ${PORT}`, "\n");
});

// CLOSING ACTIONS:
process.on("beforeExit", (code) => {
  // disconnect Gpio here:
  led.unexport();
  solenoid.unexport();

  // close mjpg_streamer:
  mjpgStreamer.kill();
});
