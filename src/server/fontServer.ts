import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.mjs';  // .mjs로 변경

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Font {
  family: string;
  weights: string[];
  formats: string[];
}

const app = express();
app.use(cors());
app.use(express.json());

const fonts: Font[] = [
  {
    family: 'NanumGothic',
    weights: ['Regular', 'Bold', 'ExtraBold'],
    formats: ['ttf']
  }
];

app.use('/fonts', express.static(path.join(__dirname, '../../assets/fonts')));

app.get('/api/fonts', (req, res) => {
  res.json(fonts);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(config.ports.fonts, () => {
  console.log(`Font server running on port ${config.ports.fonts}`);
});

export default app;
