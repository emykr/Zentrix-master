

  interface ZentrixConfig {
    apiUrl: string;
    fontApiUrl: string;
    defaultFont: string;
    defaultFontSize: number;
    defaultFontColor: string;
    defaultBackgroundColor: string;
    defaultShapeStyle: ShapeStyle;
    defaultConnectorStyle: ConnectorStyle;
  }

  interface ZentrixState {
    initialized: boolean;
    error?: Error;
  }


declare global {
  interface Window {
    __APP_INITIALIZED__: boolean;
  }

  type InitializationStatus = {
    isInitialized: boolean;
    error?: Error;
  };

  interface AppConfig {
    version: string;
    environment: 'development' | 'production';
    features: {
      enableAnimations: boolean;
      debugMode: boolean;
    };
  }

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


  interface ZentrixShape {
    id: string;
    type: ShapeType;
    position: Point;
    size: Size;
    style: ShapeStyle;
    transform?: Transform;
    text?: string;
    children?: ZentrixShape[];
    ports?: Port[];
  }

  interface ShapeStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: number;
    letterSpacing?: number;
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
    stops: GradientStop[];
    angle?: number; // linear gradient only
    center?: Point; // radial gradient only
  }

  type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'text' | 'group' | 'connector';

  interface Port {
    id: string;
    position: 'top' | 'right' | 'bottom' | 'left';
    offset?: number;
  }

  interface ConnectorStyle extends ShapeStyle {
    lineType?: 'straight' | 'orthogonal' | 'curved';
    startArrow?: 'none' | 'arrow' | 'diamond';
    endArrow?: 'none' | 'arrow' | 'diamond';
    cornerRadius?: number;
  }

  interface ConnectorPoint {
    shapeId: string;
    portId: string;
  }

  interface ConnectorShape extends ZentrixShape {
    type: 'connector';
    style: ConnectorStyle;
    source: ConnectorPoint;
    target: ConnectorPoint;
  }

  interface ZentrixShape {
    id: string;
    type: ShapeType;
    position: Point;
    size: Size;
    style: ShapeStyle;
    transform?: Transform;
    text?: string;
    children?: ZentrixShape[];
    ports?: Port[];
  }

  interface ZentrixCanvas {
    width: number;
    height: number;
    background: string;
  }

  interface ZentrixDesign {
    id: string;
    name: string;
    canvas: ZentrixCanvas;
    shapes: ZentrixShape[];
  }

  interface FontInfo {
    family: string;
    weights: string[];
    formats: string[];
  }

  interface DownloadUrl {
    weight: string;
    url: string;
  }

  interface FontFile {
    filename: string;
    url: string;
  }

  interface DownloadStat {
    filename: string;
    downloads: number;
  }
}

export {};