import React from 'react';

interface LayerPanelProps {
  shapes: ZentrixShape[];
  selectedShapeId: string | null;
  onSelectShape: (shapeId: string | null) => void;
  onLayerOrderChange: (shapeId: string, direction: 'up' | 'down') => void;
  onShapeVisibilityToggle: (shapeId: string) => void;
}

const VisibilityIcon = ({ isVisible }: { isVisible: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {isVisible ? (
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    ) : (
      <g>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </g>
    )}
  </svg>
);

const LayerPanel: React.FC<LayerPanelProps> = ({
  shapes,
  selectedShapeId,
  onSelectShape,
  onLayerOrderChange,
  onShapeVisibilityToggle
}) => {
  const handleLayerClick = (shapeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 이벤트 객체와 함께 전달
    onSelectShape(shapeId);
  };

  return (
    <div className="ui-panel layer-panel">
      <h2 className="panel-title">레이어</h2>
      <div className="layer-list">
        {shapes.map(shape => (
          <div
            key={shape.id}
            className={`layer-item ${selectedShapeId === shape.id ? 'selected' : ''}`}
            onClick={(e) => handleLayerClick(shape.id, e)}
          >
            <div className="layer-content">
              <button
                className="visibility-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  onShapeVisibilityToggle(shape.id);
                }}
                title={shape.style.opacity === 0 ? "보이기" : "숨기기"}
              >
                <VisibilityIcon isVisible={shape.style.opacity !== 0} />
              </button>
              <span className="layer-name">
                {shape.type === 'group' ? '그룹' : shape.type} {shape.id.slice(0, 4)}
              </span>
            </div>
            <div className="layer-controls">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLayerOrderChange(shape.id, 'up');
                }}
                disabled={shapes.indexOf(shape) === shapes.length - 1}
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLayerOrderChange(shape.id, 'down');
                }}
                disabled={shapes.indexOf(shape) === 0}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerPanel;