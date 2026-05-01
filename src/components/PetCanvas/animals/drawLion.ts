import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawLion(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.14) * 2 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 2, 22, 13, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.lionBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2.2)
  ctx.stroke()

  fillEllipse(ctx, 0, 6, 15, 6, p.lionBelly, 0.25)

  // tail
  const tw = Math.sin(frame * 0.1) * 8
  ctx.beginPath()
  ctx.moveTo(-22, -2)
  ctx.bezierCurveTo(-28, 4, -34 + tw * 0.3, 14, -28 + tw * 0.5, 20)
  ctx.stroke()
  // tail tuft
  ctx.beginPath()
  ctx.arc(-28 + tw * 0.5, 20, 4, 0, Math.PI * 2)
  ctx.fillStyle = p.lionMane
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  // mane — fluffy circle behind head
  const maneCx = 22
  const maneCy = -4
  const maneR = 16
  const manePuffs = 8
  for (let i = 0; i < manePuffs; i++) {
    const angle = (i / manePuffs) * Math.PI * 2
    const px = maneCx + Math.cos(angle) * (maneR - 3)
    const py = maneCy + Math.sin(angle) * (maneR - 3)
    ctx.beginPath()
    ctx.arc(px, py, 8, 0, Math.PI * 2)
    ctx.fillStyle = p.lionMane
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
  }
  // mane outline
  ctx.beginPath()
  ctx.arc(maneCx, maneCy, maneR, 0, Math.PI * 2)
  ctx.fillStyle = p.lionMane
  ctx.globalAlpha = 0.3
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  // head (on top of mane)
  ctx.beginPath()
  ctx.arc(22, -4, 10, 0, Math.PI * 2)
  ctx.fillStyle = p.lionBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // ears
  ctx.beginPath()
  ctx.arc(16, -12, 3.5, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(28, -12, 3.5, 0, Math.PI * 2)
  ctx.stroke()

  // eyes
  dot(ctx, 19, -6, 2, p.line)
  dot(ctx, 25, -6, 2, p.line)
  ctx.save(); ctx.globalAlpha = 0.5
  dot(ctx, 19.6, -6.6, 0.6, '#fff'); dot(ctx, 25.6, -6.6, 0.6, '#fff')
  ctx.restore()

  // nose
  ctx.beginPath()
  ctx.moveTo(22, -2); ctx.lineTo(20.5, -0.5); ctx.lineTo(23.5, -0.5)
  ctx.closePath(); ctx.fillStyle = p.line; ctx.fill()

  // mouth
  setStroke(ctx, p.line, 1.2)
  ctx.beginPath(); ctx.moveTo(22, -0.5); ctx.lineTo(22, 1.5); ctx.stroke()
  ctx.beginPath(); ctx.arc(20, 1.5, 2, -0.2, Math.PI * 0.6); ctx.stroke()
  ctx.beginPath(); ctx.arc(24, 1.5, 2, Math.PI * 0.4, Math.PI + 0.2); ctx.stroke()
  setStroke(ctx, p.line, 2.2)

  // legs
  const legFreq = 0.13 + speed * 0.05
  const legAmp = state === 'run' ? 7 : 1
  const ll = [
    { bx: -14, phase: 0 }, { bx: -5, phase: Math.PI },
    { bx: 7, phase: Math.PI * 0.5 }, { bx: 16, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of ll) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.3 + 0.6) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 13)
    ctx.lineTo(bx + swing * 0.3, 24)
    ctx.stroke()
    dot(ctx, bx + swing * 0.3, 24, 1.5, p.line)
  }

  ctx.restore()
}