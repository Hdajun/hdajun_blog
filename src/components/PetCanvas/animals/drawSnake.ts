import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawSnake(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const isMoving = state === 'run' && speed > 0.15

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(dir, 1)

  // S-curve body — snake always sways, faster when moving
  const wave = frame * 0.1
  const waveAmp = isMoving ? 5 : 3.5

  // compute spine points
  const pts: Array<{ bx: number; by: number }> = []
  for (let i = 0; i <= 12; i++) {
    const t = i / 12
    const bx = -25 + t * 40
    const by = Math.sin(wave + t * 3) * waveAmp * (0.3 + 0.7 * t)
    pts.push({ bx, by })
  }

  // body as a smooth path using quadratic curves
  ctx.beginPath()
  ctx.moveTo(pts[0].bx, pts[0].by)
  for (let i = 1; i < pts.length - 1; i++) {
    const cp = pts[i]
    const next = pts[i + 1]
    const midX = (cp.bx + next.bx) / 2
    const midY = (cp.by + next.by) / 2
    ctx.quadraticCurveTo(cp.bx, cp.by, midX, midY)
  }
  const lastPt = pts[pts.length - 1]
  ctx.lineTo(lastPt.bx, lastPt.by)

  // get body width at each point for stroke width variation
  const getWidth = (t: number) => {
    if (t < 0.15) return 2 + (t / 0.15) * 4
    if (t < 0.7) return 6
    return 6 - ((t - 0.7) / 0.3) * 3
  }

  // draw body with gradient fill
  ctx.save()
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = p.snakeBody
  ctx.globalAlpha = 0.6
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.restore()

  // draw body outline
  ctx.save()
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = p.line
  ctx.stroke()
  ctx.restore()

  // belly stripe — draw a lighter stripe along the bottom of the body
  ctx.save()
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = p.snakeBelly
  ctx.globalAlpha = 0.4
  // offset the path slightly downward
  ctx.beginPath()
  ctx.moveTo(pts[0].bx, pts[0].by + 1)
  for (let i = 1; i < pts.length - 1; i++) {
    const cp = pts[i]
    const next = pts[i + 1]
    const midX = (cp.bx + next.bx) / 2
    const midY = (cp.by + next.by) / 2 + 1
    ctx.quadraticCurveTo(cp.bx, cp.by + 1, midX, midY)
  }
  ctx.lineTo(lastPt.bx, lastPt.by + 1)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.restore()

  // pattern — draw scale-like diamond marks along the body
  for (let i = 2; i < pts.length - 1; i += 2) {
    const pt = pts[i]
    const t = i / pts.length
    const r = getWidth(t)
    const s = r * 0.45
    ctx.save()
    ctx.globalAlpha = 0.3
    ctx.fillStyle = p.snakePattern
    ctx.beginPath()
    ctx.moveTo(pt.bx, pt.by - s * 0.8)
    ctx.lineTo(pt.bx + s, pt.by)
    ctx.lineTo(pt.bx, pt.by + s * 0.6)
    ctx.lineTo(pt.bx - s, pt.by)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.restore()
  }

  // head — triangle-shaped like a real snake
  const headPt = pts[pts.length - 1]
  const headX = headPt.bx + 3
  const headY = headPt.by

  // head shape — diamond/triangle shape
  ctx.beginPath()
  ctx.moveTo(headX - 2, headY - 4)  // top
  ctx.lineTo(headX + 10, headY)      // right (nose)
  ctx.lineTo(headX - 2, headY + 4)   // bottom
  ctx.lineTo(headX - 6, headY)       // left (neck)
  ctx.closePath()
  ctx.fillStyle = p.snakeBody
  ctx.globalAlpha = 0.65
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()

  // head top marking
  ctx.save()
  ctx.globalAlpha = 0.25
  ctx.fillStyle = p.snakePattern
  ctx.beginPath()
  ctx.moveTo(headX - 1, headY - 3)
  ctx.lineTo(headX + 7, headY - 1)
  ctx.lineTo(headX + 7, headY + 1)
  ctx.lineTo(headX - 1, headY + 3)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.restore()

  // eyes — snake-like with vertical slit pupils
  // left eye
  dot(ctx, headX + 4, headY - 2.5, 2.5, '#FDE68A')  // yellow iris
  dot(ctx, headX + 4, headY - 2.5, 1.2, '#1C1917')    // dark pupil
  ctx.save(); ctx.globalAlpha = 0.6; dot(ctx, headX + 4.3, headY - 2.8, 0.5, '#FEF9C3'); ctx.restore()  // highlight

  // right eye
  dot(ctx, headX + 7, headY - 2, 2.5, '#FDE68A')  // yellow iris
  dot(ctx, headX + 7, headY - 2, 1.2, '#1C1917')    // dark pupil
  ctx.save(); ctx.globalAlpha = 0.6; dot(ctx, headX + 7.3, headY - 2.3, 0.5, '#FEF9C3'); ctx.restore()  // highlight

  // nostrils
  dot(ctx, headX + 9, headY - 0.8, 0.6, p.line)
  dot(ctx, headX + 9, headY + 0.8, 0.6, p.line)

  // tongue
  // tongue flicks periodically, more frequent when moving
  const tongueOut = isMoving ? Math.sin(frame * 0.12) > 0.35 : Math.sin(frame * 0.06) > 0.7
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

  // tail tip — thin taper with slight curve
  const tailPt = pts[0]
  setStroke(ctx, p.line, 1.2)
  ctx.beginPath()
  ctx.moveTo(tailPt.bx, tailPt.by)
  ctx.quadraticCurveTo(tailPt.bx - 5, tailPt.by - 2, tailPt.bx - 8, tailPt.by + 1)
  ctx.stroke()
  // small tail tip
  dot(ctx, tailPt.bx - 8, tailPt.by + 1, 0.8, p.line)

  ctx.restore()
}