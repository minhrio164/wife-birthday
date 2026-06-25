import { RuntimeGalleryItem, ViewState } from "../types/gallery"

export function renderOverlay(
  state: ViewState,
  items: RuntimeGalleryItem[],
  onClose: () => void
) {
  const root = document.getElementById("overlay-root")
  if (!root) return

  if (state.mode === "gallery" || state.mode === "loading") {
    root.innerHTML = ""
    root.setAttribute("data-open", "false")
    return
  }

  const item = items.find((entry) => entry.id === state.itemId)
  if (!item) {
    root.innerHTML = ""
    root.setAttribute("data-open", "false")
    return
  }

  root.setAttribute("data-open", "true")

  if (item.type === "photo") {
    const safeCaption = item.caption || "Our first pics"
    const safeDate = item.exifDate ?? "Chua co ngay chup"

    root.innerHTML = `
      <section class="overlay-shell">
        <article class="detail-card">
          <button class="overlay-back" type="button" aria-label="Dong">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-x-icon lucide-x"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
          <div class="detail-photo-frame">
            <img class="detail-image" src="${item.src}" alt="Anh ky niem" />
            <div class="detail-copy">
              <p class="detail-date">${safeDate}</p>
              <p class="detail-caption">${safeCaption}</p>
            </div>
          </div>
        </article>
      </section>
    `
  } else {
    const detailImageSrc = item.detailSrc ?? item.src

    root.innerHTML = `
      <section class="overlay-shell">
        <article class="mystery-card">
          <button class="overlay-back" type="button" aria-label="Dong">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-x-icon lucide-x"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
          <div class="mystery-media">
            <img class="mystery-image" src="${detailImageSrc}" alt="La thu bi mat" />
          </div>
        </article>
      </section>
    `
  }

  root.querySelector(".overlay-back")?.addEventListener("click", onClose)

  if (state.mode === "photo-detail") {
    syncPhotoFrameWidth(root)
  }
}

function syncPhotoFrameWidth(root: HTMLElement) {
  const frame = root.querySelector(".detail-photo-frame") as HTMLElement | null
  const image = root.querySelector(".detail-image") as HTMLImageElement | null
  const copy = root.querySelector(".detail-copy") as HTMLElement | null
  if (!frame || !image || !copy) return

  const horizontalPadding = 48

  const updateWidth = () => {
    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) return

    const isMobile = window.innerWidth <= 768
    const maxWidth = Math.max(160, window.innerWidth - (isMobile ? 72 : 96))
    const maxHeight = window.innerHeight * (isMobile ? 0.56 : 0.7)
    const scale = Math.min(
      1,
      maxWidth / image.naturalWidth,
      maxHeight / image.naturalHeight
    )

    const renderedWidth = Math.round(image.naturalWidth * scale)
    const renderedHeight = Math.round(image.naturalHeight * scale)

    image.style.width = `${renderedWidth}px`
    image.style.height = `${renderedHeight}px`
    frame.style.width = `${renderedWidth + horizontalPadding}px`
    copy.style.width = `${renderedWidth}px`
  }

  updateWidth()

  if (!image.complete) {
    image.addEventListener("load", updateWidth, { once: true })
  }

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(() => updateWidth())
    observer.observe(image)
  }
}
