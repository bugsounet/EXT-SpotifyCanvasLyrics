"use strict"

var NodeHelper = require("node_helper")
var logSCL = (...args) => { /* do nothing */ }
var {PythonShell} = require('python-shell')
var request = require("request")

module.exports = NodeHelper.create({
  start: function () {
    this.CLServer = null
    this.SpotifyCurrentID = null
  },

  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        console.log("[SPOTIFYCL] EXT-SpotifyCanvasLyrics Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        this.initialize(payload)
        break
    }
  },

  initialize: function (config) {
    this.config = config
    if (this.config.debug) logSCL = (...args) => { console.log("[SPOTIFYCL]", ...args) }
    if (!this.config.email || !this.config.password) {
      this.sendSocketNotification("ERROR", "[SPOTIFYCL] Email or Password not found!")
      return console.error("[SPOTIFYCL] email or password not found!")
    }

    let options = {
      mode: 'text',
      pythonOptions: ['-u'],
      scriptPath: __dirname + "/server/src",
      env: {
        SPOTIFY_USERNAME: this.config.email,
        SPOTIFY_PASSWORD: this.config.password,
        HOST_ORIGIN: "http://127.0.0.1:2411"
      }
    }

    this.CLServer = new PythonShell('main.py', options)

    this.CLServer.on('message', function (message) {
      logSCL(message)
    })
    this.CLServer.on('stderr', function (stderr) {
      console.log("[SPOTIFYCL]", stderr)
    })
    this.CLServer.on('stdout', function (stdout) {
      console.log("[SPOTIFYCL]", stdout)
    })
  }
})
