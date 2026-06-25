// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderOverlay } from "./overlay"
import { RuntimeGalleryItem } from "../types/gallery"

describe("renderOverlay", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="overlay-root"></div>'
  })

  it("renders photo detail content", () => {
    const item: RuntimeGalleryItem = {
      id: "photo-01",
      type: "photo",
      src: "/covers/image_0.jpg",
      caption: "Viet caption cua ban o day.",
      exifDate: "12/08/2024",
    }

    renderOverlay({ mode: "photo-detail", itemId: item.id }, [item], vi.fn())

    expect(document.body.textContent).toContain("12/08/2024")
    expect(
      document
        .querySelector(".detail-card .overlay-back")
        ?.getAttribute("aria-label")
    ).toBe("Dong")
    expect(document.querySelector(".detail-date")?.textContent).toContain(
      "12/08/2024"
    )
    expect(document.querySelector(".detail-photo-frame .detail-image")).not.toBeNull()
    expect(document.querySelector(".detail-copy")).not.toBeNull()
  })

  it("renders mystery card content", () => {
    const item: RuntimeGalleryItem = {
      id: "mystery-01",
      type: "mystery",
      src: "/covers/thumbnail.jpg",
      detailSrc: "/covers/letter.jpg",
      title: "Bi mat nho",
      message: "Cam on em da den.",
    }

    renderOverlay({ mode: "mystery-card", itemId: item.id }, [item], vi.fn())

    expect(
      document.querySelector(".mystery-image")?.getAttribute("src")
    ).toBe("/covers/letter.jpg")
    expect(document.querySelector(".mystery-card h2")).toBeNull()
    expect(document.querySelector(".mystery-card p")).toBeNull()
    expect(
      document
        .querySelector(".mystery-card .overlay-back")
        ?.getAttribute("aria-label")
    ).toBe("Dong")
  })
})
