import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawSnake(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const isMoving = state === 'run' && speed > 0.15

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(dir, 1)

  // S-curve body — use thick quadratic curves
  const wave = isMoving ? frame * 0.12 : frame * 0.02
  const waveAmp = isMoving ? 5 : 1.5

  // compute spine points
  const pts: Array<{ bx: number; by: number }> = []
  for (let i = 0; i <= 12; i++) {
    const t = i / 12
    const bx = -25 + t * 40
    const by = Math.sin(wave + t * 3) * waveAmp * (0.3 + 0.7 * t)
    pts.push({ bx, by })
  }

  // body as a series of overlapping circles (easy and clean)
  for (let i = 0; i < pts.length; i++) {
    const pt = pts[i]
    const t = i / pts.length
    // thin at tail, thick in middle, slightly thinner at neck
    let r: number
    if (t < 0.2) r = 2 + (t / 0.2) * 3
    else if (t < 0.75) r = 5
    else r = 5 - ((t - 0.75) / 0.25) * 2

    ctx.beginPath()
    ctx.arc(pt.bx, pt.by, r, 0, Math.PI * 2)
    ctx.fillStyle = p.snakeBody
    ctx.globalAlpha = 0.5
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.5)
    ctx.stroke()
  }

  // belly stripe — light colored band on lower half
  for (let i = 1; i < pts.length; i += 2) {
    const pt = pts[i]
    const t = i / pts.length
    let r: number
    if (t < 0.2) r = 2 + (t / 0.2) * 3
    else if (t < 0.75) r = 5
    else r = 5 - ((t - 0.75) / 0.25) * 2
    fillEllipse(ctx, pt.bx, pt.by + r * 0.3, r * 0.6, r * 0.5, p.snakeBelly, 0.2)
  }

  // pattern — small diamond marks
  for (let i = 3; i < pts.length - 1; i += 3) {
    const pt = pts[i]
    const t = i / pts.length
    let r: number
    if (t < 0.2) r = 2 + (t / 0.2) * 3
    else if (t < 0.75) r = 5
    else r = 5 - ((t - 0.75) / 0.25) * 2
    // small diamond
    const s = r * 0.5
    ctx.beginPath()
    ctx.moveTo(pt.bx, pt.by - s)
    ctx.lineTo(pt.bx + s, pt.by)
    ctx.lineTo(pt.bx, pt.by + s * 0.5)
    ctx.lineTo(pt.bx - s, pt.by)
    ctx.closePath()
    ctx.fillStyle = p.snakePattern
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // head — distinct from body, broader
  const headPt = pts[pts.length - 1]
  const headX = headPt.bx + 4
  const headY = headPt.by

  // head shape
  ctx.beginPath()
  ctx.ellipse(headX + 3, headY, 7, 5, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.snakeBody
  ctx.globalAlpha = 0.55
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // head top darker
  fillEllipse(ctx, headX + 3, headY - 1.5, 5, 2.5, p.snakePattern, 0.2)

  // eyes — on top of head
  dot(ctx, headX + 5, headY - 3, 2.2, '#fff')
  dot(ctx, headX + 5.5, headY - 3.3, 1.3, p.line)
  ctx.save(); ctx.globalAlpha = 0.4; dot(ctx, headX + 5.9, headY - 3.7, 0.4, '#fff'); ctx.restore()

  // nostrils
  dot(ctx, headX + 9, headY - 1, 0.7, p.line)
  dot(ctx, headX + 9, headY + 1, 0.7, p.line)

  // tongue
  const tongueOut = isMoving ? Math.sin(frame * 0.12) > 0.35 : Math.sin(frame * 0.03) > 0.85
  if (tongueOut) {
    const tongueLen = 5 + Math.sin(frame * 0.25) * 2
    setStroke(ctx, '#E05555', 1.3)
    ctx.beginPath()
    ctx.moveTo(headX + 10, headY)
    ctx.lineTo(headX + 10 + tongueLen, headY - 0.5)
    ctx.stroke()
    // fork
    ctx.beginPath()
    ctx.moveTo(headX + 10 + tongueLen - 1.5, headY - 0.5)
    ctx.lineTo(headX + 10 + tongueLen + 1, headY - 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(headX + 10 + tongueLen - 1.5, headY - 0.5)
    ctx.lineTo(headX + 10 + tongueLen + 1, headY + 1)
    ctx.stroke()
    setStroke(ctx, p.line, 1.5)
  }

  // tail tip — thin taper
  const tailPt = pts[0]
  setStroke(ctx, p.line, 1.2)
  ctx.beginPath()
  ctx.moveTo(tailPt.bx, tailPt.by)
  ctx.quadraticCurveTo(tailPt.bx - 4, tailPt.by - 1, tailPt.bx - 6, tailPt.by + 1)
  ctx.stroke()

  ctx.restore()
}