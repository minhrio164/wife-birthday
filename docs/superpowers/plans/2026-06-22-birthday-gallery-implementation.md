# Birthday Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current floating-photo demo into a Vietnamese birthday gift site with 30 curated images, 5 mystery greeting cards, EXIF-powered capture dates, a celebratory loading screen, and dedicated detail overlays.

**Architecture:** Keep the Three.js gallery as the rendering engine, but move content, EXIF parsing, and app state into separate modules. Use HTML/CSS overlays for loading, photo detail, and mystery cards so the interactive content stays responsive, editable, and decoupled from the shader scene.

**Tech Stack:** Vite, TypeScript, Three.js, Tailwind CSS v4, `exifr`, `vitest`, `jsdom`

---

## File Structure

### Existing files to modify

- Modify: `package.json`
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/canvas.ts`
- Modify: `src/planes.ts`
- Modify: `src/style.css`
- Modify: `src/types/types.ts`

### New source files to create

- Create: `src/data/galleryItems.ts`
- Create: `src/types/gallery.ts`
- Create: `src/utils/exif.ts`
- Create: `src/utils/formatDate.ts`
- Create: `src/utils/preloadGallery.ts`
- Create: `src/ui/overlay.ts`
- Create: `src/ui/loadingScreen.ts`
- Create: `src/app.ts`

### Test files to create

- Create: `src/utils/formatDate.test.ts`
- Create: `src/utils/exif.test.ts`
- Create: `src/ui/overlay.test.ts`

### Responsibility map

- `src/data/galleryItems.ts`: the fixed 30-item manifest, including 5 mystery entries and placeholder captions
- `src/types/gallery.ts`: shared content and app-state types
- `src/utils/exif.ts`: read and normalize EXIF capture dates
- `src/utils/formatDate.ts`: convert raw EXIF timestamps to Vietnamese display strings
- `src/utils/preloadGallery.ts`: preload gallery items and merge EXIF results into runtime data
- `src/ui/loadingScreen.ts`: render and control the birthday loading experience
- `src/ui/overlay.ts`: render photo detail and mystery card overlays
- `src/app.ts`: top-level state orchestration between loading, gallery, and overlays
- `src/canvas.ts` and `src/planes.ts`: keep rendering concerns and expose click-selection hooks

## Task 1: Add typed gallery content and test tooling

**Files:**
- Modify: `package.json`
- Create: `src/types/gallery.ts`
- Create: `src/data/galleryItems.ts`

- [ ] **Step 1: Add failing typecheck and test scripts to `package.json`**

Update `package.json` to introduce test commands and the dependencies needed for pure TypeScript and DOM-level unit tests.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@types/normalize-wheel": "^1.0.4",
    "jsdom": "^26.1.0",
    "typescript": "~5.8.3",
    "vite": "^7.1.2",
    "vitest": "^2.1.8"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.12",
    "@types/three": "^0.179.0",
    "exifr": "^7.1.3",
    "gsap": "^3.13.0",
    "lenis": "^1.3.9",
    "lil-gui": "^0.20.0",
    "normalize-wheel": "^1.0.1",
    "tailwindcss": "^4.1.12",
    "three": "file:three-0.179.1.tgz",
    "vite-plugin-glsl": "^1.5.1"
  }
}
```

- [ ] **Step 2: Add shared gallery types in `src/types/gallery.ts`**

```ts
export type GalleryItemType = "photo" | "mystery"

export interface GalleryPhotoItem {
  id: string
  type: "photo"
  src: string
  caption: string
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
```

- [ ] **Step 3: Add the fixed 30-item manifest in `src/data/galleryItems.ts`**

Create a literal array with 25 `photo` items and 5 `mystery` items. Keep captions as placeholders in Vietnamese and write mystery content directly in Vietnamese so the first version is gift-ready.

```ts
import { GalleryItem } from "../types/gallery"

export const galleryItems: GalleryItem[] = [
  {
    id: "photo-01",
    type: "photo",
    src: "/covers/image_0.jpg",
    caption: "Viet caption cua ban o day."
  },
  {
    id: "mystery-01",
    type: "mystery",
    src: "/covers/image_1.jpg",
    title: "Bi mat nho",
    message: "Cam on em da den va lam cho moi thu dep hon."
  }
]
```

Then fill out the remaining 28 entries so the final array length is exactly 30 and the mystery count is exactly 5.

- [ ] **Step 4: Run install to verify tooling dependencies resolve**

Run: `npm install`

Expected: install finishes without unresolved package errors and updates `package-lock.json`

- [ ] **Step 5: Run build to verify the new manifest compiles**

