import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface ServerConfig {
  environment: string;
  ports: {
    fonts: number;
    api: number;
    download: number;
  };
  servers: {
    fonts: string;
    api: string;
    download: string;
  };
  paths: {
    fonts: string;
    api: string;
    download: string;
  };
  security: {
    adminKey: string | undefined;
    corsOrigin: string;
  };
}

export const config: ServerConfig = {
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

export default config;
