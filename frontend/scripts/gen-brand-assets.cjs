const sharp = require("sharp");

const capPath = (cx, cy, s) => `
  <g transform="translate(${cx},${cy}) scale(${s})">
    <polygon points="0,-32 64,-8 0,16 -64,-8" fill="#ffffff"/>
    <path d="M -34,-4 L -34,22 Q -34,38 0,38 Q 34,38 34,22 L 34,-4 L 0,10 L -34,-4 Z" fill="#ffd7a8"/>
    <rect x="56" y="-8" width="6" height="40" rx="3" fill="#ffffff"/>
    <circle cx="59" cy="36" r="7" fill="#ff9a3c"/>
  </g>`;

const ogSvg = `<svg width="1536" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1e4b"/>
      <stop offset="0.55" stop-color="#123a8f"/>
      <stop offset="1" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1536" height="1024" fill="url(#bg)"/>
  <circle cx="1300" cy="180" r="260" fill="#2563eb" opacity="0.18"/>
  <circle cx="180" cy="880" r="300" fill="#f97316" opacity="0.12"/>
  ${capPath(768, 360, 2.1)}
  <text x="768" y="640" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="118" font-weight="bold" fill="#ffffff">StudyMaterial</text>
  <text x="768" y="740" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" fill="#93c5fd">Notes &#183; Papers &#183; Live Classes &#183; Quizzes</text>
  <text x="768" y="820" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" fill="#fdba74">Class 10, 11 &amp; 12 &#8212; Medical, Non-Medical, Commerce, Arts</text>
</svg>`;

const iconSvg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1d4ed8"/>
      <stop offset="1" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#bg2)"/>
  ${capPath(256, 250, 2.6)}
</svg>`;

async function main() {
  await sharp(Buffer.from(ogSvg), { density: 96 }).png().toFile("public/og-image.png");
  await sharp(Buffer.from(iconSvg), { density: 96 }).png().resize(512, 512).png().toFile("public/icon.png");
  console.log("generated og-image.png + icon.png");
}
main().catch((e) => { console.error(e); process.exit(1); });
