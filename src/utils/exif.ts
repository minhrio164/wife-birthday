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
