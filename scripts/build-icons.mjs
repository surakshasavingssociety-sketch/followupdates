/**
 * Generates the PNG app icons used by the web manifest and the Android TWA.
 *
 * The artwork is drawn pixel by pixel so the build stays dependency-free:
 * a blue field, a white notification page and a saffron verified badge.
 *
 * Run with: node scripts/build-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const OUT_DIR = path.join(process.cwd(), "public", "icons");

const BRAND = [11, 79, 156, 255];
const BRAND_DARK = [8, 58, 117, 255];
const WHITE = [255, 255, 255, 255];
const SAFFRON = [247, 154, 23, 255];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function encodePng(width, height, pixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function createCanvas(size) {
  const pixels = Buffer.alloc(size * size * 4);
  return {
    size,
    pixels,
    set(x, y, color) {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      const index = (y * size + x) * 4;
      pixels[index] = color[0];
      pixels[index + 1] = color[1];
      pixels[index + 2] = color[2];
      pixels[index + 3] = color[3];
    },
  };
}

function fillRect(canvas, x, y, width, height, color) {
  for (let py = Math.round(y); py < Math.round(y + height); py += 1) {
    for (let px = Math.round(x); px < Math.round(x + width); px += 1) {
      canvas.set(px, py, color);
    }
  }
}

function fillRoundedRect(canvas, x, y, width, height, radius, color) {
  const left = x;
  const top = y;
  const right = x + width;
  const bottom = y + height;
  for (let py = Math.round(top); py < Math.round(bottom); py += 1) {
    for (let px = Math.round(left); px < Math.round(right); px += 1) {
      const cx = Math.min(Math.max(px + 0.5, left + radius), right - radius);
      const cy = Math.min(Math.max(py + 0.5, top + radius), bottom - radius);
      const dx = px + 0.5 - cx;
      const dy = py + 0.5 - cy;
      if (dx * dx + dy * dy <= radius * radius) canvas.set(px, py, color);
    }
  }
}

function fillCircle(canvas, cx, cy, radius, color) {
  for (let py = Math.round(cy - radius); py <= Math.round(cy + radius); py += 1) {
    for (let px = Math.round(cx - radius); px <= Math.round(cx + radius); px += 1) {
      const dx = px + 0.5 - cx;
      const dy = py + 0.5 - cy;
      if (dx * dx + dy * dy <= radius * radius) canvas.set(px, py, color);
    }
  }
}

/** Thick line segment drawn with a distance test. */
function strokeLine(canvas, x1, y1, x2, y2, thickness, color) {
  const radius = thickness / 2;
  const minX = Math.round(Math.min(x1, x2) - radius - 1);
  const maxX = Math.round(Math.max(x1, x2) + radius + 1);
  const minY = Math.round(Math.min(y1, y2) - radius - 1);
  const maxY = Math.round(Math.max(y1, y2) + radius + 1);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy || 1;

  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const t = Math.max(0, Math.min(1, ((px + 0.5 - x1) * dx + (py + 0.5 - y1) * dy) / lengthSq));
      const closestX = x1 + t * dx;
      const closestY = y1 + t * dy;
      const distanceX = px + 0.5 - closestX;
      const distanceY = py + 0.5 - closestY;
      if (distanceX * distanceX + distanceY * distanceY <= radius * radius) {
        canvas.set(px, py, color);
      }
    }
  }
}

/**
 * Draws the icon artwork on a 512-unit grid and scales it to the target size.
 * `safe` shrinks the glyph so the maskable variant stays inside the safe zone.
 */
function drawIcon(size, { safe = false } = {}) {
  const canvas = createCanvas(size);
  const scale = size / 512;
  const glyphScale = safe ? 0.74 : 1;
  const center = 256;
  const map = (value) => (center + (value - center) * glyphScale) * scale;

  // Background: a soft vertical band keeps the icon readable on light and dark launchers.
  fillRect(canvas, 0, 0, size, size, BRAND);
  fillRect(canvas, 0, 0, size, Math.round(size * 0.46), BRAND_DARK);

  // Notification page.
  const page = { x: 132, y: 92, w: 248, h: 328, r: 30 };
  fillRoundedRect(
    canvas,
    map(page.x),
    map(page.y),
    (page.w * glyphScale) * scale,
    (page.h * glyphScale) * scale,
    page.r * glyphScale * scale,
    WHITE,
  );

  // Text lines on the page.
  const line = (x, y, w, h) => {
    fillRoundedRect(
      canvas,
      map(x),
      map(y),
      (w * glyphScale) * scale,
      (h * glyphScale) * scale,
      (h / 2) * glyphScale * scale,
      BRAND,
    );
  };
  line(180, 156, 152, 22);
  line(180, 204, 152, 22);
  line(180, 252, 104, 22);

  // Saffron verified badge with a white tick.
  const badge = { x: 344, y: 372, r: 58 };
  fillCircle(canvas, map(badge.x), map(badge.y), badge.r * glyphScale * scale, SAFFRON);
  strokeLine(
    canvas,
    map(316),
    map(372),
    map(336),
    map(394),
    16 * glyphScale * scale,
    WHITE,
  );
  strokeLine(
    canvas,
    map(336),
    map(394),
    map(376),
    map(346),
    16 * glyphScale * scale,
    WHITE,
  );

  return encodePng(size, size, canvas.pixels);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const outputs = [
  ["icon-192.png", 192, { safe: false }],
  ["icon-512.png", 512, { safe: false }],
  ["icon-512-maskable.png", 512, { safe: true }],
  ["icon-192-maskable.png", 192, { safe: true }],
];

for (const [name, size, options] of outputs) {
  fs.writeFileSync(path.join(OUT_DIR, name), drawIcon(size, options));
  console.log(`icons: wrote ${name} (${size}×${size})`);
}

// A small favicon PNG helps older browsers that ignore the SVG favicon.
fs.writeFileSync(path.join(process.cwd(), "public", "favicon-32.png"), drawIcon(32));
console.log("icons: wrote favicon-32.png (32×32)");
