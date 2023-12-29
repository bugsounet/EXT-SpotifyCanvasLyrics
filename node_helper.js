"use strict"

var NodeHelper = require("node_helper")
var logSCL = (...args) => { /* do nothing */ }
const protoLoader = require('./components/proto-loader')
var {PythonShell} = require('python-shell')

module.exports = NodeHelper.create({
  start: function () {
    this.tokenLyrics = {}
    this.tokenCanvas = {}
    const CanvasProto = protoLoader.loadSync('canvas.proto')
    this.EntityCanvazRequest = CanvasProto.lookupType('com.spotify.canvazcache.EntityCanvazRequest')
    this.EntityCanvazResponse = CanvasProto.lookupType('com.spotify.canvazcache.EntityCanvazResponse')
    this.updateToken = null
    this.init = false
    this.renewTokenTime = 1000 // ~ 16 min
  },

  socketNotificationReceived: async function (noti, payload) {
    switch (noti) {
      case "INIT":
        this.initialize(payload)
        break
      case "GET-LYRICS":
        if (!this.init) return this.sendSocketNotification("ERROR", "[Lyrics] This plugins is not initilized!")
        let respLyrics = await this.GetLyrics(payload)
        this.sendSocketNotification("SEND-LYRICS", respLyrics)
        break
      case "GET-CANVAS":
        if (!this.init) return this.sendSocketNotification("ERROR", "[Canvas] This plugins is not initilized!")
        let respCanvas = await this.GetCanvas(payload)
        this.sendSocketNotification("SEND-CANVAS", respCanvas)
        break
    }
  },

  initialize: async function (config) {
    console.log("[SPOTIFYCL] EXT-SpotifyCanvasLyrics Version:", require('./package.json').version, "rev:", require('./package.json').rev)
    this.config = config
    if (this.config.debug) logSCL = (...args) => { console.log("[SPOTIFYCL]", ...args) }
    if (!this.config.email || !this.config.password) {
      this.sendSocketNotification("ERROR", "[SPOTIFYCL] Email or Password not found!")
      return console.error("[SPOTIFYCL] email or password not found!")
    }
    await this.createTokens()
    this.init = true
    this.sendSocketNotification("INITIALIZED")
  },

  getLyricsToken: function () {
    let options = {
      mode: 'json',
      scriptPath: __dirname + "/components",
      args: [ "-u", this.config.email, "-p", this.config.password ]
    }
    return new Promise( resolve => {
      PythonShell.run('getToken.py', options)
        .then(result => {
          if (!result[0].Error) logSCL("[Lyrics] Token Created")
          else console.error("[SPOTIFYCL] [Lyrics] [Token] Error!", result[0].Error)
          resolve(result[0])
        })
    })
  },

  getCanvasToken: function() {
    return new Promise(async (resolve, reject) => {
      const response = await fetch("https://open.spotify.com/get_access_token?reason=transport")
      if (response.ok) {
        let data = await response.json()
        logSCL("[Canvas] Token Created")
        resolve({Error: false, Token: data.accessToken})
      } else  {
        console.error("[SPOTIFYCL] [Canvas] [Token] Error", response.status, response.statusText)
        resolve({Error: true, Token: null})
      }
    })
  },

  GetLyrics: function(id) {
    logSCL("[Lyrics] Get", id)
    if (!this.tokenLyrics || this.tokenLyrics.Error) {
      console.error("[SPOTIFYCL] [Lyrics] Token error!")
      return {success: false, message: "Token error"}
    }
    let lyrics = []
    return new Promise(async (resolve, reject) => {
      const response = await fetch('https://spclient.wg.spotify.com/lyrics/v1/track/'+id,
      {
        headers: {
          Authorization: "Bearer " + this.tokenLyrics.Token
        }
      })
      if (response.ok) {
        const result = await response.json()
        logSCL("[Lyrics]", result)
        resolve({success: true, lyrics: result})
      } else {
        console.error("[SPOTIFYCL] [Lyrics] Error:", response.status, response.statusText)
        resolve({success: false, message: response.statusText})
      }
    })
  },

  GetCanvas: function(id) {
    logSCL("[Canvas] Get", id)
    if (!this.tokenCanvas || this.tokenCanvas.Error) {
      console.error("[SPOTIFYCL] [Canvas] Token error!")
      return {success: false, message: "Token error"}
    }
    let canvas_request = this.EntityCanvazRequest
    let canvas_response = this.EntityCanvazResponse
    var message = canvas_request.create({ entities : [{ "entityUri" : "spotify:track:" + id }]})
    var buffer = canvas_request.encode(message).finish()

    return new Promise(async (resolve, reject) => {
      const response = await fetch("https://gew1-spclient.spotify.com/canvaz-cache/v0/canvases",
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-protobuf",
          "Authorization": "Bearer " + this.tokenCanvas.Token
        },
        body: buffer
      })
      if (response.ok) {
        const result = await response.arrayBuffer()
        const bytes = new Uint8Array(result)
        let decode = canvas_response.decode(bytes)
        let stringify = JSON.stringify(decode)
        let jsonResp= JSON.parse(stringify)
        if (jsonResp.canvases) {
          logSCL("[Canvas]", jsonResp.canvases[0])
          resolve({success: true, canvas: jsonResp.canvases[0]})
        } else {
          console.log("[SPOTIFYCL] [Canvas] Warn: No Canvas for this track", id)
          resolve({success: false, message: "No Canvas for this track"})
        }
      } else {
        console.error("[SPOTIFYCL] [Canvas] Error:", response.status, response.statusText)
        resolve({success: false, message: response.statusText})
      }
    })
  },

  createTokens: async function() {
    clearInterval(this.updateToken)
    this.updateToken = null
    logSCL("[Lyrics] Geneate Lyrics Token...")
    this.tokenLyrics = await this.getLyricsToken()
    logSCL("[Canvas] Generate Canvas Token...")
    this.tokenCanvas= await this.getCanvasToken()

    if (this.tokenLyrics.Error) console.error("[SPOTIFYCL] [Lyrics] Lyrics is disabled")
    if (this.tokenCanvas.Error) console.error("[SPOTIFYCL] [Canvas] Canvas is disabled")

    this.updateToken = setInterval(() => {
      logSCL("Update Tokens...")
      this.createTokens()
    }, 1000 * this.renewTokenTime)
  }
})
