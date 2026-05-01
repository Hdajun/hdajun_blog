// ─── 古村落场景绘制（可爱质感版） ────────────────────────────────────────────────
//
// 设计理念：温暖古朴的中式村落，充满生活气息
//  - 暖色夯土地面：石板路纹理、青苔点缀
//  - 茅草屋：圆润多层叠加，有质感的屋顶
//  - 石灯笼：精致圆润，夜晚有温暖光晕
//  - 古树：苍劲有力，圆润树冠
//  - 竹篱笆：清新竹节，竹叶装饰

import type { Palette, TreeInfo } from '../types'
import { rand } from '../utils'

/** 古村落地面（可爱版：暖色夯土+石板路+青苔） */
export function drawVillageGround(ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number) {
  ctx.save()

  // ── 地面：多层暖色夯土渐变 ──
  const groundGrad = ctx.createLinearGradient(0, groundY - 8, 0, h)
  groundGrad.addColorStop(0, 'rgba(217,119,6,0.32)')    // 顶部暖橘
  groundGrad.addColorStop(0.25, 'rgba(180,83,9,0.22)')  // 深橘
  groundGrad.addColorStop(0.6, 'rgba(146,64,14,0.12)')  // 棕色
  groundGrad.addColorStop(1, 'rgba(120,53,15,0)')
  ctx.fillStyle = groundGrad
  ctx.fillRect(0, groundY - 8, w, h - groundY + 8)

  // ── 地面高光线（夯土表面） ──
  ctx.globalAlpha = 0.12
  ctx.strokeStyle = '#FDE68A'
  ctx.lineWidth = 1.2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, groundY - 1)
  for (let x = 0; x <= w; x += 5) {
    ctx.lineTo(x, groundY - 1 + Math.sin(x * 0.022) * 0.8)
  }
  ctx.stroke()

  // ── 石板路（中间一条） ──
  const stoneY = groundY + 2
  const stoneColors = ['#A8A29E', '#78716C', '#D6D3D1']
  const stones = [
    { x: w * 0.3, w: 18, h: 5 }, { x: w * 0.38, w: 14, h: 4 },
    { x: w * 0.46, w: 16, h: 5 }, { x: w * 0.54, w: 15, h: 4 },
    { x: w * 0.62, w: 17, h: 5 }, { x: w * 0.7, w: 13, h: 4 },
  ]
  for (let si = 0; si < stones.length; si++) {
    const st = stones[si]
    // 石板阴影
    ctx.globalAlpha = 0.1
    ctx.fillStyle = '#44403C'
    ctx.beginPath()
    ctx.roundRect(st.x - st.w / 2 + 1, stoneY + 1, st.w, st.h, 1.5)
    ctx.fill()
    // 石板主体
    ctx.globalAlpha = 0.28
    ctx.fillStyle = stoneColors[si % stoneColors.length]
    ctx.beginPath()
    ctx.roundRect(st.x - st.w / 2, stoneY, st.w, st.h, 1.5)
    ctx.fill()
    // 石板高光
    ctx.globalAlpha = 0.12
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.roundRect(st.x - st.w / 2 + 1.5, stoneY + 0.8, st.w * 0.5, st.h * 0.4, 1)
    ctx.fill()
  }

  // ── 青苔点缀 ──
  const mossPositions = [
    { x: w * 0.08, y: groundY + 3 },
    { x: w * 0.22, y: groundY + 4 },
    { x: w * 0.78, y: groundY + 3 },
    { x: w * 0.92, y: groundY + 4 },
  ]
  for (const m of mossPositions) {
    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#4ADE80'
    ctx.beginPath()
    ctx.ellipse(m.x, m.y, 4, 1.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 0.2
    ctx.fillStyle = '#86EFAC'
    ctx.beginPath()
    ctx.ellipse(m.x - 1, m.y - 0.5, 2.5, 1, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 小草芽 ──
  const drawGrass = (gx: number, gy: number, alpha: number) => {
    ctx.globalAlpha = alpha
    ctx.strokeStyle = '#86EFAC'
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(gx, gy)
    ctx.quadraticCurveTo(gx - 1.5, gy - 5, gx + 0.5, gy - 7)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(gx + 3, gy)
    ctx.quadraticCurveTo(gx + 5, gy - 4, gx + 3.5, gy - 6)
    ctx.stroke()
  }
  drawGrass(w * 0.12, groundY + 1, 0.35)
  drawGrass(w * 0.85, groundY + 1, 0.3)

  ctx.restore()
}

/** 绘制茅草屋（可爱版：圆润多层叠加+精致细节） */
export function drawCottage(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  const dir = variant % 2 === 0 ? 1 : -1
  const bw = 46 * s   // 屋身宽
  const bh = 28 * s   // 屋身高
  const rh = 24 * s   // 屋顶高
  const ow = 12 * s   // 出檐

  // ── 屋身（多层叠加） ──
  // 屋身阴影
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#78350F'
  ctx.beginPath()
  ctx.roundRect(-bw / 2 + 1.5, -bh + 1.5, bw, bh, 3 * s)
  ctx.fill()
  // 屋身主体（暖米色）
  ctx.globalAlpha = 0.88
  ctx.fillStyle = '#FEF3C7'
  ctx.beginPath()
  ctx.roundRect(-bw / 2, -bh, bw, bh, 3 * s)
  ctx.fill()
  // 屋身暗面（右侧）
  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#D97706'
  ctx.beginPath()
  ctx.roundRect(bw * 0.15, -bh, bw * 0.35, bh, [0, 3 * s, 3 * s, 0])
  ctx.fill()
  // 屋身高光（左侧）
  ctx.globalAlpha = 0.2
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.roundRect(-bw / 2 + 2 * s, -bh + 2 * s, bw * 0.18, bh - 4 * s, 2 * s)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 门（圆润拱形） ──
  const dw = 11 * s
  const dh = 16 * s
  const dx = dir * 6 * s
  // 门阴影
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#451A03'
  ctx.beginPath()
  ctx.roundRect(dx - dw / 2 + 1, -dh + 1, dw, dh, [dw / 2, dw / 2, 2 * s, 2 * s])
  ctx.fill()
  // 门主体
  ctx.globalAlpha = 0.85
  ctx.fillStyle = '#92400E'
  ctx.beginPath()
  ctx.roundRect(dx - dw / 2, -dh, dw, dh, [dw / 2, dw / 2, 2 * s, 2 * s])
  ctx.fill()
  // 门高光
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#D97706'
  ctx.beginPath()
  ctx.roundRect(dx - dw / 2 + 1.5 * s, -dh + 2 * s, dw * 0.3, dh - 4 * s, 1 * s)
  ctx.fill()
  // 门把手（圆润金色）
  ctx.globalAlpha = 0.9
  ctx.fillStyle = '#FCD34D'
  ctx.beginPath()
  ctx.arc(dx + dir * 3 * s, -dh * 0.42, 1.8 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 0.5
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(dx + dir * 3 * s - 0.5 * s, -dh * 0.42 - 0.5 * s, 0.7 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 窗（圆润，带窗格） ──
  const wx = -dir * 13 * s
  const wSize = 9 * s
  const wy = -bh * 0.62
  // 窗阴影
  ctx.globalAlpha = 0.1
  ctx.fillStyle = '#1E3A5F'
  ctx.beginPath()
  ctx.roundRect(wx - wSize / 2 + 1, wy - wSize / 2 + 1, wSize, wSize, 2 * s)
  ctx.fill()
  // 窗玻璃
  ctx.globalAlpha = 0.55
  ctx.fillStyle = '#BAE6FD'
  ctx.beginPath()
  ctx.roundRect(wx - wSize / 2, wy - wSize / 2, wSize, wSize, 2 * s)
  ctx.fill()
  // 窗框
  ctx.globalAlpha = 0.75
  ctx.strokeStyle = '#92400E'
  ctx.lineWidth = 1.2 * s
  ctx.beginPath()
  ctx.roundRect(wx - wSize / 2, wy - wSize / 2, wSize, wSize, 2 * s)
  ctx.stroke()
  // 窗格（十字）
  ctx.globalAlpha = 0.5
  ctx.strokeStyle = '#92400E'
  ctx.lineWidth = 0.8 * s
  ctx.beginPath()
  ctx.moveTo(wx, wy - wSize / 2)
  ctx.lineTo(wx, wy + wSize / 2)
  ctx.moveTo(wx - wSize / 2, wy)
  ctx.lineTo(wx + wSize / 2, wy)
  ctx.stroke()
  // 窗高光
  ctx.globalAlpha = 0.3
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.roundRect(wx - wSize / 2 + 1.5 * s, wy - wSize / 2 + 1.5 * s, wSize * 0.35, wSize * 0.35, 1 * s)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 屋顶（茅草，多层叠加） ──
  // 屋顶阴影
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#451A03'
  ctx.beginPath()
  ctx.moveTo(-bw / 2 - ow + 2, -bh + 2)
  ctx.lineTo(0, -bh - rh + 2)
  ctx.lineTo(bw / 2 + ow + 2, -bh + 2)
  ctx.closePath()
  ctx.fill()
  // 屋顶底层（深茅草色）
  ctx.globalAlpha = 0.9
  ctx.fillStyle = '#78350F'
  ctx.beginPath()
  ctx.moveTo(-bw / 2 - ow, -bh)
  ctx.lineTo(0, -bh - rh)
  ctx.lineTo(bw / 2 + ow, -bh)
  ctx.closePath()
  ctx.fill()
  // 屋顶主层（暖棕）
  ctx.fillStyle = '#92400E'
  ctx.beginPath()
  ctx.moveTo(-bw / 2 - ow + 2 * s, -bh)
  ctx.lineTo(0, -bh - rh + 2 * s)
  ctx.lineTo(bw / 2 + ow - 2 * s, -bh)
  ctx.closePath()
  ctx.fill()
  // 屋顶亮层（茅草高光）
  ctx.globalAlpha = 0.45
  ctx.fillStyle = '#D97706'
  ctx.beginPath()
  ctx.moveTo(-bw / 2 - ow + 5 * s, -bh)
  ctx.lineTo(0, -bh - rh + 5 * s)
  ctx.lineTo(bw / 2 + ow - 5 * s, -bh)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 茅草纹理线（更细腻） ──
  ctx.globalAlpha = 0.22
  ctx.strokeStyle = '#FDE68A'
  ctx.lineWidth = 0.7 * s
  ctx.lineCap = 'round'
  for (let i = -4; i <= 4; i++) {
    const lx = i * (bw / 8)
    const t = Math.abs(i) / 4
    ctx.beginPath()
    ctx.moveTo(lx, -bh - rh * (1 - t) + 2 * s)
    ctx.lineTo(lx + (i < 0 ? -1 : 1) * ow * 0.55, -bh + 1 * s)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // ── 屋脊装饰（圆润小球） ──
  ctx.globalAlpha = 0.85
  ctx.fillStyle = '#78350F'
  ctx.beginPath()
  ctx.arc(0, -bh - rh, 3.5 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 0.4
  ctx.fillStyle = '#FCD34D'
  ctx.beginPath()
  ctx.arc(-0.8 * s, -bh - rh - 0.8 * s, 1.2 * s, 0, Math.PI * 2)
  ctx.fill()

  // ── 屋檐下小灯笼（装饰） ──
  if (variant % 2 === 0) {
    const lx = -bw * 0.25
    const ly = -bh - 3 * s
    ctx.globalAlpha = 0.8
    ctx.fillStyle = '#DC2626'
    ctx.beginPath()
    ctx.ellipse(lx, ly, 2.5 * s, 3.5 * s, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 0.4
    ctx.fillStyle = '#FCA5A5'
    ctx.beginPath()
    ctx.ellipse(lx - 0.6 * s, ly - 0.8 * s, 1 * s, 1.5 * s, -0.3, 0, Math.PI * 2)
    ctx.fill()
    // 灯笼绳
    ctx.globalAlpha = 0.6
    ctx.strokeStyle = '#78350F'
    ctx.lineWidth = 0.6 * s
    ctx.beginPath()
    ctx.moveTo(lx, ly - 3.5 * s)
    ctx.lineTo(lx, ly - 5 * s)
    ctx.stroke()
    // 流苏
    ctx.strokeStyle = '#FCD34D'
    ctx.lineWidth = 0.5 * s
    ctx.beginPath()
    ctx.moveTo(lx - 1 * s, ly + 3.5 * s)
    ctx.lineTo(lx - 1 * s, ly + 6 * s)
    ctx.moveTo(lx, ly + 3.5 * s)
    ctx.lineTo(lx, ly + 6.5 * s)
    ctx.moveTo(lx + 1 * s, ly + 3.5 * s)
    ctx.lineTo(lx + 1 * s, ly + 6 * s)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

/** 绘制石灯笼（可爱版：圆润叠加+精致细节+夜晚温暖光晕） */
export function drawLantern(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, _variant: number, isNight: boolean) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  const baseW = 9 * s
  const pillarH = 20 * s
  const lanternW = 11 * s
  const lanternH = 15 * s

  // ── 底座（多层叠加） ──
  // 底座阴影
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#1C1917'
  ctx.beginPath()
  ctx.roundRect(-baseW / 2 + 1, -4 * s + 1, baseW, 4 * s, 1.5 * s)
  ctx.fill()
  // 底座主体
  ctx.globalAlpha = 0.75
  ctx.fillStyle = '#78716C'
  ctx.beginPath()
  ctx.roundRect(-baseW / 2, -4 * s, baseW, 4 * s, 1.5 * s)
  ctx.fill()
  // 底座高光
  ctx.globalAlpha = 0.25
  ctx.fillStyle = '#D6D3D1'
  ctx.beginPath()
  ctx.roundRect(-baseW / 2 + 1.5 * s, -3.5 * s, baseW * 0.4, 2 * s, 1 * s)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 石柱（圆润叠加） ──
  // 柱阴影
  ctx.globalAlpha = 0.1
  ctx.fillStyle = '#1C1917'
  ctx.beginPath()
  ctx.roundRect(-baseW * 0.38 + 1, -4 * s - pillarH + 1, baseW * 0.76, pillarH, 2 * s)
  ctx.fill()
  // 柱主体
  ctx.globalAlpha = 0.72
  ctx.fillStyle = '#A8A29E'
  ctx.beginPath()
  ctx.roundRect(-baseW * 0.38, -4 * s - pillarH, baseW * 0.76, pillarH, 2 * s)
  ctx.fill()
  // 柱高光
  ctx.globalAlpha = 0.28
  ctx.fillStyle = '#E7E5E4'
  ctx.beginPath()
  ctx.roundRect(-baseW * 0.38 + 1.2 * s, -4 * s - pillarH + 2 * s, baseW * 0.22, pillarH - 4 * s, 1 * s)
  ctx.fill()
  // 柱纹理横线
  ctx.globalAlpha = 0.15
  ctx.strokeStyle = '#78716C'
  ctx.lineWidth = 0.6 * s
  for (let i = 1; i <= 4; i++) {
    const ty = -4 * s - pillarH * (i * 0.22)
    ctx.beginPath()
    ctx.moveTo(-baseW * 0.38, ty)
    ctx.lineTo(baseW * 0.38, ty)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // ── 中间台（圆润） ──
  const midY = -4 * s - pillarH
  ctx.globalAlpha = 0.7
  ctx.fillStyle = '#78716C'
  ctx.beginPath()
  ctx.roundRect(-lanternW * 0.65, midY - 4 * s, lanternW * 1.3, 4 * s, 1.5 * s)
  ctx.fill()
  ctx.globalAlpha = 0.25
  ctx.fillStyle = '#D6D3D1'
  ctx.beginPath()
  ctx.roundRect(-lanternW * 0.65 + 1.5 * s, midY - 3.5 * s, lanternW * 0.5, 1.5 * s, 1 * s)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 灯笼体（圆润叠加，夜晚发光） ──
  const ly = midY - 4 * s - lanternH

  // 夜晚光晕（底层）
  if (isNight) {
    ctx.globalAlpha = 0.18
    const glow = ctx.createRadialGradient(0, ly + lanternH / 2, 3 * s, 0, ly + lanternH / 2, 32 * s)
    glow.addColorStop(0, 'rgba(255,200,60,0.7)')
    glow.addColorStop(0.5, 'rgba(255,160,30,0.3)')
    glow.addColorStop(1, 'rgba(255,120,0,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(0, ly + lanternH / 2, 32 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // 灯笼阴影
  ctx.globalAlpha = 0.1
  ctx.fillStyle = '#1C1917'
  ctx.beginPath()
  ctx.roundRect(-lanternW / 2 + 1, ly + 1, lanternW, lanternH, 3 * s)
  ctx.fill()
  // 灯笼主体
  ctx.globalAlpha = isNight ? 0.9 : 0.75
  ctx.fillStyle = isNight ? '#FCD34D' : '#FDE68A'
  ctx.beginPath()
  ctx.roundRect(-lanternW / 2, ly, lanternW, lanternH, 3 * s)
  ctx.fill()
  // 灯笼暗面
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#D97706'
  ctx.beginPath()
  ctx.roundRect(lanternW * 0.15, ly, lanternW * 0.35, lanternH, [0, 3 * s, 3 * s, 0])
  ctx.fill()
  // 灯笼高光
  ctx.globalAlpha = 0.35
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.roundRect(-lanternW / 2 + 1.5 * s, ly + 2 * s, lanternW * 0.28, lanternH * 0.45, 1.5 * s)
  ctx.fill()
  // 灯笼竖纹
  ctx.globalAlpha = 0.18
  ctx.strokeStyle = '#D97706'
  ctx.lineWidth = 0.6 * s
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(i * lanternW * 0.28, ly + 1 * s)
    ctx.lineTo(i * lanternW * 0.28, ly + lanternH - 1 * s)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // ── 顶帽（圆润三角） ──
  ctx.globalAlpha = 0.82
  ctx.fillStyle = '#44403C'
  ctx.beginPath()
  ctx.moveTo(-lanternW / 2 - 2 * s, ly)
  ctx.lineTo(0, ly - 7 * s)
  ctx.lineTo(lanternW / 2 + 2 * s, ly)
  ctx.closePath()
  ctx.fill()
  // 顶帽高光
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#A8A29E'
  ctx.beginPath()
  ctx.moveTo(-lanternW * 0.1, ly)
  ctx.lineTo(0, ly - 5 * s)
  ctx.lineTo(lanternW * 0.2, ly)
  ctx.closePath()
  ctx.fill()

  // ── 流苏（夜晚更亮） ──
  ctx.globalAlpha = isNight ? 0.8 : 0.55
  ctx.strokeStyle = '#D97706'
  ctx.lineWidth = 0.7 * s
  ctx.lineCap = 'round'
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(i * lanternW * 0.3, ly + lanternH)
    ctx.lineTo(i * lanternW * 0.3, ly + lanternH + 5 * s)
    ctx.stroke()
  }

  ctx.restore()
}

/** 绘制古树（可爱版：圆润树冠+苍劲树干+树洞） */
export function drawAncientTree(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number, frame: number, palette: Palette): TreeInfo {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  const trunkH = 55 * s
  const trunkW = 13 * s
  const lean = variant % 2 === 0 ? 5 * s : -4 * s

  // ── 根部（圆润叠加） ──
  ctx.globalAlpha = 0.55
  for (let i = -1; i <= 1; i++) {
    ctx.fillStyle = i === 0 ? palette.trunk : palette.trunkDark
    ctx.beginPath()
    ctx.ellipse(i * trunkW * 0.55, -2 * s, trunkW * 0.35, 5 * s, i * 0.4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // ── 主干（圆润贝塞尔曲线） ──
  // 树干阴影
  ctx.globalAlpha = 0.15
  ctx.fillStyle = palette.trunkDark
  ctx.beginPath()
  ctx.moveTo(-trunkW / 2 + 2, 0)
  ctx.bezierCurveTo(-trunkW / 2 + lean * 0.3 + 2, -trunkH * 0.3, -trunkW / 2 + lean * 0.6 + 2, -trunkH * 0.6, lean - trunkW / 2 + 2, -trunkH)
  ctx.lineTo(lean + trunkW / 2 + 2, -trunkH)
  ctx.bezierCurveTo(lean + trunkW / 2 - lean * 0.3 + 2, -trunkH * 0.7, trunkW / 2 - lean * 0.3 + 2, -trunkH * 0.4, trunkW / 2 + 2, 0)
  ctx.closePath()
  ctx.fill()
  // 树干主体
  ctx.globalAlpha = 0.88
  ctx.fillStyle = palette.trunk
  ctx.beginPath()
  ctx.moveTo(-trunkW / 2, 0)
  ctx.bezierCurveTo(-trunkW / 2 + lean * 0.3, -trunkH * 0.3, -trunkW / 2 + lean * 0.6, -trunkH * 0.6, lean - trunkW / 2, -trunkH)
  ctx.lineTo(lean + trunkW / 2, -trunkH)
  ctx.bezierCurveTo(lean + trunkW / 2 - lean * 0.3, -trunkH * 0.7, trunkW / 2 - lean * 0.3, -trunkH * 0.4, trunkW / 2, 0)
  ctx.closePath()
  ctx.fill()
  // 树干高光（左侧）
  ctx.globalAlpha = 0.22
  ctx.fillStyle = '#D97706'
  ctx.beginPath()
  ctx.moveTo(-trunkW / 2 + 1 * s, -2 * s)
  ctx.bezierCurveTo(-trunkW / 2 + lean * 0.3 + 1 * s, -trunkH * 0.3, -trunkW / 2 + lean * 0.6 + 1 * s, -trunkH * 0.6, lean - trunkW / 2 + 1 * s, -trunkH + 5 * s)
  ctx.lineTo(lean - trunkW / 2 + trunkW * 0.28, -trunkH + 5 * s)
  ctx.bezierCurveTo(-trunkW / 2 + lean * 0.6 + trunkW * 0.28, -trunkH * 0.6, -trunkW / 2 + lean * 0.3 + trunkW * 0.28, -trunkH * 0.3, -trunkW / 2 + trunkW * 0.28, -2 * s)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 树洞（圆润椭圆） ──
  ctx.globalAlpha = 0.45
  ctx.fillStyle = palette.trunkDark
  ctx.beginPath()
  ctx.ellipse(lean * 0.35, -trunkH * 0.32, trunkW * 0.25, trunkW * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#FDE68A'
  ctx.beginPath()
  ctx.ellipse(lean * 0.35 - 1 * s, -trunkH * 0.32 - 1 * s, trunkW * 0.12, trunkW * 0.18, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 枝干（圆润曲线） ──
  ctx.globalAlpha = 0.82
  const branches = [
    { bx: lean * 0.5, by: -trunkH * 0.62, ex: lean * 0.5 - 22 * s, ey: -trunkH * 0.84, w: 4.5 * s },
    { bx: lean * 0.62, by: -trunkH * 0.74, ex: lean * 0.62 + 18 * s, ey: -trunkH * 0.94, w: 3.8 * s },
    { bx: lean * 0.75, by: -trunkH * 0.86, ex: lean * 0.75 - 12 * s, ey: -trunkH * 1.06, w: 3 * s },
  ]
  for (const b of branches) {
    ctx.strokeStyle = palette.trunk
    ctx.lineWidth = b.w
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(b.bx, b.by)
    ctx.quadraticCurveTo((b.bx + b.ex) / 2, b.by - 10 * s, b.ex, b.ey)
    ctx.stroke()
    // 枝干高光
    ctx.globalAlpha = 0.2
    ctx.strokeStyle = '#D97706'
    ctx.lineWidth = b.w * 0.3
    ctx.beginPath()
    ctx.moveTo(b.bx - 1 * s, b.by)
    ctx.quadraticCurveTo((b.bx + b.ex) / 2 - 1 * s, b.by - 10 * s, b.ex - 1 * s, b.ey)
    ctx.stroke()
    ctx.globalAlpha = 0.82
  }
  ctx.globalAlpha = 1

  // ── 树冠（圆润球形叠加，对齐森林手法） ──
  const foliageGroups = [
    { cx: lean - 18 * s, cy: -trunkH * 0.9, r: 20 * s },
    { cx: lean + 12 * s, cy: -trunkH * 0.98, r: 17 * s },
    { cx: lean, cy: -trunkH * 1.06, r: 14 * s },
  ]

  const sway = Math.sin(frame * 0.025) * 1.5 * s

  for (const fg of foliageGroups) {
    // 底层阴影
    ctx.globalAlpha = 0.22
    ctx.fillStyle = palette.foliageDark
    ctx.beginPath()
    ctx.arc(fg.cx + 2 * s, fg.cy + sway + 3 * s, fg.r + 1 * s, 0, Math.PI * 2)
    ctx.fill()
    // 主体深绿
    ctx.globalAlpha = 0.75
    ctx.fillStyle = palette.foliageDark
    ctx.beginPath()
    ctx.arc(fg.cx, fg.cy + sway, fg.r, 0, Math.PI * 2)
    ctx.fill()
    // 中层
    ctx.globalAlpha = 0.65
    ctx.fillStyle = palette.foliage
    ctx.beginPath()
    ctx.arc(fg.cx - 1 * s, fg.cy + sway - 1 * s, fg.r * 0.82, 0, Math.PI * 2)
    ctx.fill()
    // 亮层
    ctx.globalAlpha = 0.5
    ctx.fillStyle = palette.foliageLight
    ctx.beginPath()
    ctx.arc(fg.cx - 2 * s, fg.cy + sway - 2 * s, fg.r * 0.6, 0, Math.PI * 2)
    ctx.fill()
    // 高光点
    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#BBF7D0'
    ctx.beginPath()
    ctx.arc(fg.cx - fg.r * 0.3, fg.cy + sway - fg.r * 0.3, fg.r * 0.22, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  ctx.restore()

  return {
    x,
    groundY,
    scale,
    branchY: -(trunkH * 0.8) / scale,
    branchDir: variant % 2 === 0 ? 1 : -1,
  }
}

/** 绘制竹篱笆（可爱版：圆润竹节+竹叶装饰+绑绳） */
export function drawBambooFence(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, _variant: number) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  const postCount = 6
  const spacing = 9 * s
  const postH = 24 * s
  const postW = 4.5 * s

  // ── 竹竿（圆润叠加） ──
  for (let i = 0; i < postCount; i++) {
    const px = (i - (postCount - 1) / 2) * spacing
    const h = postH * (0.88 + Math.sin(i * 1.3) * 0.1)
    const isEven = i % 2 === 0

    // 竹竿阴影
    ctx.globalAlpha = 0.1
    ctx.fillStyle = '#14532D'
    ctx.beginPath()
    ctx.roundRect(px - postW / 2 + 1, -h + 1, postW, h, postW / 2)
    ctx.fill()

    // 竹竿底层（深绿）
    ctx.globalAlpha = 0.82
    ctx.fillStyle = isEven ? '#15803D' : '#166534'
    ctx.beginPath()
    ctx.roundRect(px - postW / 2, -h, postW, h, postW / 2)
    ctx.fill()

    // 竹竿主层
    ctx.fillStyle = isEven ? '#22C55E' : '#16A34A'
    ctx.beginPath()
    ctx.roundRect(px - postW / 2 + 0.5 * s, -h, postW - 1 * s, h, postW / 2)
    ctx.fill()

    // 竹竿高光
    ctx.globalAlpha = 0.35
    ctx.fillStyle = '#BBF7D0'
    ctx.beginPath()
    ctx.roundRect(px - postW / 2 + 1 * s, -h + 2 * s, postW * 0.28, h - 4 * s, postW * 0.14)
    ctx.fill()
    ctx.globalAlpha = 1

    // ── 竹节（圆润横线） ──
    ctx.globalAlpha = 0.55
    ctx.strokeStyle = '#14532D'
    ctx.lineWidth = 1.2 * s
    ctx.lineCap = 'round'
    for (let j = 1; j <= 3; j++) {
      const ny = -(h * j * 0.27)
      ctx.beginPath()
      ctx.moveTo(px - postW / 2 - 0.5 * s, ny)
      ctx.lineTo(px + postW / 2 + 0.5 * s, ny)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // ── 竹叶（顶部装饰） ──
    if (i % 2 === 0) {
      ctx.globalAlpha = 0.65
      ctx.fillStyle = '#4ADE80'
      // 左叶
      ctx.beginPath()
      ctx.ellipse(px - 4 * s, -h - 2 * s, 4 * s, 1.5 * s, -0.5, 0, Math.PI * 2)
      ctx.fill()
      // 右叶
      ctx.beginPath()
      ctx.ellipse(px + 4 * s, -h - 1.5 * s, 4 * s, 1.5 * s, 0.5, 0, Math.PI * 2)
      ctx.fill()
      // 叶高光
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#BBF7D0'
      ctx.beginPath()
      ctx.ellipse(px - 3 * s, -h - 2.5 * s, 2 * s, 0.7 * s, -0.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  // ── 横绑绳（圆润，带绳结） ──
  const ropeYs = [postH * 0.38, postH * 0.72]
  for (const ry of ropeYs) {
    const startX = -(postCount / 2) * spacing
    const endX = (postCount / 2) * spacing

    // 绳子阴影
    ctx.globalAlpha = 0.12
    ctx.strokeStyle = '#78350F'
    ctx.lineWidth = 2.2 * s
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(startX, -ry + 0.8)
    ctx.lineTo(endX, -ry + 0.8)
    ctx.stroke()

    // 绳子主体
    ctx.globalAlpha = 0.65
    ctx.strokeStyle = '#D97706'
    ctx.lineWidth = 1.8 * s
    ctx.beginPath()
    ctx.moveTo(startX, -ry)
    ctx.lineTo(endX, -ry)
    ctx.stroke()

    // 绳结（每根竹竿处）
    for (let i = 0; i < postCount; i++) {
      const px = (i - (postCount - 1) / 2) * spacing
      ctx.globalAlpha = 0.7
      ctx.fillStyle = '#B45309'
      ctx.beginPath()
      ctx.arc(px, -ry, 1.5 * s, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

/** 绘制炊烟（从屋顶升起，带动画） */
export function drawSmoke(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number, frame: number) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  // 炊烟从屋顶顶点升起，屋顶高度约 bh+rh = 28s+24s = 52s
  const startY = -(52 * s + 3 * s)
  const smokeCount = 6

  for (let i = 0; i < smokeCount; i++) {
    // 每个粒子的相位偏移，让烟雾连续
    const phase = (i / smokeCount) + frame * 0.012
    const progress = (phase % 1)  // 0..1，0=刚出烟囱，1=消散
    const py = startY - progress * 55 * s
    // 水平飘移（随高度增加飘移更大）
    const sway = Math.sin(frame * 0.04 + i * 1.2) * progress * 8 * s
    const px = (variant % 2 === 0 ? -5 : 5) * s + sway
    // 粒子半径随高度增大
    const r = (2 + progress * 7) * s
    // 透明度随高度减小
    const alpha = (1 - progress) * 0.28

    ctx.globalAlpha = alpha
    ctx.fillStyle = '#E7E5E4'
    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 1
  ctx.restore()
}

/** 绘制晾衣绳（两根竹竿+绳子+衣物） */
export function drawClothesLine(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number, frame: number) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  const poleH = 32 * s
  const poleW = 3.5 * s
  const span = 38 * s  // 两竿间距

  // ── 左竹竿 ──
  for (let side = -1; side <= 1; side += 2) {
    const px = side * span / 2
    // 竿阴影
    ctx.globalAlpha = 0.1
    ctx.fillStyle = '#14532D'
    ctx.beginPath()
    ctx.roundRect(px - poleW / 2 + 1, -poleH + 1, poleW, poleH, poleW / 2)
    ctx.fill()
    // 竿底层
    ctx.globalAlpha = 0.82
    ctx.fillStyle = '#15803D'
    ctx.beginPath()
    ctx.roundRect(px - poleW / 2, -poleH, poleW, poleH, poleW / 2)
    ctx.fill()
    // 竿主层
    ctx.fillStyle = '#22C55E'
    ctx.beginPath()
    ctx.roundRect(px - poleW / 2 + 0.5 * s, -poleH, poleW - 1 * s, poleH, poleW / 2)
    ctx.fill()
    // 竿高光
    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#BBF7D0'
    ctx.beginPath()
    ctx.roundRect(px - poleW / 2 + 1 * s, -poleH + 2 * s, poleW * 0.28, poleH - 4 * s, poleW * 0.14)
    ctx.fill()
    // 竹节
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = '#14532D'
    ctx.lineWidth = 1 * s
    ctx.lineCap = 'round'
    for (let j = 1; j <= 3; j++) {
      const ny = -(poleH * j * 0.28)
      ctx.beginPath()
      ctx.moveTo(px - poleW / 2 - 0.5 * s, ny)
      ctx.lineTo(px + poleW / 2 + 0.5 * s, ny)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  // ── 绳子（微微下垂的弧线） ──
  const ropeY = -poleH + 3 * s
  const sag = 5 * s  // 下垂量
  ctx.globalAlpha = 0.65
  ctx.strokeStyle = '#D97706'
  ctx.lineWidth = 1 * s
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-span / 2, ropeY)
  ctx.quadraticCurveTo(0, ropeY + sag, span / 2, ropeY)
  ctx.stroke()
  ctx.globalAlpha = 1

  // ── 衣物（挂在绳上，随风轻摆） ──
  const clothes = [
    { ox: -span * 0.35, color: '#FCA5A5', darkColor: '#F87171', type: 0 },  // 红色上衣
    { ox: -span * 0.08, color: '#93C5FD', darkColor: '#60A5FA', type: 1 },  // 蓝色裤子
    { ox: span * 0.18, color: '#FDE68A', darkColor: '#FCD34D', type: 0 },   // 黄色上衣
    { ox: span * 0.38, color: '#A7F3D0', darkColor: '#6EE7B7', type: 2 },   // 绿色方巾
  ]

  for (const c of clothes) {
    // 随风轻摆
    const swing = Math.sin(frame * 0.035 + c.ox * 0.05) * 1.5 * s
    const cx = c.ox
    // 挂钩（小圆点）
    ctx.globalAlpha = 0.7
    ctx.fillStyle = '#B45309'
    ctx.beginPath()
    // 计算绳子在该x处的y（抛物线）
    const t = (cx + span / 2) / span
    const ry = ropeY + sag * 4 * t * (1 - t)
    ctx.arc(cx, ry, 1.2 * s, 0, Math.PI * 2)
    ctx.fill()

    ctx.save()
    ctx.translate(cx, ry + 1 * s)
    ctx.rotate(swing * 0.04)

    if (c.type === 0) {
      // 上衣：梯形身+两袖
      ctx.globalAlpha = 0.82
      ctx.fillStyle = c.color
      ctx.beginPath()
      ctx.roundRect(-5 * s, 0, 10 * s, 10 * s, 1.5 * s)
      ctx.fill()
      // 暗面
      ctx.globalAlpha = 0.25
      ctx.fillStyle = c.darkColor
      ctx.beginPath()
      ctx.roundRect(2 * s, 0, 3 * s, 10 * s, [0, 1.5 * s, 1.5 * s, 0])
      ctx.fill()
      // 左袖
      ctx.globalAlpha = 0.75
      ctx.fillStyle = c.color
      ctx.beginPath()
      ctx.roundRect(-8 * s, 0, 3.5 * s, 5 * s, 1 * s)
      ctx.fill()
      // 右袖
      ctx.beginPath()
      ctx.roundRect(4.5 * s, 0, 3.5 * s, 5 * s, 1 * s)
      ctx.fill()
      // 高光
      ctx.globalAlpha = 0.25
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.roundRect(-4.5 * s, 0.5 * s, 2 * s, 8 * s, 1 * s)
      ctx.fill()
    } else if (c.type === 1) {
      // 裤子：两条裤腿
      ctx.globalAlpha = 0.82
      ctx.fillStyle = c.color
      ctx.beginPath()
      ctx.roundRect(-5 * s, 0, 10 * s, 5 * s, 1 * s)
      ctx.fill()
      // 左腿
      ctx.beginPath()
      ctx.roundRect(-5 * s, 4 * s, 4 * s, 8 * s, 1 * s)
      ctx.fill()
      // 右腿
      ctx.beginPath()
      ctx.roundRect(1 * s, 4 * s, 4 * s, 8 * s, 1 * s)
      ctx.fill()
      // 暗面
      ctx.globalAlpha = 0.2
      ctx.fillStyle = c.darkColor
      ctx.beginPath()
      ctx.roundRect(2 * s, 0, 3 * s, 5 * s, [0, 1 * s, 1 * s, 0])
      ctx.fill()
    } else {
      // 方巾：简单矩形
      ctx.globalAlpha = 0.78
      ctx.fillStyle = c.color
      ctx.beginPath()
      ctx.roundRect(-4 * s, 0, 8 * s, 8 * s, 1.5 * s)
      ctx.fill()
      ctx.globalAlpha = 0.2
      ctx.fillStyle = c.darkColor
      ctx.beginPath()
      ctx.roundRect(1.5 * s, 0, 2.5 * s, 8 * s, [0, 1.5 * s, 1.5 * s, 0])
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.restore()
  }

  ctx.restore()
}

/** 绘制夯土围墙（低矮，连接房屋） */
export function drawMudWall(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, variant: number) {
  ctx.save()
  ctx.translate(x, groundY)

  const s = scale
  const wallW = (variant === 0 ? 55 : 45) * s
  const wallH = 14 * s
  const dir = variant % 2 === 0 ? 1 : -1

  // ── 墙体（多层叠加） ──
  // 阴影
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#451A03'
  ctx.beginPath()
  ctx.roundRect(dir > 0 ? 0 : -wallW, -wallH + 1.5, wallW, wallH, [2 * s, 2 * s, 0, 0])
  ctx.fill()
  // 主体（夯土暖棕）
  ctx.globalAlpha = 0.82
  ctx.fillStyle = '#D97706'
  ctx.beginPath()
  ctx.roundRect(dir > 0 ? 0 : -wallW, -wallH, wallW, wallH, [2 * s, 2 * s, 0, 0])
  ctx.fill()
  // 暗面（右侧）
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#92400E'
  ctx.beginPath()
  ctx.roundRect(dir > 0 ? wallW * 0.65 : -wallW, -wallH, wallW * 0.35, wallH, dir > 0 ? [0, 2 * s, 0, 0] : [2 * s, 0, 0, 0])
  ctx.fill()
  // 高光（顶部）
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#FDE68A'
  ctx.beginPath()
  ctx.roundRect(dir > 0 ? 1 * s : -wallW + 1 * s, -wallH, wallW - 2 * s, 2.5 * s, [2 * s, 2 * s, 0, 0])
  ctx.fill()
  ctx.globalAlpha = 1

  // ── 夯土纹理（横向裂缝） ──
  ctx.globalAlpha = 0.12
  ctx.strokeStyle = '#78350F'
  ctx.lineWidth = 0.7 * s
  ctx.lineCap = 'round'
  const startX = dir > 0 ? 0 : -wallW
  for (let row = 1; row <= 2; row++) {
    const ry = -wallH + wallH * row * 0.35
    ctx.beginPath()
    ctx.moveTo(startX + 2 * s, ry)
    ctx.lineTo(startX + wallW - 2 * s, ry)
    ctx.stroke()
  }
  // 竖向砖缝（错位）
  for (let col = 1; col <= 4; col++) {
    const cx = startX + wallW * col * 0.22
    const rowOffset = col % 2 === 0 ? 0 : wallH * 0.35
    ctx.beginPath()
    ctx.moveTo(cx, -wallH + rowOffset)
    ctx.lineTo(cx, -wallH + rowOffset + wallH * 0.35)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // ── 墙顶瓦片（小圆弧装饰） ──
  ctx.globalAlpha = 0.55
  ctx.fillStyle = '#78350F'
  const tileCount = Math.floor(wallW / (6 * s))
  for (let i = 0; i < tileCount; i++) {
    const tx = startX + (i + 0.5) * (wallW / tileCount)
    ctx.beginPath()
    ctx.ellipse(tx, -wallH, (wallW / tileCount) * 0.52, 2 * s, 0, Math.PI, 0)
    ctx.fill()
  }
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#FDE68A'
  for (let i = 0; i < tileCount; i++) {
    const tx = startX + (i + 0.5) * (wallW / tileCount)
    ctx.beginPath()
    ctx.ellipse(tx - 0.5 * s, -wallH - 0.5 * s, (wallW / tileCount) * 0.22, 0.8 * s, 0, Math.PI, 0)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.restore()
}

/** 古村落布局 */
export function getVillageLayout(w: number, _h: number): Array<{ type: string; x: number; scale: number; variant: number }> {
  const items: Array<{ type: string; x: number; scale: number; variant: number }> = []

  // ── 茅草屋（高低错落：大中小三种尺寸） ──
  // 大屋（主屋，居中偏左）
  items.push({ type: 'cottage', x: w * 0.18 + rand(-8, 8), scale: rand(1.0, 1.12), variant: 0 })
  // 中屋
  items.push({ type: 'cottage', x: w * 0.55 + rand(-8, 8), scale: rand(0.88, 0.98), variant: 1 })
  // 小屋（偏右，稍矮）
  items.push({ type: 'cottage', x: w * 0.82 + rand(-8, 8), scale: rand(0.72, 0.82), variant: 0 })
  // 额外小屋（最左，最小）
  items.push({ type: 'cottage', x: w * 0.04 + rand(-5, 5), scale: rand(0.62, 0.72), variant: 1 })

  // ── 炊烟（跟随茅草屋位置） ──
  items.push({ type: 'smoke', x: w * 0.18, scale: rand(0.95, 1.1), variant: 0 })
  items.push({ type: 'smoke', x: w * 0.55, scale: rand(0.88, 1.0), variant: 1 })

  // ── 夯土围墙（连接房屋） ──
  items.push({ type: 'mudWall', x: w * 0.32, scale: rand(0.9, 1.0), variant: 0 })
  items.push({ type: 'mudWall', x: w * 0.68, scale: rand(0.88, 0.98), variant: 1 })

  // ── 晾衣绳 ──
  items.push({ type: 'clothesLine', x: w * 0.42 + rand(-8, 8), scale: rand(0.88, 1.0), variant: 0 })

  // ── 古树（有可攀爬分支） ──
  items.push({ type: 'ancientTree', x: w * 0.36 + rand(-10, 10), scale: rand(0.9, 1.1), variant: 0 })
  items.push({ type: 'ancientTree', x: w * 0.72 + rand(-10, 10), scale: rand(0.85, 1.0), variant: 1 })

  // ── 石灯笼 ──
  items.push({ type: 'lantern', x: w * 0.25, scale: rand(0.85, 1.0), variant: 0 })
  items.push({ type: 'lantern', x: w * 0.46, scale: rand(0.85, 1.0), variant: 1 })
  items.push({ type: 'lantern', x: w * 0.65, scale: rand(0.85, 1.0), variant: 0 })

  // ── 竹篱笆 ──
  items.push({ type: 'bambooFence', x: w * 0.08, scale: rand(0.9, 1.05), variant: 0 })
  items.push({ type: 'bambooFence', x: w * 0.5, scale: rand(0.9, 1.05), variant: 1 })
  items.push({ type: 'bambooFence', x: w * 0.92, scale: rand(0.88, 1.0), variant: 0 })

  return items
}