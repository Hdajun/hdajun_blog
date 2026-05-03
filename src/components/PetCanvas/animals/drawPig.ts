import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawPig(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.16) * 1.5 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body — round and chubby
  ctx.beginPath()
  ctx.ellipse(0, 2, 20, 14, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.pigBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // belly
  fillEllipse(ctx, 2, 6, 12, 7, p.pigBelly, 0.3)

  // head
  ctx.beginPath()
  ctx.arc(18, -4, 12, 0, Math.PI * 2)
  ctx.fillStyle = p.pigBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // ears
  const earWiggle = Math.sin(frame * 0.08) * 1.5
  ctx.beginPath()
  ctx.ellipse(12, -14 + earWiggle, 4, 6, -0.4, 0, Math.PI * 2)
  ctx.fillStyle = p.pigBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()
  // inner ear
  fillEllipse(ctx, 12, -14 + earWiggle, 2.5, 3.5, p.pigSnout, 0.35)

  ctx.beginPath()
  ctx.ellipse(24, -14 - earWiggle, 4, 6, 0.4, 0, Math.PI * 2)
  ctx.fillStyle = p.pigBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()
  fillEllipse(ctx, 24, -14 - earWiggle, 2.5, 3.5, p.pigSnout, 0.35)

  // snout
  ctx.beginPath()
  ctx.ellipse(28, -2, 6, 4.5, 0.1, 0, Math.PI * 2)
  ctx.fillStyle = p.pigSnout
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()

  // nostrils
  dot(ctx, 26, -2.5, 1.2, p.line)
  dot(ctx, 30, -2.5, 1.2, p.line)

  // eyes
  dot(ctx, 15, -6, 2, p.line)
  ctx.save(); ctx.globalAlpha = 0.6; dot(ctx, 15.6, -6.6, 0.7, '#fff'); ctx.restore()
  dot(ctx, 22, -6, 1.5, p.line)

  // smile
  setStroke(ctx, p.line, 1.2)
  ctx.beginPath()
  ctx.arc(25, 1, 2.5, 0.1, Math.PI * 0.7)
  ctx.stroke()
  setStroke(ctx, p.line, 2)

  // curly tail
  const tailWag = Math.sin(frame * (0.15 + speed * 0.08)) * 0.4
  setStroke(ctx, p.line, 1.8)
  ctx.beginPath()
  ctx.moveTo(-20, -2)
  ctx.bezierCurveTo(-24, -6, -28 + tailWag * 4, -10, -24 + tailWag * 3, -14)
  ctx.bezierCurveTo(-20 + tailWag * 2, -16, -22, -8, -20, -2)
  ctx.stroke()

  // legs
  const legFreq = 0.14 + speed * 0.05
  const legAmp = state === 'run' ? 6 : 1
  const legs = [
    { bx: -12, phase: 0 }, { bx: -4, phase: Math.PI },
    { bx: 8, phase: Math.PI * 0.5 }, { bx: 14, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of legs) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.4 + 0.8) + phase) * legAmp : 0
    setStroke(ctx, p.line, 2.2)
    ctx.beginPath()
    ctx.moveTo(bx, 13)
    ctx.quadraticCurveTo(bx + swing * 0.2, 17, bx + swing * 0.4, 20)
    ctx.stroke()
    // hoof
    dot(ctx, bx + swing * 0.4, 20, 1.8, p.line)
  }

  ctx.restore()
}