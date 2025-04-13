import express from 'express';
import cors from 'cors';
import * as path from 'path';


const __filename = path.resolve();
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3003; // Download 서버 포트
const server = app.listen(PORT, () => {
  console.log(`Download server running on port ${PORT}`);
});

export default app;
