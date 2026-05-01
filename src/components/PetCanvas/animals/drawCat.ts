import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawCat(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.2) * 1 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 2, 14, 10, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.catBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  fillEllipse(ctx, 0, 5, 9, 5, p.catBelly, 0.3)

  // head
  ctx.beginPath()
  ctx.arc(13, -8, 11, 0, Math.PI * 2)
  ctx.fillStyle = p.catBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // ears
  ctx.beginPath()
  ctx.moveTo(6, -16); ctx.lineTo(9, -24); ctx.lineTo(14, -17); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(16, -17); ctx.lineTo(21, -25); ctx.lineTo(24, -16); ctx.stroke()
  // inner ears
  ctx.beginPath()
  ctx.moveTo(8, -17); ctx.lineTo(10, -22); ctx.lineTo(13, -17); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(18, -17); ctx.lineTo(20, -23); ctx.lineTo(22, -17); ctx.stroke()

  // eyes
  dot(ctx, 10, -9, 2.2, p.line)
  dot(ctx, 17, -9, 2.2, p.line)
  ctx.save(); ctx.globalAlpha = 0.6
  dot(ctx, 10.7, -9.8, 0.7, '#fff'); dot(ctx, 17.7, -9.8, 0.7, '#fff')
  ctx.restore()

  // nose
  ctx.beginPath()
  ctx.moveTo(13.5, -5); ctx.lineTo(12, -3.5); ctx.lineTo(15, -3.5)
  ctx.closePath(); ctx.fillStyle = p.line; ctx.fill()

  // whiskers
  setStroke(ctx, p.line, 1)
  const wh = [[4, -5, -6, -7], [4, -3, -6, -3], [23, -5, 35, -7], [23, -3, 35, -3]]
  for (const [sx, sy, ex, ey] of wh) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()
  }
  setStroke(ctx, p.line, 2)

  // tail
  const ts = Math.sin(frame * 0.1 * (speed * 0.3 + 0.8)) * 12
  ctx.beginPath()
  ctx.moveTo(-12, 4)
  ctx.bezierCurveTo(-20, 8, -26 + ts * 0.4, 16, -20 + ts * 0.6, 24)
  ctx.bezierCurveTo(-16 + ts * 0.3, 28, -12 + ts * 0.2, 26, -14, 22)
  ctx.stroke()

  // legs
  const legFreq = 0.18 + speed * 0.06
  const legAmp = state === 'run' ? 8 : 1
  const cl = [
    { bx: -8, phase: 0 }, { bx: -2, phase: Math.PI },
    { bx: 5, phase: Math.PI * 0.5 }, { bx: 10, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of cl) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.4 + 0.8) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 10)
    ctx.quadraticCurveTo(bx + swing * 0.3, 15, bx + swing * 0.5, 20)
    ctx.stroke()
  }

  ctx.restore()
}