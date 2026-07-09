/**
 * Generate realistic Indonesian thermal-receipt style PNGs for the agentic bench.
 * Run: bun run scripts/generate-receipt-fixtures.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = join(import.meta.dir, "../fixtures/agentic/images");
mkdirSync(OUT, { recursive: true });

type Receipt = {
  file: string;
  vendor: string;
  lines: string[];
  total: number;
  tanggal: string;
  items: Array<{ name: string; jumlah: number }>;
};

const RECEIPTS: Receipt[] = [
  {
    file: "nota-indomaret.png",
    vendor: "Indomaret",
    tanggal: "2026-07-02",
    total: 87500,
    items: [
      { name: "INDOMIE GORENG 5PCS", jumlah: 17500 },
      { name: "TEH BOTOL SOSRO 350ML", jumlah: 6000 },
      { name: "BERAS RAMOS 5KG", jumlah: 64000 },
    ],
    lines: [
      "        INDOMARET",
      "   Jl. Raya Ciputat No. 12",
      "      Tangerang Selatan",
      "NPWP: 01.234.567.8-012.000",
      "--------------------------------",
      "02/07/2026  18:42  Kasir: Siti",
      "Struk: IDM-260702-88421",
      "--------------------------------",
      "INDOMIE GORENG 5PCS     17.500",
      "TEH BOTOL SOSRO 350ML    6.000",
      "BERAS RAMOS 5KG         64.000",
      "--------------------------------",
      "SUBTOTAL               87.500",
      "PPN (included)              0",
      "TOTAL                  87.500",
      "TUNAI                 100.000",
      "KEMBALI                12.500",
      "--------------------------------",
      "  Terima kasih telah belanja",
      "     di Indomaret",
    ],
  },
  {
    file: "nota-alfamart.png",
    vendor: "Alfamart",
    tanggal: "2026-07-05",
    total: 45200,
    items: [
      { name: "MINYAK GORENG 2L", jumlah: 38000 },
      { name: "GULA PASIR 1KG", jumlah: 7200 },
    ],
    lines: [
      "         ALFAMART",
      "    Cabang Pondok Aren",
      "--------------------------------",
      "05/07/2026  09:15  STR: AFM-99102",
      "--------------------------------",
      "MINYAK GORENG 2L        38.000",
      "GULA PASIR 1KG           7.200",
      "--------------------------------",
      "TOTAL                  45.200",
      "QRIS                   45.200",
      "--------------------------------",
      "   Belanja hemat di Alfamart",
    ],
  },
  {
    file: "nota-warung-padang.png",
    vendor: "Warung Padang Sederhana",
    tanggal: "2026-07-03",
    total: 85000,
    items: [
      { name: "NASI PADANG PAKET A", jumlah: 35000 },
      { name: "AYAM POP", jumlah: 28000 },
      { name: "ES TEH MANIS x2", jumlah: 16000 },
      { name: "KERUPUK", jumlah: 6000 },
    ],
    lines: [
      "   WARUNG PADANG SEDERHANA",
      "     Jl. Fatmawati Raya 88",
      "          Jakarta Selatan",
      "--------------------------------",
      "03/07/2026  12:30  Meja: 4",
      "--------------------------------",
      "NASI PADANG PAKET A     35.000",
      "AYAM POP                28.000",
      "ES TEH MANIS x2         16.000",
      "KERUPUK                  6.000",
      "--------------------------------",
      "TOTAL                  85.000",
      "BAYAR (QRIS)            85.000",
      "--------------------------------",
      "  Terima kasih - datang kembali",
    ],
  },
  {
    file: "nota-spbu-pertamina.png",
    vendor: "SPBU Pertamina 34.12345",
    tanggal: "2026-07-01",
    total: 150000,
    items: [{ name: "PERTALITE 10.00 L", jumlah: 150000 }],
    lines: [
      "      SPBU PERTAMINA",
      "        34-12345",
      "   Jl. Tol Jakarta-Tangerang",
      "--------------------------------",
      "01/07/2026  07:05",
      "Nozzle: 3   Shift: Pagi",
      "--------------------------------",
      "Produk: PERTALITE",
      "Harga/L: Rp 15.000",
      "Volume: 10.00 Liter",
      "--------------------------------",
      "TOTAL                 150.000",
      "Metode: Flazz / e-money",
      "--------------------------------",
      "   Selamat jalan, hati-hati",
    ],
  },
  {
    file: "nota-apotik-kimia-farma.png",
    vendor: "Kimia Farma Apotek",
    tanggal: "2026-06-28",
    total: 127500,
    items: [
      { name: "PARACETAMOL 500MG", jumlah: 18000 },
      { name: "VITAMIN C 1000MG", jumlah: 45000 },
      { name: "MASKER MEDIS BOX", jumlah: 64500 },
    ],
    lines: [
      "     KIMIA FARMA APOTEK",
      "      Cabang Bintaro",
      "--------------------------------",
      "28/06/2026  16:20  Resep: -",
      "--------------------------------",
      "PARACETAMOL 500MG       18.000",
      "VITAMIN C 1000MG        45.000",
      "MASKER MEDIS BOX        64.500",
      "--------------------------------",
      "TOTAL                 127.500",
      "TUNAI                 150.000",
      "KEMBALI                22.500",
      "--------------------------------",
    ],
  },
];

async function renderReceipt(r: Receipt) {
  const width = 420;
  const lineH = 22;
  const pad = 24;
  const height = pad * 2 + r.lines.length * lineH + 20;
  const text = r.lines
    .map(
      (line, i) =>
        `<text x="${pad}" y="${pad + 16 + i * lineH}" font-family="DejaVu Sans Mono, Courier New, monospace" font-size="14" fill="#111">${escapeXml(line)}</text>`,
    )
    .join("\n");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f7f7f2"/>
  <rect x="8" y="8" width="${width - 16}" height="${height - 16}" fill="#fffef8" stroke="#ddd" stroke-width="1"/>
  ${text}
</svg>`;
  const png = await sharp(Buffer.from(svg)).png().toFile(join(OUT, r.file));
  return png;
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const meta = [];
for (const r of RECEIPTS) {
  await renderReceipt(r);
  meta.push({
    file: r.file,
    path: `fixtures/agentic/images/${r.file}`,
    vendor: r.vendor,
    total: r.total,
    tanggal: r.tanggal,
    items: r.items,
  });
  console.log("wrote", r.file, "total", r.total);
}

writeFileSync(join(OUT, "receipts-manifest.json"), JSON.stringify({ receipts: meta }, null, 2));
console.log("manifest ok", meta.length);
