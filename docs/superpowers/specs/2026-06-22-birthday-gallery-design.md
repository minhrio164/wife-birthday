# Birthday Gallery Design

## Goal

Build a birthday gift website in Vietnamese based on the existing Spotify-style floating gallery animation.

The experience should feel playful and celebratory at first, then become intimate when the viewer opens photos and hidden message cards.

## Confirmed Scope

- Keep the existing floating gallery as the main visual foundation.
- Use exactly 30 images.
- Reuse those 30 images across the instanced gallery.
- Mark 5 of the 30 items as mystery items.
- Clicking a normal photo opens a dedicated detail view.
- Clicking a mystery item opens a greeting card instead of a photo detail view.
- Read photo capture date from the image EXIF metadata when available.
- Show caption placeholders for normal photos.
- Keep all visible UI copy in Vietnamese.
- Add a birthday-themed loading screen before entering the gallery.

## Non-Goals For V1

- No admin UI for uploading or editing photos in the browser.
- No custom music player or background music by default.
- No multi-page story flow outside loading, gallery, detail, and mystery card states.
- No manual metadata authoring flow in the app UI.
- No backend service unless later required by deployment constraints.

## Product Experience

The website has three core states and one shared background behavior:

1. Loading screen
2. Gallery mode
3. Photo detail mode
4. Mystery card mode

The gallery animation remains the emotional anchor of the site. When the user opens a photo or mystery card, the gallery should still feel present in the background, but interaction with it should be disabled until the viewer closes the overlay.

## State Design

### 1. Loading Screen

The site opens on a full-screen birthday-themed loading experience with a bright, celebratory tone.

Visual direction:

- Birthday-first, not dreamy-romantic-first
- Warm, cheerful palette
- Motion that feels like a gift reveal
- Vietnamese intro copy

Suggested content:

- Main line such as `Chuc mung sinh nhat em`
- Supporting line such as `Mot mon qua nho dang mo ra...`
- Confetti, sparkles, gift-like reveal, or floating celebratory particles

Exit condition:

The loading screen should only dismiss when the app has enough data to transition smoothly:

- photo manifest loaded
- EXIF processing finished or safely failed with fallback values
- main gallery assets ready enough to render

The loading screen should fade or reveal into the gallery rather than disappearing abruptly.

### 2. Gallery Mode

This is the default interactive state after loading.

Behavior:

- Preserve the current drag and scroll feeling from the existing animation.
- Continue using the floating 3D photo wall effect.
- Use the 30 provided images as the only source set.
- Repeat those 30 images across the larger instanced mesh population.

Interaction:

- Hover feedback is optional.
- Clicking a photo must identify the selected gallery item.
- Clicking a normal item opens photo detail mode.
- Clicking a mystery item opens mystery card mode.

The gallery should pause user interaction while an overlay is open, but it may continue subtle motion in the background for atmosphere.

### 3. Photo Detail Mode

Normal photos open in a separate full-screen detail overlay rather than zooming in place inside the WebGL scene.

Required content:

- Large photo
- Capture date from EXIF
- Caption placeholder in Vietnamese
- `Quay lai` button

Recommended behavior:

- Fade and scale transition from gallery to overlay
- Background gallery blurred or dimmed slightly
- Overlay layout optimized for both desktop and mobile

Fallback behavior:

- If EXIF date is missing, display `Chua co ngay chup`
- If a photo fails to load, show a graceful error state with a close action

### 4. Mystery Card Mode

Mystery items open a dedicated card overlay instead of a photo detail view.

Behavior:

- Full-screen or centered card overlay
- Distinct visual treatment from normal photo detail
- Vietnamese greeting text
- `Quay lai` button

Content model:

- Each mystery item can have its own title and message
- Mystery cards should feel rewarding and personal
- The 5 mystery items do not need unique gallery styling before click, so discovery still feels surprising

## Data Model

The current hard-coded image list in the rendering flow should be replaced by a shared manifest.

Each gallery item should support a structure equivalent to:

```ts
type GalleryItem =
  | {
      id: string
      type: "photo"
      src: string
      caption: string
      exifDate?: string
    }
  | {
      id: string
      type: "mystery"
      src: string
      title: string
      message: string
    }
```

Rules:

