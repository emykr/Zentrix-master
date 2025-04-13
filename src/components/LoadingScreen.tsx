import React, { useState, useEffect } from 'react';
import { t } from '@utils/LangLoader';
import LoadingManager from '@handler/LoadingManager';
import { ServerStatus, getServersStatus } from '@utils/ServerCheck';

interface LoadingScreenProps {
  error?: Error;
  onContinue?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ error, onContinue }) => {
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    progress: 0,
    message: ''
  });
  const [serverStatuses, setServerStatuses] = useState<ServerStatus[]>([]);

  useEffect(() => {
    const checkServers = async () => {
      const statuses = await getServersStatus();
      setServerStatuses(statuses);
    };

    const interval = setInterval(checkServers, 5000); // 5초마다 체크
    checkServers(); // 초기 체크

    const unsubscribe = LoadingManager.getInstance().subscribe(setLoadingState);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleContinue = () => {
    onContinue?.();
    setShowContinueDialog(false);
  };

  const getStatusColor = (status: ServerStatus['status']) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
      {error ? (
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">{t('error.initialization')}</p>
          <p className="text-sm opacity-75">{error.message}</p>
          <button
            onClick={() => setShowContinueDialog(true)}
            className="mt-4 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
          >
            {t('button.continue')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white" />
          <div className="w-96 text-center">
            <div className="h-2 bg-slate-700 rounded-full mb-4">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${loadingState.progress}%` }}
              />
            </div>
            <p className="text-white text-xl font-medium mb-2">{loadingState.message}</p>
            <p className="text-white/70 text-sm mb-4">{Math.round(loadingState.progress)}%</p>
            
            {/* 서버 상태 표시 */}
            <div className="mt-4 space-y-2 bg-slate-800 p-4 rounded-lg">
              <p className="text-white text-sm font-medium mb-2">서버 상태</p>
              {serverStatuses.map((server) => (
                <div key={server.name} className="flex justify-between items-center">
                  <span className="text-white/70">{server.name}</span>
                  <span className={getStatusColor(server.status)}>
                    {server.status === 'online' ? '온라인' : 
                     server.status === 'offline' ? '오프라인' : '확인 중'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showContinueDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <p className="text-white mb-4">{t('common.continuePrompt')}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowContinueDialog(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
              >
                {t('button.close')}
              </button>
              <button
                onClick={handleContinue}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                {t('button.continue')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};