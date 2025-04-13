import express from 'express';
import cors from 'cors';
import { config } from './config.mjs';  // .mjs로 변경

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(config.ports.api, () => {
  console.log(`API server running on port ${config.ports.api}`);
});

export default app;