- Total items: 30
- Total mystery items: 5
- Remaining items are normal photos
- Caption values for photos start as placeholders
- EXIF date is derived at runtime from the image file when possible

## EXIF Date Handling

The app should read image EXIF metadata on the client from the original source images.

Primary target field:

- `DateTimeOriginal`

Fallback order:

1. `DateTimeOriginal`
2. Other usable EXIF date fields if available
3. No date available -> `Chua co ngay chup`

Formatting:

- Normalize for Vietnamese display
- Prefer a human-friendly format like `dd/mm/yyyy`

Behavioral requirement:

- EXIF parsing failure must never block the rest of the website permanently
- Failure should degrade cleanly to fallback text

## Architecture Plan

### Rendering Layer

Keep the existing Three.js gallery renderer, but separate content data from rendering logic.

Rendering responsibilities:

- build and animate the instanced gallery
- expose item identity for click selection
- respond to drag and scroll input

Rendering should not own overlay UI markup or textual content.

### App State Layer

Introduce a higher-level UI state controller for:

- loading
- gallery active
- selected photo detail
- selected mystery card

A simple state model is enough:

```ts
type ViewState =
  | { mode: "loading" }
  | { mode: "gallery" }
  | { mode: "photo-detail"; itemId: string }
  | { mode: "mystery-card"; itemId: string }
```

This keeps interaction logic understandable and prevents WebGL code from becoming responsible for page-level UI.

### Content Layer

Store gallery item definitions in a dedicated content module so the user can later edit:

- photo ordering
- mystery flags
- captions
- mystery messages

without touching rendering internals.

### Overlay UI Layer

Build photo detail and mystery cards with HTML/CSS instead of trying to render all text content inside the shader scene.

Reasons:

- simpler responsive layout
- easier typography and button design
- cleaner accessibility
- easier content editing later

## Click Selection Strategy

The gallery needs deterministic item picking for click interactions.

Implementation direction:

- Use Three.js raycasting or an equivalent hit detection strategy against visible gallery instances
- Map clicked instance back to a gallery manifest item
- Respect whether the selected item is `photo` or `mystery`

If exact per-instance picking in the current instanced setup becomes too brittle, the fallback should still preserve the same user-facing behavior, not remove click-to-open.

## Responsive Behavior

Desktop:

- Detail overlay can use a split layout or large centered composition
- Generous spacing and typography

Mobile:

- Large photo stacked above metadata and caption
- Easy-to-tap close button
- No tiny overlay controls

The loading screen, gallery, detail overlay, and mystery cards must all remain usable on mobile screens.

## Visual Direction

### Overall

- Keep the motion-rich floating gallery from the original demo
- Use bright birthday energy up front
- Use warmer, more intimate UI inside detail and mystery views

### Overlay Style

- Clean typography
- Soft surfaces
- Gentle transitions
- No harsh app-like chrome

### Copy Tone

- Entire UI in Vietnamese
- Captions remain placeholders for now
- Mystery messages should support handwritten-feeling or heartfelt tone later

## Error Handling

The app should handle these cases gracefully:

- Missing EXIF metadata
- Corrupt or unreadable image
- Slow image loading
- Mystery item missing message content

Fallbacks:

- Missing EXIF -> `Chua co ngay chup`
- Missing caption -> default placeholder
- Missing mystery content -> safe default greeting copy
- Asset failure -> show closeable error or skip broken asset from detail view

## Testing Expectations

The implementation should verify:

- all 30 items load into the content manifest
- exactly 5 items behave as mystery cards
- normal photos open photo detail mode
- mystery items open card mode
- EXIF extraction works for images that contain metadata
- images without EXIF show fallback text
- `Quay lai` returns to gallery mode
- loading screen exits only after content is ready
- layouts behave acceptably on desktop and mobile

## Delivery Notes

The first implementation pass should prioritize a polished, stable gift experience over advanced tooling.

This means:

- use direct local assets
- keep editing simple
- avoid unnecessary infrastructure
- preserve the emotional effect of the existing animation while making the content personal

## Open Assumptions Resolved

- Image count is fixed at 30.
- Mystery item count is fixed at 5.
- Captions will be placeholders for now.
- Dates should come from EXIF automatically.
- Language should be Vietnamese.
- Loading screen style should be birthday-celebratory.
- Detail view should be a separate dedicated overlay, not an in-scene zoom.
