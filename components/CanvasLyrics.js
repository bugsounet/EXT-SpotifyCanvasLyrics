/* CanvasLyrics class rev: 220820 */

class CanvasLyrics {
  constructor (Config, callbacks) {
    this.config = Config
    this.debug = true
    console.log("[CanvasLyrics] Class Loaded")
    this.init = callbacks.init
    this.currentPlayback = null
    this.ads = false
    this.lyrics = null
  }

  /** Create a default display **/
  prepare() {
    var spotifyCL = document.createElement("div")
    spotifyCL.id = "EXT_SPOTIFYCL"
    const CLBackground = document.createElement("div")
    CLBackground.id = "EXT_SPOTIFYCL_BACKGROUND"

    spotifyCL.appendChild(CLBackground)

    const content = document.createElement("div")
    content.id = "EXT_SPOTIFYCL_CONTENT"
      const display = document.createElement("div")
      display.id = "EXT_SPOTIFYCL_DISPLAY"
      content.appendChild(display)
        const playing = document.createElement("div")
        playing.id = "EXT_SPOTIFYCL_PLAYING"
        display.appendChild(playing)
          const logo = document.createElement("img")
          logo.id = "EXT_SPOTIFYCL_LOGO"
          logo.src = "/modules/EXT-SpotifyCanvasLyrics/components/SpotifyLogo.png"
          playing.appendChild(logo)
          const cover = document.createElement("img")
          cover.id = "EXT_SPOTIFYCL_COVER"
          playing.appendChild(cover)
          const title = document.createElement("div")
          title.id = "EXT_SPOTIFYCL_TITLE"
          playing.appendChild(title)
          const artist = document.createElement("div")
          artist.id = "EXT_SPOTIFYCL_ARTIST"
          playing.appendChild(artist)
        const lyrics = document.createElement("div")
        lyrics.id = "EXT_SPOTIFYCL_LYRICS"
        display.appendChild(lyrics)
        const video = document.createElement("div")
        video.id = "EXT_SPOTIFYCL_VIDEO"
        display.appendChild(video)
          const canvas = document.createElement("video")
          canvas.id = "EXT_SPOTIFYCL_CANVAS"
          canvas.muted = true
          canvas.autoplay = true
          canvas.loop = true
          video.appendChild(canvas)
      const CLControlBox = document.createElement("div")
      CLControlBox.id = "EXT_SPOTIFYCL_CONTROLBOX"
        const progress = document.createElement("div")
        progress.id = "EXT_SPOTIFYCL_PROGRESS"
          const bar = document.createElement("progress")
          bar.id = "EXT_SPOTIFYCL_PROGRESS_BAR"
          bar.value = 0
          bar.max = 100
          progress.appendChild(bar)
          const time = document.createElement("div")
          time.id = "EXT_SPOTIFYCL_TIME"
          progress.appendChild(time)
            const timeCurrent = document.createElement("div")
            timeCurrent.id = "EXT_SPOTIFYCL_TIMECURRENT"
            timeCurrent.textContent = "--:--"
            time.appendChild(timeCurrent)
            const timeEnd = document.createElement("div")
            timeEnd.id = "EXT_SPOTIFYCL_TIMEEND"
            timeEnd.textContent = "--:--"
            time.appendChild(timeEnd)
        CLControlBox.appendChild(progress)
      content.appendChild(CLControlBox)
    spotifyCL.appendChild(content)

    document.body.appendChild(spotifyCL)
    this.init()
  }

  updateCurrentSpotify(current) {
    if (!current) return
    if (!this.currentPlayback) {
      this.lyrics = null
      this.updateBackground(current.item)
      this.updateSongInfo(current.item)
      //this.updatePlaying(current.is_playing)
      //this.updateDevice(current.device)
      //this.updatePlayback(current.is_playing)
      //if (current.device) this.updateVolume(current.device.volume_percent)
      //if (current.is_playing && current.item) this.updateProgress(current.progress_ms, current.item.duration_ms)
    } else {
      if (!this.connected && current.is_playing) {
        //this.updatePlayback(true)
      }
      /** for Ads **/
      if (current.currently_playing_type == "ad") {
        this.ads = true
        current.is_playing = false
      }
      if (this.currentPlayback.is_playing !== current.is_playing) {
        //this.updatePlaying(current.is_playing)
      }
      if (current.currently_playing_type == "ad") {
        this.currentPlayback.is_playing = false
        return
      }
      if (this.ads) {
        this.currentPlayback = null
        this.ads = false
        return
      }
      /** prevent all error -> reset currentPlayback **/
      if (!current.item || !current.device || !current.progress_ms || !current.item.duration_ms) return this.currentPlayback = null

      /** All is good so ... live update **/
      if (this.currentPlayback.item.id !== current.item.id) {
          this.lyrics = null
          this.updateBackground(current.item)
          this.updateSongInfo(current.item)
      }
      if (this.currentPlayback.device.id !== current.device.id) {
          //this.updateDevice(current.device)
      }
      if (this.currentPlayback.device.volume_percent !== current.device.volume_percent) {
          //this.updateVolume(current.device.volume_percent)
      }
      if (this.currentPlayback.progress_ms !== current.progress_ms) {
          this.updateProgress(current.progress_ms, current.item.duration_ms)
      }

      if (this.lyrics) this.displayActiveLyrics(current.progress_ms)
    }
    this.currentPlayback = current
  }

