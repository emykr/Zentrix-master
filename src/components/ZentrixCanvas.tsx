import React, { useRef, useEffect, useState, type ReactElement } from 'react';
import { ContextMenu } from './ContextMenu';
import { Grid } from './Grid';
import { t } from '@utils/LangLoader';
import { getPortPosition, calculateConnectorPath, createConnector } from '@utils/DesignUtils';
import { TextEditor } from './TextEditor';
import type { Point, Shape, ShapeStyle, Design, ConnectorShape, ConnectorPoint, Gradient, GradientStop, Port } from '@/types/zentrix';

// DragPoint 타입 정의
interface DragPoint extends Point {
  x: number;
  y: number;
  shapeId?: string;
  portId?: string;
}

// MenuItem 인터페이스 개선
interface MenuItem {
  id: string;
  label?: string;
  shortcut?: string;
  onClick?: () => void;
  divider?: boolean;
}

interface ZentrixCanvasProps {
  design: Design;
  onShapeClick?: (shapeId: string | null, e?: React.MouseEvent) => void;
  onShapeDelete?: (shapeId: string) => void;
  onShapeRotate?: (shapeId: string, angle: number) => void;
  onShapeDuplicate?: (shapeId: string) => void;
  onShapeUpdate?: (shapeId: string, updates: Partial<Shape>) => void;
  selectedShapeId?: string | null;
}

