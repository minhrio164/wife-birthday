interface MountAgentationOptions {
  enabled: boolean
  document?: Document
  renderAgentation?: (host: HTMLElement) => Promise<void> | void
}

export function ensureAgentationHost(doc: Document) {
  const existing = doc.getElementById("agentation-root")
  if (existing) return existing

  const host = doc.createElement("div")
  host.id = "agentation-root"
  doc.body.appendChild(host)
  return host
}

export async function mountAgentation({
  enabled,
  document: doc = document,
  renderAgentation = renderAgentationRoot,
}: MountAgentationOptions) {
  if (!enabled) return false

  const host = ensureAgentationHost(doc)
  await renderAgentation(host)
  return true
}

async function renderAgentationRoot(host: HTMLElement) {
  const [{ createElement }, { createRoot }, { Agentation }] = await Promise.all([
    import("react"),
    import("react-dom/client"),
    import("agentation"),
  ])

  const root = createRoot(host)
  root.render(createElement(Agentation))
}
