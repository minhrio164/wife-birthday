// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest"
import { ensureAgentationHost, mountAgentation } from "./agentation"

describe("mountAgentation", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  it("creates a reusable host element", () => {
    const first = ensureAgentationHost(document)
    const second = ensureAgentationHost(document)

    expect(first.id).toBe("agentation-root")
    expect(second).toBe(first)
    expect(document.querySelectorAll("#agentation-root")).toHaveLength(1)
  })

  it("does not mount when disabled", async () => {
    const renderAgentation = vi.fn()

    const mounted = await mountAgentation({
      enabled: false,
      document,
      renderAgentation,
    })

    expect(mounted).toBe(false)
    expect(renderAgentation).not.toHaveBeenCalled()
    expect(document.getElementById("agentation-root")).toBeNull()
  })

  it("creates the host and delegates rendering when enabled", async () => {
    const renderAgentation = vi.fn()

    const mounted = await mountAgentation({
      enabled: true,
      document,
      renderAgentation,
    })

    expect(mounted).toBe(true)
    expect(renderAgentation).toHaveBeenCalledTimes(1)
    expect(document.getElementById("agentation-root")).not.toBeNull()
  })
})
