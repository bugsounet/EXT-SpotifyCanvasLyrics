/**
 ** Module : EXT-SpotifyCanvasLyrics
 ** @bugsounet
 ** ©08-2022
 ** support: https://forum.bugsounet.fr
 **/

logSCL = (...args) => { /* do nothing */ }

Module.register("EXT-SpotifyCanvasLyrics", {
  defaults: {
    debug: false
  },

  start: function () {
    this.init = false
    this.helperConfig = {
      debug: this.config.debug,
      email: null,
      password: null,
      deviceName: null
    }
    if (this.helperConfig.debug) logSCL = (...args) => { console.log("[SPOTIFYCL]", ...args) }

    /** Search player config **/
    let Librespot = config.modules.find(m => m.module == "EXT-Librespot")
    let Raspotify = config.modules.find(m => m.module == "EXT-Raspotify")
    if ((Librespot && !Librespot.disabled) || (Raspotify && !Raspotify.disabled)) {
      logSCL("Player Found!")
      if (Librespot) {
        try {
          this.helperConfig.email = Librespot.config.email
        } catch (e) { }
        try {
          this.helperConfig.password = Librespot.config.password
        } catch (e) { }
        try {
          this.helperConfig.deviceName = Librespot.config.deviceName ? Librespot.config.deviceName : "MagicMirror"
        } catch (e) { }
      }
      else if (Raspotify) {
        try {
          this.helperConfig.email = Raspotify.config.email
        } catch (e) { }
        try {
          this.helperConfig.password = Raspotify.config.password
        } catch (e) { }
        try {
          this.helperConfig.deviceName = Raspotify.config.deviceName ? Raspotify.config.deviceName : "MagicMirror"
        } catch (e) { }
      }
    }
    logSCL("Config:", this.helperConfig)
    var callbacks = {
      "init": () => { this.init = true },
      "sendNotification": (noti, params) => { this.sendNotification(noti,params) },
      "sendSocketNotification": (noti, params) => { this.sendSocketNotification(noti,params) }
    }
    this.CanvasLyrics = new CanvasLyrics(callbacks)
  },

  getDom: function() {
    var dom = document.createElement("div")
    dom.style.display = "none"
    return dom
  },

  getScripts: function() {
    return [
      "/modules/EXT-SpotifyCanvasLyrics/components/CanvasLyrics.js",
      "https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js@3.0/dist/svg.min.js"
    ]
  },

  getStyles: function () {
    return [
      "EXT-SpotifyCanvasLyrics.css"
    ]
  },

  notificationReceived: function(noti, payload, sender) {
    switch(noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.helperConfig)
        this.CanvasLyrics.prepare()
        break
      case "GAv4_READY":
        if (sender.name == "MMM-GoogleAssistant") this.sendNotification("EXT_HELLO", this.name)
        break
      case "EXT_SPOTIFYCL-PLAYING":
        if (!this.init || !payload.item) return
        this.CanvasLyrics.updateCurrentSpotify(payload)
        break
      case "EXT_SPOTIFY-PLAYER_DISCONNECTED":
        this.CanvasLyrics.reset()
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    switch(noti) {
      case "ERROR":
        this.sendNotification("EXT_ALERT", {
          type: "warning",
          message: payload
        })
        break
      case "CANVAS":
        this.CanvasLyrics.displayCanvas(payload)
        break
      case "LYRICS":
        this.CanvasLyrics.loadLyrics(payload)
        break
    }
  },

})
