import React, { createContext, useState, useContext } from 'react';
import { initializeApp } from './init';

interface InitializationStatus {
  isInitialized: boolean;
  error?: Error;
}

interface InitializationContextType {
  status: InitializationStatus;
  reinitialize: () => Promise<void>;
}

const initialStatus: InitializationStatus = {
  isInitialized: false,
  error: undefined
};

const InitializationContext = createContext<InitializationContextType | undefined>(undefined);

export const InitializationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<InitializationStatus>(initialStatus);

  const initialize = async () => {
    try {
      await initializeApp();
      setStatus({ isInitialized: true });
    } catch (error) {
      setStatus({ isInitialized: false, error: error as Error });
    }
  };

  React.useEffect(() => {
    initialize();
  }, []);

  return (
    <InitializationContext.Provider value={{ status, reinitialize: initialize }}>
      {children}
    </InitializationContext.Provider>
  );
};

export const useInit = () => {
  const context = useContext(InitializationContext);
  if (!context) {
    throw new Error('useInit must be used within an InitializationProvider');
  }
  return context;
};