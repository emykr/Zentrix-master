import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { config } from './config.mjs';  // .mjs로 변경

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(config.ports.download, () => {
  console.log(`Download server running on port ${config.ports.download}`);
});

export default app;
