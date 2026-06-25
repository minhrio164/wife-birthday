# Floating Music Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating bottom-center glass music widget that matches the referenced CodePen style and fits the current birthday gallery site.

**Architecture:** Build the player as a DOM UI module separate from the WebGL gallery. Keep playlist metadata in a dedicated data file, render/update the widget from a focused UI module, and initialize it from `App` so it shares page lifecycle without coupling to `Canvas` or overlay rendering.

**Tech Stack:** TypeScript, Vite, DOM APIs, Vitest, CSS

---

### Task 1: Add widget tests and playlist scaffolding

**Files:**
- Create: `src/types/music.ts`
- Create: `src/data/musicTracks.ts`
- Create: `src/ui/musicWidget.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest"
import { createMusicWidget } from "./musicWidget"
import { musicTracks } from "../data/musicTracks"

describe("createMusicWidget", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
  })

  it("renders a bottom-center floating player with initial track metadata", () => {
    const widget = createMusicWidget({
      mount: document.getElementById("app") as HTMLElement,
      tracks: musicTracks,
    })

    expect(document.querySelector(".music-widget")).not.toBeNull()
    expect(document.querySelector(".music-widget__title")?.textContent).toBe(
      musicTracks[0].title
    )
    expect(document.querySelector(".music-widget__artist")?.textContent).toBe(
      musicTracks[0].artist
    )

    widget.destroy()
  })

  it("advances to the next track when next is clicked", () => {
    const widget = createMusicWidget({
      mount: document.getElementById("app") as HTMLElement,
      tracks: musicTracks,
    })

    ;(document.querySelector('[data-action="next"]') as HTMLButtonElement).click()

    expect(document.querySelector(".music-widget__title")?.textContent).toBe(
      musicTracks[1].title
    )

    widget.destroy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/ui/musicWidget.test.ts`
Expected: FAIL because `musicWidget`, `musicTracks`, and `music` types do not exist yet.

### Task 2: Implement a self-contained widget module

**Files:**
- Create: `src/types/music.ts`
- Create: `src/data/musicTracks.ts`
- Create: `src/ui/musicWidget.ts`
- Modify: `src/app.ts`

- [ ] **Step 1: Write minimal shared types**

```ts
export interface MusicTrack {
  id: string
  title: string
  artist: string
  coverSrc: string
  audioSrc?: string
}
```

- [ ] **Step 2: Add a local playlist**

```ts
import { MusicTrack } from "../types/music"

export const musicTracks: MusicTrack[] = [
  {
    id: "track-01",
    title: "Our Memory Lane",
    artist: "Birthday Playlist",
    coverSrc: "/covers/image_0.jpg",
  },
  {
    id: "track-02",
    title: "Pink Cloud Nights",
    artist: "Birthday Playlist",
    coverSrc: "/covers/image_7.jpg",
  },
  {
    id: "track-03",
    title: "Stardust Moments",
    artist: "Birthday Playlist",
    coverSrc: "/covers/image_14.jpg",
  },
]
```

- [ ] **Step 3: Implement the widget renderer and local state**

```ts
import { MusicTrack } from "../types/music"

interface MusicWidgetOptions {
  mount: HTMLElement
  tracks: MusicTrack[]
}

export function createMusicWidget({ mount, tracks }: MusicWidgetOptions) {
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
        <button type="button" class="music-widget__button music-widget__button--play" data-action="toggle">
          <span class="music-widget__icon music-widget__icon--play"></span>
        </button>
        <button type="button" class="music-widget__button" data-action="next">
          <span class="music-widget__icon music-widget__icon--next"></span>
        </button>
      </div>
    </div>
  `

  let currentIndex = 0
  let isPlaying = false

  const title = host.querySelector(".music-widget__title") as HTMLElement
  const artist = host.querySelector(".music-widget__artist") as HTMLElement
  const thumb = host.querySelector(".music-widget__thumb") as HTMLImageElement
  const playButton = host.querySelector('[data-action="toggle"]') as HTMLButtonElement
  const nextButton = host.querySelector('[data-action="next"]') as HTMLButtonElement

  const render = () => {
    const track = tracks[currentIndex]
    title.textContent = track.title
    artist.textContent = track.artist
    thumb.src = track.coverSrc
    playButton.setAttribute("aria-pressed", String(isPlaying))
    playButton.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music")
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
```

- [ ] **Step 4: Mount the widget from the app lifecycle**

```ts
import { musicTracks } from "./data/musicTracks"
import { createMusicWidget } from "./ui/musicWidget"

musicWidget?: { destroy(): void }

this.musicWidget = createMusicWidget({
  mount: this.appRoot,
  tracks: musicTracks,
})
```

- [ ] **Step 5: Run the widget test to verify it passes**

Run: `npm test -- src/ui/musicWidget.test.ts`
Expected: PASS

### Task 3: Style the floating glass widget

**Files:**
- Modify: `src/style.css`
- Test: `src/ui/musicWidget.test.ts`

- [ ] **Step 1: Add the widget styles**

```css
.music-widget {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 10;
  width: min(560px, calc(100vw - 24px));
  pointer-events: auto;
}

.music-widget__glass {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 10px 18px 10px 12px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow: 0 20px 44px rgba(10, 6, 18, 0.34);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
}

.music-widget__glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.58);
  pointer-events: none;
}

.music-widget__thumb {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: cover;
  display: block;
}

.music-widget__meta {
  min-width: 0;
  flex: 1 1 auto;
}

.music-widget__title,
.music-widget__artist {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-widget__title {
  color: #fff8fd;
  font-size: 1rem;
  font-weight: 600;
  text-shadow: 0 0 12px rgba(0, 0, 0, 0.28);
}

.music-widget__artist {
  margin-top: 4px;
  color: rgba(255, 242, 248, 0.72);
  font-size: 0.92rem;
}

.music-widget__controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
```

- [ ] **Step 2: Add the control button/icon styles**

```css
.music-widget__button {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.35);
}

.music-widget__button--play {
  background: linear-gradient(145deg, rgba(255, 119, 172, 0.92), rgba(255, 171, 214, 0.76));
}

.music-widget__icon--play,
.music-widget__icon--next {
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
}

.music-widget__icon--play {
  border-width: 8px 0 8px 13px;
  border-color: transparent transparent transparent currentColor;
  margin-left: 2px;
}

.music-widget__button[aria-pressed="true"] .music-widget__icon--play {
  width: 12px;
  height: 14px;
  border: 0;
  background:
    linear-gradient(currentColor, currentColor) left center/4px 14px no-repeat,
    linear-gradient(currentColor, currentColor) right center/4px 14px no-repeat;
  margin-left: 0;
}

.music-widget__icon--next {
  border-width: 7px 0 7px 10px;
  border-color: transparent transparent transparent currentColor;
  position: relative;
}

.music-widget__icon--next::after {
  content: "";
  position: absolute;
  left: 3px;
  top: -7px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 7px 0 7px 10px;
  border-color: transparent transparent transparent currentColor;
}
```

- [ ] **Step 3: Add mobile sizing and overlay-safe stacking**

```css
@media (max-width: 768px) {
  .music-widget {
    bottom: 16px;
    width: min(100%, calc(100vw - 16px));
  }

  .music-widget__glass {
    gap: 12px;
    padding: 8px 12px 8px 10px;
    border-radius: 24px;
  }

  .music-widget__thumb {
    width: 58px;
    height: 58px;
  }
}
```

- [ ] **Step 4: Run the widget test and full build**

Run: `npm test -- src/ui/musicWidget.test.ts`
Expected: PASS

Run: `npm run build`
Expected: PASS
