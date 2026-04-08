/**
 * Optional: `npm run generate:print-guide` writes a minimal placeholder PDF.
 * Does NOT run on `npm run build`.
 *
 * Never overwrites an existing `public/print-guide.pdf` unless you set
 * `FORCE_GENERATE_PRINT_GUIDE=1` (so CI, old Netlify commands, or accidental runs cannot clobber the real asset).
 */
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = join(__dirname, "..", "public", "print-guide.pdf")

if (existsSync(out) && process.env.FORCE_GENERATE_PRINT_GUIDE !== "1") {
  console.log(
    "Skipping: public/print-guide.pdf already exists. Remove the file or set FORCE_GENERATE_PRINT_GUIDE=1 to regenerate the placeholder.",
  )
  process.exit(0)
}

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
