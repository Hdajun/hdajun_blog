import type { Animal, Palette } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

/** 停歇中的鸟（树枝/屋顶上） */
export function drawBirdPerched(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame } = a
  const breathe = Math.sin(frame * 0.05) * 0.5

  ctx.save()
  ctx.translate(x, y + breathe)
  ctx.scale(dir, 1)

  // body — round and plump
  ctx.beginPath()
  ctx.ellipse(0, 0, 8, 7, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.birdBody
  ctx.globalAlpha = 0.55
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // belly
  fillEllipse(ctx, 2, 3, 5, 4, p.birdBelly, 0.3)

  // wing — folded against body
  ctx.beginPath()
  ctx.ellipse(-1, 0, 5, 4.5, -0.15, 0, Math.PI * 2)
  ctx.fillStyle = p.birdWing
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()

  // head
  ctx.beginPath()
  ctx.arc(7, -5, 5.5, 0, Math.PI * 2)
  ctx.fillStyle = p.birdBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // eye
  dot(ctx, 9, -6, 1.8, '#fff')
  dot(ctx, 9.4, -6.3, 1.1, p.line)
  ctx.save(); ctx.globalAlpha = 0.5; dot(ctx, 9.7, -6.7, 0.4, '#fff'); ctx.restore()

  // beak — short pointed
  ctx.beginPath()
  ctx.moveTo(12, -5)
  ctx.lineTo(17, -4)
  ctx.lineTo(12, -3)
  ctx.closePath()
  ctx.fillStyle = p.birdBeak
  ctx.globalAlpha = 0.75
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.2)
  ctx.stroke()

  // tail feathers — neat fan
  setStroke(ctx, p.line, 1.5)
  ctx.beginPath()
  ctx.moveTo(-7, -1)
  ctx.lineTo(-13, -4)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-7, 0)
  ctx.lineTo(-14, 0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-7, 1)
  ctx.lineTo(-13, 3)
  ctx.stroke()

  // legs — gripping perch
  setStroke(ctx, p.line, 1.5)
  ctx.beginPath()
  ctx.moveTo(1, 6)
  ctx.lineTo(1, 11)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(5, 6)
  ctx.lineTo(5, 11)
  ctx.stroke()
  // toes
  ctx.beginPath(); ctx.moveTo(-1, 11); ctx.lineTo(3, 11); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(3, 11); ctx.lineTo(7, 11); ctx.stroke()

  ctx.restore()
}

/** 飞行中的鸟 */
export function drawBirdFlying(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame } = a
  const flapPhase = a.birdFlapPhase ?? 0

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 0, 9, 5, -0.08, 0, Math.PI * 2)
  ctx.fillStyle = p.birdBody
  ctx.globalAlpha = 0.55
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // belly
  fillEllipse(ctx, 2, 2, 6, 3, p.birdBelly, 0.25)

  // head
  ctx.beginPath()
  ctx.arc(8, -3, 5, 0, Math.PI * 2)
  ctx.fillStyle = p.birdBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // eye
  dot(ctx, 10, -4, 1.6, '#fff')
  dot(ctx, 10.3, -4.2, 1, p.line)
  ctx.save(); ctx.globalAlpha = 0.4; dot(ctx, 10.6, -4.5, 0.4, '#fff'); ctx.restore()

  // beak
  ctx.beginPath()
  ctx.moveTo(12, -3)
  ctx.lineTo(18, -2)
  ctx.lineTo(12, -1)
  ctx.closePath()
  ctx.fillStyle = p.birdBeak
  ctx.globalAlpha = 0.75
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.2)
  ctx.stroke()

  // wings — flapping
  const wingAngle = Math.sin(flapPhase)
  // top wing
  ctx.save()
  ctx.translate(-2, -4)
  ctx.rotate(-0.6 + wingAngle * 0.9)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(-6, -8, -14, -2)
  ctx.quadraticCurveTo(-8, 0, 0, 0)
  ctx.closePath()
  ctx.fillStyle = p.birdWing
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()
  ctx.restore()

  // bottom wing
  ctx.save()
  ctx.translate(-2, 3)
  ctx.rotate(0.4 - wingAngle * 0.6)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(-5, 6, -12, 2)
  ctx.quadraticCurveTo(-6, 0, 0, 0)
  ctx.closePath()
  ctx.fillStyle = p.birdWing
  ctx.globalAlpha = 0.35
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.3)
  ctx.stroke()
  ctx.restore()

  // tail — spread fan
  ctx.beginPath()
  ctx.moveTo(-8, 0)
  ctx.lineTo(-15, -4)
  ctx.lineTo(-14, 0)
  ctx.lineTo(-15, 3)
  ctx.closePath()
  ctx.fillStyle = p.birdWing
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.3)
  ctx.stroke()

  ctx.restore()
}

/** 地面行走的鸟（仍保留兼容） */
export function drawBirdOnGround(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  drawBirdPerched(ctx, a, p)
}