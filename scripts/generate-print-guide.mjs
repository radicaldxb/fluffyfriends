/** Optional: run `npm run generate:print-guide` to write a minimal placeholder PDF. Not run on `npm run build` — the real asset is `public/print-guide.pdf` in git. */
import { writeFileSync, mkdirSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = join(__dirname, "..", "public", "print-guide.pdf")

const pdfDoc = await PDFDocument.create()
const page = pdfDoc.addPage([612, 792])
const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
let y = 750

function line(text, size, bold, dy = 16) {
  page.drawText(text, {
    x: 50,
    y,
    size,
    font: bold ? fontBold : font,
    color: rgb(0.15, 0.12, 0.1),
  })
  y -= dy
}

line("FluffyFriends — Print guide", 20, true, 28)
y -= 8
line(
  "Your download includes wide (16:9) and portrait formats, ready for professional printing.",
  11,
  false,
  36,
)
line("Quick tips", 14, true, 22)
line("• Use the file that matches your frame or print size (wide vs portrait).", 11, false, 18)
line(
  '• For best results, ask your print shop for "fit to page" or supply exact dimensions.',
  11,
  false,
  18,
)
line(
  "• Files are high resolution — suitable for sizes up to A1 and similar large formats.",
  11,
  false,
  18,
)
line(
  "• Prefer matte or semi-gloss paper for art-style portraits; avoid heavy gloss if you want a softer look.",
  11,
  false,
  18,
)
y -= 12
line("Questions? hello@fluffyfriends.online", 11, false, 18)
line("https://fluffyfriends.online", 11, false, 18)

const pdfBytes = await pdfDoc.save()
mkdirSync(join(__dirname, "..", "public"), { recursive: true })
writeFileSync(out, pdfBytes)
console.log("Wrote", out, pdfBytes.length, "bytes")
