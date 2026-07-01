import { Path, type PathCommand } from 'opentype.js'
import parseSVGModule from 'svg-path-parser'
import type { PlaceParams } from '@/types/pipeline'

const { parseSVG, makeAbsolute } = parseSVGModule as {
  parseSVG: (d: string) => Array<Record<string, number | string>>
  makeAbsolute: (cmds: Array<Record<string, number | string>>) => Array<Record<string, number | string>>
}

const POTRACE_SCALE = 0.1

export function pxToEm(
  xPx: number,
  yPxFromTop: number,
  unitsPerEm: number,
  canvasHeight: number,
  baselineRow: number,
  leftBearing: number,
): { x: number; y: number } {
  const s = unitsPerEm / canvasHeight
  return {
    x: xPx * s + leftBearing,
    y: (baselineRow - yPxFromTop) * s,
  }
}

/** Potrace SVG group: x' = 0.1·x, y' = H − 0.1·y (y-down image rows). */
export function potraceRawToViewBox(
  xRaw: number,
  yRaw: number,
  canvasHeight: number,
): { x: number; y: number } {
  return {
    x: POTRACE_SCALE * xRaw,
    y: canvasHeight - POTRACE_SCALE * yRaw,
  }
}

export function svgPathToOpentypePath(pathD: string): Path {
  const commands = makeAbsolute(parseSVG(pathD))
  const path = new Path()
  for (const cmd of commands) {
    switch (cmd.code) {
      case 'M':
        path.moveTo(cmd.x as number, cmd.y as number)
        break
      case 'L':
        path.lineTo(cmd.x as number, cmd.y as number)
        break
      case 'C':
        path.curveTo(
          cmd.x1 as number,
          cmd.y1 as number,
          cmd.x2 as number,
          cmd.y2 as number,
          cmd.x as number,
          cmd.y as number,
        )
        break
      case 'Z':
        path.close()
        break
      default:
        throw new Error(`Unsupported SVG path command: ${String(cmd.code)}`)
    }
  }
  return path
}

export function placeSvgPath(
  pathD: string,
  canvasHeight: number,
  place: PlaceParams,
  leftBearing: number,
  rightBearing: number,
): { path: Path; advanceWidth: number } {
  const path = svgPathToOpentypePath(pathD)
  fixWinding(path)

  const s = place.unitsPerEm / canvasHeight

  let maxYView = -Infinity
  for (const cmd of path.commands) {
    for (const key of ['y', 'y1', 'y2'] as const) {
      const raw = cmd[key]
      if (raw === undefined) continue
      const yView = potraceRawToViewBox(0, raw as number, canvasHeight).y
      if (yView > maxYView) maxYView = yView
    }
  }

  for (const cmd of path.commands) {
    for (const key of ['x', 'y', 'x1', 'y1', 'x2', 'y2'] as const) {
      const raw = cmd[key]
      if (raw === undefined) continue
      if (key.startsWith('x')) {
        cmd[key] = POTRACE_SCALE * (raw as number) * s + leftBearing
      } else {
        const yView = potraceRawToViewBox(0, raw as number, canvasHeight).y
        cmd[key] = (maxYView - yView) * s
      }
    }
  }

  if (place.verticalOverride) {
    const { dyEm, scale } = place.verticalOverride
    for (const cmd of path.commands) {
      for (const key of ['y', 'y1', 'y2'] as const) {
        if (cmd[key] !== undefined) {
          cmd[key] = ((cmd[key] as number) + dyEm) * scale
        }
      }
      for (const key of ['x', 'x1', 'x2'] as const) {
        if (cmd[key] !== undefined) {
          cmd[key] = (cmd[key] as number) * scale
        }
      }
    }
  }

  const advanceWidth = Math.round(path.getBoundingBox().x2 + rightBearing)

  return { path, advanceWidth }
}

/** Split path commands into closed contours (each starts with M). */
export function splitContours(path: Path): Path[] {
  const contours: Path[] = []
  let current: Path | null = null

  for (const cmd of path.commands) {
    if (cmd.type === 'M') {
      if (current) contours.push(current)
      current = new Path()
      current.moveTo(cmd.x!, cmd.y!)
    } else if (current) {
      current.extend([cmd])
    }
  }
  if (current) contours.push(current)
  return contours
}

/** Shoelace signed area; y-up → CCW positive. */
export function signedArea(path: Path): number {
  let area = 0
  let cx = 0
  let cy = 0
  for (const cmd of path.commands) {
    if (cmd.type === 'M') {
      cx = cmd.x!
      cy = cmd.y!
    } else if (cmd.type === 'L') {
      area += (cx * cmd.y! - cmd.x! * cy) / 2
      cx = cmd.x!
      cy = cmd.y!
    } else if (cmd.type === 'C') {
      area += (cx * cmd.y! - cmd.x! * cy) / 2
      cx = cmd.x!
      cy = cmd.y!
    } else if (cmd.type === 'Z' && path.commands.length) {
      const start = path.commands.find((c: { type?: string }) => c.type === 'M')
      if (start) {
        area += (cx * start.y! - start.x! * cy) / 2
        cx = start.x!
        cy = start.y!
      }
    }
  }
  return area
}

export function reverseContour(path: Path): void {
  const cmds = path.commands.filter((c) => c.type !== 'Z')
  if (cmds.length < 2) return

  const reversed: PathCommand[] = []
  const first = cmds[0]
  const last = cmds[cmds.length - 1]
  reversed.push({ type: 'M', x: last.x, y: last.y })

  for (let i = cmds.length - 1; i > 0; i--) {
    const cmd = cmds[i]
    const prev = cmds[i - 1]
    if (cmd.type === 'L') {
      reversed.push({ type: 'L', x: prev.x, y: prev.y })
    } else if (cmd.type === 'C') {
      reversed.push({
        type: 'C',
        x1: cmd.x2,
        y1: cmd.y2,
        x2: cmd.x1,
        y2: cmd.y1,
        x: prev.x,
        y: prev.y,
      })
    }
  }

  if (first.type === 'L') {
    reversed.push({ type: 'L', x: first.x, y: first.y })
  } else if (first.type === 'C') {
    reversed.push({
      type: 'C',
      x1: last.x1,
      y1: last.y1,
      x2: first.x2,
      y2: first.y2,
      x: first.x,
      y: first.y,
    })
  }

  reversed.push({ type: 'Z' })
  path.commands = reversed
}

/**
 * TrueType holes: outer clockwise (negative signed area in y-up), inners opposite.
 */
export function fixWinding(path: Path): void {
  const contours = splitContours(path)
  if (contours.length <= 1) return

  const areas = contours.map((c) => ({ c, area: signedArea(c) }))
  const outer = areas.reduce((a, b) => (Math.abs(b.area) > Math.abs(a.area) ? b : a))
  const outerSign = Math.sign(outer.area) || -1

  path.commands = []
  for (const { c, area } of areas) {
    const isOuter = c === outer.c
    const wantSign = isOuter ? -1 : outerSign
    if (Math.sign(area) !== wantSign && area !== 0) {
      reverseContour(c)
    }
    path.extend(c.commands)
  }
}