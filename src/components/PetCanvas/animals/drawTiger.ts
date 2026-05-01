import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawTiger(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.16) * 1.5 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 0, 20, 11, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.tigerBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // stripes on body
  setStroke(ctx, p.tigerStripe, 2.5)
  ctx.globalAlpha = 0.4
  const stripes = [[-12, -4, -8, 6], [-4, -6, 0, 8], [6, -5, 10, 7]]
  for (const [sx, sy, ex, ey] of stripes) {
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo((sx + ex) / 2, sy + 2, ex, ey)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)

  // belly
  fillEllipse(ctx, 0, 4, 14, 5, p.tigerBelly, 0.25)

  // head
  ctx.beginPath()
  ctx.arc(20, -3, 11, 0, Math.PI * 2)
  ctx.fillStyle = p.tigerBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // head stripes
  setStroke(ctx, p.tigerStripe, 2)
  ctx.globalAlpha = 0.35
  ctx.beginPath(); ctx.moveTo(16, -12); ctx.lineTo(18, -6); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(22, -13); ctx.lineTo(22, -6); ctx.stroke()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)

  // ears
  ctx.beginPath()
  ctx.arc(14, -12, 4, 0, Math.PI * 2)
  ctx.fillStyle = p.tigerBody
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(26, -12, 4, 0, Math.PI * 2)
  ctx.fillStyle = p.tigerBody
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.stroke()

  // eyes
  dot(ctx, 17, -5, 2, p.line)
  dot(ctx, 23, -5, 2, p.line)
  ctx.save(); ctx.globalAlpha = 0.5
  dot(ctx, 17.6, -5.6, 0.6, '#fff'); dot(ctx, 23.6, -5.6, 0.6, '#fff')
  ctx.restore()

  // nose
  ctx.beginPath()
  ctx.moveTo(20, -1); ctx.lineTo(18.5, 0.5); ctx.lineTo(21.5, 0.5)
  ctx.closePath(); ctx.fillStyle = p.line; ctx.fill()

  // mouth
  setStroke(ctx, p.line, 1.2)
  ctx.beginPath(); ctx.moveTo(20, 0.5); ctx.lineTo(20, 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(18, 2, 2, -0.2, Math.PI * 0.6); ctx.stroke()
  ctx.beginPath(); ctx.arc(22, 2, 2, Math.PI * 0.4, Math.PI + 0.2); ctx.stroke()
  setStroke(ctx, p.line, 2)

  // tail
  const tw = Math.sin(frame * 0.12) * 10
  ctx.beginPath()
  ctx.moveTo(-20, -2)
  ctx.bezierCurveTo(-26, 4, -32 + tw * 0.3, 14, -26 + tw * 0.6, 20)
  ctx.stroke()
  // tail tip
  setStroke(ctx, p.tigerStripe, 3)
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(-26 + tw * 0.6, 20)
  ctx.quadraticCurveTo(-24 + tw * 0.7, 24, -22 + tw * 0.5, 22)
  ctx.stroke()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)

  // legs
  const legFreq = 0.16 + speed * 0.06
  const legAmp = state === 'run' ? 8 : 1
  const tl = [
    { bx: -12, phase: 0 }, { bx: -4, phase: Math.PI },
    { bx: 6, phase: Math.PI * 0.5 }, { bx: 14, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of tl) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.4 + 0.8) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 9)
    ctx.quadraticCurveTo(bx + swing * 0.3, 14, bx + swing * 0.5, 19)
    ctx.stroke()
    dot(ctx, bx + swing * 0.5, 19, 1.5, p.line)
  }

  ctx.restore()
}