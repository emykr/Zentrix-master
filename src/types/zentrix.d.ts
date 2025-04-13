export declare namespace Zentrix {
  interface Point {
    x: number;
    y: number;
  }

  interface Size {
    width: number;
    height: number;
  }

  interface Transform {
    rotate?: number;
    scale?: Point;
    skew?: Point;
  }

  interface ShapeStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: number;
    shadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
    gradient?: Gradient;
  }

  interface GradientStop {
    offset: number;
    color: string;
  }

  interface Gradient {
    type: 'linear' | 'radial';
    angle?: number;
    center?: Point;
    stops: GradientStop[];
  }

  interface Port {
    id: string;
    position: 'top' | 'right' | 'bottom' | 'left';
    offset?: number;
  }

  interface ConnectorStyle {
    stroke: string;
    strokeWidth: number;
    lineType: 'straight' | 'curved' | 'orthogonal';
    startArrow: 'none' | 'arrow';
    endArrow: 'none' | 'arrow';
    cornerRadius: number;
  }

  interface ConnectorPoint {
    shapeId: string;
    portId: string;
  }

  interface ConnectorShape extends Shape {
    source: ConnectorPoint;
    target: ConnectorPoint;
    style: ConnectorStyle;
  }

  interface Shape {
    id: string;
    type: 'rectangle' | 'circle' | 'text' | 'connector' | 'group';
    position: Point;
    size: Size;
    style: ShapeStyle;
    transform?: Transform;
    text?: string;
    ports?: Port[];
    children?: Shape[];
  }

  interface Canvas {
    width: number;
    height: number;
    background: string;
  }

  interface Design {
    id: string;
    name: string;
    canvas: Canvas;
    shapes: Shape[];
  }

  interface Config {
    servers: {
      fonts: string;
      api: string;
      download: string;
    };
  }
}

export type {
  Config,
  State,
  Point,
  Size,
  Transform,
  Shape,
  ShapeStyle,
  GradientStop,
  Gradient,
  ShapeType,
  Port,
  ConnectorStyle,
  ConnectorPoint,
  ConnectorShape,
  Canvas,
  Design,
  FontInfo,
  DownloadUrl,
  FontFile
};
