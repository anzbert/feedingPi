# Pi Feeder

## installation instructions
update Pi:

`sudo apt-get update`

`sudo apt-get upgrade`


clone this repo:

`git clone https://github.com/anzbert/feedingPi.git`

install mjpg streamer from:

https://github.com/jacksonliam/mjpg-streamer

install node from:

https://nodejs.org/en/download/ on ARMv7 or ARMv8 (Pi 2 and newer)

on ARMv6 (Pi 1 and Zero), follow these instructions:

https://hassancorrigan.com/blog/install-nodejs-on-a-raspberry-pi-zero/

inside repo folder, download dependencies with:

`npm install`

to start server enter:

`node server.js`

-------------------------

### included npm libraries:
- express
- http-proxy-middleware
- onoff
