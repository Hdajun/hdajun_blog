import type { Animal, Palette, TreeInfo } from '../types'
import { setStroke, dot, fillEllipse } from '../utils'

/** 地面上行走的猴子（侧视图），坐标系与其他地面动物一致：(0,0)=脚踩地，-y 为上 */
export function drawMonkeyOnGround(ctx: CanvasRenderingContext2D, a: Animal, p: Palette) {
  const { x, y, dir, frame, state } = a
  const isRun = state === 'run'
  const isEat = state === 'eat'
  const bob = isRun ? Math.sin(frame * 0.2) * 1.2 : 0
  const legSwing = isRun ? Math.sin(frame * 0.22) * 9 : 0
  const armSwing = isRun ? Math.sin(frame * 0.22 + Math.PI) * 7 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // tail (drawn first, behind body)
  const tailOsc = Math.sin(frame * 0.09) * 6
  setStroke(ctx, p.line, 1.5)
  ctx.beginPath()
  ctx.moveTo(-6, -4)
  ctx.bezierCurveTo(-16, -2, -20 + tailOsc * 0.5, -14, -13, -20)
  ctx.bezierCurveTo(-8, -26, -2, -20, -6, -13)
  ctx.stroke()

  // body
  ctx.beginPath()
  ctx.ellipse(0, -12, 8, 11, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.monkeyBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()

  // belly
  fillEllipse(ctx, 3, -11, 5, 7, p.monkeyBelly, 0.25)

  // legs
  setStroke(ctx, p.line, 1.8)
  ctx.beginPath()
  ctx.moveTo(-3, -2)
  ctx.quadraticCurveTo(-5, 3, -5 + legSwing * 0.8, 8)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(3, -2)
  ctx.quadraticCurveTo(5, 3, 5 - legSwing * 0.8, 8)
  ctx.stroke()

  // arms
  if (isEat) {
    ctx.beginPath()
    ctx.moveTo(-5, -18)
    ctx.quadraticCurveTo(-10, -16, -12, -10)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(5, -18)
    ctx.quadraticCurveTo(14, -20, 16, -26)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(-5, -18)
    ctx.quadraticCurveTo(-12, -14, -14 + armSwing, -8)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(5, -18)
    ctx.quadraticCurveTo(12, -14, 14 - armSwing, -8)
    ctx.stroke()
  }

  // head (slightly forward-facing, shifted +x for side view)
  ctx.beginPath()
  ctx.arc(5, -28, 10, 0, Math.PI * 2)
  ctx.fillStyle = p.monkeyBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()

  // face patch
  ctx.beginPath()
  ctx.ellipse(7, -27, 6.5, 7, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.monkeyFace
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.2)
  ctx.stroke()
  setStroke(ctx, p.line, 1.8)

  // ears
  ctx.beginPath(); ctx.arc(-5, -30, 4.5, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(15, -30, 4.5, 0, Math.PI * 2); ctx.stroke()

  // eyes
  dot(ctx, 3, -30, 1.6, p.line); dot(ctx, 9, -30, 1.6, p.line)
  ctx.save(); ctx.globalAlpha = 0.5
  dot(ctx, 3.7, -30.7, 0.5, '#fff'); dot(ctx, 9.7, -30.7, 0.5, '#fff')
  ctx.restore()

  // nose & mouth
  dot(ctx, 5, -25, 0.7, p.line); dot(ctx, 8, -25, 0.7, p.line)
  setStroke(ctx, p.line, 1)
  ctx.beginPath(); ctx.arc(6.5, -23, 2.5, 0.15, Math.PI - 0.15); ctx.stroke()

  ctx.restore()
}

export function drawMonkeyOnBranch(ctx: CanvasRenderingContext2D, a: Animal, treeInfo: TreeInfo, p: Palette) {
  const { frame } = a
  const pose = a.monkeyPose ?? 'hang'
  const { x, groundY, scale: s, branchY, branchDir } = treeInfo

  // bodyScale: 让猴子身体视觉大小始终等于 a.scale，与地面保持一致
  const bodyScale = (a.scale ?? 1) / s

  ctx.save()
  ctx.translate(x, groundY)
  ctx.scale(s, s)

  const branchEndX = branchDir * 34

  if (pose === 'hang') {
    const swing = Math.sin(frame * 0.06) * 8
    // 向下偏移补偿手臂缩短后与树枝的距离差，使抓握点仍贴近树枝
    ctx.translate(branchEndX + swing, branchY + 2 + 10 * (1 - bodyScale))
    ctx.scale(bodyScale, bodyScale)

    // arms reaching up
    setStroke(ctx, p.line, 2)
    ctx.beginPath()
    ctx.moveTo(-5, -4); ctx.quadraticCurveTo(-6, -8, 0, -10); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(5, -4); ctx.quadraticCurveTo(6, -8, 0, -10); ctx.stroke()

    // head
    ctx.beginPath()
    ctx.arc(0, 6, 10, 0, Math.PI * 2)
    ctx.fillStyle = p.monkeyBody
    ctx.globalAlpha = 0.45
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 2)
    ctx.stroke()

    // face
    ctx.beginPath()
    ctx.ellipse(0, 7, 6.5, 7, 0, 0, Math.PI * 2)
    ctx.fillStyle = p.monkeyFace
    ctx.globalAlpha = 0.4
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.3)
    ctx.stroke()
    setStroke(ctx, p.line, 2)

    // ears
    ctx.beginPath(); ctx.arc(-10, 5, 5, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(10, 5, 5, 0, Math.PI * 2); ctx.stroke()

    // eyes
    dot(ctx, -3, 4, 1.8, p.line); dot(ctx, 3, 4, 1.8, p.line)
    ctx.save(); ctx.globalAlpha = 0.5
    dot(ctx, -2.3, 3.3, 0.6, '#fff'); dot(ctx, 3.7, 3.3, 0.6, '#fff')
    ctx.restore()

    // nose & mouth
    dot(ctx, -1, 8, 0.8, p.line); dot(ctx, 1, 8, 0.8, p.line)
    setStroke(ctx, p.line, 1.2)
    ctx.beginPath(); ctx.arc(0, 10, 3, 0.15, Math.PI - 0.15); ctx.stroke()
    setStroke(ctx, p.line, 2)

    // body
    ctx.beginPath()
    ctx.ellipse(0, 22, 8, 12, 0, 0, Math.PI * 2)
    ctx.fillStyle = p.monkeyBody
    ctx.globalAlpha = 0.45
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 2)
    ctx.stroke()

    fillEllipse(ctx, 0, 23, 5, 8, p.monkeyBelly, 0.25)

    // legs
    const legSwing = Math.sin(frame * 0.07) * 5
    ctx.beginPath()
    ctx.moveTo(-5, 32); ctx.quadraticCurveTo(-7, 38, -8 + legSwing, 44); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(5, 32); ctx.quadraticCurveTo(7, 38, 8 - legSwing, 44); ctx.stroke()

    // tail
    const tailOsc = Math.sin(frame * 0.1) * 4
    ctx.beginPath()
    ctx.moveTo(-4, 30)
    ctx.bezierCurveTo(-14, 34, -18 + tailOsc, 42, -10, 46)
    ctx.bezierCurveTo(-6, 48, -2, 46, -4, 42)
    ctx.stroke()
  } else {
    // sit on branch：向上偏移补偿，保持猴子底部贴近树枝
    ctx.translate(branchEndX, branchY - 18 * bodyScale)
    ctx.scale(bodyScale, bodyScale)

    // sitting body
    ctx.beginPath()
    ctx.ellipse(0, 6, 10, 10, 0, 0, Math.PI * 2)
    ctx.fillStyle = p.monkeyBody
    ctx.globalAlpha = 0.45
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 2)
    ctx.stroke()

    fillEllipse(ctx, 0, 8, 6, 6, p.monkeyBelly, 0.25)

    // head
    ctx.beginPath()
    ctx.arc(0, -10, 10, 0, Math.PI * 2)
    ctx.fillStyle = p.monkeyBody
    ctx.globalAlpha = 0.45
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 2)
    ctx.stroke()

    // face
    ctx.beginPath()
    ctx.ellipse(0, -9, 6.5, 7, 0, 0, Math.PI * 2)
    ctx.fillStyle = p.monkeyFace
    ctx.globalAlpha = 0.4
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.3)
    ctx.stroke()
    setStroke(ctx, p.line, 2)

    // ears
    ctx.beginPath(); ctx.arc(-10, -11, 5, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(10, -11, 5, 0, Math.PI * 2); ctx.stroke()

    // eyes
    dot(ctx, -3, -12, 1.8, p.line); dot(ctx, 3, -12, 1.8, p.line)
    ctx.save(); ctx.globalAlpha = 0.5
    dot(ctx, -2.3, -12.7, 0.6, '#fff'); dot(ctx, 3.7, -12.7, 0.6, '#fff')
    ctx.restore()

    // nose & mouth
    dot(ctx, -1, -8, 0.8, p.line); dot(ctx, 1, -8, 0.8, p.line)
    setStroke(ctx, p.line, 1.2)
    ctx.beginPath(); ctx.arc(0, -6, 3, 0.15, Math.PI - 0.15); ctx.stroke()
    setStroke(ctx, p.line, 2)

    // arms resting
    ctx.beginPath()
    ctx.moveTo(-8, 2); ctx.quadraticCurveTo(-14, 8, -16, 14); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(8, 2); ctx.quadraticCurveTo(14, 8, 16, 14); ctx.stroke()

    // legs dangling
    const legSwing = Math.sin(frame * 0.04) * 3
    ctx.beginPath()
    ctx.moveTo(-5, 14); ctx.quadraticCurveTo(-6, 20, -7 + legSwing, 26); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(5, 14); ctx.quadraticCurveTo(6, 20, 7 - legSwing, 26); ctx.stroke()

    // tail hanging
    const tailOsc = Math.sin(frame * 0.06) * 3
    ctx.beginPath()
    ctx.moveTo(-6, 12)
    ctx.bezierCurveTo(-14, 16, -18 + tailOsc, 26, -12, 32)
    ctx.bezierCurveTo(-8, 36, -4, 34, -6, 28)
    ctx.stroke()
  }

  ctx.restore()
}