const ZentrixCanvas: React.FC<ZentrixCanvasProps> = ({
  design,
  onShapeClick,
  onShapeDelete,
  onShapeRotate,
  onShapeDuplicate,
  onShapeUpdate,
  selectedShapeId
}): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    shapeId: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<DragPoint | null>(null);
  const [originalShape, setOriginalShape] = useState<Shape | null>(null);
  const [editingText, setEditingText] = useState<Shape | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, design.canvas.width, design.canvas.height);
    ctx.fillStyle = design.canvas.background;
    ctx.fillRect(0, 0, design.canvas.width, design.canvas.height);

    // 모든 도형 렌더링
    design.shapes.forEach((s: Shape) => renderShape(ctx, s));
      
    // 선택된 도형의 경계 상자와 핸들 렌더링
    if (selectedShapeId) {
      const shape = design.shapes.find((s: Shape) => s.id === selectedShapeId);
      if (shape) {
        renderBoundingBox(ctx, shape);
        renderTransformHandles(ctx, shape);
      }
    }
  }, [design, selectedShapeId]);

  useEffect(() => {
    if (contextMenu) {
      const shape = design.shapes.find((s: Shape) => s.id === contextMenu.shapeId);
      if (!shape) {
        setContextMenu(null);
      }
    }
    
    if (editingText) {
      const shape = design.shapes.find((s: Shape) => s.id === editingText.id);
      if (!shape) {
        setEditingText(null);
      }
    }
  }, [design.shapes, contextMenu, editingText]);

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 클릭된 도형 찾기
    for (let i = design.shapes.length - 1; i >= 0; i--) {
      const shape = design.shapes[i];
      if (isPointInShape(x, y, shape)) {
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          shapeId: shape.id
        });
        break;
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onShapeClick) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Z-index 순서대로 도형 체크 (위에 있는 도형부터)
    for (let i = design.shapes.length - 1; i >= 0; i--) {
      const shape = design.shapes[i];
      if (isPointInShape(x, y, shape)) {
        e.stopPropagation(); // 이벤트 전파 중지
        onShapeClick(shape.id, e);
        return;
      }
    }

    // 빈 공간 클릭시 선택 해제
    onShapeClick(null);
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const shape of design.shapes) {
      if (shape.type === 'text' && isPointInShape(x, y, shape)) {
        setEditingText(shape);
        break;
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 클릭 이벤트 전파 중지
    e.stopPropagation();
    
    // 포트 클릭 체크
    if (selectedShapeId) {
      const selectedShape = design.shapes.find((s: Shape) => s.id === selectedShapeId);
      if (selectedShape?.ports) {
        for (const port of selectedShape.ports as Port[]) {
          const portPos = getPortPosition(selectedShape, port.id);
          const distance = Math.sqrt(
            Math.pow(portPos.x - x, 2) + Math.pow(portPos.y - y, 2)
          );
          
          if (distance <= 5) { // 포트 클릭 반경
            // 연결선 시작 또는 완료 처리
            setIsDragging(true);
            setDragStart({
              x: portPos.x,
              y: portPos.y,
              shapeId: selectedShape.id,
              portId: port.id
            });
            return;
          }
        }
      }
    }

    // Z-index 순서대로 도형 체크 (위에 있는 도형부터)
    for (let i = design.shapes.length - 1; i >= 0; i--) {
      const shape = design.shapes[i];
      if (isPointInShape(x, y, shape)) {
        if (shape.id !== selectedShapeId) {
          onShapeClick?.(shape.id);
        }
        setIsDragging(true);
        setDragStart({ x, y });
        setOriginalShape({ ...shape });
        return;
      }
    }

    // 빈 공간 클릭시 선택 해제
    onShapeClick?.(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && dragStart && dragStart.shapeId && dragStart.portId) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      design.shapes.forEach((s: Shape) => renderShape(ctx, s));

      ctx.beginPath();
      ctx.moveTo(dragStart.x, dragStart.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      return;
    }

    if (isDragging && originalShape && dragStart) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      if (selectedShapeId) {
        onShapeUpdate?.(selectedShapeId, {
          position: {
            x: originalShape.position.x + deltaX,
            y: originalShape.position.y + deltaY
          }
        });
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart) {
      setIsDragging(false);
      setDragStart(null);
      setOriginalShape(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || !dragStart.shapeId || !dragStart.portId) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 포트 위에서 마우스를 놓았는지 확인
    for (const shape of design.shapes) {
      if (shape.id === dragStart.shapeId) continue;

      if (shape.ports) {
        for (const port of shape.ports) {
          const portPos = getPortPosition(shape, port.id);
          const distance = Math.sqrt(
            Math.pow(portPos.x - x, 2) + Math.pow(portPos.y - y, 2)
          );

          if (distance <= 5) { // 포트 클릭 반경
            // 연결선 생성
            const connector = createConnector(
              {
                shapeId: dragStart.shapeId,
                portId: dragStart.portId
              },
              {
                shapeId: shape.id,
                portId: port.id
              }
            );

            onShapeUpdate?.(connector.id, connector);
            break;
          }
        }
      }
    }

    setIsDragging(false);
    setDragStart(null);
  };

  const handleTextComplete = (text: string, style: Partial<ShapeStyle>) => {
    if (editingText && onShapeUpdate) {
      // 원래 도형의 크기와 위치 유지
      onShapeUpdate(editingText.id, {
        text,
        style: { ...editingText.style, ...style },
        // size와 position은 원래 도형의 값을 유지
        size: editingText.size,
        position: editingText.position
      });
      setEditingText(null);
    }
  };

  const isPointInShape = (x: number, y: number, shape: Shape): boolean => {
    const { position, size } = shape;

    switch (shape.type) {
      case 'text':
      case 'rectangle':
        return (
          x >= position.x &&
          x <= position.x + size.width &&
          y >= position.y &&
          y <= position.y + size.height
        );

      case 'circle':
        const centerX = position.x + size.width / 2;
        const centerY = position.y + size.height / 2;
        const radius = Math.min(size.width, size.height) / 2;
        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        return distance <= radius;

      case 'triangle':
        return isPointInTriangle(
          x,
          y,
          { x: position.x + size.width / 2, y: position.y },
          { x: position.x + size.width, y: position.y + size.height },
          { x: position.x, y: position.y + size.height }
        );

      default:
        return false;
    }
  };

  const isPointInTriangle = (
    px: number,
    py: number,
    p1: Point,
    p2: Point,
    p3: Point
  ): boolean => {
    const area = getTriangleArea(p1, p2, p3);
    const area1 = getTriangleArea({ x: px, y: py }, p2, p3);
    const area2 = getTriangleArea(p1, { x: px, y: py }, p3);
    const area3 = getTriangleArea(p1, p2, { x: px, y: py });

    return Math.abs(area - (area1 + area2 + area3)) < 0.1;
  };

  const getTriangleArea = (p1: Point, p2: Point, p3: Point): number => {
    return Math.abs(
      (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2
    );
  };

  const getContextMenuItems = (shapeId: string): MenuItem[] => {
    const shape = design.shapes.find((s: Shape) => s.id === shapeId);
    if (!shape) {
      setContextMenu(null);
      return [];
    }

    const menuItems: MenuItem[] = [
      {
        id: 'duplicate',
        label: t('menu.context.duplicate'),
        shortcut: 'Ctrl+D',
        onClick: () => onShapeDuplicate?.(shapeId)
      }
    ];

    if (shape.type === 'text') {
      menuItems.push({
        id: 'edit',
        label: t('menu.context.editStyle'),
        shortcut: 'Double Click',
        onClick: () => setEditingText(shape)
      });
    }

    menuItems.push(
      {
        id: 'rotate',
        label: t('menu.context.rotate90'),
        shortcut: 'R',
        onClick: () => onShapeRotate?.(shapeId, 90)
      },
      {
        id: 'divider1',
        divider: true,
        label: ''
      },
      {
        id: 'delete',
        label: t('menu.context.delete'),
        shortcut: 'Delete',
        onClick: () => onShapeDelete?.(shapeId)
      }
    );

    return menuItems;
  };

  const renderShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save();

    // Transform 적용
    if (shape.transform) {
      const centerX = shape.position.x + shape.size.width / 2;
      const centerY = shape.position.y + shape.size.height / 2;

      ctx.translate(centerX, centerY);
      if (shape.transform.rotate) {
        ctx.rotate((shape.transform.rotate * Math.PI) / 180);
      }
      ctx.translate(-centerX, -centerY);
    }

    // Style 적용
    applyStyle(ctx, shape.style);

    // 도형 타입별 렌더링
    switch (shape.type) {
      case 'group':
        // 그룹의 경계 상자 렌더링
        ctx.strokeStyle = shape.style.stroke || '#2196f3';
        ctx.lineWidth = shape.style.strokeWidth || 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          shape.position.x,
          shape.position.y,
          shape.size.width,
          shape.size.height
        );
        ctx.setLineDash([]);

        // 자식 도형들 렌더링
        shape.children?.forEach((child: Shape) => {
          const childInGroup = {
            ...child,
            position: {
              x: shape.position.x + child.position.x,
              y: shape.position.y + child.position.y
            }
          };
          renderShape(ctx, childInGroup);
        });
        break;
      case 'text':
        const textStyle = shape.style;
        const fontSize = textStyle.fontSize || 16;
        ctx.font = `${textStyle.bold ? 'bold' : ''} ${textStyle.italic ? 'italic' : ''} ${fontSize}px ${textStyle.fontFamily || 'sans-serif'}`;
        ctx.fillStyle = textStyle.textColor || '#000000';
        ctx.textAlign = (textStyle.textAlign || 'left') as CanvasTextAlign;
        
        if (textStyle.backgroundColor) {
          const metrics = ctx.measureText(shape.text || '');
          const textHeight = fontSize;
          ctx.fillStyle = textStyle.backgroundColor;
          ctx.fillRect(
            shape.position.x,
            shape.position.y,
            shape.size.width,
            shape.size.height
          );
          ctx.fillStyle = textStyle.textColor || '#000000';
        }

        let baselineY = shape.position.y + fontSize;
        const lineHeight = textStyle.lineHeight || 1.5;
        const lines = (shape.text || '').split('\n');

        lines.forEach((line: string, index: number) => {
          let x = shape.position.x;
          if (textStyle.textAlign === 'center') {
            x = shape.position.x + shape.size.width / 2;
          } else if (textStyle.textAlign === 'right') {
            x = shape.position.x + shape.size.width;
          }

          ctx.fillText(line, x, baselineY + (index * fontSize * lineHeight));
        });

        if (textStyle.underline || textStyle.strikethrough) {
          ctx.beginPath();
          lines.forEach((line: string, index: number) => {
            const metrics = ctx.measureText(line);
            const lineWidth = metrics.width;
            let startX = shape.position.x;
            let y = baselineY + (index * fontSize * lineHeight);

            if (textStyle.textAlign === 'center') {
              startX = shape.position.x + (shape.size.width - lineWidth) / 2;
            } else if (textStyle.textAlign === 'right') {
              startX = shape.position.x + shape.size.width - lineWidth;
            }

            if (textStyle.underline) {
              ctx.moveTo(startX, y + 2);
              ctx.lineTo(startX + lineWidth, y + 2);
            }
            if (textStyle.strikethrough) {
              ctx.moveTo(startX, y - fontSize/3);
              ctx.lineTo(startX + lineWidth, y - fontSize/3);
            }
          });
          ctx.strokeStyle = textStyle.textColor || '#000000';
          ctx.stroke();
        }
        break;
      case 'rectangle':
        ctx.fillRect(
          shape.position.x,
          shape.position.y,
          shape.size.width,
          shape.size.height
        );
        if (shape.style.stroke) {
          ctx.strokeRect(
            shape.position.x,
            shape.position.y,
            shape.size.width,
            shape.size.height
          );
        }
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(
          shape.position.x + shape.size.width / 2,
          shape.position.y + shape.size.height / 2,
          Math.min(shape.size.width, shape.size.height) / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        if (shape.style.stroke) {
          ctx.stroke();
        }
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(shape.position.x + shape.size.width / 2, shape.position.y);
        ctx.lineTo(
          shape.position.x + shape.size.width,
          shape.position.y + shape.size.height
        );
        ctx.lineTo(shape.position.x, shape.position.y + shape.size.height);
        ctx.closePath();
        ctx.fill();
        if (shape.style.stroke) {
          ctx.stroke();
        }
        break;
      case 'connector':
        const connector = shape as ConnectorShape;
        const sourceShape = design.shapes.find((s: Shape) => s.id === connector.source.shapeId);
        const targetShape = design.shapes.find((s: Shape) => s.id === connector.target.shapeId);
        
        if (!sourceShape || !targetShape) return;
        
        const sourcePoint = getPortPosition(sourceShape, connector.source.portId);
        const targetPoint = getPortPosition(targetShape, connector.target.portId);
        const path = calculateConnectorPath(
          sourcePoint,
          targetPoint,
          connector.style.lineType,
          connector.style.cornerRadius
        );

        // 연결선 그리기
        ctx.beginPath();
        if (connector.style.lineType === 'curved') {
          ctx.moveTo(path[0].x, path[0].y);
          ctx.bezierCurveTo(
            path[1].x, path[1].y,
            path[2].x, path[2].y,
            path[3].x, path[3].y
          );
        } else {
          ctx.moveTo(path[0].x, path[0].y);
          path.slice(1).forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
        }
        ctx.stroke();

        // 화살표 그리기
        if (connector.style.endArrow === 'arrow') {
          const lastSegment = path.slice(-2);
          const angle = Math.atan2(
            lastSegment[1].y - lastSegment[0].y,
            lastSegment[1].x - lastSegment[0].x
          );
          
          ctx.beginPath();
          ctx.moveTo(targetPoint.x, targetPoint.y);
          ctx.lineTo(
            targetPoint.x - 10 * Math.cos(angle - Math.PI / 6),
            targetPoint.y - 10 * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            targetPoint.x - 10 * Math.cos(angle + Math.PI / 6),
            targetPoint.y - 10 * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();
        }
        break;
    }

    if (selectedShapeId === shape.id) {
      renderBoundingBox(ctx, shape);
      renderTransformHandles(ctx, shape);
      renderPorts(ctx, shape); // 포트 렌더링 추가
    }
    
    ctx.restore();
  };

  const renderBoundingBox = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save();
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    const { x, y } = shape.position;
    const { width, height } = shape.size;
    
    // 회전 적용
    if (shape.transform?.rotate) {
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate((shape.transform.rotate * Math.PI) / 180);
      ctx.translate(-(x + width / 2), -(y + height / 2));
    }
        
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
  };

  const renderTransformHandles = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 2;
    
    const { x, y } = shape.position;
    const { width, height } = shape.size;
    const handleSize = 8;
    
    // 회전 중심점 적용
    if (shape.transform?.rotate) {
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate((shape.transform.rotate * Math.PI) / 180);
      ctx.translate(-(x + width / 2), -(y + height / 2));
    }
    
    // 이동 핸들 (중앙)
    const moveHandle = {
      x: x + width / 2,
      y: y + height / 2
    };
    
    ctx.beginPath();
    ctx.arc(moveHandle.x, moveHandle.y, handleSize, 0, Math.PI * 2);
    ctx.fillStyle = '#2196f3';
    ctx.fill();
    ctx.stroke();

    // 회전 핸들 (상단 중앙)
    const rotateHandle = {
      x: x + width / 2,
      y: y - 30
    };

    // 회전 핸들로의 선
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(rotateHandle.x, rotateHandle.y);
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(rotateHandle.x, rotateHandle.y, handleSize, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  };

  const renderPorts = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    if (!shape.ports || shape.type === 'connector') return;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 2;

    shape.ports.forEach((port: Port) => {
      const pos: Point = getPortPosition(shape, port.id);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  };

  const applyStyle = (ctx: CanvasRenderingContext2D, style: ShapeStyle) => {
    ctx.fillStyle = style.fill || '#ffffff';
    ctx.strokeStyle = style.stroke || '#000000';
    ctx.lineWidth = style.strokeWidth || 1;
    ctx.globalAlpha = style.opacity ?? 1;

    if (style.shadow) {
      ctx.shadowColor = style.shadow.color;
      ctx.shadowBlur = style.shadow.blur;
      ctx.shadowOffsetX = style.shadow.offsetX;
      ctx.shadowOffsetY = style.shadow.offsetY;
    } else {
      // 그림자 효과 초기화
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    if (style.gradient) {
      const gradient = createGradient(ctx, style.gradient);
      ctx.fillStyle = gradient;
    }
  };

  const createGradient = (
    ctx: CanvasRenderingContext2D,
    gradient: Gradient
  ): CanvasGradient => {
    let canvasGradient: CanvasGradient;

    if (gradient.type === 'linear') {
      const angle = gradient.angle || 0;
      const rad = (angle * Math.PI) / 180;
      const size = Math.max(design.canvas.width, design.canvas.height);
      
      canvasGradient = ctx.createLinearGradient(
        0,
        0,
        size * Math.cos(rad),
        size * Math.sin(rad)
      );
    } else {
      const center = gradient.center || {
        x: design.canvas.width / 2,
        y: design.canvas.height / 2
      };
      canvasGradient = ctx.createRadialGradient(
        center.x,
        center.y,
        0,
        center.x,
        center.y,
        Math.max(design.canvas.width, design.canvas.height) / 2
      );
    }

    gradient.stops.forEach((stop: GradientStop) => {
      canvasGradient.addColorStop(stop.offset, stop.color);
    });

    return canvasGradient;
  };

  return (
    <div className="relative zentrix-scrollbar w-full h-full overflow-auto">
      <div className="relative min-w-fit min-h-fit">
        <Grid 
          width={design.canvas.width} 
          height={design.canvas.height} 
        />
        <canvas
          ref={canvasRef}
          width={design.canvas.width}
          height={design.canvas.height}
          onClick={handleCanvasClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="zentrix-canvas relative z-10"
        />
        <div className="absolute inset-0">
          {editingText && (
            <div
              style={{
                position: 'absolute',
                left: `${editingText.position.x}px`,
                top: `${editingText.position.y}px`,
                width: `${editingText.size.width}px`,
                height: `${editingText.size.height}px`
              }}
            >
              <TextEditor
                text={editingText.text || ''}
                position={editingText.position}
                size={editingText.size}
                style={editingText.style}
                onComplete={handleTextComplete}
                onCancel={() => setEditingText(null)}
              />
            </div>
          )}
        </div>
        {contextMenu && (
          <ContextMenu
            items={getContextMenuItems(contextMenu.shapeId)}
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ZentrixCanvas;