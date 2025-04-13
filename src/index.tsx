import React from 'react';
import { createRoot } from 'react-dom/client';
import { InitializationProvider } from '@core/InitializationContext';
import App from './App';

// 스타일 import
import '@styles/global.css';
import '@styles/scrollbar.css';

// DOM이 준비되면 앱 초기화
const initializeApp = () => {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Failed to find the root element');
  }

  // root element에 기본 스타일 적용
  container.classList.add('w-full', 'h-full', 'zentrix-scrollbar');

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <InitializationProvider>
        <App />
      </InitializationProvider>
    </React.StrictMode>
  );
};

// DOMContentLoaded 이벤트에서 앱 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}