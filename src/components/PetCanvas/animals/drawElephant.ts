import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawElephant(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.14) * 2 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 2, 28, 18, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.elephantBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2.2)
  ctx.stroke()

  fillEllipse(ctx, 0, 6, 18, 10, p.elephantBelly, 0.25)

  // head
  ctx.beginPath()
  ctx.arc(26, -6, 14, 0, Math.PI * 2)
  ctx.fillStyle = p.elephantBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2.2)
  ctx.stroke()

  // ear
  const earFlap = Math.sin(frame * 0.06) * 3
  ctx.beginPath()
  ctx.ellipse(34, -2 + earFlap, 10, 14, 0.2, 0, Math.PI * 2)
  ctx.fillStyle = p.elephantBody
  ctx.globalAlpha = 0.35
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // trunk
  const trunkSwing = Math.sin(frame * 0.08) * 6
  ctx.beginPath()
  ctx.moveTo(36, 0)
  ctx.bezierCurveTo(40, 8, 38 + trunkSwing, 18, 32 + trunkSwing * 0.5, 22)
  ctx.bezierCurveTo(28 + trunkSwing * 0.3, 24, 26 + trunkSwing * 0.2, 20, 28, 16)
  ctx.stroke()

  // eye
  dot(ctx, 28, -9, 2, p.line)
  ctx.save(); ctx.globalAlpha = 0.5; dot(ctx, 28.7, -9.8, 0.7, '#fff'); ctx.restore()

  // tusk
  setStroke(ctx, p.line, 1.5)
  ctx.beginPath()
  ctx.moveTo(32, 0)
  ctx.quadraticCurveTo(36, 6, 34, 12)
  ctx.stroke()
  setStroke(ctx, p.line, 2.2)

  // tail
  const tw = Math.sin(frame * 0.1) * 4
  ctx.beginPath()
  ctx.moveTo(-28, 0); ctx.quadraticCurveTo(-34, -4 + tw, -32, -10 + tw); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-32, -10 + tw); ctx.lineTo(-34, -14 + tw)
  ctx.moveTo(-32, -10 + tw); ctx.lineTo(-30, -14 + tw)
  ctx.stroke()

  // legs
  const legFreq = 0.12 + speed * 0.04
  const legAmp = state === 'run' ? 7 : 1
  const el = [
    { bx: -16, phase: 0 }, { bx: -6, phase: Math.PI },
    { bx: 10, phase: Math.PI * 0.5 }, { bx: 20, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of el) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.3 + 0.6) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx - 3, 18); ctx.lineTo(bx - 3 + swing * 0.3, 28)
    ctx.moveTo(bx + 3, 18); ctx.lineTo(bx + 3 + swing * 0.3, 28)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(bx + swing * 0.3, 28, 4, 2, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}