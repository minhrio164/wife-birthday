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
