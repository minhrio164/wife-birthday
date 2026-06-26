import { describe, expect, it, vi } from "vitest"
import { galleryItems } from "../data/galleryItems"
import { readCaptureDate } from "./exif"
import { preloadGalleryItems } from "./preloadGallery"

vi.mock("exifr", () => ({
  default: {
    parse: vi.fn()
  }
}))

describe("readCaptureDate", () => {
  it("uses optimized imported photos for preview photos", () => {
    const photoItems = galleryItems.filter((item) => item.type === "photo")

    expect(photoItems).toHaveLength(25)
    expect(photoItems[0]?.src).toBe("/photos/photo-01.jpg")
    expect(photoItems[24]?.src).toBe("/photos/photo-25.jpg")
  })

  it("uses DateTimeOriginal when available", async () => {
    const exifr = await import("exifr")
    vi.mocked(exifr.default.parse).mockResolvedValueOnce({
      DateTimeOriginal: "2024:08:12 18:30:45"
    })

    await expect(readCaptureDate(new Blob(["x"]))).resolves.toBe("12/08/2024")
  })

  it("falls back gracefully when EXIF parsing fails", async () => {
    const exifr = await import("exifr")
    vi.mocked(exifr.default.parse).mockRejectedValueOnce(
      new Error("bad metadata")
    )

    await expect(readCaptureDate(new Blob(["x"]))).resolves.toBe(
      "Chua co ngay chup"
    )
  })

  it("adds exifDate only to photo items", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(new Blob(["x"])))

    const exifr = await import("exifr")
    vi.mocked(exifr.default.parse).mockResolvedValue({
      DateTimeOriginal: "2024:08:12 18:30:45"
    })

    const result = await preloadGalleryItems(galleryItems.slice(0, 4))

    expect(result[0]).toMatchObject({
      type: "photo",
      exifDate: "12/08/2024"
    })
    expect(result[3]).toMatchObject({
      type: "mystery"
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)

    fetchMock.mockRestore()
  })
})
