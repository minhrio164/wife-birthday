import { GalleryItem, GalleryPhotoItem } from "../types/gallery"

const palette = [
  ["#f36c61", "#f8d27a"],
  ["#6e7cf7", "#91e6ff"],
  ["#ff8fb8", "#ffd9a8"],
  ["#3bc9a7", "#dafb7d"],
  ["#7f63ff", "#ff8ec7"],
  ["#ff9f68", "#ffe06b"],
]

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

function createPlaceholderImage(index: number, label: string) {
  const [start, end] = palette[index % palette.length]
  const number = String(index + 1).padStart(2, "0")
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1400">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="900" height="1400" rx="64" fill="url(#g)" />
      <circle cx="760" cy="220" r="150" fill="rgba(255,255,255,0.16)" />
      <circle cx="180" cy="1180" r="180" fill="rgba(255,255,255,0.12)" />
      <rect x="72" y="72" width="756" height="1256" rx="42" fill="rgba(22,18,37,0.14)" stroke="rgba(255,255,255,0.36)" stroke-width="4" />
      <text x="92" y="180" fill="rgba(255,255,255,0.86)" font-size="42" font-family="Helvetica, Arial, sans-serif" letter-spacing="10">BIRTHDAY DEMO</text>
      <text x="92" y="680" fill="#fffdf7" font-size="220" font-weight="700" font-family="Helvetica, Arial, sans-serif">${number}</text>
      <text x="92" y="800" fill="rgba(255,255,255,0.92)" font-size="82" font-weight="700" font-family="Helvetica, Arial, sans-serif">${label}</text>
      <text x="92" y="1210" fill="rgba(255,255,255,0.82)" font-size="38" font-family="Helvetica, Arial, sans-serif">Image holder tam thoi cho gallery</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

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

const photoItems = Array.from({ length: 25 }, (_, index) => createPhoto(index))

const mysteryEntries: GalleryItem[] = [
  {
    id: "mystery-01",
    type: "mystery",
    src: "/mystery-thumbnail.png",
    detailSrc: "/mystery-letter.png",
    title: "Dieu nho xiu dau tien",
    message: "Neu hom nay em dang cuoi, thi anh muon em cuoi them mot chut nua. Chuc em co mot sinh nhat that ngot ngao.",
  },
  {
    id: "mystery-02",
    type: "mystery",
    src: "/mystery-thumbnail.png",
    detailSrc: "/mystery-letter.png",
    title: "Qua bat ngo thu hai",
    message: "Co nhung ngay binh thuong boi vi co em ma tro thanh ky niem. Cam on em da xuat hien trong cuoc song cua anh.",
  },
  {
    id: "mystery-03",
    type: "mystery",
    src: "/mystery-thumbnail.png",
    detailSrc: "/mystery-letter.png",
    title: "Chuc em mot dieu dep",
    message: "Mong em luon duoc yeu thuong, duoc bao boc, va luon gap nhung dieu dep de nhat tren duong di cua minh.",
  },
  {
    id: "mystery-04",
    type: "mystery",
    src: "/mystery-thumbnail.png",
    detailSrc: "/mystery-letter.png",
    title: "Phia sau moi tam anh",
    message: "Moi tam anh o day chi la cai co. Dieu anh thuc su muon giu lai la cam giac duoc di cung em qua nhung ngay vui the nay.",
  },
  {
    id: "mystery-05",
    type: "mystery",
    src: "/mystery-thumbnail.png",
    detailSrc: "/mystery-letter.png",
    title: "Chot lai bang mot loi chuc",
    message: "Chuc em mot tuoi moi that ruc ro, nhieu niem vui, nhieu suc khoe, va that nhieu tinh yeu o quanh minh.",
  },
]

export const galleryItems: GalleryItem[] = [
  photoItems[0],
  photoItems[1],
  photoItems[2],
  mysteryEntries[0],
  photoItems[3],
  photoItems[4],
  photoItems[5],
  photoItems[6],
  mysteryEntries[1],
  photoItems[7],
  photoItems[8],
  photoItems[9],
  photoItems[10],
  mysteryEntries[2],
  photoItems[11],
  photoItems[12],
  photoItems[13],
  mysteryEntries[3],
  photoItems[14],
  photoItems[15],
  photoItems[16],
  photoItems[17],
  photoItems[18],
  mysteryEntries[4],
  photoItems[19],
  photoItems[20],
  photoItems[21],
  photoItems[22],
  photoItems[23],
  photoItems[24],
]
