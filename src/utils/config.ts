export const config = {
  servers: {
    fonts: process.env.REACT_APP_FONTS_SERVER || 'http://localhost:3001',
    api: process.env.REACT_APP_API_SERVER || 'http://localhost:3002',
    download: process.env.REACT_APP_DOWNLOAD_SERVER || 'http://localhost:3003'
  }
};

export default config;
