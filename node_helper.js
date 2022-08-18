"use strict"

var NodeHelper = require("node_helper")
var logCANVAS = (...args) => { /* do nothing */ }
var {PythonShell} = require('python-shell')

module.exports = NodeHelper.create({
  start: function () {
    this.canvas = null
  },

  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        console.log("[CANVAS] EXT-SpotifyCanvas Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        this.initialize(payload)
      break
    }
  },

  initialize: function (config) {
    this.config = config
    if (this.config.debug) logCANVAS = (...args) => { console.log("[CANVAS]", ...args) }
    if (!this.config.email || !this.config.password) {
      this.sendSocketNotification("ERROR", "Email or Password not found!")
      return console.error("[CANVAS] email or password not found!")
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

    this.canvas = new PythonShell('main.py', options)

    this.canvas.on('message', function (message) {
      logCANVAS(message)
    })
    this.canvas.on('stderr', function (stderr) {
      console.log("[CANVAS]", stderr)
    })
    this.canvas.on('stdout', function (stdout) {
      console.log("[CANVAS]", stdout)
    })
  }
})
