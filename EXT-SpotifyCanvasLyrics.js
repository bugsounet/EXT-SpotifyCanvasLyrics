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
      password: null
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
      }
      else if (Raspotify) {
        try {
          this.helperConfig.email = Raspotify.config.email
        } catch (e) { }
        try {
          this.helperConfig.password = Raspotify.config.password
        } catch (e) { }
      }
    }
    logSCL("Config:", this.helperConfig)
    var callbacks = {
      "init": () => { this.init = true }
    }
    this.CanvasLyrics = new CanvasLyrics(null, callbacks)
  },

  getDom: function() {
    var dom = document.createElement("div")
    dom.style.display = "none"
    return dom
  },

  getScripts: function() {
    return [
      "/modules/EXT-SpotifyCanvasLyrics/components/CanvasLyrics.js",
      "https://code.iconify.design/1/1.0.6/iconify.min.js"
    ]
  },

  getStyles: function () {
    return [
      "EXT-SpotifyCanvasLyrics.css",
      "https://cdn.materialdesignicons.com/5.2.45/css/materialdesignicons.min.css",
      "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
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
        this.sendSocketNotification("SEARCH_CL", payload.item)
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
