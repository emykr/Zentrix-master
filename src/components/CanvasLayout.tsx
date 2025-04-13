import React, { useState } from 'react';
import ZentrixCanvas from '@components/ZentrixCanvas';
import ToolbarLeft from '@components/toolbar/ToolbarLeft';
import ComponentPanel from '@components/ComponentPanel';
import type { Design } from '@/types';

interface CanvasLayoutProps {
  design: Design;
}

const CanvasLayout: React.FC<CanvasLayoutProps> = ({ design }) => {
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  return (
    <div className="w-full h-full flex">
      <ToolbarLeft />
      <ComponentPanel 
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
      />
      <div className="flex-1 p-4">
        <ZentrixCanvas
          design={design}
          selectedShapeId={selectedShapeId}
          onShapeClick={setSelectedShapeId}
        />
      </div>
    </div>
  );
};

export default CanvasLayout;