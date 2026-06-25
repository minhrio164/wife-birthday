export type GalleryItemType = "photo" | "mystery"

export interface GalleryPhotoItem {
  id: string
  type: "photo"
  src: string
  caption: string
  demoDate?: string
}

export interface GalleryMysteryItem {
  id: string
  type: "mystery"
  src: string
  title: string
  message: string
}

export type GalleryItem = GalleryPhotoItem | GalleryMysteryItem

export interface RuntimePhotoItem extends GalleryPhotoItem {
  exifDate?: string
}

export type RuntimeGalleryItem = RuntimePhotoItem | GalleryMysteryItem

export type ViewState =
  | { mode: "loading" }
  | { mode: "gallery" }
  | { mode: "photo-detail"; itemId: string }
  | { mode: "mystery-card"; itemId: string }

export interface GallerySelection {
  itemId: string
}
