const express = require("express");
const app = express();

const PORT = 3000;
const WEB_FOLDER = __dirname + "/web";

app.use("/", express.static(WEB_FOLDER));

app.listen(PORT, () => {
  console.info(`Listening on port ${PORT} | Web Content in ${WEB_FOLDER}`);
});
