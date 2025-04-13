import { setLang, t } from '@utils/LangLoader';
import LoadingManager from '@handler/LoadingManager';
import { getServersStatus } from '@utils/ServerCheck';
import type { Config } from '@/types/zentrix';

interface AppConfig extends Config {
  version: string;
  environment: 'development' | 'production';
  features: {
    enableAnimations: boolean;
    debugMode: boolean;
  };
}

const loadConfig = async (): Promise<AppConfig> => {
  const loadingManager = LoadingManager.getInstance();
  loadingManager.updateProgress(10, t('init.loadingConfig'));
  
  // 설정 파일 로드 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    version: '1.0.0',
    environment: process.env.NODE_ENV as 'development' | 'production',
    features: {
      enableAnimations: true,
      debugMode: process.env.NODE_ENV === 'development'
    }
  };
};

export const initializeApp = async (): Promise<void> => {
  const loadingManager = LoadingManager.getInstance();
  
  try {
    await loadingManager.startLoading(t('init.initializing'));
    
    // 단계별 진행률 업데이트
    loadingManager.updateProgress(20, t('init.checkingServerConnection'));
    await new Promise(resolve => setTimeout(resolve, 500));

    const serverStatus = await getServersStatus();
    loadingManager.updateProgress(60, t('init.checkingServerStatus'));
    
    const offlineServers = serverStatus.filter(s => s.status === 'offline');
    if (offlineServers.length > 0) {
      const serverNames = offlineServers.map(s => s.name).join(', ');
      throw new Error(`${t('init.serverConnectionFailed')}: ${serverNames}`);
    }

    loadingManager.updateProgress(100, t('init.initializationComplete'));
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    throw error;
  } finally {
    await loadingManager.stopLoading();
  }
};