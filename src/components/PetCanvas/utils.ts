// ─── PetCanvas 辅助绘图工具 ────────────────────────────────────────────────────

import type { Palette } from './types'
import { PALETTE_LIGHT, PALETTE_DARK } from './constants'

export function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
export function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
export function rand(a: number, b: number) { return a + Math.random() * (b - a) }

export function setStroke(ctx: CanvasRenderingContext2D, color: string, lw = 2) {
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

export function fillEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

export function getPalette(): Palette {
  return document.documentElement.classList.contains('dark') ? PALETTE_DARK : PALETTE_LIGHT
}