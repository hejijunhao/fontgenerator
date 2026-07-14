/**
 * Generates 1200×630 Open Graph PNGs for each route.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCanvas, loadImage } from '@napi-rs/canvas'

const root = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(root, '../public')
const ogDir = path.join(publicDir, 'og')
const W = 1200
const H = 630

mkdirSync(ogDir, { recursive: true })

function drawBrandHeader(ctx, title, subtitle, palette) {
  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = palette.ink
  ctx.font = '600 28px Inter, system-ui, sans-serif'
  ctx.fillText('GLYPHMILL', 64, 72)

  ctx.font = '600 52px Inter, system-ui, sans-serif'
  ctx.fillText(title, 64, 150)

  ctx.fillStyle = palette.muted
  ctx.font = '400 26px Inter, system-ui, sans-serif'
  wrapText(ctx, subtitle, 64, 210, W - 128, 34)
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let cursorY = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY)
      line = word
      cursorY += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, cursorY)
}

function drawPipeline(ctx, palette) {
  const nodes = ['pre', 'trc', 'plc', 'bld', 'exp']
  const labels = ['Preprocess', 'Trace', 'Place', 'Build', 'Export']
  const startX = 120
  const y = 420
  const gap = 200

  ctx.strokeStyle = palette.hairline
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(startX + 40, y)
  ctx.lineTo(startX + gap * 4 + 40, y)
  ctx.stroke()

  nodes.forEach((node, i) => {
    const x = startX + gap * i
    ctx.fillStyle = palette.panel
    ctx.strokeStyle = palette.hairline
    ctx.lineWidth = 1
    ctx.fillRect(x, y - 36, 80, 72)
    ctx.strokeRect(x, y - 36, 80, 72)

    ctx.fillStyle = palette.ink
    ctx.font = '500 22px "IBM Plex Mono", monospace'
    ctx.fillText(node, x + 14, y + 6)

    ctx.fillStyle = palette.muted
    ctx.font = '400 16px Inter, system-ui, sans-serif'
    ctx.fillText(labels[i], x - 4, y + 58)
  })
}

async function generateLanding() {
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')
  const palette = { bg: '#f6f5f0', ink: '#1a1a18', muted: '#6b6a66', hairline: '#d8d6ce', panel: '#ffffff' }

  drawBrandHeader(
    ctx,
    'PNG letter art → installable fonts',
    'Browser-native conversion with WASM. Optional agent tuning.',
    palette,
  )

  const source = await loadImage(path.join(publicDir, 'A-KaminoDeco.png'))
  const render = await loadImage(path.join(publicDir, 'golden/A-render.png'))

  const imgY = 280
  const imgH = 280
  const srcW = (source.width / source.height) * imgH
  ctx.drawImage(source, 700, imgY, srcW, imgH)
  ctx.drawImage(render, 920, imgY, imgH, imgH)

  ctx.fillStyle = palette.muted
  ctx.font = '400 20px Inter, system-ui, sans-serif'
  ctx.fillText('Source PNG', 700, imgY + imgH + 28)
  ctx.fillText('Built font', 920, imgY + imgH + 28)

  writeFileSync(path.join(ogDir, 'landing.png'), canvas.toBuffer('image/png'))
}

function generateHowItWorks() {
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')
  const palette = { bg: '#f6f5f0', ink: '#1a1a18', muted: '#6b6a66', hairline: '#c8c6be', panel: '#eeede6' }

  drawBrandHeader(
    ctx,
    'How PNG images become fonts',
    'Preprocess → Potrace trace → place → build → export. FAQ and methodology.',
    palette,
  )
  drawPipeline(ctx, palette)

  writeFileSync(path.join(ogDir, 'how-it-works.png'), canvas.toBuffer('image/png'))
}

function generateExport() {
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')
  const palette = { bg: '#0d0c0b', ink: '#eceae6', muted: '#9a9894', hairline: '#2a2927', panel: '#161514' }

  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = palette.ink
  ctx.font = '600 28px Inter, system-ui, sans-serif'
  ctx.fillText('GLYPHMILL · EXPORT', 64, 72)

  ctx.font = '600 52px Inter, system-ui, sans-serif'
  ctx.fillText('Console font mill', 64, 150)

  ctx.fillStyle = palette.muted
  ctx.font = '400 26px Inter, system-ui, sans-serif'
  ctx.fillText('SOURCE → BUILD → REVIEW → EXPORT', 64, 210)

  const bays = ['SOURCE', 'BUILD', 'REVIEW', 'EXPORT']
  bays.forEach((label, i) => {
    const x = 64 + i * 270
    const y = 320
    ctx.fillStyle = palette.panel
    ctx.strokeStyle = palette.hairline
    ctx.fillRect(x, y, 240, 240)
    ctx.strokeRect(x, y, 240, 240)

    ctx.fillStyle = palette.muted
    ctx.font = '500 14px "IBM Plex Mono", monospace'
    ctx.fillText(label, x + 16, y + 32)
  })

  writeFileSync(path.join(ogDir, 'export.png'), canvas.toBuffer('image/png'))
}

function generateGenerate() {
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')
  const palette = { bg: '#f6f5f0', ink: '#1a1a18', muted: '#6b6a66', hairline: '#c8c6be' }

  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, W, H)

  for (let y = 0; y < H; y += 8) {
    for (let x = 0; x < W; x += 8) {
      if ((x + y) % 16 === 0) {
        ctx.fillStyle = 'rgba(26, 26, 24, 0.04)'
        ctx.fillRect(x, y, 4, 4)
      }
    }
  }

  ctx.strokeStyle = palette.hairline
  ctx.lineWidth = 2
  ctx.setLineDash([12, 8])
  ctx.strokeRect(64, 120, W - 128, H - 200)
  ctx.setLineDash([])

  ctx.fillStyle = palette.ink
  ctx.font = '600 52px Inter, system-ui, sans-serif'
  ctx.fillText('Generate — coming soon', 96, 220)

  ctx.fillStyle = palette.muted
  ctx.font = '400 26px Inter, system-ui, sans-serif'
  ctx.fillText('Agentic glyph creation. Use Export today.', 96, 280)

  writeFileSync(path.join(ogDir, 'generate.png'), canvas.toBuffer('image/png'))
}

await generateLanding()
generateHowItWorks()
generateExport()
generateGenerate()

console.log('generate-og-images: wrote public/og/*.png (1200×630)')