  updateBackground(playbackItem) {
    if (!playbackItem) return
    var img_url
    if (playbackItem.album) img_url = playbackItem.album.images[0].url
    else img_url = playbackItem.images[0].url
    const back = document.getElementById("EXT_SPOTIFYCL_BACKGROUND")
    if (img_url !== back.src) back.style.backgroundImage = `url(${img_url})`
  }

  displayCanvas(video) {
    const canvas = document.getElementById("EXT_SPOTIFYCL_CANVAS")
    if ((video == "none") || (video.endsWith("jpg"))) canvas.src= "/modules/EXT-SpotifyCanvasLyrics/components/spotify.mp4"
    else  canvas.src= video
  }

  updateProgress(progressMS, durationMS) {
    const bar = document.getElementById("EXT_SPOTIFYCL_PROGRESS_BAR")
    bar.value = progressMS

    if (bar.max != durationMS) bar.max = durationMS

    const current = document.getElementById("EXT_SPOTIFYCL_TIMECURRENT")
    current.innerText = this.msToTime(progressMS)
    const end = document.getElementById("EXT_SPOTIFYCL_TIMEEND")
    end.innerText = this.msToTime(durationMS)
  }

  updateSongInfo(playbackItem) {
    if (!playbackItem) return

    const cover_img = document.getElementById("EXT_SPOTIFYCL_COVER")

    var img_url
    //var display_name
    if (playbackItem.album){
      img_url = playbackItem.album.images[1].url
      //display_name = playbackItem.album.name
    }
    else{
      img_url = playbackItem.images[1].url
      //display_name = playbackItem.show.name
    }
    if (img_url !== cover_img.src) {
      //cover_img.classList.remove('fade-in')
      //let offset = cover_img.offsetWidth
      //cover_img.classList.add('fade-in')
      cover_img.src = img_url
    }

    const title = document.getElementById("EXT_SPOTIFYCL_TITLE")
    title.textContent = playbackItem.name

    const artist = document.getElementById("EXT_SPOTIFYCL_ARTIST")
    const artists = playbackItem.artists
    let artistName = ""
    if (playbackItem.album){
      for (let x = 0; x < artists.length; x++) {
        if (!artistName) {
          artistName = artists[x].name
        } else {
          artistName += ", " + artists[x].name
        }
      }
    } else{
      artistName = playbackItem.show.publisher
    }
    artist.textContent = artistName
  }

  loadLyrics(lyrics) {
    if (!lyrics) return this.lyrics = null
    this.lyrics = []
    var createLyrics = []
    lyrics.forEach(lyric => {
      let line = {
        time: lyric.time,
        words: lyric.words[0].string
      }
      createLyrics.push(line)
    })
    this.lyrics = createLyrics
    console.log("Lyrics Loaded")
    var lyricBox = document.getElementById("EXT_SPOTIFYCL_LYRICS")
    lyricBox.innerHTML= ""
    this.displayLyrics()
  }

  displayLyrics() {
    if (!this.lyrics) return
    console.log("Display Lyrics")
    var lyricBox = document.getElementById("EXT_SPOTIFYCL_LYRICS")
    this.lyrics.forEach(line => {
      var lyricLine = document.createElement("div")
      lyricLine.id = "EXT_SPOTIFYCL_LINE"
      lyricLine.classList.add(line.time)
      lyricLine.textContent = line.words
      lyricBox.appendChild(lyricLine)
    })
  }

  displayActiveLyrics(time) {
    this.lyrics.forEach((line, nb) => {
      var focus = document.getElementsByClassName(line.time)[0]
      if (line.time < time) {
        focus.classList.add("hidden")
        focus.classList.remove("active")
      } else {
        focus.classList.remove("hidden")
        focus.classList.remove("active")
      }
      if ((this.lyrics[nb+1]) && (time >= line.time && time <= this.lyrics[nb+1].time)) {
        focus.classList.remove("hidden")
        focus.classList.add("active")
      }
    })
  }

  /** Tools **/
  msToTime(duration) {
    let ret = ""
    let seconds = parseInt((duration / 1000) % 60)
      , minutes = parseInt((duration / (1000 * 60)) % 60)
      , hours = parseInt((duration / (1000 * 60 * 60)) % 24)
    if (hours > 0) {
      hours = (hours < 10) ? "0" + hours : hours
      ret = ret + hours + ":"
    }
    minutes = (minutes < 10) ? "0" + minutes : minutes
    seconds = (seconds < 10) ? "0" + seconds : seconds
    return ret + minutes + ":" + seconds
  }
}  
