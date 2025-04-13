import type { 
  Design, Shape, Point, Size, ConnectorPoint, 
  ConnectorShape, ShapeStyle, ConnectorStyle, Port 
} from '@/types/zentrix';

import { v4 as uuidv4 } from 'uuid';

export const createShape = (
  type: Shape['type'],
  position: Point,
  size: Size,
  options: Partial<Pick<Shape, 'text' | 'style' | 'transform'>> = {}
): Shape => {
  // 기본 스타일 설정
  const defaultStyle: ShapeStyle = {
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 1,
    opacity: 1,
    textColor: '#000000',  // 텍스트 색상을 검정색으로 고정
    fontSize: 16,
    fontFamily: 'sans-serif'
  };

  const shape = {
    id: crypto.randomUUID(),
    type,
    position,
    size,
    style: {
      ...defaultStyle,
      ...options.style
    },
    transform: options.transform,
    text: options.text,
    ...(type === 'group' ? { children: [] } : {})
  };

  // 배경색에 따른 텍스트 색상 자동 설정
  if (type === 'text' && shape.style.fill) {
    shape.style.textColor = getContrastTextColor(shape.style.fill);
  }

  return shape;
};

export const updateShape = (
  design: Design,
  shapeId: string,
  updates: Partial<Shape>
): Design => {
  return {
    ...design,
    shapes: design.shapes.map((shape: Shape) =>
      shape.id === shapeId
        ? { ...shape, ...updates }
        : shape
    )
  };
};

export const deleteShape = (
  design: Design,
  shapeId: string
): Design => {
  return {
    ...design,
    shapes: design.shapes.filter((shape: Shape) => shape.id !== shapeId)
  };
};

export const moveShape = (
  design: Design,
  shapeId: string,
  deltaX: number,
  deltaY: number
): Design => {
  return updateShape(design, shapeId, {
    position: {
      x: design.shapes.find((s: Shape) => s.id === shapeId)!.position.x + deltaX,
      y: design.shapes.find((s: Shape) => s.id === shapeId)!.position.y + deltaY
    }
  });
};

export const resizeShape = (
  design: Design,
  shapeId: string,
  width: number,
  height: number
): Design => {
  return updateShape(design, shapeId, {
    size: { width, height }
  });
};

export const rotateShape = (
  design: Design,
  shapeId: string,
  angle: number
): Design => {
  const shape = design.shapes.find((s: Shape) => s.id === shapeId)!;
  return updateShape(design, shapeId, {
    transform: {
      ...shape.transform,
      rotate: angle
    }
  });
};

export const createConnector = (
  source: ConnectorPoint,
  target: ConnectorPoint,
  style: Partial<ConnectorStyle> = {}
): ConnectorShape => {
  const defaultStyle: ConnectorStyle = {
    stroke: '#000000',
    strokeWidth: 2,
    lineType: 'orthogonal',
    startArrow: 'none',
    endArrow: 'arrow',
    cornerRadius: 5,
    textColor: ''
  };

  return {
    id: crypto.randomUUID(),
    type: 'connector',
    position: { x: 0, y: 0 }, // Will be calculated during render
    size: { width: 0, height: 0 }, // Will be calculated during render
    style: { ...defaultStyle, ...style },
    source,
    target
  } as ConnectorShape;
};

export const getPortPosition = (shape: Shape, portId: string): Point => {
  const port = shape.ports?.find((p: Port) => p.id === portId);
  if (!port) {
    throw new Error(`Port with ID ${portId} not found in shape ${shape.id}`);
  }

  const offset = port.offset || 0.5;
  
  switch (port.position) {
    case 'top':
      return {
        x: shape.position.x + shape.size.width * offset,
        y: shape.position.y
      };
    case 'right':
      return {
        x: shape.position.x + shape.size.width,
        y: shape.position.y + shape.size.height * offset
      };
    case 'bottom':
      return {
        x: shape.position.x + shape.size.width * offset,
        y: shape.position.y + shape.size.height
      };
    case 'left':
      return {
        x: shape.position.x,
        y: shape.position.y + shape.size.height * offset
      };
  }
};

export const calculateConnectorPath = (
  sourcePoint: Point,
  targetPoint: Point,
  lineType: ConnectorStyle['lineType'] = 'orthogonal',
  cornerRadius: number = 5
): Point[] => {
  if (lineType === 'straight') {
    return [sourcePoint, targetPoint];
  }

  if (lineType === 'curved') {
    // 베지어 곡선 제어점 계산
    const controlPoint1 = {
      x: sourcePoint.x + (targetPoint.x - sourcePoint.x) * 0.5,
      y: sourcePoint.y
    };
    const controlPoint2 = {
      x: sourcePoint.x + (targetPoint.x - sourcePoint.x) * 0.5,
      y: targetPoint.y
    };
    return [sourcePoint, controlPoint1, controlPoint2, targetPoint];
  }

  // orthogonal (직각) 연결선
  const dx = targetPoint.x - sourcePoint.x;
  const dy = targetPoint.y - sourcePoint.y;
  const midX = sourcePoint.x + dx / 2;

  return [
    sourcePoint,
    { x: midX, y: sourcePoint.y },
    { x: midX, y: targetPoint.y },
    targetPoint
  ];
};

export const addDefaultPorts = (shape: Shape): Shape => {
  if (shape.type === 'connector') return shape;
  
  return {
    ...shape,
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' }
    ]
  };
};

export const getContrastTextColor = (backgroundColor: string): string => {
  // HEX to RGB 변환
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // 상대 휘도 계산 (WCAG 기준)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};