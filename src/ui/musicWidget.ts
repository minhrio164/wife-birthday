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

  const render = () => {
    const track = tracks[currentIndex]
    title.textContent = track.title
    artist.textContent = track.artist
    thumb.src = track.coverSrc
    playButton.setAttribute("aria-pressed", String(isPlaying))
    playButton.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music")
    playIcon.src = isPlaying ? "/Icon-pause.svg" : "/Icon-play.svg"
  }

  playButton.addEventListener("click", () => {
    isPlaying = !isPlaying
    render()
  })

  nextButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % tracks.length
    isPlaying = false
    render()
  })

  mount.appendChild(host)
  render()

  return {
    destroy() {
      host.remove()
    },
  }
}