Run: `npm run build`

Expected: PASS, with the existing Vite large-chunk warning allowed

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/types/gallery.ts src/data/galleryItems.ts
git commit -m "feat: add birthday gallery content manifest"
```

If this project is still a non-git folder, initialize or reconnect Git before starting implementation, then use the same commit message.

## Task 2: Add EXIF parsing and date formatting with tests first

**Files:**
- Create: `src/utils/formatDate.ts`
- Create: `src/utils/exif.ts`
- Create: `src/utils/formatDate.test.ts`
- Create: `src/utils/exif.test.ts`

- [ ] **Step 1: Write failing date-format tests in `src/utils/formatDate.test.ts`**

```ts
import { describe, expect, it } from "vitest"
import { formatExifDate } from "./formatDate"

describe("formatExifDate", () => {
  it("formats EXIF timestamps as dd/mm/yyyy", () => {
    expect(formatExifDate("2024:08:12 18:30:45")).toBe("12/08/2024")
  })

  it("returns fallback text when value is missing", () => {
    expect(formatExifDate(undefined)).toBe("Chua co ngay chup")
  })

  it("returns fallback text when value is invalid", () => {
    expect(formatExifDate("not-a-date")).toBe("Chua co ngay chup")
  })
})
```

- [ ] **Step 2: Write failing EXIF tests in `src/utils/exif.test.ts`**

```ts
import { describe, expect, it, vi } from "vitest"
import { readCaptureDate } from "./exif"

vi.mock("exifr", () => ({
  default: {
    parse: vi.fn()
  }
}))

