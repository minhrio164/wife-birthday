// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest"
import { createMusicWidget } from "./musicWidget"
import { musicTracks } from "../data/musicTracks"

describe("createMusicWidget", () => {
  let audioInstances: AudioMock[] = []

  class AudioMock {
    src = ""
    currentTime = 0
    preload = ""
    play = vi.fn().mockResolvedValue(undefined)
    pause = vi.fn()
    load = vi.fn()
    constructor() {
      audioInstances.push(this)
    }
    removeAttribute = vi.fn((name: string) => {
      if (name === "src") this.src = ""
    })
    addEventListener = vi.fn()
  }

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
    audioInstances = []
    vi.stubGlobal("Audio", AudioMock)
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
    expect(
      (
        document.querySelector(
          '.music-widget__button--play img'
        ) as HTMLImageElement
      )?.getAttribute("src")
    ).toBe("/Icon-play.svg")
    expect(
      (
        document.querySelector('[data-action="next"] img') as HTMLImageElement
      )?.getAttribute("src")
    ).toBe("/Icon-chevron-right.svg")

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

  it("swaps the play icon to pause when toggled", async () => {
    const widget = createMusicWidget({
      mount: document.getElementById("app") as HTMLElement,
      tracks: musicTracks,
    })

    expect(audioInstances[0]?.src).toBe("")
    ;(document.querySelector('[data-action="toggle"]') as HTMLButtonElement).click()
    await Promise.resolve()

    expect(
      (
        document.querySelector(
          '.music-widget__button--play img'
        ) as HTMLImageElement
      )?.getAttribute("src")
    ).toBe("/Icon-pause.svg")
    expect(audioInstances[0]?.src).toContain("/jennie-like-jennie.mp3")
    expect(audioInstances[0]?.currentTime).toBe(36)

    widget.destroy()
  })

  it("disables play when the active track has no audio source", () => {
    const widget = createMusicWidget({
      mount: document.getElementById("app") as HTMLElement,
      tracks: musicTracks,
    })

    ;(document.querySelector('[data-action="next"]') as HTMLButtonElement).click()

    expect(
      (document.querySelector('[data-action="toggle"]') as HTMLButtonElement)
        .disabled
    ).toBe(true)

    widget.destroy()
  })
})
