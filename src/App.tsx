import React from 'react';
import { withInitialization } from '@core/withInitialization';
import Zentrix from '@pages/Zentrix';
import '@styles/ui.css'; // UI 스타일 추가

const App: React.FC = () => {
  return (
    <div className="w-full h-full bg-slate-900">
      <Zentrix />
    </div>
  );
};

export default withInitialization(App);