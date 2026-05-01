// ─── 花园场景绘制（可爱质感版） ──────────────────────────────────────────────────
//
// 设计理念：春日花园，充满生机
//  - 多层草地渐变：嫩绿→翠绿
//  - 可爱蝴蝶飞舞
//  - 小草芽点缀
//  - 圆润球形叠加花朵
//  - 蘑菇、灌木丛等新元素

import type { Palette } from '../types'
import { rand } from '../utils'

/** 绘制花园地面 + 天空（可爱版） */
export function drawGardenGround(ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number) {
  ctx.save()

  // ── 天空：清新蓝绿渐变 ──
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY)
  skyGrad.addColorStop(0, 'rgba(224,242,254,0.15)')    // 顶部淡蓝
  skyGrad.addColorStop(0.5, 'rgba(186,230,253,0.12)')  // 中部天蓝
  skyGrad.addColorStop(1, 'rgba(167,243,208,0.08)')    // 近地嫩绿
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, groundY)

  // ── 地面：多层草地渐变 ──
  const groundGrad = ctx.createLinearGradient(0, groundY - 8, 0, h)
  groundGrad.addColorStop(0, 'rgba(134,239,172,0.35)')   // 顶部嫩绿
  groundGrad.addColorStop(0.3, 'rgba(74,222,128,0.22)')  // 翠绿
  groundGrad.addColorStop(0.7, 'rgba(34,197,94,0.12)')   // 深绿
  groundGrad.addColorStop(1, 'rgba(22,163,74,0)')        // 底部透明
  ctx.fillStyle = groundGrad
  ctx.fillRect(0, groundY - 8, w, h - groundY + 8)

  // ── 地面高光线（草地光泽） ──
  ctx.globalAlpha = 0.15
  ctx.strokeStyle = '#D9F99D'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, groundY - 1)
  for (let x = 0; x <= w; x += 5) {
    ctx.lineTo(x, groundY - 1 + Math.sin(x * 0.03) * 1)
  }
  ctx.stroke()

  // ── 小草芽（点缀） ──
  const drawGrassBlade = (gx: number, gy: number, alpha: number) => {
    ctx.globalAlpha = alpha
    ctx.strokeStyle = '#86EFAC'
    ctx.lineWidth = 1.2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(gx, gy)
    ctx.quadraticCurveTo(gx - 1.5, gy - 6, gx + 0.5, gy - 9)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(gx + 2, gy)
    ctx.quadraticCurveTo(gx + 4, gy - 5, gx + 2.5, gy - 8)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(gx + 4, gy)
    ctx.quadraticCurveTo(gx + 6, gy - 4, gx + 5, gy - 7)
    ctx.stroke()
  }

  const grassPositions = [
    { x: w * 0.08, y: groundY + 1 },
    { x: w * 0.18, y: groundY + 2 },
    { x: w * 0.32, y: groundY + 1 },
    { x: w * 0.48, y: groundY + 2 },
    { x: w * 0.62, y: groundY + 1 },
    { x: w * 0.75, y: groundY + 2 },
    { x: w * 0.88, y: groundY + 1 },
    { x: w * 0.95, y: groundY + 2 },
  ]
  for (const g of grassPositions) {
    drawGrassBlade(g.x, g.y, 0.4)
  }

  // ── 小花点缀（地面散落） ──
  const drawTinyFlower = (fx: number, fy: number, color: string, alpha: number) => {
    ctx.globalAlpha = alpha
    // 花瓣（4片小圆）
    for (let p = 0; p < 4; p++) {
      const angle = (Math.PI / 2) * p
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(fx + Math.cos(angle) * 2, fy + Math.sin(angle) * 2, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    // 花心
    ctx.fillStyle = '#FCD34D'
    ctx.beginPath()
    ctx.arc(fx, fy, 1.2, 0, Math.PI * 2)
    ctx.fill()
  }

  const tinyFlowers = [
    { x: w * 0.12, y: groundY + 3, color: '#F9A8D4' },
    { x: w * 0.25, y: groundY + 4, color: '#FDA4AF' },
    { x: w * 0.42, y: groundY + 3, color: '#FCA5A5' },
    { x: w * 0.58, y: groundY + 4, color: '#FBCFE8' },
    { x: w * 0.72, y: groundY + 3, color: '#F0ABFC' },
    { x: w * 0.85, y: groundY + 4, color: '#F9A8D4' },
  ]
  for (const f of tinyFlowers) {
    drawTinyFlower(f.x, f.y, f.color, 0.5)
  }

  ctx.restore()
}

/** 绘制花圃（可爱版：圆润球形叠加花朵+多层土地+茎叶） */
export function drawFlowerBed(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number, frame: number, palette: Palette) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  const bw = 52 * s

  // ── 土地底座（多层叠加，圆润） ──
  // 阴影层
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#451A03'
  ctx.beginPath()
  ctx.ellipse(1 * s, 0, bw * 0.95, 6 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // 深色土层
  ctx.globalAlpha = 0.55
  ctx.fillStyle = '#78350F'
  ctx.beginPath()
  ctx.ellipse(0, -1 * s, bw * 0.88, 5.5 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // 主土层
  ctx.globalAlpha = 0.65
  ctx.fillStyle = '#92400E'
  ctx.beginPath()
  ctx.ellipse(0, -2 * s, bw * 0.82, 5 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // 土地高光
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#D97706'
  ctx.beginPath()
  ctx.ellipse(-bw * 0.15, -3 * s, bw * 0.35, 2 * s, -0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 花朵（圆润球形叠加，完全对齐 Icon 手法） ──
  const colors = palette.flowerPetals
  const petalCount = 7 + variant % 3

  for (let i = 0; i < petalCount; i++) {
    const fx = (i / (petalCount - 1) - 0.5) * bw * 1.5
    const foscil = Math.sin(frame * 0.055 + i * 0.85) * 1.8 * s
    const fh = (16 + (i % 3) * 5) * s
    const color = colors[(i + variant) % colors.length]

    // ── 茎（带叶子） ──
    ctx.globalAlpha = 0.85
    ctx.strokeStyle = '#16A34A'
    ctx.lineWidth = 1.5 * s
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(fx, -3 * s)
    ctx.quadraticCurveTo(fx + foscil * 0.4, -fh * 0.5, fx + foscil * 0.3, -fh)
    ctx.stroke()

    // 小叶子（左右各一片）
    if (i % 2 === 0) {
      ctx.globalAlpha = 0.7
      ctx.fillStyle = '#22C55E'
      ctx.beginPath()
      ctx.ellipse(fx - 3 * s + foscil * 0.1, -fh * 0.45, 3.5 * s, 1.5 * s, -0.5, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.globalAlpha = 0.7
      ctx.fillStyle = '#22C55E'
      ctx.beginPath()
      ctx.ellipse(fx + 3 * s + foscil * 0.1, -fh * 0.5, 3.5 * s, 1.5 * s, 0.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // ── 花朵（圆润球形叠加） ──
    const headX = fx + foscil * 0.3
    const headY = -fh

    // 花瓣底层阴影
    ctx.globalAlpha = 0.25
    ctx.fillStyle = color
    for (let p = 0; p < 5; p++) {
      const pa = (Math.PI * 2 / 5) * p + frame * 0.008
      ctx.beginPath()
      ctx.arc(headX + Math.cos(pa) * 4.5 * s, headY + Math.sin(pa) * 4.5 * s + 1 * s, 3.5 * s, 0, Math.PI * 2)
      ctx.fill()
    }
    // 花瓣主层（5片圆形叠加）
    ctx.globalAlpha = 0.82
    ctx.fillStyle = color
    for (let p = 0; p < 5; p++) {
      const pa = (Math.PI * 2 / 5) * p + frame * 0.008
      ctx.beginPath()
      ctx.arc(headX + Math.cos(pa) * 4.2 * s, headY + Math.sin(pa) * 4.2 * s, 3.2 * s, 0, Math.PI * 2)
      ctx.fill()
    }
    // 花瓣高光层
    ctx.globalAlpha = 0.35
    ctx.fillStyle = 'white'
    for (let p = 0; p < 5; p++) {
      const pa = (Math.PI * 2 / 5) * p + frame * 0.008
      ctx.beginPath()
      ctx.arc(
        headX + Math.cos(pa) * 4.2 * s - 0.8 * s,
        headY + Math.sin(pa) * 4.2 * s - 0.8 * s,
        1.2 * s, 0, Math.PI * 2
      )
      ctx.fill()
    }

    // 花心底层
    ctx.globalAlpha = 0.9
    ctx.fillStyle = '#D97706'
    ctx.beginPath()
    ctx.arc(headX, headY, 3 * s, 0, Math.PI * 2)
    ctx.fill()
    // 花心主层
    ctx.fillStyle = palette.flowerCenter
    ctx.beginPath()
    ctx.arc(headX, headY - 0.3 * s, 2.5 * s, 0, Math.PI * 2)
    ctx.fill()
    // 花心高光
    ctx.globalAlpha = 0.6
    ctx.fillStyle = '#FEF9C3'
    ctx.beginPath()
    ctx.arc(headX - 0.8 * s, headY - 1 * s, 1 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

/** 绘制木篱笆（可爱版：圆润木柱+爬藤小花装饰） */
export function drawFence(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  const postW = 5.5 * s
  const postH = 22 * s
  const postCount = 4 + variant % 2
  const spacing = 14 * s

  const totalW = postCount * spacing
  const startX = -totalW * 0.5

  // ── 横梁（圆润，带高光） ──
  const railYs = [-(postH * 0.38), -(postH * 0.72)]
  for (const ry of railYs) {
    // 横梁阴影
    ctx.globalAlpha = 0.15
    ctx.fillStyle = '#78350F'
    ctx.beginPath()
    ctx.roundRect(startX - 1, ry - 3 * s + 1, totalW + 2, 5.5 * s, 2 * s)
    ctx.fill()
    // 横梁主体
    ctx.globalAlpha = 0.72
    ctx.fillStyle = '#D97706'
    ctx.beginPath()
    ctx.roundRect(startX, ry - 3 * s, totalW, 5.5 * s, 2 * s)
    ctx.fill()
    // 横梁高光
    ctx.globalAlpha = 0.25
    ctx.fillStyle = '#FDE68A'
    ctx.beginPath()
    ctx.roundRect(startX + 2 * s, ry - 2.5 * s, totalW - 4 * s, 1.8 * s, 1 * s)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // ── 竖柱（圆润尖顶） ──
  for (let i = 0; i <= postCount; i++) {
    const px = startX + i * spacing

    // 柱子阴影
    ctx.globalAlpha = 0.12
    ctx.fillStyle = '#78350F'
    ctx.beginPath()
    ctx.roundRect(px - postW / 2 + 1, -postH + 1, postW, postH, 2 * s)
    ctx.fill()

    // 柱子主体
    ctx.globalAlpha = 0.75
    ctx.fillStyle = '#B45309'
    ctx.beginPath()
    ctx.roundRect(px - postW / 2, -postH, postW, postH, 2 * s)
    ctx.fill()

    // 柱子高光
    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#FDE68A'
    ctx.beginPath()
    ctx.roundRect(px - postW / 2 + 1 * s, -postH + 2 * s, postW * 0.35, postH - 4 * s, 1 * s)
    ctx.fill()

    // 尖顶（圆润三角）
    ctx.globalAlpha = 0.8
    ctx.fillStyle = '#92400E'
    ctx.beginPath()
    ctx.moveTo(px - postW / 2, -postH)
    ctx.lineTo(px, -postH - 6 * s)
    ctx.lineTo(px + postW / 2, -postH)
    ctx.closePath()
    ctx.fill()
    // 尖顶高光
    ctx.globalAlpha = 0.25
    ctx.fillStyle = '#FCD34D'
    ctx.beginPath()
    ctx.moveTo(px - postW * 0.15, -postH)
    ctx.lineTo(px - postW * 0.05, -postH - 4 * s)
    ctx.lineTo(px + postW * 0.15, -postH)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // ── 爬藤装饰（小叶子+小花） ──
  const vineColors = ['#F9A8D4', '#FCA5A5', '#FBCFE8', '#F0ABFC']
  for (let i = 0; i < postCount; i++) {
    const px = startX + i * spacing + spacing * 0.5
    const ry = railYs[0]

    // 藤蔓叶子
    ctx.globalAlpha = 0.6
    ctx.fillStyle = '#4ADE80'
    ctx.beginPath()
    ctx.ellipse(px - 3 * s, ry - 4 * s, 3 * s, 1.8 * s, -0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(px + 2 * s, ry - 5 * s, 2.8 * s, 1.6 * s, 0.5, 0, Math.PI * 2)
    ctx.fill()

    // 小花（每隔一个柱子）
    if (i % 2 === 0) {
      const fc = vineColors[i % vineColors.length]
      ctx.globalAlpha = 0.8
      for (let p = 0; p < 4; p++) {
        const pa = (Math.PI / 2) * p
        ctx.fillStyle = fc
        ctx.beginPath()
        ctx.arc(px + Math.cos(pa) * 2.2 * s, ry - 6 * s + Math.sin(pa) * 2.2 * s, 1.8 * s, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = '#FCD34D'
      ctx.beginPath()
      ctx.arc(px, ry - 6 * s, 1.3 * s, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.restore()
}

/** 绘制喷泉（可爱版：圆润石盆+多层叠加+水花粒子） */
export function drawFountain(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, _variant: number, frame: number) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  const baseR = 24 * s
  const pillarH = 18 * s

  // ── 底部水盆（多层叠加） ──
  // 盆阴影
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#1E3A5F'
  ctx.beginPath()
  ctx.ellipse(1 * s, -1 * s, baseR + 2 * s, 7 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // 盆底层（深色）
  ctx.globalAlpha = 0.65
  ctx.fillStyle = '#7DD3FC'
  ctx.beginPath()
  ctx.ellipse(0, -3 * s, baseR, 6.5 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // 水面（浅蓝）
  ctx.globalAlpha = 0.55
  ctx.fillStyle = '#BAE6FD'
  ctx.beginPath()
  ctx.ellipse(0, -4 * s, baseR * 0.88, 5 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // 水面高光
  ctx.globalAlpha = 0.3
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.ellipse(-baseR * 0.25, -5 * s, baseR * 0.3, 2 * s, -0.3, 0, Math.PI * 2)
  ctx.fill()
  // 盆沿（圆润石材）
  ctx.globalAlpha = 0.7
  ctx.fillStyle = '#CBD5E1'
  ctx.beginPath()
  ctx.ellipse(0, -7 * s, baseR * 0.92, 3.5 * s, 0, 0, Math.PI)
  ctx.fill()
  // 盆沿高光
  ctx.globalAlpha = 0.3
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.ellipse(-baseR * 0.2, -8 * s, baseR * 0.3, 1.2 * s, -0.2, 0, Math.PI)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 中央柱（圆润叠加） ──
  // 柱子阴影
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#334155'
  ctx.beginPath()
  ctx.roundRect(-4 * s + 1, -7 * s - pillarH + 1, 8 * s, pillarH, 3 * s)
  ctx.fill()
  // 柱子主体
  ctx.globalAlpha = 0.7
  ctx.fillStyle = '#94A3B8'
  ctx.beginPath()
  ctx.roundRect(-4 * s, -7 * s - pillarH, 8 * s, pillarH, 3 * s)
  ctx.fill()
  // 柱子高光
  ctx.globalAlpha = 0.3
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.roundRect(-3 * s, -7 * s - pillarH + 2 * s, 2.5 * s, pillarH - 4 * s, 1.5 * s)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 顶部小盆（圆润叠加） ──
  ctx.globalAlpha = 0.65
  ctx.fillStyle = '#7DD3FC'
  ctx.beginPath()
  ctx.ellipse(0, -7 * s - pillarH, 11 * s, 4 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 0.7
  ctx.fillStyle = '#CBD5E1'
  ctx.beginPath()
  ctx.ellipse(0, -8 * s - pillarH, 11 * s, 3.5 * s, 0, 0, Math.PI)
  ctx.fill()
  ctx.globalAlpha = 0.25
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.ellipse(-3 * s, -9 * s - pillarH, 4 * s, 1.2 * s, -0.2, 0, Math.PI)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 水柱动画（5股，更丰富） ──
  ctx.lineCap = 'round'
  const waterColor = '#7DD3FC'
  const jets = [
    { i: 0, spread: 0, height: 18 },
    { i: -1, spread: -1, height: 14 },
    { i: 1, spread: 1, height: 14 },
    { i: -2, spread: -2, height: 9 },
    { i: 2, spread: 2, height: 9 },
  ]
  for (const jet of jets) {
    const wPhase = frame * 0.07 + jet.i * 1.1
    ctx.globalAlpha = 0.55 + Math.sin(wPhase) * 0.1
    ctx.strokeStyle = waterColor
    ctx.lineWidth = (1.8 - Math.abs(jet.i) * 0.3 + Math.sin(wPhase) * 0.3) * s
    ctx.beginPath()
    const startY = -8 * s - pillarH - 3 * s
    ctx.moveTo(jet.spread * 1.5 * s, startY)
    ctx.quadraticCurveTo(
      jet.spread * (9 + Math.sin(wPhase) * 1.5) * s,
      startY - jet.height * s,
      jet.spread * (16 + Math.sin(wPhase * 0.6) * 2) * s,
      startY - (jet.height * 0.3) * s
    )
    ctx.stroke()
  }

  // ── 水花粒子（落水点） ──
  ctx.globalAlpha = 0.4
  ctx.fillStyle = '#BAE6FD'
  for (let i = 0; i < 6; i++) {
    const dropPhase = (frame * 0.05 + i * 1.2) % (Math.PI * 2)
    const dropX = Math.sin(dropPhase * 2.5 + i) * baseR * 0.55
    const dropY = -4 * s - Math.abs(Math.sin(dropPhase)) * 4 * s
    ctx.beginPath()
    ctx.arc(dropX, dropY, (0.8 + Math.sin(dropPhase) * 0.4) * s, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 水面涟漪（动态） ──
  for (let ri = 0; ri < 2; ri++) {
    const ripple = ((frame * 0.8 + ri * 20) % 40) / 40
    ctx.globalAlpha = 0.25 * (1 - ripple)
    ctx.strokeStyle = '#7DD3FC'
    ctx.lineWidth = 0.8 * s
    ctx.beginPath()
    ctx.ellipse(0, -4 * s, baseR * 0.45 * (0.2 + ripple), 2.5 * s * (0.2 + ripple), 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  // ── 盆边小花装饰 ──
  const flowerColors = ['#F9A8D4', '#FCA5A5', '#FBCFE8']
  for (let fi = 0; fi < 3; fi++) {
    const fa = (Math.PI * 2 / 3) * fi + 0.5
    const fx = Math.cos(fa) * baseR * 0.82
    const fy = -7 * s + Math.sin(fa) * 2 * s
    ctx.globalAlpha = 0.7
    for (let p = 0; p < 4; p++) {
      const pa = (Math.PI / 2) * p
      ctx.fillStyle = flowerColors[fi % flowerColors.length]
      ctx.beginPath()
      ctx.arc(fx + Math.cos(pa) * 2 * s, fy + Math.sin(pa) * 2 * s, 1.5 * s, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#FCD34D'
    ctx.beginPath()
    ctx.arc(fx, fy, 1.2 * s, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

/** 绘制可爱蘑菇（圆润球形叠加，多种变体） */
export function drawMushroom(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale

  // 蘑菇颜色变体
  const capColors = [
    { dark: '#DC2626', mid: '#EF4444', light: '#FCA5A5', spot: 'white' },   // 红色
    { dark: '#D97706', mid: '#F59E0B', light: '#FDE68A', spot: 'white' },   // 橙色
    { dark: '#7C3AED', mid: '#8B5CF6', light: '#C4B5FD', spot: 'white' },   // 紫色
    { dark: '#0369A1', mid: '#0EA5E9', light: '#BAE6FD', spot: 'white' },   // 蓝色
  ]
  const cap = capColors[variant % capColors.length]

  const capR = (9 + variant % 3) * s
  const stemH = (8 + variant % 3) * s
  const stemW = 4.5 * s

  // ── 根部阴影 ──
  ctx.globalAlpha = 0.1
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.ellipse(0.5 * s, 0.5 * s, stemW * 1.2, 2 * s, 0, 0, Math.PI * 2)
  ctx.fill()

  // ── 菌柄（圆润叠加） ──
  // 柄底层
  ctx.globalAlpha = 0.7
  ctx.fillStyle = '#FEF3C7'
  ctx.beginPath()
  ctx.roundRect(-stemW / 2, -stemH, stemW, stemH, stemW * 0.4)
  ctx.fill()
  // 柄高光
  ctx.globalAlpha = 0.4
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.roundRect(-stemW / 2 + 0.8 * s, -stemH + 1.5 * s, stemW * 0.3, stemH - 3 * s, 1 * s)
  ctx.fill()
  // 柄裙边（菌环）
  ctx.globalAlpha = 0.55
  ctx.fillStyle = '#FDE68A'
  ctx.beginPath()
  ctx.ellipse(0, -stemH * 0.55, stemW * 0.9, 1.8 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 菌盖（圆润球形叠加） ──
  // 盖底层阴影
  ctx.globalAlpha = 0.2
  ctx.fillStyle = cap.dark
  ctx.beginPath()
  ctx.ellipse(0.5 * s, -stemH + 0.5 * s, capR * 1.05, capR * 0.62, 0, 0, Math.PI * 2)
  ctx.fill()
  // 盖底层（深色）
  ctx.globalAlpha = 0.85
  ctx.fillStyle = cap.dark
  ctx.beginPath()
  ctx.arc(0, -stemH, capR, Math.PI, 0)
  ctx.closePath()
  ctx.fill()
  // 盖中层
  ctx.fillStyle = cap.mid
  ctx.beginPath()
  ctx.arc(0, -stemH - 0.5 * s, capR * 0.92, Math.PI, 0)
  ctx.closePath()
  ctx.fill()
  // 盖亮层
  ctx.fillStyle = cap.light
  ctx.globalAlpha = 0.45
  ctx.beginPath()
  ctx.arc(0, -stemH - 1 * s, capR * 0.75, Math.PI, 0)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // 盖底面（浅色）
  ctx.globalAlpha = 0.5
  ctx.fillStyle = '#FEF9C3'
  ctx.beginPath()
  ctx.ellipse(0, -stemH, capR * 0.88, capR * 0.28, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 白色圆点（可爱装饰） ──
  const spots = variant % 2 === 0
    ? [{ dx: -capR * 0.3, dy: -capR * 0.5, r: 2.2 * s }, { dx: capR * 0.28, dy: -capR * 0.42, r: 1.8 * s }, { dx: 0, dy: -capR * 0.72, r: 1.5 * s }]
    : [{ dx: -capR * 0.22, dy: -capR * 0.55, r: 2 * s }, { dx: capR * 0.32, dy: -capR * 0.35, r: 2.2 * s }]

  ctx.globalAlpha = 0.88
  ctx.fillStyle = cap.spot
  for (const sp of spots) {
    ctx.beginPath()
    ctx.arc(sp.dx, -stemH + sp.dy, sp.r, 0, Math.PI * 2)
    ctx.fill()
    // 点高光
    ctx.globalAlpha = 0.4
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.beginPath()
    ctx.arc(sp.dx - sp.r * 0.3, -stemH + sp.dy - sp.r * 0.3, sp.r * 0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 0.88
    ctx.fillStyle = cap.spot
  }

  // ── 盖顶高光 ──
  ctx.globalAlpha = 0.35
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.ellipse(-capR * 0.22, -stemH - capR * 0.62, capR * 0.28, capR * 0.15, -0.4, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

/** 绘制圆润灌木丛（对齐森林树冠手法：多层圆形叠加） */
export function drawBush(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale

  // 颜色系统（对齐森林树冠）
  const foliageDark = '#15803D'
  const foliageMid = '#16A34A'
  const foliageMain = '#22C55E'
  const foliageLight = '#4ADE80'
  const foliageHighlight = '#BBF7D0'

  // 灌木丛形状变体
  const bushConfigs = [
    // 变体0：宽矮型
    [
      { cx: 0, cy: -12, r: 14 },
      { cx: -12, cy: -9, r: 11 },
      { cx: 12, cy: -9, r: 11 },
      { cx: -6, cy: -18, r: 9 },
      { cx: 6, cy: -17, r: 9 },
      { cx: 0, cy: -22, r: 7 },
    ],
    // 变体1：高挑型
    [
      { cx: 0, cy: -16, r: 12 },
      { cx: -10, cy: -11, r: 9 },
      { cx: 10, cy: -11, r: 9 },
      { cx: -4, cy: -23, r: 8 },
      { cx: 4, cy: -22, r: 8 },
      { cx: 0, cy: -28, r: 6 },
    ],
    // 变体2：圆胖型
    [
      { cx: 0, cy: -13, r: 15 },
      { cx: -13, cy: -10, r: 10 },
      { cx: 13, cy: -10, r: 10 },
      { cx: -5, cy: -20, r: 10 },
      { cx: 5, cy: -19, r: 10 },
    ],
  ]

  const circles = bushConfigs[variant % bushConfigs.length].map(c => ({
    cx: c.cx * s,
    cy: c.cy * s,
    r: c.r * s,
  }))

  // ── 根部阴影 ──
  ctx.globalAlpha = 0.1
  ctx.fillStyle = '#14532D'
  ctx.beginPath()
  ctx.ellipse(0.5 * s, 0, circles[0].r * 1.1, 3 * s, 0, 0, Math.PI * 2)
  ctx.fill()

  // ── 底层阴影（深色，偏下） ──
  ctx.globalAlpha = 0.28
  for (const c of circles) {
    ctx.fillStyle = foliageDark
    ctx.beginPath()
    ctx.arc(c.cx, c.cy + 3 * s, c.r + 1 * s, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 主体（深绿底层） ──
  ctx.globalAlpha = 0.9
  for (const c of circles) {
    ctx.fillStyle = foliageDark
    ctx.beginPath()
    ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 中层 ──
  ctx.globalAlpha = 0.85
  for (const c of circles) {
    ctx.fillStyle = foliageMid
    ctx.beginPath()
    ctx.arc(c.cx, c.cy - 0.5 * s, c.r * 0.9, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 亮层 ──
  ctx.globalAlpha = 0.8
  for (const c of circles) {
    ctx.fillStyle = foliageMain
    ctx.beginPath()
    ctx.arc(c.cx, c.cy - 1 * s, c.r * 0.78, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 高光（左上角） ──
  ctx.globalAlpha = 0.3
  for (const c of circles) {
    ctx.fillStyle = foliageLight
    ctx.beginPath()
    ctx.arc(c.cx - c.r * 0.25, c.cy - c.r * 0.25, c.r * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 高光点 ──
  ctx.globalAlpha = 0.45
  ctx.fillStyle = foliageHighlight
  for (const c of circles.slice(0, 2)) {
    ctx.beginPath()
    ctx.arc(c.cx - c.r * 0.3, c.cy - c.r * 0.35, c.r * 0.22, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 小花点缀（灌木上的小花） ──
  const flowerColors = ['#F9A8D4', '#FCA5A5', '#FBCFE8', '#FDE68A']
  const flowerPositions = [
    { cx: circles[0].cx - circles[0].r * 0.4, cy: circles[0].cy - circles[0].r * 0.6 },
    { cx: circles[1].cx + circles[1].r * 0.2, cy: circles[1].cy - circles[1].r * 0.5 },
    { cx: circles[2].cx - circles[2].r * 0.1, cy: circles[2].cy - circles[2].r * 0.55 },
  ]
  ctx.globalAlpha = 0.85
  for (let fi = 0; fi < flowerPositions.length; fi++) {
    const fp = flowerPositions[fi]
    const fc = flowerColors[(fi + variant) % flowerColors.length]
    for (let p = 0; p < 4; p++) {
      const pa = (Math.PI / 2) * p
      ctx.fillStyle = fc
      ctx.beginPath()
      ctx.arc(fp.cx + Math.cos(pa) * 2.5 * s, fp.cy + Math.sin(pa) * 2.5 * s, 1.8 * s, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#FCD34D'
    ctx.beginPath()
    ctx.arc(fp.cx, fp.cy, 1.4 * s, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}
/** 绘制花瓣粒子（落花效果，可爱版：多形状+旋转+淡出+蝴蝶） */
export function drawPetals(ctx: CanvasRenderingContext2D, w: number, groundY: number, frame: number, _palette: Palette) {
  ctx.save()

  // 更丰富的颜色
  const colors = ['#F9A8D4', '#FDA4AF', '#FCA5A5', '#FBCFE8', '#F0ABFC', '#FDE68A', '#BBF7D0', '#BAE6FD']
  const petalCount = 24

  for (let i = 0; i < petalCount; i++) {
    const t = (frame * 0.55 + i * 137.5) % 360
    const px = ((i * 137.5 + Math.sin(frame * 0.018 + i * 0.7) * 35) % w + w) % w
    const py = (t / 360) * (groundY + 30)
    const angle = frame * 0.025 + i * 0.9
    const r = 2.5 + (i % 4) * 0.8
    const fadeAlpha = 0.65 * (1 - py / (groundY + 30) * 0.35)

    ctx.save()
    ctx.translate(px, py)
    ctx.rotate(angle)
    ctx.globalAlpha = fadeAlpha
    ctx.fillStyle = colors[i % colors.length]

    // 交替绘制不同形状的花瓣
    if (i % 3 === 0) {
      // 椭圆花瓣
      ctx.beginPath()
      ctx.ellipse(0, 0, r, r * 0.45, 0, 0, Math.PI * 2)
      ctx.fill()
    } else if (i % 3 === 1) {
      // 双圆叠加花瓣
      ctx.beginPath()
      ctx.arc(-r * 0.3, 0, r * 0.55, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(r * 0.3, 0, r * 0.55, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // 圆形花瓣
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
      ctx.fill()
    }

    // 花瓣高光
    ctx.globalAlpha = fadeAlpha * 0.4
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(-r * 0.2, -r * 0.2, r * 0.25, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  // ── 蝴蝶（2只，飞舞动画） ──
  const butterflies = [
    { phase: 0, baseX: w * 0.3, baseY: groundY * 0.35 },
    { phase: Math.PI, baseX: w * 0.7, baseY: groundY * 0.25 },
  ]

  for (const bf of butterflies) {
    const bx = bf.baseX + Math.sin(frame * 0.022 + bf.phase) * 40
    const by = bf.baseY + Math.sin(frame * 0.035 + bf.phase * 1.3) * 20
    const wingFlap = Math.sin(frame * 0.18 + bf.phase)

    ctx.save()
    ctx.translate(bx, by)
    ctx.globalAlpha = 0.7

    const wingColors = bf.phase === 0
      ? { outer: '#F9A8D4', inner: '#FBCFE8' }
      : { outer: '#FDE68A', inner: '#FEF9C3' }

    // 上翅（大）
    ctx.fillStyle = wingColors.outer
    ctx.beginPath()
    ctx.ellipse(-5 * Math.abs(wingFlap), -3, 7, 4.5, -0.5 + wingFlap * 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(5 * Math.abs(wingFlap), -3, 7, 4.5, 0.5 - wingFlap * 0.3, 0, Math.PI * 2)
    ctx.fill()

    // 下翅（小）
    ctx.fillStyle = wingColors.inner
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.ellipse(-4 * Math.abs(wingFlap), 2, 4.5, 3, -0.3 + wingFlap * 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(4 * Math.abs(wingFlap), 2, 4.5, 3, 0.3 - wingFlap * 0.2, 0, Math.PI * 2)
    ctx.fill()

    // 翅膀花纹
    ctx.globalAlpha = 0.35
    ctx.fillStyle = '#D97706'
    ctx.beginPath()
    ctx.arc(-4 * Math.abs(wingFlap), -2, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(4 * Math.abs(wingFlap), -2, 1.5, 0, Math.PI * 2)
    ctx.fill()

    // 身体
    ctx.globalAlpha = 0.75
    ctx.fillStyle = '#78350F'
    ctx.beginPath()
    ctx.ellipse(0, 0, 1.2, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    // 触角
    ctx.strokeStyle = '#78350F'
    ctx.lineWidth = 0.8
    ctx.lineCap = 'round'
    ctx.globalAlpha = 0.65
    ctx.beginPath()
    ctx.moveTo(-1, -3)
    ctx.quadraticCurveTo(-4, -7, -3, -9)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(1, -3)
    ctx.quadraticCurveTo(4, -7, 3, -9)
    ctx.stroke()
    ctx.fillStyle = '#78350F'
    ctx.globalAlpha = 0.75
    ctx.beginPath()
    ctx.arc(-3, -9, 1, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(3, -9, 1, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  ctx.restore()
}

/** 花园布局（可爱版：加入蘑菇、灌木丛） */
export function getGardenLayout(w: number, _h: number): Array<{ type: string; x: number; scale: number; variant: number }> {
  const items: Array<{ type: string; x: number; scale: number; variant: number }> = []

  // 灌木丛（背景层，先画）
  items.push({ type: 'bush', x: w * 0.06, scale: rand(0.85, 1.05), variant: 0 })
  items.push({ type: 'bush', x: w * 0.35, scale: rand(0.8, 1.0), variant: 2 })
  items.push({ type: 'bush', x: w * 0.65, scale: rand(0.85, 1.05), variant: 1 })
  items.push({ type: 'bush', x: w * 0.92, scale: rand(0.8, 1.0), variant: 0 })

  // 篱笆
  items.push({ type: 'fence', x: w * 0.18, scale: rand(0.85, 1.0), variant: 0 })
  items.push({ type: 'fence', x: w * 0.52, scale: rand(0.85, 1.0), variant: 1 })
  items.push({ type: 'fence', x: w * 0.80, scale: rand(0.85, 1.0), variant: 0 })

  // 花圃
  items.push({ type: 'flowerBed', x: w * 0.22, scale: rand(0.9, 1.1), variant: 0 })
  items.push({ type: 'flowerBed', x: w * 0.58, scale: rand(0.9, 1.1), variant: 2 })
  items.push({ type: 'flowerBed', x: w * 0.86, scale: rand(0.85, 1.0), variant: 1 })

  // 喷泉（居中偏左）
  items.push({ type: 'fountain', x: w * 0.42, scale: 1.0, variant: 0 })

  // 蘑菇（散落点缀）
  items.push({ type: 'mushroom', x: w * 0.10, scale: rand(0.7, 0.95), variant: 0 })
  items.push({ type: 'mushroom', x: w * 0.30, scale: rand(0.65, 0.85), variant: 2 })
  items.push({ type: 'mushroom', x: w * 0.72, scale: rand(0.7, 0.9), variant: 1 })
  items.push({ type: 'mushroom', x: w * 0.90, scale: rand(0.65, 0.85), variant: 3 })

  // 落花（全屏粒子）
  items.push({ type: 'petals', x: w * 0.5, scale: 1.0, variant: 0 })

  return items
}