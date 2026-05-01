// ─── 场景绘制：草 & 花 ────────────────────────────────────────────────────────

import type { Palette } from '../types'
import { setStroke, dot } from '../utils'

export function drawGrass(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, variant: number, frame: number, p: Palette) {
  ctx.save()
  ctx.translate(x, groundY)
  ctx.scale(s, s)

  const blades = variant % 3 === 0 ? 5 : variant % 3 === 1 ? 4 : 6
  for (let i = 0; i < blades; i++) {
    const bx = (i - blades / 2) * 4
    const h = 9 + Math.sin(i * 1.5) * 4
    const sway = Math.sin(i * 0.8 + variant + frame * 0.008) * 3

    ctx.beginPath()
    ctx.moveTo(bx - 1, 0)
    ctx.quadraticCurveTo(bx + sway * 0.5 - 1, -h * 0.6, bx + sway, -h)
    ctx.quadraticCurveTo(bx + sway * 0.5 + 1, -h * 0.6, bx + 1, 0)
    ctx.closePath()
    ctx.fillStyle = i % 2 === 0 ? p.grass : p.grassDark
    ctx.globalAlpha = 0.5
    ctx.fill()
    ctx.globalAlpha = 1

    setStroke(ctx, p.line, 1.2)
    ctx.beginPath()
    ctx.moveTo(bx, 0)
    ctx.quadraticCurveTo(bx + sway * 0.5, -h * 0.6, bx + sway, -h)
    ctx.stroke()
  }

  ctx.restore()
}

export function drawFlower(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, variant: number, frame: number, p: Palette) {
  ctx.save()
  ctx.translate(x, groundY)
  ctx.scale(s, s)

  const stemSway = Math.sin(frame * 0.01 + variant) * 1.5
  setStroke(ctx, p.grass, 1.5)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(stemSway, -8, stemSway * 0.5, -16)
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(stemSway * 0.3 - 3, -6, 3, 1.5, -0.5, 0, Math.PI * 2)
  ctx.fillStyle = p.grass
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1

  const petalColor = p.flowerPetals[variant % p.flowerPetals.length]
  const petalCount = variant % 2 === 0 ? 5 : 4
  const cx = stemSway * 0.5
  const cy = -16
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2
    const px = cx + Math.cos(angle) * 4
    const py = cy + Math.sin(angle) * 4
    ctx.beginPath()
    ctx.ellipse(px, py, 3.5, 2.5, angle, 0, Math.PI * 2)
    ctx.fillStyle = petalColor
    ctx.globalAlpha = 0.6
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1)
    ctx.stroke()
  }

  dot(ctx, cx, cy, 2, p.flowerCenter)

  ctx.restore()
}