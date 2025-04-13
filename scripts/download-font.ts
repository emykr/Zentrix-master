import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONTS_TO_DOWNLOAD = [
  {
    family: 'NanumGothic',
    weights: ['Regular', 'Bold', 'ExtraBold'],
    url: 'http://fonts.emykr.xyz:3001'
  },
  {
    family: 'NanumMyeongjo',
    weights: ['Regular', 'Bold'],
    url: 'http://fonts.emykr.xyz:3002'
  },
  {
    family: 'NotoSansKR',
    weights: ['Regular', 'Bold'],
    url: 'http://fonts.emykr.xyz:3003'
  }
];

async function downloadFont(family: string, weight: string, url: string) {
  const fontPath = path.join(__dirname, '../src/assets/fonts');
  const filename = `${family}-${weight}.ttf`;
  const fullPath = path.join(fontPath, filename);

  try {
    // 폰트 디렉토리 생성
    await fs.mkdir(fontPath, { recursive: true });

    // 폰트 파일 다운로드
    const response = await axios.get(`${url}/${family}/${weight}`, {
      responseType: 'arraybuffer'
    });

    // 폰트 파일 저장
    await fs.writeFile(fullPath, response.data);
    console.log(`Downloaded: ${filename}`);
  } catch (error) {
    console.error(`Failed to download ${filename}:`, error.message);
  }
}

async function downloadAllFonts() {
  for (const font of FONTS_TO_DOWNLOAD) {
    for (const weight of font.weights) {
      await downloadFont(font.family, weight, font.url);
    }
  }
}

downloadAllFonts().catch(console.error);