describe("readCaptureDate", () => {
  it("uses DateTimeOriginal when available", async () => {
    const exifr = await import("exifr")
    vi.mocked(exifr.default.parse).mockResolvedValueOnce({
      DateTimeOriginal: "2024:08:12 18:30:45"
    })

    await expect(readCaptureDate(new Blob(["x"]))).resolves.toBe("12/08/2024")
  })

  it("falls back gracefully when EXIF parsing fails", async () => {
    const exifr = await import("exifr")
    vi.mocked(exifr.default.parse).mockRejectedValueOnce(new Error("bad metadata"))

    await expect(readCaptureDate(new Blob(["x"]))).resolves.toBe("Chua co ngay chup")
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`

Expected: FAIL with missing module or missing function errors for `formatExifDate` and `readCaptureDate`

- [ ] **Step 4: Implement `src/utils/formatDate.ts`**

```ts
const FALLBACK_DATE = "Chua co ngay chup"

export function formatExifDate(value?: string | Date | null): string {
  if (!value) return FALLBACK_DATE

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const day = String(value.getDate()).padStart(2, "0")
    const month = String(value.getMonth() + 1).padStart(2, "0")
    const year = String(value.getFullYear())
    return `${day}/${month}/${year}`
  }

  if (typeof value !== "string") return FALLBACK_DATE

  const match = value.match(/^(\d{4}):(\d{2}):(\d{2})/)
  if (!match) return FALLBACK_DATE

  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}

export { FALLBACK_DATE }
```

- [ ] **Step 5: Implement `src/utils/exif.ts`**

```ts
import exifr from "exifr"
import { FALLBACK_DATE, formatExifDate } from "./formatDate"

interface ExifLike {
  DateTimeOriginal?: string | Date
  CreateDate?: string | Date
  ModifyDate?: string | Date
}

export async function readCaptureDate(blob: Blob): Promise<string> {
  try {
    const metadata = (await exifr.parse(blob)) as ExifLike | null
    return formatExifDate(
      metadata?.DateTimeOriginal ?? metadata?.CreateDate ?? metadata?.ModifyDate
    )
  } catch {
    return FALLBACK_DATE
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`

Expected: PASS for `formatExifDate` and `readCaptureDate`

- [ ] **Step 7: Commit**

```bash
git add src/utils/formatDate.ts src/utils/exif.ts src/utils/formatDate.test.ts src/utils/exif.test.ts
git commit -m "feat: add exif date parsing utilities"
```

## Task 3: Preload gallery items and enrich photos with EXIF dates

**Files:**
- Create: `src/utils/preloadGallery.ts`
- Modify: `src/data/galleryItems.ts`
- Test: `src/utils/exif.test.ts`

- [ ] **Step 1: Add a failing preload test to `src/utils/exif.test.ts`**

Append a case that proves only photo items request EXIF parsing while mystery items pass through unchanged.

```ts
import { galleryItems } from "../data/galleryItems"
import { preloadGalleryItems } from "./preloadGallery"

it("adds exifDate only to photo items", async () => {
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(new Blob(["x"])))

  const exifr = await import("exifr")
  vi.mocked(exifr.default.parse).mockResolvedValue({
    DateTimeOriginal: "2024:08:12 18:30:45"
  })

  const result = await preloadGalleryItems(galleryItems.slice(0, 2))

  expect(result[0]).toMatchObject({ type: "photo", exifDate: "12/08/2024" })
  expect(result[1]).toMatchObject({ type: "mystery" })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`

Expected: FAIL because `preloadGalleryItems` does not exist yet

- [ ] **Step 3: Implement `src/utils/preloadGallery.ts`**

```ts
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
        return { ...item, exifDate }
      } catch {
        return { ...item, exifDate: "Chua co ngay chup" }
      }
    })
  )
}
```

- [ ] **Step 4: Run tests to verify the preload path passes**

Run: `npm test`

Expected: PASS for the new preload case and previous EXIF tests

- [ ] **Step 5: Run build to confirm runtime types stay valid**

Run: `npm run build`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/utils/preloadGallery.ts src/utils/exif.test.ts
git commit -m "feat: preload gallery metadata from exif"
```

## Task 4: Refactor renderer to use content items and emit click selections

**Files:**
- Modify: `src/planes.ts`
- Modify: `src/canvas.ts`
- Modify: `src/types/types.ts`
- Modify: `src/types/gallery.ts`

- [ ] **Step 1: Add typed renderer callback contracts**

Extend `src/types/gallery.ts` with a renderer-facing selection callback:

```ts
export interface GallerySelection {
  itemId: string
}
```

Extend `src/types/types.ts` only if needed for shared pointer math. Keep selection types in `gallery.ts`, not `types.ts`.

- [ ] **Step 2: Add the renderer API to `src/planes.ts`**

Refactor the class constructor to accept runtime items and an `onSelect` callback.

```ts
import { RuntimeGalleryItem } from "./types/gallery"

interface Props {
  scene: THREE.Scene
  sizes: Size
  items: RuntimeGalleryItem[]
  onSelect?: (itemId: string) => void
}
```

Store the items and create a deterministic mapping from instance index to manifest item:

```ts
items: RuntimeGalleryItem[]
instanceItemIds: string[] = []
onSelect?: (itemId: string) => void
interactive = true
```

During `fillMeshData()`:

```ts
const item = this.items[i % this.items.length]
this.instanceItemIds[i] = item.id
```

- [ ] **Step 3: Add pointer click picking in `src/planes.ts`**

Use a raycaster against the instanced mesh. Add a `bindSelection(camera, element)` method.

```ts
bindSelection(camera: THREE.PerspectiveCamera, element: HTMLElement) {
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  element.addEventListener("click", (event) => {
    if (!this.interactive) return

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(pointer, camera)
    const [hit] = raycaster.intersectObject(this.mesh)
    const instanceId = hit?.instanceId

    if (instanceId == null) return

    const itemId = this.instanceItemIds[instanceId]
    if (itemId) this.onSelect?.(itemId)
  })
}
```

- [ ] **Step 4: Wire selection through `src/canvas.ts`**

Refactor `Canvas` so it receives runtime items and a selection callback:

```ts
import { RuntimeGalleryItem } from "./types/gallery"

interface CanvasOptions {
  items: RuntimeGalleryItem[]
  onSelect?: (itemId: string) => void
}

constructor({ items, onSelect }: CanvasOptions) {
  this.items = items
  this.onSelect = onSelect
  // existing setup
}
```

Then create planes with:

```ts
this.planes = new Planes({
  scene: this.scene,
  sizes: this.sizes,
  items: this.items,
  onSelect: this.onSelect
})

this.planes.bindDrag(this.renderer.domElement)
this.planes.bindSelection(this.camera, this.renderer.domElement)
```

Add a toggle method for overlays:

```ts
setInteractive(enabled: boolean) {
  this.planes.interactive = enabled
}
```

- [ ] **Step 5: Run build to verify the renderer compiles**

Run: `npm run build`

Expected: PASS, with no type mismatch between renderer and content items

- [ ] **Step 6: Commit**

```bash
git add src/planes.ts src/canvas.ts src/types/gallery.ts src/types/types.ts
git commit -m "feat: add clickable gallery item selection"
```

## Task 5: Add overlay UI and DOM rendering with tests first

**Files:**
- Create: `src/ui/overlay.ts`
- Create: `src/ui/overlay.test.ts`
- Modify: `index.html`
- Modify: `src/style.css`

- [ ] **Step 1: Write failing overlay tests in `src/ui/overlay.test.ts`**

```ts
import { beforeEach, describe, expect, it } from "vitest"
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
      exifDate: "12/08/2024"
    }

    renderOverlay({ mode: "photo-detail", itemId: item.id }, [item], () => {})

    expect(document.body.textContent).toContain("12/08/2024")
    expect(document.body.textContent).toContain("Quay lai")
  })

  it("renders mystery card content", () => {
    const item: RuntimeGalleryItem = {
      id: "mystery-01",
      type: "mystery",
      src: "/covers/image_1.jpg",
      title: "Bi mat nho",
      message: "Cam on em da den."
    }

    renderOverlay({ mode: "mystery-card", itemId: item.id }, [item], () => {})

    expect(document.body.textContent).toContain("Bi mat nho")
    expect(document.body.textContent).toContain("Cam on em da den.")
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`

Expected: FAIL because `renderOverlay` does not exist yet

- [ ] **Step 3: Add `#overlay-root` to `index.html`**

```html
<body>
  <div id="app" class="h-dvh"></div>
  <div id="overlay-root"></div>
  <canvas id="webgl"></canvas>
  <script type="module" src="/src/main.ts"></script>
</body>
```

- [ ] **Step 4: Implement `src/ui/overlay.ts`**

```ts
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
    return
  }

  root.setAttribute("data-open", "true")

  if (item.type === "photo") {
    root.innerHTML = `
      <section class="overlay-shell">
        <button class="overlay-back" type="button">Quay lai</button>
        <article class="detail-card">
          <img class="detail-image" src="${item.src}" alt="Anh ky niem" />
          <div class="detail-copy">
            <p class="detail-date">${item.exifDate ?? "Chua co ngay chup"}</p>
            <p class="detail-caption">${item.caption}</p>
          </div>
        </article>
      </section>
    `
  } else {
    root.innerHTML = `
      <section class="overlay-shell">
        <button class="overlay-back" type="button">Quay lai</button>
        <article class="mystery-card">
          <p class="mystery-kicker">Bat ngo nho</p>
          <h2>${item.title}</h2>
          <p>${item.message}</p>
        </article>
      </section>
    `
  }

  root.querySelector(".overlay-back")?.addEventListener("click", onClose)
}
```

- [ ] **Step 5: Add overlay styles to `src/style.css`**

Append CSS for `#overlay-root`, `.overlay-shell`, `.detail-card`, `.detail-image`, `.detail-copy`, `.mystery-card`, and `.overlay-back`. Keep the palette bright and gift-like, with mobile-friendly stacking below `768px`.

- [ ] **Step 6: Run tests and build**

Run: `npm test && npm run build`

Expected: PASS for overlay tests and production build

- [ ] **Step 7: Commit**

```bash
git add index.html src/ui/overlay.ts src/ui/overlay.test.ts src/style.css
git commit -m "feat: add birthday detail and mystery overlays"
```

## Task 6: Add loading screen and top-level app orchestration

**Files:**
- Create: `src/ui/loadingScreen.ts`
- Create: `src/app.ts`
- Modify: `src/main.ts`
- Modify: `src/canvas.ts`
- Modify: `src/style.css`

- [ ] **Step 1: Implement `src/ui/loadingScreen.ts`**

```ts
export function renderLoadingScreen(root: HTMLElement) {
  root.innerHTML = `
    <section class="loading-screen" data-loading="true">
      <div class="loading-badge">Sinh nhat</div>
      <h1>Chuc mung sinh nhat em</h1>
      <p>Mot mon qua nho dang mo ra...</p>
      <div class="loading-confetti" aria-hidden="true"></div>
    </section>
  `
}

export function clearLoadingScreen(root: HTMLElement) {
  root.innerHTML = ""
}
```

- [ ] **Step 2: Implement app orchestration in `src/app.ts`**

```ts
import Canvas from "./canvas"
import { galleryItems } from "./data/galleryItems"
import { RuntimeGalleryItem, ViewState } from "./types/gallery"
import { renderOverlay } from "./ui/overlay"
import { clearLoadingScreen, renderLoadingScreen } from "./ui/loadingScreen"
import { preloadGalleryItems } from "./utils/preloadGallery"

export default class App {
  canvas?: Canvas
  items: RuntimeGalleryItem[] = []
  state: ViewState = { mode: "loading" }
  appRoot: HTMLElement

  constructor() {
    this.appRoot = document.getElementById("app") as HTMLElement
  }

  async start() {
    renderLoadingScreen(this.appRoot)
    this.items = await preloadGalleryItems(galleryItems)
    clearLoadingScreen(this.appRoot)

    this.canvas = new Canvas({
      items: this.items,
      onSelect: (itemId) => this.openItem(itemId)
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

  closeOverlay = () => this.setState({ mode: "gallery" })

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
```

- [ ] **Step 3: Simplify `src/main.ts` to boot the new app**

```ts
import "./style.css"
import App from "./app"

const app = new App()
app.start()
```

- [ ] **Step 4: Extend `src/style.css` with loading-screen styles**

Add CSS for:

- `.loading-screen`
- `.loading-badge`
- celebratory gradient background
- subtle confetti / sparkle motion
- smooth fade-out support

Keep the visual tone birthday-first and readable in Vietnamese.

- [ ] **Step 5: Run the app locally and verify the flow manually**

Run: `npm run dev -- --host 127.0.0.1`

Expected:

- loading screen appears first
- gallery loads afterward
- clicking normal photos opens detail overlay
- clicking mystery items opens greeting card overlay
- `Quay lai` returns to the gallery

- [ ] **Step 6: Run full verification**

Run: `npm test && npm run build`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/ui/loadingScreen.ts src/app.ts src/main.ts src/style.css src/canvas.ts
git commit -m "feat: orchestrate birthday gallery experience"
```

## Task 7: Polish responsive layout and content readiness

**Files:**
- Modify: `src/style.css`
- Modify: `src/data/galleryItems.ts`
- Modify: `src/ui/overlay.ts`

- [ ] **Step 1: Replace temporary mystery copy with final starter-safe copy**

Update the 5 mystery entries in `src/data/galleryItems.ts` so each one has a distinct title and heartfelt starter message in Vietnamese. Keep them editable later, but gift-ready now.

```ts
{
  id: "mystery-03",
  type: "mystery",
  src: "/covers/image_17.jpg",
  title: "Dieu anh muon noi",
  message: "Chuc em luon vui ve, duoc yeu thuong, va gap that nhieu dieu dep de thuong."
}
```

- [ ] **Step 2: Tighten mobile overlay layout in `src/style.css`**

Ensure the detail and mystery overlays:

- stack cleanly on small screens
- keep the back button reachable
- avoid image overflow
- preserve readable spacing and font sizes

Use a media query under `768px` to switch the detail card to a vertical layout.

- [ ] **Step 3: Make overlay text resilient in `src/ui/overlay.ts`**

Add safe fallback rendering for captions and mystery content:

```ts
const safeCaption = item.type === "photo"
  ? item.caption || "Viet caption cua ban o day."
  : ""
```

and for mystery cards:

```ts
const safeTitle = item.title || "Bat ngo nho"
const safeMessage =
  item.message || "Chuc em mot ngay sinh nhat that vui va that nhieu yeu thuong."
```

- [ ] **Step 4: Run final verification**

Run: `npm test && npm run build`

Expected: PASS

Then manually verify in the browser at:

- desktop width around `1280px`
- mobile width around `390px`

Expected:

- loading screen stays readable
- overlays remain usable
- detail and mystery experiences feel intentional rather than broken at small sizes

- [ ] **Step 5: Commit**

```bash
git add src/style.css src/data/galleryItems.ts src/ui/overlay.ts
git commit -m "feat: polish birthday gallery overlays for delivery"
```

## Spec Coverage Check

- 30 images and 5 mystery items: covered in Task 1 and Task 7
- EXIF-based date reading: covered in Task 2 and Task 3
- dedicated detail overlay with date, caption, and back button: covered in Task 5 and Task 6
- mystery greeting card flow: covered in Task 5, Task 6, and Task 7
- birthday-themed loading screen: covered in Task 6
- preserve current floating gallery as base animation: covered in Task 4 and Task 6
- Vietnamese UI copy: covered in Tasks 1, 5, 6, and 7
- responsive usability: covered in Task 5 and Task 7

## Placeholder Scan

- No `TODO` or `TBD` placeholders remain in implementation steps
- Each command includes an expected outcome
- Each code-creation step names exact files and concrete code direction

## Type Consistency Check

- `GalleryItem`, `RuntimeGalleryItem`, and `ViewState` are introduced first in Task 1 and reused consistently later
- `readCaptureDate` returns the same `string` display format expected by overlay rendering
- renderer click flow consistently passes `itemId` into app state transitions

## Execution Notes

- Start by reconnecting or initializing Git if this folder remains detached from its original repository
- Keep the local `three-0.179.1.tgz` dependency pinned unless the package source is cleaned up separately
- Use the existing browser preview to manually validate the emotional feel of transitions after each major task

Plan complete and saved to `docs/superpowers/plans/2026-06-22-birthday-gallery-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
