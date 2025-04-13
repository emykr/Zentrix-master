import { setLang } from '@utils/LangLoader';
import LoadingManager from '@handler/LoadingManager';
import { getServersStatus } from '@utils/ServerCheck';

const loadConfig = async (): Promise<AppConfig> => {
  const loadingManager = LoadingManager.getInstance();
  loadingManager.updateProgress(10, '설정 파일 로드 중...');
  
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
    await loadingManager.startLoading('초기화 중...');
    
    // 단계별 진행률 업데이트
    loadingManager.updateProgress(20, '서버 연결 확인 중...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const serverStatus = await getServersStatus();
    loadingManager.updateProgress(60, '서버 상태 확인 중...');
    
    const offlineServers = serverStatus.filter(s => s.status === 'offline');
    if (offlineServers.length > 0) {
      throw new Error(`서버 연결 실패: ${offlineServers.map(s => s.name).join(', ')}`);
    }

    loadingManager.updateProgress(100, '초기화 완료');
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    throw error;
  } finally {
    await loadingManager.stopLoading();
  }
};