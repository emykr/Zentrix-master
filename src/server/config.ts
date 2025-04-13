import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');

dotenv.config({ path: envPath });

export const config = {
  environment: process.env.NODE_ENV || 'development',
  ports: {
    fonts: Number(process.env.FONTS_PORT) || 3001,
    api: Number(process.env.API_PORT) || 3002,
    download: Number(process.env.DOWNLOAD_PORT) || 3003
  },
  servers: {
    fonts: process.env.FONTS_SERVER || 'http://fonts.emykr.xyz',
    api: process.env.API_SERVER || 'http://api.emykr.xyz',
    download: process.env.DOWNLOAD_SERVER || 'http://download.emykr.xyz'
  },
  paths: {
    fonts: '/assets/fonts',
    api: '/api',
    download: '/download'
  },
  security: {
    adminKey: process.env.ADMIN_KEY,
    corsOrigin: process.env.CORS_ORIGIN || '*'
  }
};