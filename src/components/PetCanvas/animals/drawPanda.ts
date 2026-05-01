import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawPanda(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.15) * 1.5 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body — white
  ctx.beginPath()
  ctx.ellipse(0, 2, 18, 14, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  fillEllipse(ctx, 0, 6, 12, 7, p.pandaBelly, 0.25)

  // head — white circle
  ctx.beginPath()
  ctx.arc(16, -4, 13, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // black ears
  ctx.beginPath()
  ctx.arc(8, -14, 5, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.6
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(24, -14, 5, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.6
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.stroke()

  // black eye patches
  ctx.beginPath()
  ctx.ellipse(11, -6, 5, 4.5, -0.2, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.ellipse(21, -6, 5, 4.5, 0.2, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1

  // eyes — white dots in black patches
  dot(ctx, 12, -6, 2.2, '#fff')
  dot(ctx, 22, -6, 2.2, '#fff')
  dot(ctx, 12.6, -6.6, 0.8, p.pandaBlack)
  dot(ctx, 22.6, -6.6, 0.8, p.pandaBlack)

  // nose
  ctx.beginPath()
  ctx.ellipse(16.5, -1, 2.5, 1.8, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.6
  ctx.fill()
  ctx.globalAlpha = 1

  // mouth
  setStroke(ctx, p.line, 1.2)
  ctx.beginPath(); ctx.moveTo(16.5, 0); ctx.lineTo(16.5, 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(14.5, 2, 2, -0.2, Math.PI * 0.5); ctx.stroke()
  ctx.beginPath(); ctx.arc(18.5, 2, 2, Math.PI * 0.5, Math.PI + 0.2); ctx.stroke()
  setStroke(ctx, p.line, 2)

  // arms — black
  const armSwing = state === 'run' ? Math.sin(frame * 0.15) * 4 : 0
  ctx.beginPath()
  ctx.ellipse(-14, 4 + armSwing, 5, 8, 0.3, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(10, 4 - armSwing, 5, 8, -0.3, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.stroke()
  setStroke(ctx, p.line, 2)

  // legs — black
  const legFreq = 0.13 + speed * 0.05
  const legAmp = state === 'run' ? 6 : 1
  const pl = [
    { bx: -10, phase: 0 }, { bx: -2, phase: Math.PI },
    { bx: 6, phase: Math.PI * 0.5 }, { bx: 12, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of pl) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.3 + 0.6) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.ellipse(bx + swing * 0.3, 16, 5, 6, 0, 0, Math.PI * 2)
    ctx.fillStyle = p.pandaBlack
    ctx.globalAlpha = 0.4
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.8)
    ctx.stroke()
  }

  // tail
  ctx.beginPath()
  ctx.arc(-18, 0, 4, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBody
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  ctx.restore()
}