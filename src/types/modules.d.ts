declare module 'opentype.js' {
  export type PathCommand = {
    type: string
    x?: number
    y?: number
    x1?: number
    y1?: number
    x2?: number
    y2?: number
  }

  export class Path {
    commands: PathCommand[]
    moveTo(x: number, y: number): void
    lineTo(x: number, y: number): void
    curveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void
    close(): void
    extend(commands: unknown): void
    getBoundingBox(): { x1: number; y1: number; x2: number; y2: number }
    draw(ctx: CanvasRenderingContext2D): void
    static fromSVG(path: string, options?: Record<string, unknown>): Path
  }

  export class Glyph {
    constructor(options: Record<string, unknown>)
  }

  export class Font {
    constructor(options: Record<string, unknown>)
    glyphs: { length: number }
    validate(): string[]
    toArrayBuffer(): ArrayBuffer
    getPath(text: string, x: number, y: number, fontSize: number): Path
  }

  export function parse(buffer: ArrayBuffer): Font
}

declare module 'potrace-wasm' {
  export function loadFromCanvas(canvas: HTMLCanvasElement): Promise<string>
  const def: { loadFromCanvas: typeof loadFromCanvas }
  export default def
}

declare module 'svg-path-parser' {
  export function parseSVG(d: string): Array<Record<string, number | string>>
  export function makeAbsolute(
    cmds: Array<Record<string, number | string>>,
  ): Array<Record<string, number | string>>
}

declare module 'wawoff2' {
  export function compress(buffer: Buffer): Promise<Buffer>
}