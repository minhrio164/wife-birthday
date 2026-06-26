import { MusicTrack } from "../types/music"

interface MusicWidgetOptions {
  mount: HTMLElement
  tracks: MusicTrack[]
}

interface MusicWidgetHandle {
  destroy(): void
}

export function createMusicWidget({
  mount,
  tracks,
}: MusicWidgetOptions): MusicWidgetHandle {
  if (tracks.length === 0) {
    return {
      destroy() {},
    }
  }

  const host = document.createElement("section")
  host.className = "music-widget"
  host.innerHTML = `
    <div class="music-widget__glass">
      <div class="music-widget__thumb-wrap">
        <img class="music-widget__thumb" alt="Album cover" />
      </div>
      <div class="music-widget__meta">
        <p class="music-widget__title"></p>
        <p class="music-widget__artist"></p>
      </div>
      <div class="music-widget__controls">
        <button
          type="button"
          class="music-widget__button music-widget__button--play"
          data-action="toggle"
        >
          <img class="music-widget__icon-image music-widget__icon-image--play" alt="" />
        </button>
        <button
          type="button"
          class="music-widget__button"
          data-action="next"
          aria-label="Next track"
        >
          <img
            class="music-widget__icon-image music-widget__icon-image--next"
            src="/Icon-chevron-right.svg"
            alt=""
          />
        </button>
      </div>
    </div>
  `

  let currentIndex = 0
  let isPlaying = false
  const audio = typeof Audio !== "undefined" ? new Audio() : null
  if (audio) {
    audio.preload = "none"
  }

  const title = host.querySelector(".music-widget__title") as HTMLElement
  const artist = host.querySelector(".music-widget__artist") as HTMLElement
  const thumb = host.querySelector(".music-widget__thumb") as HTMLImageElement
  const playButton = host.querySelector(
    '[data-action="toggle"]'
  ) as HTMLButtonElement
  const playIcon = host.querySelector(
    ".music-widget__icon-image--play"
  ) as HTMLImageElement
  const nextButton = host.querySelector(
    '[data-action="next"]'
  ) as HTMLButtonElement

  const clearAudioSource = () => {
    if (!audio) return
    audio.pause()
    audio.removeAttribute("src")
    audio.load()
  }

  const syncAudioSource = () => {
    if (!audio) return false
    const track = tracks[currentIndex]
    if (!track.audioSrc) {
      clearAudioSource()
      return false
    }

    const absoluteSource = new URL(track.audioSrc, window.location.href).href

    if (audio.src !== absoluteSource) {
      audio.pause()
      audio.src = track.audioSrc
      audio.currentTime = track.startAtSeconds ?? 0
    }

    return true
  }

  const render = () => {
    const track = tracks[currentIndex]
    title.textContent = track.title
    artist.textContent = track.artist
    thumb.src = track.coverSrc
    playButton.setAttribute("aria-pressed", String(isPlaying))
    playButton.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music")
    playIcon.src = isPlaying ? "/Icon-pause.svg" : "/Icon-play.svg"
    playButton.disabled = !track.audioSrc
  }

  playButton.addEventListener("click", async () => {
    const track = tracks[currentIndex]
    if (!track.audioSrc || !audio) return

    if (isPlaying) {
      audio.pause()
      isPlaying = false
      render()
      return
    }

    try {
      if (!syncAudioSource()) {
        isPlaying = false
        render()
        return
      }
      await audio.play()
      isPlaying = true
    } catch {
      isPlaying = false
    }

    render()
  })

  nextButton.addEventListener("click", async () => {
    currentIndex = (currentIndex + 1) % tracks.length
    const nextTrack = tracks[currentIndex]

    if (isPlaying && audio && nextTrack.audioSrc) {
      try {
        if (!syncAudioSource()) {
          isPlaying = false
          render()
          return
        }
        await audio.play()
      } catch {
        isPlaying = false
      }
    } else {
      clearAudioSource()
      isPlaying = false
    }

    render()
  })

  audio?.addEventListener("ended", () => {
    isPlaying = false
    render()
  })

  mount.appendChild(host)
  render()

  return {
    destroy() {
      audio?.pause()
      audio?.removeAttribute("src")
      audio?.load()
      host.remove()
    },
  }
}
