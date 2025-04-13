import express from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import { fileURLToPath } from 'url';
import history from 'connect-history-api-fallback';
import fs from 'fs/promises';
import rateLimit from 'express-rate-limit';
import { config } from '../utils/config'; 

const __filename = path.resolve();
const __dirname = path.dirname(__filename);

const app = express();

// 기본 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(compression());

// Rate limiting 설정
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // IP당 최대 요청 수
});
app.use('/api', limiter);

// API 라우트
app.get('/api/fonts', (req, res) => {
  const availableFonts = [
    {
      family: 'NanumGothic',
      weights: ['Regular', 'Bold', 'ExtraBold'],
      formats: ['ttf']
    }
  ];
  res.json(availableFonts);
});

// 폰트 다운로드 API
app.get('/api/fonts/download/:family/:weight', async (req, res) => {
  const { family, weight } = req.params;
  const filename = `${family}-${weight}.ttf`;
  const filePath = path.join(__dirname, '..', 'assets', 'fonts', filename);

  try {
    await fs.access(filePath);
    res.download(filePath);
  } catch (error) {
    res.status(404).json({ error: '폰트 파일을 찾을 수 없습니다.' });
  }
});

// 정적 파일 제공 설정
app.use('/fonts', express.static(path.join(__dirname, '..', 'assets', 'fonts'), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.ttf')) {
      res.setHeader('Content-Type', 'font/ttf');
    }
    // 1년간 캐시
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// SPA를 위한 history API fallback
app.use(history());

// 빌드된 앱 제공
app.use(express.static(path.join(__dirname, '../../dist'), {
  index: false,
  maxAge: '30d'
}));

// 모든 요청을 index.html로 리다이렉트 (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// 에러 핸들링
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

const PORT = process.env.PORT || 3001;

if (config.environment !== 'test') {
  app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
}

export { app };