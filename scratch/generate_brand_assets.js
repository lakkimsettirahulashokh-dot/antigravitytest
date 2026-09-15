const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const brandingDir = path.join(__dirname, '..', 'assets', 'branding');
fs.mkdirSync(brandingDir, { recursive: true });

// 1. Generate favicon.svg
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A2031"/>
      <stop offset="100%" stop-color="#0B0F19"/>
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5865F2"/>
      <stop offset="100%" stop-color="#2DD4BF"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C5CFF"/>
      <stop offset="100%" stop-color="#5865F2"/>
    </linearGradient>
  </defs>
  
  <!-- Outer Rounded Squircle -->
  <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#bgGrad)" stroke="#2A3147" stroke-width="2"/>
  <rect x="3" y="3" width="58" height="58" rx="15" fill="none" stroke="url(#primaryGrad)" stroke-width="1.5" stroke-opacity="0.6"/>
  
  <!-- Terminal Prompt Icon -->
  <path d="M18 22 L30 32 L18 42" fill="none" stroke="url(#primaryGrad)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Blinking Cursor Invariant -->
  <rect x="36" y="38" width="12" height="4.5" rx="2" fill="#2DD4BF"/>
  
  <!-- Subtle Top AI Sparkle Dot -->
  <circle cx="44" cy="20" r="2.5" fill="#F6C177"/>
