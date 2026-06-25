# Floating Music Widget Design

## Goal

Add a compact floating music player widget to the birthday gallery site that sits at the bottom center of the viewport and visually follows the glassmorphism style from the referenced CodePen, without interfering with the WebGL gallery interactions or modal overlays.

## Context

The current app is a Vite + TypeScript site with:

- a WebGL gallery rendered through `Canvas` / `Planes`
- DOM overlays for image and mystery detail states
- a visual theme that now includes a galaxy background and glass-like accents

This makes the music player a good fit as a DOM widget layered above the gallery canvas, rather than something rendered inside WebGL.

## Chosen Approach

Implement a **floating compact widget**:

- `position: fixed`
- horizontally centered at the bottom of the viewport
- visually floating above the gallery
- glassmorphism styling inspired by the CodePen reference
- shown during normal gallery browsing
- placed below modal overlays in stacking order so photo and mystery detail views remain the primary focus

This is preferred over a full-width dock or an auto-hide player because it matches the desired “widget” behavior while keeping implementation scope contained.

## Layout

The widget is a single horizontal card with three sections:

1. **Thumb section**
   - album/image thumbnail on the left
   - rounded corners
   - fixed small square footprint

2. **Meta section**
   - track title
   - artist/subtitle
   - vertically stacked
   - centered visually within the widget height

3. **Control section**
   - play/pause primary button
   - next/skip button
   - compact spacing
   - controls aligned to the right edge

The overall widget should be compact enough to float above the page without feeling like a footer.

## Visual Direction

Use the CodePen as stylistic inspiration, not a literal copy-paste.

Required visual traits:

- frosted glass background
- soft translucent overlay
- large pill-like border radius
- subtle inner highlight and outer shadow
- light text over the galaxy background
- gentle visual contrast that stays readable over the pink cloud/stars scene

The widget should feel intentional within the birthday theme, not like an unrelated audio bar dropped on top.

## Behavior

### Visibility

- visible in gallery mode
- can remain mounted across app states
- should sit beneath detail overlays via `z-index`

### Interaction

- play/pause toggles player state
- next advances to the next track in a local playlist
- clicking the widget controls must not trigger or interfere with gallery selection behind it

### Audio

Initial scope supports a small local playlist model in code.

Possible sources:

- local audio files in `public/`
- external audio URLs if provided later

If no real audio assets are available yet, the implementation may still establish the component structure and state flow, but true playback should be treated as dependent on track sources.

## Architecture

Add the player as a DOM-driven UI module separate from the WebGL renderer.

Suggested boundaries:

- `src/ui/musicWidget.ts`
  - render widget markup
  - bind controls
  - expose update hooks if needed

- `src/data/musicTracks.ts`
  - playlist metadata such as title, artist, image, audio source

- `src/app.ts`
  - initialize the widget during app startup
  - keep lifecycle separate from overlay state

This keeps audio/widget logic isolated from `Canvas` and `Planes`.

## Layering

Recommended stacking order:

- WebGL gallery canvas at the base
- floating music widget above the gallery
- modal overlays above the widget
- loading screen above everything when active

This preserves the widget’s persistent feel while respecting modal focus.

## Responsiveness

Desktop-first behavior:

- centered floating widget at bottom
- comfortable horizontal layout

Mobile fallback:

- slightly narrower width
- tighter spacing
- same bottom-center anchoring

The widget should never overflow the viewport width.

## Testing

Implementation should verify:

- widget renders with expected structure
- control buttons are present and clickable
- play/pause state changes correctly
- next changes displayed track metadata
- widget does not visually overtake overlays
- build remains clean

## Scope Notes

Included:

- floating glass player UI
- local widget state
- track switching
- play/pause interaction

Not included in this scope:

- waveform/progress scrubber
- volume slider
- drag/reposition behavior
- Spotify API integration
- synchronization with WebGL objects

## Recommendation

Proceed with the floating compact widget as a self-contained DOM module. This gives the site the desired “music companion” feel with low risk to the existing gallery and overlay systems.
