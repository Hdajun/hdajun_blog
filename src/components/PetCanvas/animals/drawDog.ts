import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawDog(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.18) * 1.5 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body fill
  ctx.beginPath()
  ctx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.dogBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // belly
  fillEllipse(ctx, 0, 3, 16, 5, p.dogBelly, 0.3)

  // head
  ctx.beginPath()
  ctx.ellipse(22, -4, 10, 9, 0.1, 0, Math.PI * 2)
  ctx.fillStyle = p.dogBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // ear
  const earWag = Math.sin(frame * 0.1) * 2
  ctx.beginPath()
  ctx.ellipse(26, 1 + earWag, 4.5, 9, 0.3, 0, Math.PI * 2)
  ctx.fillStyle = p.dogBody
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // eye
  dot(ctx, 25, -7, 2, p.line)
  ctx.save(); ctx.globalAlpha = 0.6; dot(ctx, 25.7, -7.8, 0.7, '#fff'); ctx.restore()
  dot(ctx, 31, -3, 1.8, p.line)

  // smile
  setStroke(ctx, p.line, 1.3)
  ctx.beginPath()
  ctx.arc(28, -1, 3, 0.1, Math.PI * 0.85)
  ctx.stroke()
  setStroke(ctx, p.line, 2)

  // tail
  const wag = Math.sin(frame * (0.18 + speed * 0.08)) * (0.4 + speed * 0.15)
  ctx.beginPath()
  ctx.moveTo(-22, -3)
  ctx.quadraticCurveTo(-28, -8 + wag * 6, -25, -14 + wag * 4)
  ctx.stroke()

  // legs
  const legFreq = 0.16 + speed * 0.06
  const legAmp = state === 'run' ? 8 : 1
  const legs = [
    { bx: -14, phase: 0 }, { bx: -6, phase: Math.PI },
    { bx: 6, phase: Math.PI * 0.5 }, { bx: 14, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of legs) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.4 + 0.8) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 8)
    ctx.quadraticCurveTo(bx + swing * 0.3, 14, bx + swing * 0.5, 18)
    ctx.stroke()
    dot(ctx, bx + swing * 0.5, 18, 1.3, p.line)
  }

  ctx.restore()
}