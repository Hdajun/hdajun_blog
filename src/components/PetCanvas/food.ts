// ─── 食物系统：绘制 + 逻辑 ──────────────────────────────────────────────────

import type { FoodItem } from './types'
import { FOOD_LIFETIME, FOOD_EAT_DIST, FOOD_COLORS } from './constants'
import { setStroke, dot } from './utils'

// ─── 食物绘制 ──────────────────────────────────────────────────────────────────

function drawFish(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, frame: number, p: { line: string }) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)

  const wiggle = Math.sin(frame * 0.08) * 0.1
  ctx.rotate(wiggle)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#60A5FA'
  ctx.globalAlpha = 0.7
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  // tail
  ctx.beginPath()
  ctx.moveTo(-8, 0)
  ctx.lineTo(-14, -5)
  ctx.lineTo(-14, 5)
  ctx.closePath()
  ctx.fillStyle = '#3B82F6'
  ctx.globalAlpha = 0.6
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.2)
  ctx.stroke()

  // eye
  dot(ctx, 4, -1.5, 1.5, p.line)
  ctx.save(); ctx.globalAlpha = 0.6; dot(ctx, 4.5, -2, 0.5, '#fff'); ctx.restore()

  // fin
  setStroke(ctx, '#3B82F6', 1.2)
  ctx.beginPath()
  ctx.moveTo(0, -5)
  ctx.quadraticCurveTo(2, -10, -2, -9)
  ctx.stroke()
  setStroke(ctx, p.line, 1.5)

  // scale lines
  setStroke(ctx, '#93C5FD', 0.8)
  ctx.globalAlpha = 0.5
  ctx.beginPath(); ctx.moveTo(-1, -3); ctx.quadraticCurveTo(0, 0, -1, 3); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(2, -3); ctx.quadraticCurveTo(3, 0, 2, 3); ctx.stroke()
  ctx.globalAlpha = 1

  ctx.restore()
}

