import Canvas from "./canvas"
import { galleryItems } from "./data/galleryItems"
import { musicTracks } from "./data/musicTracks"
import { RuntimeGalleryItem, ViewState } from "./types/gallery"
import { renderOverlay } from "./ui/overlay"
import { clearLoadingScreen, renderLoadingScreen } from "./ui/loadingScreen"
import { createMusicWidget } from "./ui/musicWidget"
import { preloadGalleryItems } from "./utils/preloadGallery"

export default class App {
  canvas?: Canvas
  musicWidget?: { destroy(): void }
  items: RuntimeGalleryItem[] = []
  state: ViewState = { mode: "loading" }
  appRoot: HTMLElement

  constructor() {
    this.appRoot = document.getElementById("app") as HTMLElement
  }

  async start() {
    const enterLoading = new Promise<void>((resolve) => {
      renderLoadingScreen(this.appRoot, resolve)
    })

    renderOverlay({ mode: "loading" }, [], this.closeOverlay)

    const [items] = await Promise.all([
      preloadGalleryItems(galleryItems),
      enterLoading,
      new Promise((resolve) => window.setTimeout(resolve, 1800)),
    ])

    this.items = items
    clearLoadingScreen(this.appRoot)

    this.canvas = new Canvas({
      items: this.items,
      onSelect: (itemId) => this.openItem(itemId),
    })
    this.musicWidget = createMusicWidget({
      mount: this.appRoot,
      tracks: musicTracks,
    })

    this.setState({ mode: "gallery" })
    this.render()
  }

  openItem(itemId: string) {
    const item = this.items.find((entry) => entry.id === itemId)
    if (!item) return

    this.setState(
      item.type === "photo"
        ? { mode: "photo-detail", itemId }
        : { mode: "mystery-card", itemId }
    )
  }

  closeOverlay = () => {
    this.setState({ mode: "gallery" })
  }

  setState(nextState: ViewState) {
    this.state = nextState
    this.canvas?.setInteractive(nextState.mode === "gallery")
    renderOverlay(this.state, this.items, this.closeOverlay)
  }

  render = () => {
    this.canvas?.render()
    requestAnimationFrame(this.render)
  }
}
