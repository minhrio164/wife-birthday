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
    const safeCaption = item.caption || "Viet caption cua ban o day."
    const safeDate = item.exifDate ?? "Chua co ngay chup"

    root.innerHTML = `
      <section class="overlay-shell">
        <button class="overlay-back" type="button">Quay lai</button>
        <article class="detail-card">
          <img class="detail-image" src="${item.src}" alt="Anh ky niem" />
          <div class="detail-copy">
            <p class="detail-date">${safeDate}</p>
            <p class="detail-caption">${safeCaption}</p>
          </div>
        </article>
      </section>
    `
  } else {
    const safeTitle = item.title || "Bat ngo nho"
    const safeMessage =
      item.message ||
      "Chuc em mot ngay sinh nhat that vui va that nhieu yeu thuong."

    root.innerHTML = `
      <section class="overlay-shell">
        <button class="overlay-back" type="button">Quay lai</button>
        <article class="mystery-card">
          <div class="mystery-stars" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <p class="mystery-kicker">Bat ngo nho danh cho em</p>
          <h2>${safeTitle}</h2>
          <p>${safeMessage}</p>
          <div class="mystery-signoff">
            <span>From your birthday gallery demo</span>
          </div>
        </article>
      </section>
    `
  }

  root.querySelector(".overlay-back")?.addEventListener("click", onClose)
}
