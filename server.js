"use strict";

// NODE MODULES
const path = require("path");
const http = require("http");
const process = require("process");
const { spawn } = require("child_process");
const exec = require("child_process").exec;

// 3rd PARTY MODULES
const auth = require("http-auth"); // https://github.com/gevorg/http-auth
const express = require("express"); // https://expressjs.com/
const { createProxyMiddleware } = require("http-proxy-middleware"); // https://github.com/chimurai/http-proxy-middleware

// DEV OPTION for testing on non-linux:
function Gpio() {}
if (process.platform == "linux") {
  Gpio = require("onoff").Gpio; // https://github.com/fivdi/onoff
}

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
  // process.exit(); // shut down when mjpg streamer startup fails
});

// GPIO
const output = [
  new Gpio(13, "out"), // 0: Rotator (13)
  new Gpio(19, "out"), // 1: Dispenser Right (19)
  new Gpio(26, "out"), // 2: Dispenser Left (26)
];
const outputActivationTime = [400, 1500, 1500]; // in milliseconds
const outputCanOnlyActivateOnce = [false, false, false]; // @todo set activation limits
let outputReady = [true, true, true]; // startUp ready-state

// CREATE WEBCAM PROXY
const proxyOptions = {
  target: "http://192.168.1.202:8080", // target host
  ws: true, // proxy websockets
  pathRewrite: {
    "^/webcam": "/?action=stream", // rewrite path
  },
};
const proxy = createProxyMiddleware(proxyOptions);

// EXPRESS FLOW:
const app = express();

app.use((req, res, next) => {
  console.log(
    `${new Date().toTimeString()}:: ${req.ip} Requesting: ${req.url}`
  );
  next();
});

app.post("/shutdown-pi", (req, res) => {
  console.log("::shutdown command executing::");

  // allow user to shutdown / reboot without sudo access:
  //
  // sudo visudo
  // add : [username] ALL=(ALL) NOPASSWD: /sbin/poweroff, /sbin/reboot, /sbin/shutdown

  exec("sudo shutdown now", (error, stdout, stderr) => {
    if (error) {
      console.log("Out", stdout);
      console.log("Err", stderr);
      console.error(`Exec error: ${error}`);
      res.sendStatus(500);
    }
    res.sendStatus(202);
  });
});

// FOR TESTING:
// app.post("/button:number", (req, res) => {
//   res.sendStatus(200);
// });

// IN PRODUCTION:
app.post("/button:number", (req, res) => {
  const number = parseInt(req.params.number);
  console.log(
    `${new Date().toTimeString()}:: ${req.ip} Clicked Button: ${number}`
  );

  if (outputReady[number] === true) {
    output[number].write(1); // turn on
    outputReady[number] = false; // de-activate

    setTimeout(() => {
      output[number].write(0); // turn off

      // re-activate:
      if (outputCanOnlyActivateOnce[number] === false) {
        outputReady[number] = true;
      }
    }, outputActivationTime[number]);

    res.sendStatus(200); // respond to client with OK
  } else {
    // NOT ready:
    console.log(
      `${new Date().toTimeString()}:: ${
        req.ip
      } Clicked Button: ${number} - NOT READY YET!!`
    );
    res.sendStatus(500); // respond with server error
  }
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
  output.forEach((output) => {
    output.unexport();
  });

  // close mjpg_streamer:
  mjpgStreamer.kill();
});
