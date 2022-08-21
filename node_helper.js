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
      case "SEARCH_CL":
        this.searchCL(payload)
        break
    }
  },

  initialize: function (config) {
    this.config = config
    if (this.config.debug) logSCL = (...args) => { console.log("[SPOTIFYCL]", ...args) }
    if (!this.config.email || !this.config.password) {
      this.sendSocketNotification("ERROR", "Email or Password not found!")
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
  },

  searchCL: function (item) {
    if (!item || !item.id || (this.SpotifyCurrentID == item.id)) return

    this.SpotifyCurrentID = item.id
    var canvas = () => {
      request(
        {
          url: "http://127.0.0.1:2411/api/canvas/"+item.id,
          method: "GET",
          json: true
        },
        (error, response, body) => {
          if (error) {
            this.SpotifyCurrentID = null
            return console.error("[SPOTIFYCL] API return", error.code)
          }
          if (body) {
            if (body.success == "true") {
              this.sendSocketNotification("CANVAS", body.canvas_url)
              logSCL("SEND:", body.canvas_url)
            }
          }
        }
      )
    }
    canvas()
  }
})
