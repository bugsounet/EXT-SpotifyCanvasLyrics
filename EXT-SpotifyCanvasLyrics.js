/**
 ** Module : EXT-SpotifyCanvasLyrics
 ** @bugsounet
 ** support: https://forum.bugsounet.fr
 **/

logSCL = (...args) => { /* do nothing */ };

Module.register("EXT-SpotifyCanvasLyrics", {
  defaults: {
    debug: false
  },

  start () {
    this.helperConfig = {
      debug: this.config.debug,
      email: null,
      password: null
    };
    if (this.helperConfig.debug) logSCL = (...args) => { console.log("[SPOTIFYCL]", ...args); };

    /** Search player config **/
    let Librespot = config.modules.find((m) => m.module === "EXT-Librespot");
    if (Librespot && !Librespot.disabled) {
      logSCL("Player Found!");
      if (Librespot) {
        try {
          this.helperConfig.email = Librespot.config.email;
        } catch (e) { }
        try {
          this.helperConfig.password = Librespot.config.password;
        } catch (e) { }
      }
    }
    this.ready= false;
    logSCL("Config:", this.helperConfig);
  },

  getDom () {
    var dom = document.createElement("div");
    dom.style.display = "none";
    return dom;
  },

  notificationReceived (noti, payload, sender) {
    if (noti === "GA_READY") {
      if (sender.name === "MMM-GoogleAssistant") this.sendSocketNotification("INIT", this.helperConfig);
    }
    if (!this.ready) return;

    switch(noti) {
      case "EXT_SCL-GET_LYRICS":
        this.sendSocketNotification("GET-LYRICS", payload);
        break;
      case "EXT_SCL-GET_CANVAS":
        this.sendSocketNotification("GET-CANVAS", payload);
        break;
    }
  },

  socketNotificationReceived (noti, payload) {
    switch(noti) {
      case "INITIALIZED":
        this.ready= true;
        this.sendNotification("EXT_HELLO", this.name);
        this.sendNotification("EXT_SCL-READY");
        break;
      case "ERROR":
        this.sendNotification("EXT_ALERT", {
          type: "warning",
          message: payload
        });
        break;
      case "SEND-LYRICS":
        logSCL("Send Lyrics", payload);
        this.sendNotification("EXT_SCL-SEND_LYRICS", payload);
        break;
      case "SEND-CANVAS":
        logSCL("Send Canvas", payload);
        this.sendNotification("EXT_SCL-SEND_CANVAS", payload);
        break;
    }
  }
});
