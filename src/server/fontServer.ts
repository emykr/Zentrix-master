import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = path.resolve();
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

const assetsPath = path.resolve(process.cwd(), 'assets/fonts');
app.use('/fonts', express.static(assetsPath));

app.get('/api/fonts', (req, res) => {
  res.json(fonts);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3001; // Font 서버 포트
const server = app.listen(PORT, () => {
  console.log(`Font server running on port ${PORT}`);
});

export default app;
