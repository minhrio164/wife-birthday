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

  it("swaps the play icon to pause when toggled", () => {
    const widget = createMusicWidget({
      mount: document.getElementById("app") as HTMLElement,
      tracks: musicTracks,
    })

    ;(document.querySelector('[data-action="toggle"]') as HTMLButtonElement).click()

    expect(
      (
        document.querySelector(
          '.music-widget__button--play img'
        ) as HTMLImageElement
      )?.getAttribute("src")
    ).toBe("/Icon-pause.svg")

    widget.destroy()
  })
})
