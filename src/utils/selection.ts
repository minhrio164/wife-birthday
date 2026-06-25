export interface ScreenPointer {
  x: number
  y: number
}

export interface ScreenRect {
  itemId: string
  left: number
  right: number
  top: number
  bottom: number
  depth: number
}

export function pickItemFromScreenRects(
  pointer: ScreenPointer,
  rects: ScreenRect[]
): string | null {
  const hits = rects.filter(
    (rect) =>
      pointer.x >= rect.left &&
      pointer.x <= rect.right &&
      pointer.y >= rect.top &&
      pointer.y <= rect.bottom
  )

  if (hits.length === 0) return null

  hits.sort((a, b) => a.depth - b.depth)
  return hits[0].itemId
}
