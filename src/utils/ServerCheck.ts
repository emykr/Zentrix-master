import { config } from '@utils/config';  // 새로운 클라이언트용 config

export interface ServerStatus {
  name: string;
  url: string;
  status: 'checking' | 'online' | 'offline';
  latency?: number;
}

const timeout = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
};

export const checkServer = async (url: string, port: number): Promise<boolean> => {
  try {
    const startTime = performance.now();
    const response = await Promise.race([
      fetch(`${url}:${port}/api/health`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
      }),
      timeout(15000) // 15초 타임아웃
    ]);
    const endTime = performance.now();
    const latency = endTime - startTime;

    return response.ok;
  } catch (error) {
    console.warn(`Server check failed for ${url}:${port}:`, error);
    return false;
  }
};

export const getServersStatus = async (): Promise<ServerStatus[]> => {
  const servers = [
    { name: 'Fonts', url: config.servers.fonts, port: config.ports.fonts },
    { name: 'API', url: config.servers.api, port: config.ports.api },
    { name: 'Download', url: config.servers.download, port: config.ports.download }
  ];

  const statuses = await Promise.all(
    servers.map(async (server) => ({
      name: server.name,
      url: server.url,
      status: (await checkServer(server.url, server.port) ? 'online' : 'offline') as 'online' | 'offline'
    }))
  );

  return statuses;
};