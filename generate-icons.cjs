const fs = require('fs');
const path = require('path');

// 简单的 24x24 PNG 图标生成（纯色圆形占位）
function createSimplePng(width, height, r, g, b) {
  // PNG 文件头 + IHDR + IDAT + IEND
  // 简化：用最小的有效 PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  
  function crc32(data) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    for (let i = 0; i < data.length; i++) {
      crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function makeChunk(type, data) {
    const typeData = Buffer.concat([Buffer.from(type), data]);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeData), 0);
    return Buffer.concat([length, typeData, crc]);
  }

  // 生成像素数据 - 简单的圆形图标
  const rawData = [];
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 2;
  
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        rawData.push(r, g, b, 255);
      } else {
        rawData.push(0, 0, 0, 0);
      }
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  
  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

const imagesDir = path.join(__dirname, 'miniprogram', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 生成 tabBar 图标
const tabs = [
  { name: 'tab-home', color: [107, 101, 95], activeColor: [221, 154, 130] },
  { name: 'tab-scale', color: [107, 101, 95], activeColor: [221, 154, 130] },
  { name: 'tab-rescue', color: [107, 101, 95], activeColor: [221, 154, 130] },
  { name: 'tab-stats', color: [107, 101, 95], activeColor: [221, 154, 130] },
  { name: 'tab-settings', color: [107, 101, 95], activeColor: [221, 154, 130] },
];

tabs.forEach(tab => {
  const normalPng = createSimplePng(48, 48, ...tab.color);
  const activePng = createSimplePng(48, 48, ...tab.activeColor);
  
  fs.writeFileSync(path.join(imagesDir, `${tab.name}.png`), normalPng);
  fs.writeFileSync(path.join(imagesDir, `${tab.name}-active.png`), activePng);
  console.log(`Created ${tab.name}.png and ${tab.name}-active.png`);
});

console.log('All icons generated!');
