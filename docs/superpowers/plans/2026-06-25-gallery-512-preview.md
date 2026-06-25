# Gallery 512 Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder gallery images with the real assets currently stored in `public/512` so the browser preview shows actual photos.

**Architecture:** Keep the existing gallery data shape and overlay behavior unchanged. Only swap the `src` values in `src/data/galleryItems.ts` from generated placeholder data URLs to stable `/512/*.jpg` asset paths, while preserving captions, mystery cards, and EXIF preloading.

**Tech Stack:** TypeScript, Vite, Vitest

---

### Task 1: Verify gallery sources with a failing test

**Files:**
- Modify: `src/utils/exif.test.ts`
- Test: `src/utils/exif.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("uses bundled /512 images for preview photos", () => {
  const photoItems = galleryItems.filter((item) => item.type === "photo")

  expect(photoItems).toHaveLength(25)
  expect(photoItems[0]?.src).toBe("/512/p1.jpg")
  expect(photoItems[12]?.src).toBe("/512/p13.jpg")
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/utils/exif.test.ts`
Expected: FAIL because gallery photo `src` values are still placeholder `data:image/svg+xml` URLs.

### Task 2: Point gallery data at the current `/512` assets

**Files:**
- Modify: `src/data/galleryItems.ts`
- Test: `src/utils/exif.test.ts`

- [ ] **Step 1: Write minimal implementation**

```ts
const photoSources = [
  "/512/p1.jpg",
  "/512/p2.jpg",
  "/512/p3.jpg",
  "/512/p4.jpg",
  "/512/p5.jpg",
  "/512/p6.jpg",
  "/512/p7.jpg",
  "/512/p8.jpg",
  "/512/p9.jpg",
  "/512/p10.jpg",
  "/512/p11.jpg",
  "/512/p12.jpg",
  "/512/p13.jpg",
] as const

function createPhoto(index: number): GalleryPhotoItem {
  const ordinal = String(index + 1).padStart(2, "0")
  const src = photoSources[index % photoSources.length]

  return {
    id: `photo-${ordinal}`,
    type: "photo",
    src,
    caption: `Caption demo ${ordinal} - mot khoanh khac dang yeu de sau nay ban thay vao.`,
    demoDate: `${String((index % 27) + 1).padStart(2, "0")}/${String(((index + 3) % 12) + 1).padStart(2, "0")}/2024`,
  }
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npm test -- src/utils/exif.test.ts`
Expected: PASS

### Task 3: Full verification

**Files:**
- Modify: `src/data/galleryItems.ts`
- Modify: `src/utils/exif.test.ts`

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS with all test files green.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: PASS and emit `dist/` output without errors.
