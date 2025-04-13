import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3002; // API 서버 포트
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;
