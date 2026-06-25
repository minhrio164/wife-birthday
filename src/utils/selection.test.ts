import { describe, expect, it } from "vitest"
import { pickItemFromScreenRects } from "./selection"

describe("pickItemFromScreenRects", () => {
  it("selects the frontmost item under the pointer", () => {
    const result = pickItemFromScreenRects(
      { x: 240, y: 180 },
      [
        {
          itemId: "back",
          left: 180,
          right: 300,
          top: 120,
          bottom: 260,
          depth: 0.8,
        },
        {
          itemId: "front",
          left: 200,
          right: 280,
          top: 140,
          bottom: 240,
          depth: 0.2,
        },
      ]
    )

    expect(result).toBe("front")
  })

  it("returns null when the pointer is outside every item", () => {
    const result = pickItemFromScreenRects(
      { x: 40, y: 40 },
      [
        {
          itemId: "photo-01",
          left: 180,
          right: 300,
          top: 120,
          bottom: 260,
          depth: 0.5,
        },
      ]
    )

    expect(result).toBeNull()
  })
})
