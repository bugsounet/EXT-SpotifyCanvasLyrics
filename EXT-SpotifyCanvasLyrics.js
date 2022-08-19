/**
 ** Module : EXT-SpotifyCanvasLyrics
 ** @bugsounet
 ** ©08-2022
 ** support: https://forum.bugsounet.fr
 **/

logSCL = (...args) => { /* do nothing */ }

Module.register("EXT-SpotifyCanvasLyrics", {
  defaults: {
    debug: false,
    email: null,
    password: null
  },

  start: function () {
    if (this.config.debug) logCanvas = (...args) => { console.log("[SPOTIFYCL]", ...args) }
    if (!this.config.email || !this.config.password) {
      /** Search player config **/
      let Librespot = config.modules.find(m => m.module == "EXT-Librespot")
      let Raspotify = config.modules.find(m => m.module == "EXT-Raspotify")
      if ((Librespot && !Librespot.disabled) || (Raspotify && !Raspotify.disabled)) {
        logSCL("Player Found!")
        if (Librespot) {
          try {
            this.config.email = Librespot.config.email
          } catch (e) { }
          try {
            this.config.password = Librespot.config.password
          } catch (e) { }
        }
        else if (Raspotify) {
          try {
            this.config.email = Raspotify.config.email
          } catch (e) { }
          try {
            this.config.password = Raspotify.config.password
          } catch (e) { }
        }
      }
    }
    logCanvas("Config:", this.config)
  },

  getDom: function() {
    var canvas = document.createElement("div")
    return canvas
  },

  notificationReceived: function(noti, payload, sender) {
    switch(noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.config)
        break
      case "GAv4_READY":
        if (sender.name == "MMM-GoogleAssistant") this.sendNotification("EXT_HELLO", this.name)
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
    }
  },

})
