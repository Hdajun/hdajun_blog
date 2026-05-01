import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawGiraffe(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.12) * 1.5 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 2, 20, 12, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.giraffeBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  fillEllipse(ctx, 0, 6, 14, 6, p.giraffeBelly, 0.25)

  // spots
  const spots = [[-8, 0, 3], [4, -2, 2.5], [-2, 6, 2], [10, 4, 2.5], [-14, -2, 2]]
  for (const [sx, sy, sr] of spots) {
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fillStyle = p.giraffeSpot
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // neck
  setStroke(ctx, p.line, 2)
  ctx.beginPath()
  ctx.moveTo(14, -6); ctx.quadraticCurveTo(18, -20, 16, -36); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(20, -4); ctx.quadraticCurveTo(24, -20, 22, -36); ctx.stroke()
  // neck fill
  ctx.beginPath()
  ctx.moveTo(14, -6); ctx.quadraticCurveTo(18, -20, 16, -36)
  ctx.lineTo(22, -36); ctx.quadraticCurveTo(24, -20, 20, -4)
  ctx.closePath()
  ctx.fillStyle = p.giraffeBody
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  // neck spots
  const neckSpots = [[18, -16, 2], [17, -26, 1.8]]
  for (const [sx, sy, sr] of neckSpots) {
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fillStyle = p.giraffeSpot
    ctx.globalAlpha = 0.3
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // head
  ctx.beginPath()
  ctx.ellipse(19, -42, 7, 5, 0.1, 0, Math.PI * 2)
  ctx.fillStyle = p.giraffeBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // ossicones
  ctx.beginPath(); ctx.moveTo(16, -46); ctx.lineTo(15, -52); ctx.stroke()
  dot(ctx, 15, -52, 1.5, p.line)
  ctx.beginPath(); ctx.moveTo(22, -46); ctx.lineTo(23, -52); ctx.stroke()
  dot(ctx, 23, -52, 1.5, p.line)

  // ear
  ctx.beginPath()
  ctx.ellipse(12, -43, 3, 5, -0.3, 0, Math.PI * 2)
  ctx.stroke()

  // eye
  dot(ctx, 21, -43, 1.5, p.line)

  // tail
  const tw = Math.sin(frame * 0.08) * 4
  ctx.beginPath()
  ctx.moveTo(-20, 0); ctx.quadraticCurveTo(-26, 2 + tw, -24, 8 + tw); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-24, 8 + tw); ctx.lineTo(-26, 12 + tw)
  ctx.moveTo(-24, 8 + tw); ctx.lineTo(-22, 12 + tw)
  ctx.stroke()

  // legs
  const legFreq = 0.14 + speed * 0.05
  const legAmp = state === 'run' ? 9 : 1
  const gl = [
    { bx: -12, phase: 0 }, { bx: -4, phase: Math.PI },
    { bx: 8, phase: Math.PI * 0.5 }, { bx: 16, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of gl) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.3 + 0.6) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 12); ctx.lineTo(bx + swing * 0.3, 28); ctx.stroke()
    dot(ctx, bx + swing * 0.3, 28, 1.5, p.line)
  }

  ctx.restore()
}