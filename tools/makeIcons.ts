// Tạo icon PNG cho PWA từ SVG, không cần thư viện ngoài.
// Dùng: npx tsx tools/makeIcons.ts
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../public');

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

function createCanvas(size: number): { data: Uint8ClampedArray; put(x: number, y: number, c: RGBA): void } {
  const data = new Uint8ClampedArray(size * size * 4);
  return {
    data,
    put(x: number, y: number, c: RGBA) {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      const i = (y * size + x) * 4;
      data[i] = c.r;
      data[i + 1] = c.g;
      data[i + 2] = c.b;
      data[i + 3] = c.a;
    }
  };
}

/**
 * Vẽ hình tròn màu đỏ Nhật Bản trên nền tối, rồi render chữ 日 bằng bitmap đơn giản.
 *
 * @param size  kích thước ảnh (px)
 * @param scale  tỉ lệ nội dung so với canvas (dùng < 1 cho icon maskable:
 *               nội dung phải nằm trọn vùng an toàn ~80% khi hệ điều hành cắt bo tròn)
 */
function drawIcon(size: number, scale = 1): Buffer {
  const { data, put } = createCanvas(size);
  const bg: RGBA = { r: 15, g: 23, b: 42, a: 255 };
  const red: RGBA = { r: 239, g: 68, b: 68, a: 255 };
  const white: RGBA = { r: 255, g: 255, b: 255, a: 255 };

  // Vùng vẽ nội dung (co lại quanh tâm theo `scale`)
  const origin = (size * (1 - scale)) / 2;
  const s = (v: number) => origin + v * scale;

  const radius = size * 0.14;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // nền bo góc
      const inCorner =
        (x < radius && y < radius && (x - radius) ** 2 + (y - radius) ** 2 > radius ** 2) ||
        (x >= size - radius && y < radius && (x - (size - radius)) ** 2 + (y - radius) ** 2 > radius ** 2) ||
        (x < radius && y >= size - radius && (x - radius) ** 2 + (y - (size - radius)) ** 2 > radius ** 2) ||
        (x >= size - radius &&
          y >= size - radius &&
          (x - (size - radius)) ** 2 + (y - (size - radius)) ** 2 > radius ** 2);
      put(x, y, inCorner ? { r: 0, g: 0, b: 0, a: 0 } : bg);
    }
  }

  // vòng tròn đỏ
  const cx = size / 2;
  const cy = size / 2;
  const r = (size * 0.3) * scale;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= r) put(x, y, red);
    }
  }

  // chữ 日 vẽ bằng 5 hình chữ nhật
  const k = (size / 16) * scale;
  const drawRect = (rx: number, ry: number, rw: number, rh: number) => {
    for (let y = Math.round(ry); y < Math.round(ry + rh); y++) {
      for (let x = Math.round(rx); x < Math.round(rx + rw); x++) put(x, y, white);
    }
  };
  const stroke = Math.max(1.5, k * 0.9);
  const left = s(size * 0.34);
  const right = s(size * 0.66);
  const top = s(size * 0.3);
  const bottom = s(size * 0.7);
  drawRect(left, top, right - left, stroke); // hàng trên
  drawRect(left, (top + bottom) / 2 - stroke / 2, right - left, stroke); // hàng giữa
  drawRect(left, bottom - stroke, right - left, stroke); // hàng dưới
  drawRect(left, top, stroke, bottom - top); // cột trái
  drawRect(right - stroke, top, stroke, bottom - top); // cột phải

  return encodePNG(data, size, size);
}

function encodePNG(data: Uint8ClampedArray, width: number, height: number): Buffer {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter type 0
    for (let x = 0; x < width * 4; x++) {
      raw[y * (width * 4 + 1) + 1 + x] = data[y * width * 4 + x];
    }
  }

  const chunks: Buffer[] = [];
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  chunks.push(signature);
  chunks.push(chunk('IHDR', ihdr));
  chunks.push(chunk('IDAT', zlib.deflateSync(raw)));
  chunks.push(chunk('IEND', Buffer.alloc(0)));

  return Buffer.concat(chunks);
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

for (const { file, size, scale } of [
  { file: 'icon-192.png', size: 192, scale: 1 },
  { file: 'icon-512.png', size: 512, scale: 1 },
  // maskable: nội dung thu nhỏ ~60% để nằm trọn vùng an toàn khi hệ điều hành cắt bo tròn
  { file: 'icon-maskable-512.png', size: 512, scale: 0.6 },
]) {
  const out = path.join(OUT_DIR, file);
  fs.writeFileSync(out, drawIcon(size, scale));
  console.log(`✓ đã tạo ${path.relative(process.cwd(), out)}`);
}
