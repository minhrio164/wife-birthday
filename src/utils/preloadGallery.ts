import { GalleryItem, RuntimeGalleryItem } from "../types/gallery"

export async function preloadGalleryItems(
  items: GalleryItem[]
): Promise<RuntimeGalleryItem[]> {
  return items.map((item) => {
    if (item.type === "mystery") return item

    return {
      ...item,
      exifDate: item.demoDate ?? "Chua co ngay chup",
    }
  })
}
