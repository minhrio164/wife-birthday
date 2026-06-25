import { GalleryItem, RuntimeGalleryItem } from "../types/gallery"
import { readCaptureDate } from "./exif"

export async function preloadGalleryItems(
  items: GalleryItem[]
): Promise<RuntimeGalleryItem[]> {
  return Promise.all(
    items.map(async (item) => {
      if (item.type === "mystery") return item

      try {
        const response = await fetch(item.src)
        const blob = await response.blob()
        const exifDate = await readCaptureDate(blob)
        const resolvedDate =
          exifDate === "Chua co ngay chup" ? item.demoDate ?? exifDate : exifDate
        return { ...item, exifDate: resolvedDate }
      } catch {
        return { ...item, exifDate: item.demoDate ?? "Chua co ngay chup" }
      }
    })
  )
}
