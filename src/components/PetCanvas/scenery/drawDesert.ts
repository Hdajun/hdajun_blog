// ─── 沙漠场景绘制（可爱质感版） ──────────────────────────────────────────────────────
//
// 设计理念：参考森林场景和沙漠 Icon 的风格
//  - 多层圆润叠加：阴影层、主体层、高光层
//  - 柔和透明度：营造温暖质感
//  - 可爱细节：表情、小花、圆润形状
//  - 统一色调：暖黄、柔和绿、温暖棕

import type { Palette } from '../types'
import { rand } from '../utils'

// ─── 沙漠地面 + 天空 ─────────────────────────────────────────────────────────

/** 绘制沙漠地面渐变 + 天空暖色调（可爱版） */
export function drawDesertGround(ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number) {
  ctx.save()

  // ── 天空：温暖渐变（从顶部淡蓝到地平线暖橘） ──
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY)
  skyGrad.addColorStop(0, 'rgba(254,243,199,0.12)')    // 顶部淡奶油
  skyGrad.addColorStop(0.35, 'rgba(253,224,71,0.18)')  // 中部暖黄
  skyGrad.addColorStop(0.7, 'rgba(251,191,36,0.22)')   // 地平线金黄
  skyGrad.addColorStop(1, 'rgba(253,186,116,0.28)')    // 近地暖橘
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, groundY)

  // ── 可爱云朵（圆润椭圆叠加，参考 Icon 手法） ──
  const drawCloud = (cx: number, cy: number, baseR: number, alpha: number) => {
    ctx.save()
    ctx.globalAlpha = alpha
    // 云朵底层阴影
    ctx.fillStyle = '#FDE68A'
    ctx.beginPath()
    ctx.ellipse(cx, cy + 3, baseR * 1.1, baseR * 0.45, 0, 0, Math.PI * 2)
    ctx.fill()
    // 主体圆润叠加
    const puffs = [
      { dx: 0, dy: 0, r: baseR },
      { dx: -baseR * 0.55, dy: baseR * 0.15, r: baseR * 0.72 },
      { dx: baseR * 0.55, dy: baseR * 0.12, r: baseR * 0.68 },
      { dx: -baseR * 0.25, dy: -baseR * 0.22, r: baseR * 0.6 },
      { dx: baseR * 0.28, dy: -baseR * 0.18, r: baseR * 0.58 },
    ]
    ctx.fillStyle = '#FFFBEB'
    for (const p of puffs) {
      ctx.beginPath()
      ctx.arc(cx + p.dx, cy + p.dy, p.r, 0, Math.PI * 2)
      ctx.fill()
    }
    // 高光
    ctx.globalAlpha = alpha * 0.5
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.ellipse(cx - baseR * 0.2, cy - baseR * 0.25, baseR * 0.35, baseR * 0.2, -0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  drawCloud(w * 0.15, groundY * 0.18, 14, 0.22)
  drawCloud(w * 0.55, groundY * 0.12, 11, 0.18)
  drawCloud(w * 0.82, groundY * 0.22, 9, 0.15)

  // ── 地面：多层沙色渐变（暖黄色调） ──
  const groundGrad = ctx.createLinearGradient(0, groundY - 10, 0, h)
  groundGrad.addColorStop(0, 'rgba(253,230,138,0.55)')   // 顶部亮黄
  groundGrad.addColorStop(0.2, 'rgba(251,191,36,0.38)')  // 金黄
  groundGrad.addColorStop(0.55, 'rgba(217,119,6,0.22)')  // 深橘
  groundGrad.addColorStop(1, 'rgba(180,83,9,0.08)')      // 底部深棕
  ctx.fillStyle = groundGrad
  ctx.fillRect(0, groundY - 10, w, h - groundY + 10)

  // ── 地面高光线（沙地表面反光） ──
  ctx.globalAlpha = 0.18
  ctx.strokeStyle = '#FEF3C7'
  ctx.lineWidth = 1.2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, groundY - 2)
  for (let x = 0; x <= w; x += 6) {
    ctx.lineTo(x, groundY - 2 + Math.sin(x * 0.025) * 1.2)
  }
  ctx.stroke()

  // ── 沙纹：细波浪线（更柔和） ──
  ctx.lineCap = 'round'
  for (let row = 0; row < 6; row++) {
    const y = groundY + 5 + row * 7
    const amp = 1.2 + row * 0.4
    const freq = 0.018 + row * 0.004
    ctx.globalAlpha = 0.05 + row * 0.008
    ctx.strokeStyle = '#D97706'
    ctx.lineWidth = 0.7
    ctx.beginPath()
    for (let x = 0; x < w; x += 3) {
      const yy = y + Math.sin(x * freq + row * 2.1) * amp
      if (x === 0) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }

  // ── 散落小石子（圆润可爱） ──
  const stones = [
    { x: w * 0.08, y: groundY + 4, rx: 3.5, ry: 2 },
    { x: w * 0.22, y: groundY + 7, rx: 2.5, ry: 1.5 },
    { x: w * 0.38, y: groundY + 3, rx: 4, ry: 2.2 },
    { x: w * 0.55, y: groundY + 6, rx: 2.8, ry: 1.6 },
    { x: w * 0.7, y: groundY + 4, rx: 3.2, ry: 1.8 },
    { x: w * 0.85, y: groundY + 5, rx: 2.2, ry: 1.3 },
    { x: w * 0.93, y: groundY + 3, rx: 3, ry: 1.7 },
  ]
  for (const s of stones) {
    // 石子阴影
    ctx.globalAlpha = 0.08
    ctx.fillStyle = '#92400E'
    ctx.beginPath()
    ctx.ellipse(s.x + 1, s.y + 1.5, s.rx, s.ry * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    // 石子主体
    ctx.globalAlpha = 0.22
    ctx.fillStyle = '#D6D3D1'
    ctx.beginPath()
    ctx.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, Math.PI * 2)
    ctx.fill()
    // 石子高光
    ctx.globalAlpha = 0.12
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.ellipse(s.x - s.rx * 0.25, s.y - s.ry * 0.3, s.rx * 0.4, s.ry * 0.35, -0.3, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 小草芽（点缀） ──
  const drawGrass = (gx: number, gy: number, alpha: number) => {
    ctx.globalAlpha = alpha
    ctx.strokeStyle = '#86EFAC'
    ctx.lineWidth = 0.9
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(gx, gy)
    ctx.quadraticCurveTo(gx - 2, gy - 5, gx + 1, gy - 8)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(gx + 3, gy)
    ctx.quadraticCurveTo(gx + 5, gy - 4, gx + 3, gy - 7)
    ctx.stroke()
  }
  drawGrass(w * 0.3, groundY + 2, 0.35)
  drawGrass(w * 0.62, groundY + 1, 0.28)
  drawGrass(w * 0.88, groundY + 2, 0.32)

  ctx.restore()
}

// ─── 仙人掌 ───────────────────────────────────────────────────────────────────

/** 绘制仙人掌（可爱版：圆润球形叠加+可爱表情+小花，完全对齐 Icon 手法） */
export function drawCactus(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  const hasLeftArm = variant % 3 !== 2
  const hasRightArm = variant % 2 === 0
  const hasFlower = variant % 3 !== 1
  const hasFace = variant % 2 === 0

  // 颜色系统（对齐 Icon）
  const greenDark = '#15803D'
  const greenMid = '#16A34A'
  const greenMain = '#22C55E'
  const greenLight = '#4ADE80'
  const greenHighlight = '#BBF7D0'

  // ── 根部阴影椭圆 ──
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#D97706'
  ctx.beginPath()
  ctx.ellipse(0, 2 * s, 11 * s, 2.5 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 左小臂（圆润球形叠加，完全对齐 Icon） ──
  if (hasLeftArm) {
    const armCX = -16 * s
    const armCY = -28 * s
    // 连接部分
    ctx.fillStyle = greenDark
    ctx.beginPath()
    ctx.ellipse(-8 * s, -26 * s, 5 * s, 3 * s, 0, 0, Math.PI * 2)
    ctx.fill()
    // 小臂球体底层（深色）
    ctx.fillStyle = greenDark
    ctx.beginPath()
    ctx.arc(armCX, armCY, 7 * s, 0, Math.PI * 2)
    ctx.fill()
    // 小臂球体中层
    ctx.fillStyle = greenMid
    ctx.beginPath()
    ctx.arc(armCX, armCY - 0.5 * s, 6 * s, 0, Math.PI * 2)
    ctx.fill()
    // 小臂球体亮层
    ctx.fillStyle = greenMain
    ctx.beginPath()
    ctx.arc(armCX, armCY - 1 * s, 5 * s, 0, Math.PI * 2)
    ctx.fill()
    // 小臂高光
    ctx.globalAlpha = 0.5
    ctx.fillStyle = greenHighlight
    ctx.beginPath()
    ctx.arc(armCX - 2 * s, armCY - 2.5 * s, 2.2 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // ── 右小臂（稍高位置，不对称更自然） ──
  if (hasRightArm) {
    const armCX = 16 * s
    const armCY = -34 * s
    // 连接部分
    ctx.fillStyle = greenDark
    ctx.beginPath()
    ctx.ellipse(8 * s, -32 * s, 4.5 * s, 2.8 * s, 0, 0, Math.PI * 2)
    ctx.fill()
    // 小臂球体底层
    ctx.fillStyle = greenDark
    ctx.beginPath()
    ctx.arc(armCX, armCY, 6.5 * s, 0, Math.PI * 2)
    ctx.fill()
    // 小臂球体中层
    ctx.fillStyle = greenMid
    ctx.beginPath()
    ctx.arc(armCX, armCY - 0.5 * s, 5.5 * s, 0, Math.PI * 2)
    ctx.fill()
    // 小臂球体亮层
    ctx.fillStyle = greenMain
    ctx.beginPath()
    ctx.arc(armCX, armCY - 1 * s, 4.5 * s, 0, Math.PI * 2)
    ctx.fill()
    // 小臂高光
    ctx.globalAlpha = 0.5
    ctx.fillStyle = greenHighlight
    ctx.beginPath()
    ctx.arc(armCX - 1.5 * s, armCY - 2 * s, 2 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // ── 主干（圆润球形叠加，完全对齐 Icon 手法） ──
  const bodyH = 48 * s
  const bodyCY = -bodyH * 0.5

  // 身体底层（深绿，最大的椭圆）
  ctx.fillStyle = greenDark
  ctx.beginPath()
  ctx.ellipse(0, bodyCY, 11 * s, bodyH * 0.5 + 2 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // 身体中层
  ctx.fillStyle = greenMid
  ctx.beginPath()
  ctx.ellipse(0, bodyCY - 1 * s, 9.5 * s, bodyH * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()
  // 身体亮层
  ctx.fillStyle = greenMain
  ctx.beginPath()
  ctx.ellipse(0, bodyCY - 2 * s, 8 * s, bodyH * 0.5 - 1 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // 身体高光（左侧弧形光泽）
  ctx.globalAlpha = 0.5
  ctx.fillStyle = greenLight
  ctx.beginPath()
  ctx.ellipse(-3.5 * s, bodyCY - 4 * s, 3.5 * s, bodyH * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()
  // 顶部高光点
  ctx.globalAlpha = 0.6
  ctx.fillStyle = greenHighlight
  ctx.beginPath()
  ctx.arc(-2.5 * s, -bodyH + 6 * s, 3 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 可爱表情 ──
  if (hasFace) {
    const faceY = bodyCY + 4 * s
    // 眼睛（圆润小豆眼）
    ctx.fillStyle = '#14532D'
    ctx.beginPath()
    ctx.arc(-2.5 * s, faceY, 2 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(2.5 * s, faceY, 2 * s, 0, Math.PI * 2)
    ctx.fill()
    // 眼睛高光
    ctx.fillStyle = 'white'
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.arc(-1.8 * s, faceY - 0.8 * s, 0.8 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(3.2 * s, faceY - 0.8 * s, 0.8 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
    // 腮红
    ctx.globalAlpha = 0.35
    ctx.fillStyle = '#FB923C'
    ctx.beginPath()
    ctx.ellipse(-4.5 * s, faceY + 2.5 * s, 2.8 * s, 1.6 * s, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(4.5 * s, faceY + 2.5 * s, 2.8 * s, 1.6 * s, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
    // 微笑嘴巴
    ctx.strokeStyle = '#14532D'
    ctx.lineWidth = 1.5 * s
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-2 * s, faceY + 4 * s)
    ctx.quadraticCurveTo(0, faceY + 6.5 * s, 2 * s, faceY + 4 * s)
    ctx.stroke()
  }

  // ── 头顶小花（粉色，可爱点缀） ──
  if (hasFlower) {
    const fy = -bodyH - 2 * s
    // 花瓣（5 片，圆形叠加）
    ctx.globalAlpha = 0.85
    for (let pi = 0; pi < 5; pi++) {
      const angle = (pi / 5) * Math.PI * 2 - Math.PI / 2
      const px = Math.cos(angle) * 4.5 * s
      const py = fy + Math.sin(angle) * 4.5 * s
      ctx.fillStyle = '#F9A8D4'
      ctx.beginPath()
      ctx.arc(px, py, 3 * s, 0, Math.PI * 2)
      ctx.fill()
    }
    // 花心
    ctx.fillStyle = '#FBBF24'
    ctx.beginPath()
    ctx.arc(0, fy, 2.5 * s, 0, Math.PI * 2)
    ctx.fill()
    // 花心高光
    ctx.globalAlpha = 0.7
    ctx.fillStyle = '#FEF9C3'
    ctx.beginPath()
    ctx.arc(-0.8 * s, fy - 0.8 * s, 1 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // ── 刺（细小，点缀感） ──
  ctx.globalAlpha = 0.45
  ctx.strokeStyle = '#BBF7D0'
  ctx.lineWidth = 0.8 * s
  ctx.lineCap = 'round'
  const spineCount = 4
  for (let si = 0; si < spineCount; si++) {
    const sy = -8 * s - si * 10 * s
    if (sy < -bodyH + 8 * s) break
    ctx.beginPath()
    ctx.moveTo(-8 * s, sy)
    ctx.lineTo(-12 * s, sy - 2.5 * s)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(8 * s, sy + 2 * s)
    ctx.lineTo(12 * s, sy)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  ctx.restore()
}

// ─── 沙漠枯树 ─────────────────────────────────────────────────────────────────

/** 绘制沙漠枯树（可爱版：圆润枝干+柔和色调） */
export function drawDeadTree(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  const trunkH = 42 * s
  const lean = variant % 2 === 0 ? 4 * s : -3 * s

  // 颜色系统（更柔和的棕色）
  const barkDark = '#78350F'
  const barkMain = '#92400E'
  const barkMid = '#B45309'
  const barkLight = '#D97706'

  // ── 根部阴影 ──
  ctx.globalAlpha = 0.12
  ctx.fillStyle = barkDark
  ctx.beginPath()
  ctx.ellipse(0, 2 * s, 10 * s, 3 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 根部隆起（圆润小球） ──
  ctx.globalAlpha = 0.35
  ctx.fillStyle = barkMain
  ctx.beginPath()
  ctx.arc(-4 * s, 1 * s, 3 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(5 * s, 1 * s, 2.5 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 主干（圆润渐变，用多段圆形叠加） ──
  const drawTrunkSegment = (cy: number, r: number, alpha: number) => {
    ctx.globalAlpha = alpha
    // 底层深色
    ctx.fillStyle = barkDark
    ctx.beginPath()
    ctx.arc(lean * (cy / trunkH), cy, r + 0.5 * s, 0, Math.PI * 2)
    ctx.fill()
    // 中层
    ctx.fillStyle = barkMain
    ctx.beginPath()
    ctx.arc(lean * (cy / trunkH) - 0.3 * s, cy - 0.3 * s, r, 0, Math.PI * 2)
    ctx.fill()
    // 高光
    ctx.globalAlpha = alpha * 0.4
    ctx.fillStyle = barkLight
    ctx.beginPath()
    ctx.arc(lean * (cy / trunkH) - r * 0.3, cy - r * 0.25, r * 0.45, 0, Math.PI * 2)
    ctx.fill()
  }

  // 从底部到顶部，逐渐变细
  const segments = 8
  for (let i = 0; i < segments; i++) {
    const t = i / segments
    const cy = -trunkH * t
    const r = (6 - t * 3.5) * s
    const alpha = 0.75 + t * 0.15
    drawTrunkSegment(cy, r, alpha)
  }

  // ── 树皮纹理（柔和横线） ──
  ctx.globalAlpha = 0.18
  ctx.strokeStyle = barkDark
  ctx.lineWidth = 0.8 * s
  ctx.lineCap = 'round'
  for (let i = 1; i <= 5; i++) {
    const ty = -trunkH * (i * 0.17)
    const tx = lean * (i * 0.17)
    ctx.beginPath()
    ctx.moveTo(tx - 3 * s, ty)
    ctx.quadraticCurveTo(tx, ty - 0.8 * s, tx + 3 * s, ty)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // ── 枝条（圆润曲线） ──
  const branches = [
    { sx: lean * 0.45, sy: -trunkH * 0.45, ex: lean * 0.45 - 18 * s, ey: -trunkH * 0.7, w: 2.5 },
    { sx: lean * 0.6, sy: -trunkH * 0.6, ex: lean * 0.6 + 16 * s, ey: -trunkH * 0.82, w: 2 },
    { sx: lean * 0.75, sy: -trunkH * 0.75, ex: lean * 0.75 - 10 * s, ey: -trunkH * 0.92, w: 1.5 },
    { sx: lean * 0.88, sy: -trunkH * 0.88, ex: lean * 0.88 + 8 * s, ey: -trunkH * 1.0, w: 1.2 },
  ]

  ctx.globalAlpha = 0.8
  for (const b of branches) {
    // 粗枝（圆润线条）
    ctx.strokeStyle = barkMid
    ctx.lineWidth = b.w * s
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(b.sx, b.sy)
    ctx.quadraticCurveTo((b.sx + b.ex) * 0.5, (b.sy + b.ey) * 0.5 - 3 * s, b.ex, b.ey)
    ctx.stroke()

    // 细枝（2~3 个）
    ctx.lineWidth = 0.9 * s
    ctx.strokeStyle = barkLight
    ctx.globalAlpha = 0.65

    ctx.beginPath()
    ctx.moveTo(b.ex, b.ey)
    ctx.lineTo(b.ex - 6 * s, b.ey - 5 * s)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(b.ex, b.ey)
    ctx.lineTo(b.ex + 5 * s, b.ey - 7 * s)
    ctx.stroke()

    if (b.w > 2) {
      const mx = (b.sx + b.ex) * 0.5
      const my = (b.sy + b.ey) * 0.5
      ctx.beginPath()
      ctx.moveTo(mx, my)
      ctx.lineTo(mx - 4 * s, my - 4 * s)
      ctx.stroke()
    }

    ctx.globalAlpha = 0.8
  }

  // ── 顶部小细枝 ──
  ctx.lineWidth = 0.7 * s
  ctx.strokeStyle = barkLight
  ctx.globalAlpha = 0.7
  const topX = lean
  const topY = -trunkH
  ctx.beginPath()
  ctx.moveTo(topX, topY)
  ctx.lineTo(topX - 3 * s, topY - 4 * s)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(topX, topY)
  ctx.lineTo(topX + 4 * s, topY - 3 * s)
  ctx.stroke()

  ctx.restore()
}

// ─── 沙丘 ─────────────────────────────────────────────────────────────────────

/** 绘制沙丘（可爱版：圆润曲线+柔和渐变+高光） */
export function drawDune(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number) {
  ctx.save()

  const s = scale
  const w = (120 + variant * 30) * s
  const h = (20 + variant * 5) * s
  const offset = variant % 2 === 0 ? 0.35 : 0.55  // 峰顶偏左或偏右

  // 颜色系统（暖黄色调）
  const duneBase = '#FDE68A'
  const duneMid = '#FCD34D'
  const duneMain = '#FBBF24'
  const duneHighlight = '#FEF3C7'
  const duneShadow = '#F59E0B'

  // ── 背景层（更大更淡，营造层次） ──
  ctx.globalAlpha = 0.15
  ctx.fillStyle = duneBase
  ctx.beginPath()
  ctx.moveTo(x - w * 0.65, groundY + 3)
  ctx.quadraticCurveTo(x - w * offset * 0.7, groundY - h * 0.6, x, groundY - h * 0.5)
  ctx.quadraticCurveTo(x + w * 0.45, groundY - h * 0.15, x + w * 0.65, groundY + 3)
  ctx.closePath()
  ctx.fill()

  // ── 主沙丘（圆润曲线） ──
  ctx.globalAlpha = 0.42
  ctx.fillStyle = duneMain
  ctx.beginPath()
  ctx.moveTo(x - w / 2, groundY + 2)
  ctx.quadraticCurveTo(x - w * offset, groundY - h, x, groundY - h * 0.85)
  ctx.quadraticCurveTo(x + w * (1 - offset), groundY - h * 0.2, x + w / 2, groundY + 2)
  ctx.closePath()
  ctx.fill()

  // ── 峰脊高光（迎光面，圆润叠加） ──
  ctx.globalAlpha = 0.28
  ctx.fillStyle = duneHighlight
  ctx.beginPath()
  ctx.ellipse(
    x - w * offset + w * 0.08,
    groundY - h * 0.88,
    w * 0.18,
    h * 0.22,
    -0.3,
    0,
    Math.PI * 2
  )
  ctx.fill()

  // ── 沙纹线（柔和曲线） ──
  ctx.globalAlpha = 0.12
  ctx.strokeStyle = duneShadow
  ctx.lineWidth = 0.8 * s
  ctx.lineCap = 'round'

  for (let li = 0; li < 3; li++) {
    const ly = groundY - h * (0.2 + li * 0.22)
    const lx1 = x - w * 0.28 + li * w * 0.04
    const lx2 = x + w * 0.22 - li * w * 0.02
    ctx.beginPath()
    ctx.moveTo(lx1, ly)
    ctx.quadraticCurveTo((lx1 + lx2) / 2, ly - 1.2 * s, lx2, ly + 0.3 * s)
    ctx.stroke()
  }

  // ── 背光面暗影（圆润渐变） ──
  ctx.globalAlpha = 0.08
  ctx.fillStyle = duneShadow
  ctx.beginPath()
  ctx.moveTo(x + w * 0.05, groundY - h * 0.75)
  ctx.quadraticCurveTo(x + w * (1 - offset) - w * 0.05, groundY - h * 0.1, x + w / 2, groundY + 2)
  ctx.lineTo(x + w * 0.25, groundY - h * 0.55)
  ctx.closePath()
  ctx.fill()

  // ── 顶部高光点（点缀） ──
  ctx.globalAlpha = 0.18
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.ellipse(
    x - w * offset + w * 0.02,
    groundY - h * 0.92,
    w * 0.08,
    h * 0.12,
    -0.4,
    0,
    Math.PI * 2
  )
  ctx.fill()

  ctx.restore()
}

// ─── 风滚草 ───────────────────────────────────────────────────────────────────

/** 绘制风滚草（可爱版：圆润球形+多层叠加+可爱高光） */
export function drawTumbleweed(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number, frame: number) {
  ctx.save()
  const s = scale
  const r = (10 + variant * 2.5) * s
  const bobY = Math.sin(frame * 0.04 + variant) * 2 * s
  ctx.translate(x, groundY - r + bobY)
  ctx.rotate(frame * 0.025 * (variant % 2 === 0 ? 1 : -1))

  // 颜色系统（暖棕色调）
  const twDark = '#78350F'
  const twMain = '#92400E'
  const twMid = '#B45309'
  const twLight = '#D97706'
  const twHighlight = '#FDE68A'

  // ── 地面阴影 ──
  ctx.globalAlpha = 0.08
  ctx.fillStyle = twDark
  ctx.beginPath()
  ctx.ellipse(0, r + 1.5 * s, r * 0.75, 2 * s, 0, 0, Math.PI * 2)
  ctx.fill()

  // ── 球体底层（深色，最大） ──
  ctx.globalAlpha = 0.55
  ctx.fillStyle = twDark
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()

  // ── 球体中层 ──
  ctx.globalAlpha = 0.5
  ctx.fillStyle = twMain
  ctx.beginPath()
  ctx.arc(-0.5 * s, -0.5 * s, r * 0.88, 0, Math.PI * 2)
  ctx.fill()

  // ── 枝条（圆润曲线，多层） ──
  ctx.lineCap = 'round'

  // 外层粗枝
  ctx.globalAlpha = 0.7
  ctx.strokeStyle = twMid
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + variant * 0.4
    ctx.lineWidth = (0.8 + (i % 2) * 0.3) * s
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82)
    ctx.quadraticCurveTo(
      Math.cos(a + Math.PI / 4) * r * 0.2,
      Math.sin(a + Math.PI / 4) * r * 0.2,
      Math.cos(a + Math.PI) * r * 0.82,
      Math.sin(a + Math.PI) * r * 0.82,
    )
    ctx.stroke()
  }

  // 内层细枝
  ctx.globalAlpha = 0.5
  ctx.strokeStyle = twLight
  ctx.lineWidth = 0.5 * s
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i + 0.6 + variant * 0.2
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55)
    ctx.quadraticCurveTo(
      Math.cos(a + Math.PI / 3) * r * 0.12,
      Math.sin(a + Math.PI / 3) * r * 0.12,
      Math.cos(a + Math.PI / 1.4) * r * 0.48,
      Math.sin(a + Math.PI / 1.4) * r * 0.48,
    )
    ctx.stroke()
  }

  // ── 小叶片碎片（圆润椭圆） ──
  ctx.globalAlpha = 0.4
  ctx.fillStyle = twLight
  for (let i = 0; i < 5; i++) {
    const la = (Math.PI * 2 / 5) * i + variant * 0.5
    const lr = r * (0.3 + (i % 3) * 0.1)
    ctx.beginPath()
    ctx.ellipse(
      Math.cos(la) * lr,
      Math.sin(la) * lr,
      2 * s, 0.8 * s,
      la,
      0, Math.PI * 2
    )
    ctx.fill()
  }

  // ── 球体高光（左上角，圆润光泽） ──
  ctx.globalAlpha = 0.22
  ctx.fillStyle = twHighlight
  ctx.beginPath()
  ctx.arc(-r * 0.28, -r * 0.28, r * 0.32, 0, Math.PI * 2)
  ctx.fill()

  // ── 高光点 ──
  ctx.globalAlpha = 0.35
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(-r * 0.35, -r * 0.35, r * 0.12, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// ─── 布局 ──────────────────────────────────────────────────────────────────────

/** 初始化沙漠场景元素（随机位置数组，供 buildScenery 使用） */
export function getDesertLayout(w: number, _h: number): Array<{ type: string; x: number; scale: number; variant: number }> {
  const items: Array<{ type: string; x: number; scale: number; variant: number }> = []

  // 沙丘（底层，先画）—— 增加数量和层次
  const dunePositions = [w * 0.05, w * 0.28, w * 0.52, w * 0.72, w * 0.92]
  dunePositions.forEach((x, i) => {
    items.push({ type: 'dune', x: x + rand(-15, 15), scale: rand(0.7, 1.25), variant: i })
  })

  // 仙人掌
  const cactusPositions = [w * 0.12, w * 0.4, w * 0.58, w * 0.84]
  cactusPositions.forEach((x, i) => {
    items.push({ type: 'cactus', x: x + rand(-12, 12), scale: rand(0.7, 1.1), variant: i })
  })

  // 枯树
  const deadTreePositions = [w * 0.25, w * 0.68]
  deadTreePositions.forEach((x, i) => {
    items.push({ type: 'deadTree', x: x + rand(-18, 18), scale: rand(0.8, 1.05), variant: i })
  })

  // 风滚草
  const twPositions = [w * 0.18, w * 0.48, w * 0.76, w * 0.92]
  twPositions.forEach((x, i) => {
    items.push({ type: 'tumbleweed', x: x + rand(-10, 10), scale: rand(0.65, 1.0), variant: i })
  })

  return items
}