/* CanvasLyrics class rev: 220820 */

class CanvasLyrics {
  constructor (Config, callbacks) {
    this.config = Config
    this.debug = true
    console.log("[CanvasLyrics] Class Loaded")
    this.init = callbacks.init
  }

  /** Create a default display **/
  prepare() {
    var spotifyCL = document.createElement("div")
    spotifyCL.id = "EXT_SPOTIFYCL"
    const CLBackground = document.createElement("div")
    CLBackground.id = "EXT_SPOTIFYCL_BACKGROUND"

    spotifyCL.appendChild(CLBackground)

    const box1 = document.createElement("div")
    box1.id = "EXT_SPOTIFYCL_BOX1"
      const box2 = document.createElement("div")
      box2.id = "EXT_SPOTIFYCL_BOX2"
      box1.appendChild(box2)
        const box3 = document.createElement("div")
        box3.id = "EXT_SPOTIFYCL_BOX3"
        box2.appendChild(box3)
          const box4 = document.createElement("div")
          box4.id = "EXT_SPOTIFYCL_BOX4"
          box3.appendChild(box4)
          const box5 = document.createElement("div")
          box5.id = "EXT_SPOTIFYCL_BOX5"
          box3.appendChild(box5)
            const canvas = document.createElement("video")
            canvas.id = "EXT_SPOTIFYCL_CANVAS"
            canvas.muted = true;
		        canvas.autoplay = true
		        canvas.loop = true
            box5.appendChild(canvas)
      const CLControlBox = document.createElement("div")
      CLControlBox.id = "EXT_SPOTIFYCL_CONTROLBOX"
      box1.appendChild(CLControlBox)
    spotifyCL.appendChild(box1)

    document.body.appendChild(spotifyCL)
    this.init()
  }

  updateDisplay(playbackItem) {
    if (!playbackItem) return
    var img_url
    var display_name
    if (playbackItem.album) {
      img_url = playbackItem.album.images[0].url
      display_name = playbackItem.album.name
    }
    else {
      img_url = playbackItem.images[0].url
      display_name = playbackItem.show.name
    }
    const sDom = document.getElementById("EXT_SPOTIFYCL")
    const back = document.getElementById("EXT_SPOTIFYCL_BACKGROUND")
    if (img_url !== back.src) {
      back.style.backgroundImage = `url(${img_url})`
    }
  }

  displayCanvas(video) {
    const canvas = document.getElementById("EXT_SPOTIFYCL_CANVAS") 
    canvas.src= video
  }
}  
