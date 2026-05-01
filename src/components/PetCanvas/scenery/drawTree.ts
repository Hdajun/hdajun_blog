// ─── 场景绘制：树 ──────────────────────────────────────────────────────────────

import type { TreeInfo, Palette } from '../types'
import { setStroke } from '../utils'

function drawCloudCrown(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  circles: { cx: number; cy: number; r: number }[]
) {
  // 1) shadow / light layer underneath
  ctx.save()
  ctx.globalAlpha = 0.3
  for (const c of circles) {
    ctx.beginPath()
    ctx.arc(c.cx, c.cy + 4, c.r + 1, 0, Math.PI * 2)
    ctx.fillStyle = p.foliageDark
    ctx.fill()
  }
  ctx.restore()

  // 2) main green fill — draw all circles, no stroke yet
  for (const c of circles) {
    ctx.beginPath()
    ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2)
    ctx.fillStyle = p.foliage
    ctx.fill()
  }

  // 3) highlight on top-left of each puff
  ctx.save()
  ctx.globalAlpha = 0.3
  for (const c of circles) {
    ctx.beginPath()
    ctx.arc(c.cx - c.r * 0.25, c.cy - c.r * 0.25, c.r * 0.55, 0, Math.PI * 2)
    ctx.fillStyle = p.foliageLight
    ctx.fill()
  }
  ctx.restore()

  // 4) single smooth contour around the whole crown group
  setStroke(ctx, p.line, 1.5)
  if (circles.length < 2) {
    for (const c of circles) {
      ctx.beginPath()
      ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2)
      ctx.stroke()
    }
  } else {
    const cx = circles.reduce((s, c) => s + c.cx, 0) / circles.length
    const cy = circles.reduce((s, c) => s + c.cy, 0) / circles.length
    const steps = 48
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2
      const dx = Math.cos(angle)
      const dy = Math.sin(angle)
      let maxR = 0
      for (const c of circles) {
        const proj = (c.cx - cx) * dx + (c.cy - cy) * dy
        if (proj <= 0) continue
        const perpSq = (c.cx - cx) ** 2 + (c.cy - cy) ** 2 - proj * proj
        const rSq = c.r * c.r
        if (perpSq >= rSq) continue
        const ext = proj + Math.sqrt(rSq - perpSq)
        if (ext > maxR) maxR = ext
      }
      if (maxR === 0) {
        for (const c of circles) {
          const d = Math.hypot(c.cx - cx, c.cy - cy) + c.r
          if (d > maxR) maxR = d
        }
      }
      pts.push({ x: cx + dx * maxR, y: cy + dy * maxR })
    }
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const midX = (prev.x + curr.x) / 2
      const midY = (prev.y + curr.y) / 2
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
    }
    const last = pts[pts.length - 1]
    const first = pts[0]
    const midX = (last.x + first.x) / 2
    const midY = (last.y + first.y) / 2
    ctx.quadraticCurveTo(last.x, last.y, midX, midY)
    ctx.closePath()
    ctx.stroke()
  }
}

export function drawTree(ctx: CanvasRenderingContext2D, treeInfo: TreeInfo, variant: number, p: Palette) {
  const { x, groundY, scale: s, branchY, branchDir } = treeInfo

  ctx.save()
  ctx.translate(x, groundY)
  ctx.scale(s, s)

  // ── trunk ──
  ctx.beginPath()
  ctx.moveTo(-6, 2)
  ctx.quadraticCurveTo(-7, -20, -5, -50)
  ctx.lineTo(-2, -55)
  ctx.lineTo(2, -55)
  ctx.lineTo(5, -50)
  ctx.quadraticCurveTo(7, -20, 6, 2)
  ctx.closePath()
  ctx.fillStyle = p.trunk
  ctx.fill()
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  // trunk texture
  setStroke(ctx, p.trunkDark, 0.8)
  ctx.globalAlpha = 0.35
  ctx.beginPath(); ctx.moveTo(-1, -8); ctx.quadraticCurveTo(0, -28, 1, -48); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(3, -6); ctx.quadraticCurveTo(2, -24, 0, -44); ctx.stroke()
  ctx.globalAlpha = 1

  // ── horizontal branch (for monkey) ──
  if (branchY !== 0) {
    const bx = branchDir * 4
    const bex = branchDir * 38
    ctx.beginPath()
    ctx.moveTo(bx, branchY - 3)
    ctx.quadraticCurveTo(bx + (bex - bx) * 0.5, branchY - 6, bex, branchY - 2)
    ctx.lineTo(bex, branchY + 3)
    ctx.quadraticCurveTo(bx + (bex - bx) * 0.5, branchY + 1, bx, branchY + 2)
    ctx.closePath()
    ctx.fillStyle = p.trunk
    ctx.fill()
    setStroke(ctx, p.line, 1.2)
    ctx.stroke()
  }

  // ── crown: fluffy cloud puffs ──
  const crowns = variant === 0
    ? [
        { cx: 0, cy: -76, r: 22 },
        { cx: -18, cy: -66, r: 16 },
        { cx: 18, cy: -68, r: 17 },
        { cx: -8, cy: -86, r: 14 },
        { cx: 10, cy: -84, r: 15 },
        { cx: 0, cy: -94, r: 11 },
      ]
    : variant === 1
    ? [
        { cx: 2, cy: -74, r: 20 },
        { cx: -16, cy: -64, r: 15 },
        { cx: 16, cy: -62, r: 16 },
        { cx: -6, cy: -86, r: 13 },
        { cx: 8, cy: -84, r: 14 },
        { cx: 2, cy: -92, r: 10 },
      ]
    : [
        { cx: -2, cy: -72, r: 19 },
        { cx: -16, cy: -62, r: 14 },
        { cx: 14, cy: -60, r: 15 },
        { cx: -8, cy: -84, r: 12 },
        { cx: 6, cy: -82, r: 13 },
        { cx: -2, cy: -90, r: 9 },
      ]

  drawCloudCrown(ctx, p, crowns)

  ctx.restore()
}