function drawBone(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, frame: number, p: { line: string }) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)

  const tilt = Math.sin(frame * 0.05) * 0.08
  ctx.rotate(tilt)

  // main shaft
  ctx.beginPath()
  ctx.moveTo(-8, -2)
  ctx.lineTo(8, -2)
  ctx.lineTo(8, 2)
  ctx.lineTo(-8, 2)
  ctx.closePath()
  ctx.fillStyle = '#F5F5F4'
  ctx.globalAlpha = 0.8
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  // knobs
  ctx.beginPath(); ctx.arc(-8, -3, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#F5F5F4'; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1; setStroke(ctx, p.line, 1.5); ctx.stroke()
  ctx.beginPath(); ctx.arc(-8, 3, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#F5F5F4'; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke()
  ctx.beginPath(); ctx.arc(8, -3, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#F5F5F4'; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke()
  ctx.beginPath(); ctx.arc(8, 3, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#F5F5F4'; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke()

  // shine
  ctx.beginPath()
  ctx.ellipse(-2, -1, 5, 1, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.globalAlpha = 0.3
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.restore()
}

function drawBanana(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, frame: number, p: { line: string }) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)

  const wiggle = Math.sin(frame * 0.06) * 2
  ctx.rotate(0.2)

  // banana body
  ctx.beginPath()
  ctx.moveTo(-8, 4)
  ctx.quadraticCurveTo(-6 + wiggle, -8, 4 + wiggle, -10)
  ctx.quadraticCurveTo(8 + wiggle, -10, 10 + wiggle * 0.5, -6)
  ctx.quadraticCurveTo(6, -4, 2, -2)
  ctx.quadraticCurveTo(-4, 1, -8, 4)
  ctx.closePath()
  ctx.fillStyle = '#FDE047'
  ctx.globalAlpha = 0.8
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  // tip
  ctx.beginPath()
  ctx.arc(10 + wiggle * 0.5, -6, 1.5, 0, Math.PI * 2)
  ctx.fillStyle = '#92400E'
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1

  // stem
  setStroke(ctx, '#A16207', 2)
  ctx.beginPath()
  ctx.moveTo(-8, 4)
  ctx.lineTo(-10, 6)
  ctx.stroke()
  setStroke(ctx, p.line, 1.5)

  // highlight
  ctx.beginPath()
  ctx.moveTo(-3, 1)
  ctx.quadraticCurveTo(wiggle, -6, 5 + wiggle, -7)
  setStroke(ctx, '#FEF08A', 1.5)
  ctx.globalAlpha = 0.5
  ctx.stroke()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)

  ctx.restore()
}

/** 绘制单个食物项（含动画） */
export function drawFoodItem(ctx: CanvasRenderingContext2D, food: FoodItem, frame: number, palette: { line: string }) {
  if (food.eaten) {
    const s = 1 - food.eatAnim
    if (s <= 0) return
    ctx.save()
    ctx.translate(food.x, food.y)
    ctx.scale(s, s)
    ctx.globalAlpha = s
    switch (food.type) {
      case 'fish': drawFish(ctx, 0, 0, 1, frame, palette); break
      case 'bone': drawBone(ctx, 0, 0, 1, frame, palette); break
      case 'banana': drawBanana(ctx, 0, 0, 1, frame, palette); break
    }
    ctx.restore()
    return
  }

  // bob animation
  const bobY = Math.sin(frame * 0.04 + food.x * 0.1) * 2
  const scale = 1 + Math.sin(frame * 0.06 + food.x * 0.05) * 0.05
  const fadeIn = Math.min(1, (FOOD_LIFETIME - food.timer) / 20)
  const fadeOut = food.timer < 60 ? food.timer / 60 : 1

  // glow
  ctx.save()
  ctx.globalAlpha = 0.15 * fadeIn * fadeOut
  ctx.beginPath()
  ctx.arc(food.x, food.y + bobY, 14, 0, Math.PI * 2)
  ctx.fillStyle = FOOD_COLORS[food.type]
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = fadeIn * fadeOut
  switch (food.type) {
    case 'fish': drawFish(ctx, food.x, food.y + bobY, scale, frame, palette); break
    case 'bone': drawBone(ctx, food.x, food.y + bobY, scale, frame, palette); break
    case 'banana': drawBanana(ctx, food.x, food.y + bobY, scale, frame, palette); break
  }
  ctx.restore()

  // particles
  if (food.particles) {
    for (const pt of food.particles) {
      if (pt.life > 0) {
        ctx.save()
        ctx.globalAlpha = pt.life * 0.7
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 2 * pt.life, 0, Math.PI * 2)
        ctx.fillStyle = pt.color
        ctx.fill()
        ctx.restore()
      }
    }
  }
}

/** 绘制食物被吃时的 emoticon（爱心 + 星星） */
export function drawEatEmote(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, frame: number) {
  const t = frame * 0.1
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  // heart
  const hx = Math.sin(t) * 4
  const hy = -20 + Math.sin(t * 1.5) * 3
  ctx.globalAlpha = 0.6
  ctx.fillStyle = '#F87171'
  ctx.beginPath()
  ctx.moveTo(hx, hy)
  ctx.bezierCurveTo(hx - 3, hy - 3, hx - 6, hy + 1, hx, hy + 4)
  ctx.bezierCurveTo(hx + 6, hy + 1, hx + 3, hy - 3, hx, hy)
  ctx.fill()
  // star
  const sx = Math.cos(t * 0.7) * 8
  const sy = -24 + Math.cos(t * 1.2) * 2
  ctx.fillStyle = '#FBBF24'
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const a1 = (i / 5) * Math.PI * 2 - Math.PI / 2
    const a2 = a1 + Math.PI / 5
    ctx.lineTo(sx + Math.cos(a1) * 3, sy + Math.sin(a1) * 3)
    ctx.lineTo(sx + Math.cos(a2) * 1.3, sy + Math.sin(a2) * 1.3)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/** 根据 type 绘制靠近嘴边的食物 */
export function drawFoodNearMouth(
  ctx: CanvasRenderingContext2D,
  type: 'fish' | 'bone' | 'banana',
  x: number, y: number, scale: number, frame: number,
  palette: { line: string }
) {
  switch (type) {
    case 'fish': drawFish(ctx, x, y, scale, frame, palette); break
    case 'bone': drawBone(ctx, x, y, scale, frame, palette); break
    case 'banana': drawBanana(ctx, x, y, scale, frame, palette); break
  }
}