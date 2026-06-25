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
