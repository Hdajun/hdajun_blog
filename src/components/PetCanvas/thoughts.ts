// ─── 气泡系统 ──────────────────────────────────────────────────────────────────

import { THOUGHT_DURATION, THOUGHTS, THOUGHTS_SAD, THOUGHTS_HAPPY, THOUGHTS_NIGHT } from './constants'
import type { Animal } from './types'

/** 根据心情选择气泡文本池 */
function getThoughtPool(mood: number, isNight: boolean): string[] {
  if (isNight) return THOUGHTS_NIGHT
  if (mood >= 70) return THOUGHTS_HAPPY
  if (mood <= 30) return THOUGHTS_SAD
  return THOUGHTS
}

/** 随机选取一条气泡文本，如果有名字则带前缀 */
export function pickThought(mood: number, isNight: boolean, name?: string): string {
  const pool = getThoughtPool(mood, isNight)
  const text = pool[Math.floor(Math.random() * pool.length)]
  if (name) return `${name}：${text}`
  return text
}

/** 更新气泡计时器 */
export function updateThought(animal: Animal, isNight: boolean, allAnimals: Animal[]) {
  if (animal.thoughtTimer !== undefined && animal.thoughtTimer > 0) {
    animal.thoughtTimer--
    if (animal.thoughtTimer === 0) {
      animal.thoughtText = undefined
      animal.thoughtTimer = undefined
    }
  }
  if (!animal.thoughtText && animal.thoughtTimer === undefined && Math.random() < 0.002) {
    const activeCount = allAnimals.filter(o => o.thoughtText).length
    if (activeCount < 2) {
      animal.thoughtText = pickThought(animal.mood, isNight, animal.name)
      animal.thoughtTimer = THOUGHT_DURATION
    }
  }
  if (animal.thoughtText === undefined && animal.thoughtTimer === undefined && Math.random() < 0.001) {
    animal.thoughtTimer = -(THOUGHT_DURATION as number)  // cooldown (negative = waiting)
  }
  if (animal.thoughtTimer !== undefined && animal.thoughtTimer < 0) {
    animal.thoughtTimer++
  }
}

/** 绘制气泡 */
export function drawThoughtBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, progress: number, scale: number) {
  const fadeIn = Math.min(progress / 15, 1)
  const fadeOut = progress > THOUGHT_DURATION - 40 ? (THOUGHT_DURATION - progress) / 40 : 1
  const alpha = Math.min(fadeIn, fadeOut)
  if (alpha <= 0) return

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  ctx.scale(scale, scale)

  const fontSize = 11
  ctx.font = `${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`
  const metrics = ctx.measureText(text)
  const tw = metrics.width
  const padX = 10
  const padY = 7
  const bw = tw + padX * 2
  const bh = fontSize + padY * 2
  const bx = -bw / 2
  const by = -bh - 8

  const dark = document.documentElement.classList.contains('dark')
  ctx.fillStyle = dark ? 'rgba(55,65,81,0.92)' : 'rgba(255,255,255,0.95)'
  ctx.strokeStyle = dark ? '#6b7280' : '#d1d5db'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  const r = 8
  ctx.moveTo(bx + r, by)
  ctx.lineTo(bx + bw - r, by)
  ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r)
  ctx.lineTo(bx + bw, by + bh - r)
  ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh)
  ctx.lineTo(bx + r, by + bh)
  ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r)
  ctx.lineTo(bx, by + r)
  ctx.quadraticCurveTo(bx, by, bx + r, by)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // tail dots
  ctx.fillStyle = dark ? 'rgba(55,65,81,0.92)' : 'rgba(255,255,255,0.95)'
  ctx.beginPath(); ctx.arc(-4, by + bh + 3, 3, 0, Math.PI * 2); ctx.fill()
  if (!dark) { ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 1; ctx.stroke() }
  ctx.beginPath(); ctx.arc(-1, by + bh + 7, 2, 0, Math.PI * 2); ctx.fill()
  if (!dark) { ctx.stroke() }

  // text
  ctx.fillStyle = dark ? '#e5e7eb' : '#374151'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, by + bh / 2)

  ctx.restore()
}

/** 绘制 "look around" 动画（三点省略号） */
export function drawLookEmote(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1, scale: number, frame: number, lookTimer: number) {
  const LOOK_DURATION = 40
  const progress = lookTimer / LOOK_DURATION
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.globalAlpha = Math.min(1, progress * 3) * 0.6
  const bobX = Math.sin(frame * 0.08) * 2 * dir
  for (let i = 0; i < 3; i++) {
    const dotAlpha = Math.sin(frame * 0.1 + i * 0.8) * 0.3 + 0.7
    ctx.globalAlpha = dotAlpha * Math.min(1, progress * 3) * 0.5
    ctx.beginPath()
    ctx.arc(6 * dir + bobX + i * 3 * dir, -12 - i * 2, 1.2, 0, Math.PI * 2)
    ctx.fillStyle = '#9CA3AF'
    ctx.fill()
  }
  ctx.restore()
}