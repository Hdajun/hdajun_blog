import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

export function drawHedgehog(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.2) * 1 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body — round
  ctx.beginPath()
  ctx.ellipse(0, 2, 16, 12, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.hedgehogBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // belly
  fillEllipse(ctx, 4, 6, 10, 6, p.hedgehogBelly, 0.3)

  // spines — triangular spikes on the back
  const spineWiggle = state === 'run' ? Math.sin(frame * 0.15) * 1.5 : Math.sin(frame * 0.04) * 0.3
  const spineCount = 9
  setStroke(ctx, p.hedgehogSpine, 1.8)
  for (let i = 0; i < spineCount; i++) {
    const t = i / (spineCount - 1)
    const bx = -12 + t * 18
    const baseY = -8 + Math.sin(t * Math.PI) * 3
    const spineH = 8 + Math.sin(t * Math.PI + frame * 0.05) * 1.5 + spineWiggle * (0.5 - Math.abs(t - 0.5))
    const tipX = bx + 1
    const tipY = baseY - spineH
    ctx.beginPath()
    ctx.moveTo(bx - 2, baseY)
    ctx.lineTo(tipX, tipY)
    ctx.lineTo(bx + 2, baseY)
    ctx.closePath()
    ctx.fillStyle = p.hedgehogSpine
    ctx.globalAlpha = 0.4
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.stroke()
  }

  // head — small, pointed snout
  ctx.beginPath()
  ctx.ellipse(16, -2, 8, 7, 0.15, 0, Math.PI * 2)
  ctx.fillStyle = p.hedgehogBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // snout
  ctx.beginPath()
  ctx.ellipse(22, -1, 4, 3, 0.2, 0, Math.PI * 2)
  ctx.fillStyle = p.hedgehogBelly
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  // nose
  dot(ctx, 25, -1.5, 1.5, '#2A2A2A')

  // eye
  dot(ctx, 18, -4, 2, '#fff')
  dot(ctx, 18.4, -4.3, 1.2, p.line)
  ctx.save(); ctx.globalAlpha = 0.5; dot(ctx, 18.7, -4.7, 0.4, '#fff'); ctx.restore()

  // ear
  const earTwitch = Math.sin(frame * 0.08) * 1
  ctx.beginPath()
  ctx.ellipse(13, -7 + earTwitch, 3, 4, -0.3, 0, Math.PI * 2)
  ctx.fillStyle = p.hedgehogBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()
  fillEllipse(ctx, 13, -7 + earTwitch, 1.8, 2.5, p.hedgehogBelly, 0.3)

  // tail — tiny nub
  ctx.beginPath()
  ctx.arc(-15, 4, 3, 0, Math.PI * 2)
  ctx.fillStyle = p.hedgehogBody
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  // legs — short and stubby
  const legFreq = 0.16 + speed * 0.06
  const legAmp = state === 'run' ? 4 : 0.5
  const legs = [
    { bx: -8, phase: 0 }, { bx: -2, phase: Math.PI },
    { bx: 8, phase: Math.PI * 0.5 }, { bx: 13, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of legs) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.4 + 0.6) + phase) * legAmp : 0
    setStroke(ctx, p.line, 2)
    ctx.beginPath()
    ctx.moveTo(bx, 12)
    ctx.quadraticCurveTo(bx + swing * 0.2, 16, bx + swing * 0.4, 18)
    ctx.stroke()
    // tiny paw
    dot(ctx, bx + swing * 0.4, 18, 1.5, p.line)
  }

  ctx.restore()
}