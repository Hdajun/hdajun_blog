import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawRabbit(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.22) * 2 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 2, 12, 10, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()

  fillEllipse(ctx, 0, 5, 8, 5, p.rabbitBelly, 0.3)

  // head
  ctx.beginPath()
  ctx.arc(10, -6, 9, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()

  // ears
  const earTwitch = Math.sin(frame * 0.08) * 2
  ctx.beginPath()
  ctx.ellipse(6, -22 + earTwitch, 3.5, 10, -0.15, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()
  // inner ear
  ctx.beginPath()
  ctx.ellipse(6, -22 + earTwitch, 2, 7, -0.15, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitEar
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.beginPath()
  ctx.ellipse(13, -23 - earTwitch, 3.5, 10, 0.15, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(13, -23 - earTwitch, 2, 7, 0.15, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitEar
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1

  // eye
  dot(ctx, 12, -7, 2, p.line)
  ctx.save(); ctx.globalAlpha = 0.5; dot(ctx, 12.6, -7.7, 0.6, '#fff'); ctx.restore()
  dot(ctx, 17, -4, 1.3, p.line)

  // whiskers
  setStroke(ctx, p.line, 0.8)
  ctx.beginPath(); ctx.moveTo(16, -3); ctx.lineTo(24, -5); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(16, -2); ctx.lineTo(24, -1); ctx.stroke()

  // tail
  setStroke(ctx, p.line, 1.8)
  ctx.beginPath(); ctx.arc(-12, 0, 5, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(-13, -2, 3, 0, Math.PI * 2); ctx.stroke()

  // legs
  const legFreq = 0.2 + speed * 0.08
  const legAmp = state === 'run' ? 7 : 1
  const rl = [
    { bx: -6, phase: 0 }, { bx: -1, phase: Math.PI },
    { bx: 5, phase: Math.PI * 0.5 }, { bx: 9, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of rl) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.4 + 0.8) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 10)
    ctx.quadraticCurveTo(bx + swing * 0.3, 14, bx + swing * 0.5, 17)
    ctx.stroke()
  }

  ctx.restore()
}