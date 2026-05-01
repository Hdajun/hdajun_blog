// ─── 场景绘制：石头 ────────────────────────────────────────────────────────────

import type { Palette } from '../types'
import { setStroke } from '../utils'

export function drawRock(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, variant: number, p: Palette) {
  ctx.save()
  ctx.translate(x, groundY)
  ctx.scale(s, s)

  if (variant % 4 === 0) {
    // round boulder
    ctx.beginPath()
    ctx.moveTo(-12, 0)
    ctx.quadraticCurveTo(-14, -8, -8, -14)
    ctx.quadraticCurveTo(-2, -18, 4, -16)
    ctx.quadraticCurveTo(10, -14, 12, -8)
    ctx.quadraticCurveTo(13, -2, 10, 2)
    ctx.quadraticCurveTo(4, 4, -4, 3)
    ctx.quadraticCurveTo(-10, 2, -12, 0)
    ctx.closePath()
    ctx.fillStyle = p.rock
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.5)
    ctx.stroke()
    // highlight
    ctx.beginPath()
    ctx.ellipse(-2, -10, 5, 3, -0.3, 0, Math.PI * 2)
    ctx.fillStyle = p.rockLight
    ctx.globalAlpha = 0.3
    ctx.fill()
    ctx.globalAlpha = 1
  } else if (variant % 4 === 1) {
    // tall thin rock
    ctx.beginPath()
    ctx.moveTo(-5, 0)
    ctx.quadraticCurveTo(-7, -8, -4, -18)
    ctx.quadraticCurveTo(-1, -22, 3, -20)
    ctx.quadraticCurveTo(6, -16, 5, -8)
    ctx.quadraticCurveTo(5, -2, 4, 1)
    ctx.closePath()
    ctx.fillStyle = p.rock
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.5)
    ctx.stroke()
    // crack
    setStroke(ctx, p.rockDark, 0.8)
    ctx.globalAlpha = 0.4
    ctx.beginPath()
    ctx.moveTo(0, -16)
    ctx.quadraticCurveTo(1, -10, -1, -4)
    ctx.stroke()
    ctx.globalAlpha = 1
  } else if (variant % 4 === 2) {
    // flat wide rock
    ctx.beginPath()
    ctx.moveTo(-16, 0)
    ctx.quadraticCurveTo(-18, -5, -12, -8)
    ctx.quadraticCurveTo(-4, -10, 4, -9)
    ctx.quadraticCurveTo(12, -8, 16, -4)
    ctx.quadraticCurveTo(17, 0, 14, 2)
    ctx.quadraticCurveTo(6, 3, -4, 3)
    ctx.quadraticCurveTo(-12, 2, -16, 0)
    ctx.closePath()
    ctx.fillStyle = p.rock
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.5)
    ctx.stroke()
    // top highlight
    ctx.beginPath()
    ctx.ellipse(0, -6, 8, 2.5, 0, 0, Math.PI * 2)
    ctx.fillStyle = p.rockLight
    ctx.globalAlpha = 0.25
    ctx.fill()
    ctx.globalAlpha = 1
  } else {
    // two small rocks clustered
    ctx.beginPath()
    ctx.moveTo(-8, 0)
    ctx.quadraticCurveTo(-9, -6, -5, -9)
    ctx.quadraticCurveTo(-1, -11, 3, -8)
    ctx.quadraticCurveTo(5, -4, 4, 0)
    ctx.closePath()
    ctx.fillStyle = p.rock
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.3)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(6, 0)
    ctx.quadraticCurveTo(5, -4, 8, -7)
    ctx.quadraticCurveTo(12, -9, 14, -5)
    ctx.quadraticCurveTo(14, -1, 12, 1)
    ctx.closePath()
    ctx.fillStyle = p.rock
    ctx.globalAlpha = 0.3
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.3)
    ctx.stroke()
  }

  ctx.restore()
}