</svg>`;

fs.writeFileSync(path.join(brandingDir, 'favicon.svg'), svgFavicon, 'utf8');
console.log('✅ favicon.svg created');

// Pure PNG generator helper (Zero dependencies, uncompressed/deflated raw RGBA)
function createPngBuffer(width, height, pixelFn) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw Image Data with filter byte 0 per scanline
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// CRC32 table & calculator
let crcTable = null;
function makeCrcTable() {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

function crc32(buf) {
  if (!crcTable) crcTable = makeCrcTable();
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

// Icon Pixel Generator
function generateIconPixel(x, y, width, height) {
  // Normalize
  const nx = x / width;
  const ny = y / height;
  
  // Distance from center
  const cx = 0.5;
  const cy = 0.5;
  const dx = Math.abs(nx - cx);
  const dy = Math.abs(ny - cy);
  const dist = Math.sqrt((nx - cx)**2 + (ny - cy)**2);

  // Rounded squircle mask
  const cornerRadius = 0.22;
  const rx = Math.max(0, dx - (0.5 - cornerRadius));
  const ry = Math.max(0, dy - (0.5 - cornerRadius));
  const cornerDist = Math.sqrt(rx * rx + ry * ry);
  if (cornerDist > cornerRadius) {
    return [0, 0, 0, 0]; // Transparent outside squircle
  }

  // Border check
  const isBorder = (cornerDist > cornerRadius - 0.035) || (dx > 0.465) || (dy > 0.465);

  if (isBorder) {
    // Gradient border (#5865F2 to #2DD4BF)
    const t = nx;
    const r = Math.round(88 * (1 - t) + 45 * t);
    const g = Math.round(101 * (1 - t) + 212 * t);
    const b = Math.round(242 * (1 - t) + 191 * t);
    return [r, g, b, 255];
  }

  // Inside background: Deep twilight gradient (#1A2031 to #0B0F19)
  let r = Math.round(26 * (1 - ny) + 11 * ny);
  let g = Math.round(32 * (1 - ny) + 15 * ny);
  let b = Math.round(49 * (1 - ny) + 25 * ny);

  // Terminal Prompt ">"
  // Tip at (0.45, 0.5), top at (0.28, 0.35), bottom at (0.28, 0.65)
  const inChevronTop = (nx >= 0.28 && nx <= 0.48 && Math.abs((nx - 0.28) * 0.75 - (ny - 0.35)) < 0.045);
  const inChevronBottom = (nx >= 0.28 && nx <= 0.48 && Math.abs((nx - 0.28) * (-0.75) - (ny - 0.65)) < 0.045);
  
  if (inChevronTop || inChevronBottom) {
    // Primary Indigo to Teal
    return [88, 101, 242, 255];
  }

  // Underscore cursor "_"
  if (nx >= 0.54 && nx <= 0.74 && ny >= 0.60 && ny <= 0.66) {
    return [45, 212, 191, 255]; // Teal
  }

  // Sparkle point
  if (Math.sqrt((nx - 0.68)**2 + (ny - 0.32)**2) < 0.04) {
    return [246, 193, 119, 255]; // Rose Gold
  }

  return [r, g, b, 255];
}

// Generate PNG sizes
console.log('Generating PNG icons...');
const png16 = createPngBuffer(16, 16, generateIconPixel);
fs.writeFileSync(path.join(brandingDir, 'favicon-16x16.png'), png16);

const png32 = createPngBuffer(32, 32, generateIconPixel);
fs.writeFileSync(path.join(brandingDir, 'favicon-32x32.png'), png32);

const png180 = createPngBuffer(180, 180, generateIconPixel);
fs.writeFileSync(path.join(brandingDir, 'apple-touch-icon.png'), png180);

const png192 = createPngBuffer(192, 192, generateIconPixel);
fs.writeFileSync(path.join(brandingDir, 'icon-192.png'), png192);

const png512 = createPngBuffer(512, 512, generateIconPixel);
fs.writeFileSync(path.join(brandingDir, 'icon-512.png'), png512);

// Generate favicon.ico (combining 16x16 and 32x32 PNGs inside ICO container)
function createIcoBuffer(png16Buf, png32Buf) {
  // ICO Header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Image type: 1 = ICO
  header.writeUInt16LE(2, 4); // Number of images: 2

  // 2 Directory entries: 16 bytes each
  const dir16 = Buffer.alloc(16);
  dir16.writeUInt8(16, 0); // Width
  dir16.writeUInt8(16, 1); // Height
  dir16.writeUInt8(0, 2);  // Colors
  dir16.writeUInt8(0, 3);  // Reserved
  dir16.writeUInt16LE(1, 4); // Color planes
  dir16.writeUInt16LE(32, 6); // Bits per pixel
  dir16.writeUInt32LE(png16Buf.length, 8); // Size of image data
  dir16.writeUInt32LE(6 + 32, 12); // Offset to image data

  const dir32 = Buffer.alloc(16);
  dir32.writeUInt8(32, 0);
  dir32.writeUInt8(32, 1);
  dir32.writeUInt8(0, 2);
  dir32.writeUInt8(0, 3);
  dir32.writeUInt16LE(1, 4);
  dir32.writeUInt16LE(32, 6);
  dir32.writeUInt32LE(png32Buf.length, 8);
  dir32.writeUInt32LE(6 + 32 + png16Buf.length, 12);

  return Buffer.concat([header, dir16, dir32, png16Buf, png32Buf]);
}

const icoBuf = createIcoBuffer(png16, png32);
fs.writeFileSync(path.join(__dirname, '..', 'favicon.ico'), icoBuf);
fs.writeFileSync(path.join(brandingDir, 'favicon.ico'), icoBuf);
console.log('✅ favicon.ico and multi-res PNG icons generated');

// 2. Generate manifest.json
const manifestData = {
  name: "BTechPath AI OS",
  short_name: "BTechPath AI",
  description: "From Classroom to Career, Your Engineering Journey Guided by AI.",
  start_url: "/",
  display: "standalone",
  background_color: "#0B0F19",
  theme_color: "#0B0F19",
  icons: [
    {
      src: "assets/branding/icon-192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "assets/branding/icon-512.png",
      sizes: "512x512",
      type: "image/png"
    },
    {
      src: "assets/branding/favicon.svg",
      sizes: "any",
      type: "image/svg+xml"
    }
  ]
};

fs.writeFileSync(path.join(__dirname, '..', 'manifest.json'), JSON.stringify(manifestData, null, 2), 'utf8');
console.log('✅ manifest.json created');

// 3. Generate 1200x630 Open Graph Image (assets/branding/btechpath-ai-og.png)
console.log('Generating 1200x630 Open Graph preview image...');

function generateOgPixel(x, y, width, height) {
  const nx = x / width;
  const ny = y / height;

  // Ambient Dark Twilight Background (#0B0F19 with radial indigo & teal glows)
  const dGlow1 = Math.sqrt((nx - 0.25)**2 + (ny - 0.4)**2); // Indigo glow
  const dGlow2 = Math.sqrt((nx - 0.8)**2 + (ny - 0.6)**2);  // Teal glow

  let r = 11;
  let g = 15;
  let b = 25;

  // Add subtle indigo aura
  if (dGlow1 < 0.6) {
    const factor = (1 - dGlow1 / 0.6)**2;
    r += Math.round(45 * factor);
    g += Math.round(55 * factor);
    b += Math.round(150 * factor);
  }

  // Add subtle teal aura
  if (dGlow2 < 0.5) {
    const factor = (1 - dGlow2 / 0.5)**2;
    r += Math.round(15 * factor);
    g += Math.round(80 * factor);
    b += Math.round(75 * factor);
  }

  // Border framing: subtle 1px border at margin 24px
  if ((x >= 24 && x <= width - 24 && (y === 24 || y === height - 24)) ||
      (y >= 24 && y <= height - 24 && (x === 24 || x === width - 24))) {
    return [42, 49, 71, 255]; // #2A3147
  }

  // Subtle background grid (every 60px)
  if ((x % 60 === 0 || y % 60 === 0) && nx > 0.05 && nx < 0.95 && ny > 0.05 && ny < 0.95) {
    r = Math.min(255, r + 6);
    g = Math.min(255, g + 8);
    b = Math.min(255, b + 12);
  }

  // Terminal badge in top-left (x: 100 to 180, y: 110 to 190)
  if (x >= 100 && x <= 180 && y >= 110 && y <= 190) {
    const bx = (x - 100) / 80;
    const by = (y - 110) / 80;
    const bDist = Math.max(Math.abs(bx - 0.5), Math.abs(by - 0.5));
    if (bDist <= 0.48) {
      if (bDist >= 0.45) return [88, 101, 242, 255]; // Indigo border
      // Terminal icon ">"
      if ((bx >= 0.28 && bx <= 0.48 && Math.abs((bx - 0.28) * 0.75 - (by - 0.35)) < 0.06) ||
          (bx >= 0.28 && bx <= 0.48 && Math.abs((bx - 0.28) * (-0.75) - (by - 0.65)) < 0.06)) {
        return [88, 101, 242, 255];
      }
      if (bx >= 0.54 && bx <= 0.74 && by >= 0.60 && by <= 0.68) {
        return [45, 212, 191, 255]; // Teal cursor
      }
      return [26, 32, 49, 255]; // #1A2031
    }
  }

  // Brand Name Pill accent line (x: 210 to 520, y: 145 to 155)
  if (x >= 210 && x <= 520 && y >= 148 && y <= 152) {
    const t = (x - 210) / 310;
    return [Math.round(88 * (1 - t) + 45 * t), Math.round(101 * (1 - t) + 212 * t), Math.round(242 * (1 - t) + 191 * t), 255];
  }

  // Tagline Divider Bar (x: 100 to 1100, y: 340 to 343)
  if (x >= 100 && x <= 1100 && y >= 340 && y <= 343) {
    const t = (x - 100) / 1000;
    return [Math.round(88 * (1 - t) + 45 * t), Math.round(101 * (1 - t) + 212 * t), Math.round(242 * (1 - t) + 191 * t), 200];
  }

  // Feature Card Badges in bottom row:
  // Card 1: LEARN (x: 100 to 320, y: 460 to 540)
  // Card 2: BUILD (x: 360 to 580, y: 460 to 540)
  // Card 3: PREPARE (x: 620 to 840, y: 460 to 540)
  // Card 4: GROW (x: 880 to 1100, y: 460 to 540)
  const cards = [
    { x1: 100, x2: 320, color: [88, 101, 242] },
    { x1: 360, x2: 580, color: [124, 92, 255] },
    { x1: 620, x2: 840, color: [45, 212, 191] },
    { x1: 880, x2: 1100, color: [246, 193, 119] }
  ];

  for (const card of cards) {
    if (x >= card.x1 && x <= card.x2 && y >= 460 && y <= 540) {
      const isCardBorder = (x === card.x1 || x === card.x2 || y === 460 || y === 540);
      if (isCardBorder) return [...card.color, 180];
      return [26, 32, 49, 220]; // Elevated background
    }
  }

  return [Math.min(255, r), Math.min(255, g), Math.min(255, b), 255];
}

const ogBuffer = createPngBuffer(1200, 630, generateOgPixel);
fs.writeFileSync(path.join(brandingDir, 'btechpath-ai-og.png'), ogBuffer);
console.log('✅ btechpath-ai-og.png (1200x630) generated successfully');
