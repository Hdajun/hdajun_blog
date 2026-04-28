'use client'

import { useRef, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type AnimalType = 'dog' | 'cat' | 'monkey' | 'elephant' | 'rabbit' | 'giraffe' | 'tiger' | 'lion' | 'panda'
type AnimalState = 'run' | 'idle' | 'sit'
type MonkeyPose = 'hang' | 'sit'

interface Animal {
  type: AnimalType
  x: number
  y: number
  vx: number
  vy: number
  dir: 1 | -1
  frame: number
  state: AnimalState
  wanderTimer: number
  wanderVx: number
  idleTimer: number
  sitTimer: number
  scale: number
  seekTimer: number
  treeIndex?: number
  monkeyPose?: MonkeyPose
  monkeyTimer?: number
  thoughtText?: string
  thoughtTimer?: number
}

interface Scenery {
  type: 'tree' | 'rock' | 'grass' | 'flower'
  x: number
  scale: number
  variant: number
}

interface TreeInfo {
  x: number
  groundY: number
  scale: number
  branchY: number
  branchDir: 1 | -1
}

interface ClickTarget {
  x: number
  y: number
  active: boolean
  timer: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GROUND_Y_RATIO = 0.72
const DAMPING = 0.96
const MAX_SPEED_NORMAL = 1.0
const MAX_SPEED_SEEK = 1.6
const SEEK_FORCE = 0.12
const SEEK_DURATION = 180
const MONKEY_SWITCH_INTERVAL = 300
const REPEL_DIST = 60
const REPEL_FORCE = 0.08

// ─── Color palettes ───────────────────────────────────────────────────────────

const PALETTE_LIGHT = {
  line: '#4b5563',
  trunk: '#8B6F47',
  trunkDark: '#6B5235',
  foliage: '#6BBF6B',
  foliageDark: '#4A9E4A',
  foliageLight: '#8FD88F',
  grass: '#7BC67B',
  grassDark: '#5AA85A',
  flowerPetals: ['#F472B6', '#FB923C', '#A78BFA', '#FBBF24', '#F87171'],
  flowerCenter: '#FBBF24',
  rock: '#A8B0B8',
  rockDark: '#8A929A',
  rockLight: '#C2C8CE',
  // animal colors
  dogBody: '#C4956A',
  dogBelly: '#E0C9A8',
  catBody: '#F5A623',
  catBelly: '#FDE8C8',
  elephantBody: '#9EAAB4',
  elephantBelly: '#C4CED6',
  rabbitBody: '#F0E6DC',
  rabbitBelly: '#FFFFFF',
  rabbitEar: '#F5B0B0',
  giraffeBody: '#E8C45A',
  giraffeBelly: '#F5E0A0',
  giraffeSpot: '#C49A2A',
  monkeyBody: '#A0764A',
  monkeyBelly: '#D4B88C',
  monkeyFace: '#E8D4B8',
  tigerBody: '#E8A030',
  tigerBelly: '#F5D898',
  tigerStripe: '#3D2B1A',
  lionBody: '#D4A84A',
  lionBelly: '#F0DCA0',
  lionMane: '#B07820',
  pandaBody: '#F0F0F0',
  pandaBlack: '#2A2A2A',
  pandaBelly: '#FFFFFF',
}

const PALETTE_DARK = {
  line: '#9ca3af',
  trunk: '#7A6240',
  trunkDark: '#5A4228',
  foliage: '#3D7A3D',
  foliageDark: '#2D5E2D',
  foliageLight: '#4E8E4E',
  grass: '#3D7A3D',
  grassDark: '#2D5E2D',
  flowerPetals: ['#9B6B8E', '#B07A5A', '#7E6FA8', '#A8924A', '#A86060'],
  flowerCenter: '#A8924A',
  rock: '#5A6268',
  rockDark: '#444C52',
  rockLight: '#6E767C',
  dogBody: '#8A6A4A',
  dogBelly: '#A08868',
  catBody: '#B07A1A',
  catBelly: '#C89848',
  elephantBody: '#6A7A84',
  elephantBelly: '#8A949C',
  rabbitBody: '#A8A098',
  rabbitBelly: '#C0B8B0',
  rabbitEar: '#B08080',
  giraffeBody: '#A08838',
  giraffeBelly: '#B8A060',
  giraffeSpot: '#806820',
  monkeyBody: '#705432',
  monkeyBelly: '#907050',
  monkeyFace: '#A08868',
  tigerBody: '#A07020',
  tigerBelly: '#B89850',
  tigerStripe: '#1A1510',
  lionBody: '#907030',
  lionBelly: '#A89060',
  lionMane: '#704C12',
  pandaBody: '#A0A0A0',
  pandaBlack: '#1A1A1A',
  pandaBelly: '#B8B8B8',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
function rand(a: number, b: number) { return a + Math.random() * (b - a) }

function setStroke(ctx: CanvasRenderingContext2D, color: string, lw = 2) {
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

function fillEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

function getPalette() {
  return document.documentElement.classList.contains('dark') ? PALETTE_DARK : PALETTE_LIGHT
}

// ─── Thought bubbles ──────────────────────────────────────────────────────────

const THOUGHTS = [
  '今天天气真好~',
  '好想出去玩呀',
  '你在看我吗？',
  '摸摸我嘛~',
  '有点饿了…',
  '好困，想睡觉',
  '嘿嘿嘿~',
  '你是男生还是女生？',
  '今天吃什么好呢',
  '快陪我玩！',
  '我跑得可快了',
  '这个画面真好看',
  '我是最可爱的！',
  '要不要一起散步？',
  '好无聊呀~',
  '你点击了我一下！',
  '我超乖的对不对',
  '想晒太阳…',
  '今天也是元气满满！',
  '偷偷告诉你个秘密…',
  '刚才那个梦好奇怪',
  '谁在说我的坏话？',
  '哼，我才不生气呢',
  '世界那么大，我想去看看',
  '今天的云好像棉花糖',
  '有没有小鱼干吃？',
  '我是全场的焦点！',
  '怎么还不下班呀',
  '要不要一起发呆？',
  '刚才是不是有人叫我',
  '想喝奶茶了~',
  '我有一个大胆的想法',
  '别看我，我会害羞的',
  '今天又是摸鱼的一天',
  '谁能给我梳梳毛呀',
  '我想当一只咸鱼',
  '你笑什么笑！',
  '这个问题我想了很久…',
  '我好像听到开罐头的声音',
  '等等我！别跑那么快',
]

const THOUGHT_DURATION = 300
const THOUGHT_COOLDOWN = 300

function drawThoughtBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, progress: number, scale: number) {
  // progress: 0→1 (appear→fade), bubble visible when progress < 1
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

  // bubble body
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

// ─── Scenery drawing ──────────────────────────────────────────────────────────

// Draw a fluffy cloud-like tree crown using overlapping circles
// Only one outer contour stroke for the whole group
function drawCloudCrown(
  ctx: CanvasRenderingContext2D,
  p: ReturnType<typeof getPalette>,
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
  //    Use a union path: trace the convex-ish outline by walking
  //    around the outermost edges of the circle cluster
  setStroke(ctx, p.line, 1.5)
  if (circles.length < 2) {
    for (const c of circles) {
      ctx.beginPath()
      ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2)
      ctx.stroke()
    }
  } else {
    // compute outline using angle sweep from centroid
    const cx = circles.reduce((s, c) => s + c.cx, 0) / circles.length
    const cy = circles.reduce((s, c) => s + c.cy, 0) / circles.length
    const steps = 48
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2
      const dx = Math.cos(angle)
      const dy = Math.sin(angle)
      // find max distance along this ray that is inside any circle
      let maxR = 0
      for (const c of circles) {
        // project circle center onto ray
        const proj = (c.cx - cx) * dx + (c.cy - cy) * dy
        if (proj <= 0) continue
        const perpSq = (c.cx - cx) ** 2 + (c.cy - cy) ** 2 - proj * proj
        const rSq = c.r * c.r
        if (perpSq >= rSq) continue
        const ext = proj + Math.sqrt(rSq - perpSq)
        if (ext > maxR) maxR = ext
      }
      if (maxR === 0) {
        // fallback: use farthest circle edge in this direction
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
    // close back to first point
    const last = pts[pts.length - 1]
    const first = pts[0]
    const midX = (last.x + first.x) / 2
    const midY = (last.y + first.y) / 2
    ctx.quadraticCurveTo(last.x, last.y, midX, midY)
    ctx.closePath()
    ctx.stroke()
  }
}

function drawTree(ctx: CanvasRenderingContext2D, treeInfo: TreeInfo, variant: number) {
  const p = getPalette()
  const { x, groundY, scale: s, branchY, branchDir } = treeInfo

  ctx.save()
  ctx.translate(x, groundY)
  ctx.scale(s, s)

  // ── trunk: thick, tapered, brown fill ──
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

function drawRock(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, variant: number) {
  const p = getPalette()
  ctx.save()
  ctx.translate(x, groundY)
  ctx.scale(s, s)

  if (variant % 4 === 0) {
    // round boulder
    ctx.beginPath()
    ctx.moveTo(-12, 0)
    ctx.quadraticCurveTo(-14, -8, -8, -14)
    ctx.quadraticCurveTo(-2, -18, 4, -16)
    ctx.quadraticCurveTo(10, -14, 12, -8)
    ctx.quadraticCurveTo(13, -2, 10, 2)
    ctx.quadraticCurveTo(4, 4, -4, 3)
    ctx.quadraticCurveTo(-10, 2, -12, 0)
    ctx.closePath()
    ctx.fillStyle = p.rock
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.5)
    ctx.stroke()
    // highlight
    ctx.beginPath()
    ctx.ellipse(-2, -10, 5, 3, -0.3, 0, Math.PI * 2)
    ctx.fillStyle = p.rockLight
    ctx.globalAlpha = 0.3
    ctx.fill()
    ctx.globalAlpha = 1
  } else if (variant % 4 === 1) {
    // tall thin rock
    ctx.beginPath()
    ctx.moveTo(-5, 0)
    ctx.quadraticCurveTo(-7, -8, -4, -18)
    ctx.quadraticCurveTo(-1, -22, 3, -20)
    ctx.quadraticCurveTo(6, -16, 5, -8)
    ctx.quadraticCurveTo(5, -2, 4, 1)
    ctx.closePath()
    ctx.fillStyle = p.rock
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.5)
    ctx.stroke()
    // crack
    setStroke(ctx, p.rockDark, 0.8)
    ctx.globalAlpha = 0.4
    ctx.beginPath()
    ctx.moveTo(0, -16)
    ctx.quadraticCurveTo(1, -10, -1, -4)
    ctx.stroke()
    ctx.globalAlpha = 1
  } else if (variant % 4 === 2) {
    // flat wide rock
    ctx.beginPath()
    ctx.moveTo(-16, 0)
    ctx.quadraticCurveTo(-18, -5, -12, -8)
    ctx.quadraticCurveTo(-4, -10, 4, -9)
    ctx.quadraticCurveTo(12, -8, 16, -4)
    ctx.quadraticCurveTo(17, 0, 14, 2)
    ctx.quadraticCurveTo(6, 3, -4, 3)
    ctx.quadraticCurveTo(-12, 2, -16, 0)
    ctx.closePath()
    ctx.fillStyle = p.rock
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.5)
    ctx.stroke()
    // top highlight
    ctx.beginPath()
    ctx.ellipse(0, -6, 8, 2.5, 0, 0, Math.PI * 2)
    ctx.fillStyle = p.rockLight
    ctx.globalAlpha = 0.25
    ctx.fill()
    ctx.globalAlpha = 1
  } else {
    // two small rocks clustered
    ctx.beginPath()
    ctx.moveTo(-8, 0)
    ctx.quadraticCurveTo(-9, -6, -5, -9)
    ctx.quadraticCurveTo(-1, -11, 3, -8)
    ctx.quadraticCurveTo(5, -4, 4, 0)
    ctx.closePath()
    ctx.fillStyle = p.rock
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.3)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(6, 0)
    ctx.quadraticCurveTo(5, -4, 8, -7)
    ctx.quadraticCurveTo(12, -9, 14, -5)
    ctx.quadraticCurveTo(14, -1, 12, 1)
    ctx.closePath()
    ctx.fillStyle = p.rock
    ctx.globalAlpha = 0.3
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.3)
    ctx.stroke()
  }

  ctx.restore()
}

function drawGrass(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, variant: number, frame: number) {
  const p = getPalette()
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

function drawFlower(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, variant: number, frame: number) {
  const p = getPalette()
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

// ─── Animal drawing ───────────────────────────────────────────────────────────

function drawDog(ctx: CanvasRenderingContext2D, a: Animal) {
  const p = getPalette()
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.18) * 1.5 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body fill
  ctx.beginPath()
  ctx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.dogBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // belly
  fillEllipse(ctx, 0, 3, 16, 5, p.dogBelly, 0.3)

  // head
  ctx.beginPath()
  ctx.ellipse(22, -4, 10, 9, 0.1, 0, Math.PI * 2)
  ctx.fillStyle = p.dogBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // ear
  const earWag = Math.sin(frame * 0.1) * 2
  ctx.beginPath()
  ctx.ellipse(26, 1 + earWag, 4.5, 9, 0.3, 0, Math.PI * 2)
  ctx.fillStyle = p.dogBody
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // eye
  dot(ctx, 25, -7, 2, p.line)
  ctx.save(); ctx.globalAlpha = 0.6; dot(ctx, 25.7, -7.8, 0.7, '#fff'); ctx.restore()
  dot(ctx, 31, -3, 1.8, p.line)

  // smile
  setStroke(ctx, p.line, 1.3)
  ctx.beginPath()
  ctx.arc(28, -1, 3, 0.1, Math.PI * 0.85)
  ctx.stroke()
  setStroke(ctx, p.line, 2)

  // tail
  const wag = Math.sin(frame * (0.18 + speed * 0.08)) * (0.4 + speed * 0.15)
  ctx.beginPath()
  ctx.moveTo(-22, -3)
  ctx.quadraticCurveTo(-28, -8 + wag * 6, -25, -14 + wag * 4)
  ctx.stroke()

  // legs
  const legFreq = 0.16 + speed * 0.06
  const legAmp = state === 'run' ? 8 : 1
  const legs = [
    { bx: -14, phase: 0 }, { bx: -6, phase: Math.PI },
    { bx: 6, phase: Math.PI * 0.5 }, { bx: 14, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of legs) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.4 + 0.8) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 8)
    ctx.quadraticCurveTo(bx + swing * 0.3, 14, bx + swing * 0.5, 18)
    ctx.stroke()
    dot(ctx, bx + swing * 0.5, 18, 1.3, p.line)
  }

  ctx.restore()
}

function drawCat(ctx: CanvasRenderingContext2D, a: Animal) {
  const p = getPalette()
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.2) * 1 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 2, 14, 10, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.catBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  fillEllipse(ctx, 0, 5, 9, 5, p.catBelly, 0.3)

  // head
  ctx.beginPath()
  ctx.arc(13, -8, 11, 0, Math.PI * 2)
  ctx.fillStyle = p.catBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // ears
  ctx.beginPath()
  ctx.moveTo(6, -16); ctx.lineTo(9, -24); ctx.lineTo(14, -17); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(16, -17); ctx.lineTo(21, -25); ctx.lineTo(24, -16); ctx.stroke()
  // inner ears
  ctx.beginPath()
  ctx.moveTo(8, -17); ctx.lineTo(10, -22); ctx.lineTo(13, -17); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(18, -17); ctx.lineTo(20, -23); ctx.lineTo(22, -17); ctx.stroke()

  // eyes
  dot(ctx, 10, -9, 2.2, p.line)
  dot(ctx, 17, -9, 2.2, p.line)
  ctx.save(); ctx.globalAlpha = 0.6
  dot(ctx, 10.7, -9.8, 0.7, '#fff'); dot(ctx, 17.7, -9.8, 0.7, '#fff')
  ctx.restore()

  // nose
  ctx.beginPath()
  ctx.moveTo(13.5, -5); ctx.lineTo(12, -3.5); ctx.lineTo(15, -3.5)
  ctx.closePath(); ctx.fillStyle = p.line; ctx.fill()

  // whiskers
  setStroke(ctx, p.line, 1)
  const wh = [[4, -5, -6, -7], [4, -3, -6, -3], [23, -5, 35, -7], [23, -3, 35, -3]]
  for (const [sx, sy, ex, ey] of wh) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()
  }
  setStroke(ctx, p.line, 2)

  // tail
  const ts = Math.sin(frame * 0.1 * (speed * 0.3 + 0.8)) * 12
  ctx.beginPath()
  ctx.moveTo(-12, 4)
  ctx.bezierCurveTo(-20, 8, -26 + ts * 0.4, 16, -20 + ts * 0.6, 24)
  ctx.bezierCurveTo(-16 + ts * 0.3, 28, -12 + ts * 0.2, 26, -14, 22)
  ctx.stroke()

  // legs
  const legFreq = 0.18 + speed * 0.06
  const legAmp = state === 'run' ? 8 : 1
  const cl = [
    { bx: -8, phase: 0 }, { bx: -2, phase: Math.PI },
    { bx: 5, phase: Math.PI * 0.5 }, { bx: 10, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of cl) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.4 + 0.8) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 10)
    ctx.quadraticCurveTo(bx + swing * 0.3, 15, bx + swing * 0.5, 20)
    ctx.stroke()
  }

  ctx.restore()
}

function drawElephant(ctx: CanvasRenderingContext2D, a: Animal) {
  const p = getPalette()
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.14) * 2 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 2, 28, 18, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.elephantBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2.2)
  ctx.stroke()

  fillEllipse(ctx, 0, 6, 18, 10, p.elephantBelly, 0.25)

  // head
  ctx.beginPath()
  ctx.arc(26, -6, 14, 0, Math.PI * 2)
  ctx.fillStyle = p.elephantBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2.2)
  ctx.stroke()

  // ear
  const earFlap = Math.sin(frame * 0.06) * 3
  ctx.beginPath()
  ctx.ellipse(34, -2 + earFlap, 10, 14, 0.2, 0, Math.PI * 2)
  ctx.fillStyle = p.elephantBody
  ctx.globalAlpha = 0.35
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // trunk
  const trunkSwing = Math.sin(frame * 0.08) * 6
  ctx.beginPath()
  ctx.moveTo(36, 0)
  ctx.bezierCurveTo(40, 8, 38 + trunkSwing, 18, 32 + trunkSwing * 0.5, 22)
  ctx.bezierCurveTo(28 + trunkSwing * 0.3, 24, 26 + trunkSwing * 0.2, 20, 28, 16)
  ctx.stroke()

  // eye
  dot(ctx, 28, -9, 2, p.line)
  ctx.save(); ctx.globalAlpha = 0.5; dot(ctx, 28.7, -9.8, 0.7, '#fff'); ctx.restore()

  // tusk
  setStroke(ctx, p.line, 1.5)
  ctx.beginPath()
  ctx.moveTo(32, 0)
  ctx.quadraticCurveTo(36, 6, 34, 12)
  ctx.stroke()
  setStroke(ctx, p.line, 2.2)

  // tail
  const tw = Math.sin(frame * 0.1) * 4
  ctx.beginPath()
  ctx.moveTo(-28, 0); ctx.quadraticCurveTo(-34, -4 + tw, -32, -10 + tw); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-32, -10 + tw); ctx.lineTo(-34, -14 + tw)
  ctx.moveTo(-32, -10 + tw); ctx.lineTo(-30, -14 + tw)
  ctx.stroke()

  // legs
  const legFreq = 0.12 + speed * 0.04
  const legAmp = state === 'run' ? 7 : 1
  const el = [
    { bx: -16, phase: 0 }, { bx: -6, phase: Math.PI },
    { bx: 10, phase: Math.PI * 0.5 }, { bx: 20, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of el) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.3 + 0.6) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx - 3, 18); ctx.lineTo(bx - 3 + swing * 0.3, 28)
    ctx.moveTo(bx + 3, 18); ctx.lineTo(bx + 3 + swing * 0.3, 28)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(bx + swing * 0.3, 28, 4, 2, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}

function drawRabbit(ctx: CanvasRenderingContext2D, a: Animal) {
  const p = getPalette()
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.22) * 2 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 2, 12, 10, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()

  fillEllipse(ctx, 0, 5, 8, 5, p.rabbitBelly, 0.3)

  // head
  ctx.beginPath()
  ctx.arc(10, -6, 9, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()

  // ears
  const earTwitch = Math.sin(frame * 0.08) * 2
  ctx.beginPath()
  ctx.ellipse(6, -22 + earTwitch, 3.5, 10, -0.15, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()
  // inner ear
  ctx.beginPath()
  ctx.ellipse(6, -22 + earTwitch, 2, 7, -0.15, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitEar
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.beginPath()
  ctx.ellipse(13, -23 - earTwitch, 3.5, 10, 0.15, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.8)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(13, -23 - earTwitch, 2, 7, 0.15, 0, Math.PI * 2)
  ctx.fillStyle = p.rabbitEar
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1

  // eye
  dot(ctx, 12, -7, 2, p.line)
  ctx.save(); ctx.globalAlpha = 0.5; dot(ctx, 12.6, -7.7, 0.6, '#fff'); ctx.restore()
  dot(ctx, 17, -4, 1.3, p.line)

  // whiskers
  setStroke(ctx, p.line, 0.8)
  ctx.beginPath(); ctx.moveTo(16, -3); ctx.lineTo(24, -5); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(16, -2); ctx.lineTo(24, -1); ctx.stroke()

  // tail
  setStroke(ctx, p.line, 1.8)
  ctx.beginPath(); ctx.arc(-12, 0, 5, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(-13, -2, 3, 0, Math.PI * 2); ctx.stroke()

  // legs
  const legFreq = 0.2 + speed * 0.08
  const legAmp = state === 'run' ? 7 : 1
  const rl = [
    { bx: -6, phase: 0 }, { bx: -1, phase: Math.PI },
    { bx: 5, phase: Math.PI * 0.5 }, { bx: 9, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of rl) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.4 + 0.8) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 10)
    ctx.quadraticCurveTo(bx + swing * 0.3, 14, bx + swing * 0.5, 17)
    ctx.stroke()
  }

  ctx.restore()
}

function drawGiraffe(ctx: CanvasRenderingContext2D, a: Animal) {
  const p = getPalette()
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.12) * 1.5 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 2, 20, 12, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.giraffeBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  fillEllipse(ctx, 0, 6, 14, 6, p.giraffeBelly, 0.25)

  // spots
  const spots = [[-8, 0, 3], [4, -2, 2.5], [-2, 6, 2], [10, 4, 2.5], [-14, -2, 2]]
  for (const [sx, sy, sr] of spots) {
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fillStyle = p.giraffeSpot
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // neck
  setStroke(ctx, p.line, 2)
  ctx.beginPath()
  ctx.moveTo(14, -6); ctx.quadraticCurveTo(18, -20, 16, -36); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(20, -4); ctx.quadraticCurveTo(24, -20, 22, -36); ctx.stroke()
  // neck fill
  ctx.beginPath()
  ctx.moveTo(14, -6); ctx.quadraticCurveTo(18, -20, 16, -36)
  ctx.lineTo(22, -36); ctx.quadraticCurveTo(24, -20, 20, -4)
  ctx.closePath()
  ctx.fillStyle = p.giraffeBody
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  // neck spots
  const neckSpots = [[18, -16, 2], [17, -26, 1.8]]
  for (const [sx, sy, sr] of neckSpots) {
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fillStyle = p.giraffeSpot
    ctx.globalAlpha = 0.3
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // head
  ctx.beginPath()
  ctx.ellipse(19, -42, 7, 5, 0.1, 0, Math.PI * 2)
  ctx.fillStyle = p.giraffeBody
  ctx.globalAlpha = 0.45
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // ossicones
  ctx.beginPath(); ctx.moveTo(16, -46); ctx.lineTo(15, -52); ctx.stroke()
  dot(ctx, 15, -52, 1.5, p.line)
  ctx.beginPath(); ctx.moveTo(22, -46); ctx.lineTo(23, -52); ctx.stroke()
  dot(ctx, 23, -52, 1.5, p.line)

  // ear
  ctx.beginPath()
  ctx.ellipse(12, -43, 3, 5, -0.3, 0, Math.PI * 2)
  ctx.stroke()

  // eye
  dot(ctx, 21, -43, 1.5, p.line)

  // tail
  const tw = Math.sin(frame * 0.08) * 4
  ctx.beginPath()
  ctx.moveTo(-20, 0); ctx.quadraticCurveTo(-26, 2 + tw, -24, 8 + tw); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-24, 8 + tw); ctx.lineTo(-26, 12 + tw)
  ctx.moveTo(-24, 8 + tw); ctx.lineTo(-22, 12 + tw)
  ctx.stroke()

  // legs
  const legFreq = 0.14 + speed * 0.05
  const legAmp = state === 'run' ? 9 : 1
  const gl = [
    { bx: -12, phase: 0 }, { bx: -4, phase: Math.PI },
    { bx: 8, phase: Math.PI * 0.5 }, { bx: 16, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of gl) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.3 + 0.6) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 12); ctx.lineTo(bx + swing * 0.3, 28); ctx.stroke()
    dot(ctx, bx + swing * 0.3, 28, 1.5, p.line)
  }

  ctx.restore()
}

// ── Tiger ─────────────────────────────────────────────────────────────────────

function drawTiger(ctx: CanvasRenderingContext2D, a: Animal) {
  const p = getPalette()
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.16) * 1.5 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 0, 20, 11, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.tigerBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // stripes on body
  setStroke(ctx, p.tigerStripe, 2.5)
  ctx.globalAlpha = 0.4
  const stripes = [[-12, -4, -8, 6], [-4, -6, 0, 8], [6, -5, 10, 7]]
  for (const [sx, sy, ex, ey] of stripes) {
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo((sx + ex) / 2, sy + 2, ex, ey)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)

  // belly
  fillEllipse(ctx, 0, 4, 14, 5, p.tigerBelly, 0.25)

  // head
  ctx.beginPath()
  ctx.arc(20, -3, 11, 0, Math.PI * 2)
  ctx.fillStyle = p.tigerBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // head stripes
  setStroke(ctx, p.tigerStripe, 2)
  ctx.globalAlpha = 0.35
  ctx.beginPath(); ctx.moveTo(16, -12); ctx.lineTo(18, -6); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(22, -13); ctx.lineTo(22, -6); ctx.stroke()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)

  // ears
  ctx.beginPath()
  ctx.arc(14, -12, 4, 0, Math.PI * 2)
  ctx.fillStyle = p.tigerBody
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(26, -12, 4, 0, Math.PI * 2)
  ctx.fillStyle = p.tigerBody
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.stroke()

  // eyes
  dot(ctx, 17, -5, 2, p.line)
  dot(ctx, 23, -5, 2, p.line)
  ctx.save(); ctx.globalAlpha = 0.5
  dot(ctx, 17.6, -5.6, 0.6, '#fff'); dot(ctx, 23.6, -5.6, 0.6, '#fff')
  ctx.restore()

  // nose
  ctx.beginPath()
  ctx.moveTo(20, -1); ctx.lineTo(18.5, 0.5); ctx.lineTo(21.5, 0.5)
  ctx.closePath(); ctx.fillStyle = p.line; ctx.fill()

  // mouth
  setStroke(ctx, p.line, 1.2)
  ctx.beginPath(); ctx.moveTo(20, 0.5); ctx.lineTo(20, 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(18, 2, 2, -0.2, Math.PI * 0.6); ctx.stroke()
  ctx.beginPath(); ctx.arc(22, 2, 2, Math.PI * 0.4, Math.PI + 0.2); ctx.stroke()
  setStroke(ctx, p.line, 2)

  // tail
  const tw = Math.sin(frame * 0.12) * 10
  ctx.beginPath()
  ctx.moveTo(-20, -2)
  ctx.bezierCurveTo(-26, 4, -32 + tw * 0.3, 14, -26 + tw * 0.6, 20)
  ctx.stroke()
  // tail tip
  setStroke(ctx, p.tigerStripe, 3)
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(-26 + tw * 0.6, 20)
  ctx.quadraticCurveTo(-24 + tw * 0.7, 24, -22 + tw * 0.5, 22)
  ctx.stroke()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)

  // legs
  const legFreq = 0.16 + speed * 0.06
  const legAmp = state === 'run' ? 8 : 1
  const tl = [
    { bx: -12, phase: 0 }, { bx: -4, phase: Math.PI },
    { bx: 6, phase: Math.PI * 0.5 }, { bx: 14, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of tl) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.4 + 0.8) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 9)
    ctx.quadraticCurveTo(bx + swing * 0.3, 14, bx + swing * 0.5, 19)
    ctx.stroke()
    dot(ctx, bx + swing * 0.5, 19, 1.5, p.line)
  }

  ctx.restore()
}

// ── Lion ──────────────────────────────────────────────────────────────────────

function drawLion(ctx: CanvasRenderingContext2D, a: Animal) {
  const p = getPalette()
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.14) * 2 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body
  ctx.beginPath()
  ctx.ellipse(0, 2, 22, 13, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.lionBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2.2)
  ctx.stroke()

  fillEllipse(ctx, 0, 6, 15, 6, p.lionBelly, 0.25)

  // tail
  const tw = Math.sin(frame * 0.1) * 8
  ctx.beginPath()
  ctx.moveTo(-22, -2)
  ctx.bezierCurveTo(-28, 4, -34 + tw * 0.3, 14, -28 + tw * 0.5, 20)
  ctx.stroke()
  // tail tuft
  ctx.beginPath()
  ctx.arc(-28 + tw * 0.5, 20, 4, 0, Math.PI * 2)
  ctx.fillStyle = p.lionMane
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  // mane — fluffy circle behind head
  const maneCx = 22
  const maneCy = -4
  const maneR = 16
  const manePuffs = 8
  for (let i = 0; i < manePuffs; i++) {
    const angle = (i / manePuffs) * Math.PI * 2
    const px = maneCx + Math.cos(angle) * (maneR - 3)
    const py = maneCy + Math.sin(angle) * (maneR - 3)
    ctx.beginPath()
    ctx.arc(px, py, 8, 0, Math.PI * 2)
    ctx.fillStyle = p.lionMane
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
  }
  // mane outline
  ctx.beginPath()
  ctx.arc(maneCx, maneCy, maneR, 0, Math.PI * 2)
  ctx.fillStyle = p.lionMane
  ctx.globalAlpha = 0.3
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  // head (on top of mane)
  ctx.beginPath()
  ctx.arc(22, -4, 10, 0, Math.PI * 2)
  ctx.fillStyle = p.lionBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // ears
  ctx.beginPath()
  ctx.arc(16, -12, 3.5, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(28, -12, 3.5, 0, Math.PI * 2)
  ctx.stroke()

  // eyes
  dot(ctx, 19, -6, 2, p.line)
  dot(ctx, 25, -6, 2, p.line)
  ctx.save(); ctx.globalAlpha = 0.5
  dot(ctx, 19.6, -6.6, 0.6, '#fff'); dot(ctx, 25.6, -6.6, 0.6, '#fff')
  ctx.restore()

  // nose
  ctx.beginPath()
  ctx.moveTo(22, -2); ctx.lineTo(20.5, -0.5); ctx.lineTo(23.5, -0.5)
  ctx.closePath(); ctx.fillStyle = p.line; ctx.fill()

  // mouth
  setStroke(ctx, p.line, 1.2)
  ctx.beginPath(); ctx.moveTo(22, -0.5); ctx.lineTo(22, 1.5); ctx.stroke()
  ctx.beginPath(); ctx.arc(20, 1.5, 2, -0.2, Math.PI * 0.6); ctx.stroke()
  ctx.beginPath(); ctx.arc(24, 1.5, 2, Math.PI * 0.4, Math.PI + 0.2); ctx.stroke()
  setStroke(ctx, p.line, 2.2)

  // legs
  const legFreq = 0.13 + speed * 0.05
  const legAmp = state === 'run' ? 7 : 1
  const ll = [
    { bx: -14, phase: 0 }, { bx: -5, phase: Math.PI },
    { bx: 7, phase: Math.PI * 0.5 }, { bx: 16, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of ll) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.3 + 0.6) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.moveTo(bx, 13)
    ctx.lineTo(bx + swing * 0.3, 24)
    ctx.stroke()
    dot(ctx, bx + swing * 0.3, 24, 1.5, p.line)
  }

  ctx.restore()
}

// ── Panda ─────────────────────────────────────────────────────────────────────

function drawPanda(ctx: CanvasRenderingContext2D, a: Animal) {
  const p = getPalette()
  const { x, y, dir, frame, state } = a
  const speed = Math.abs(a.vx)
  const bob = state === 'run' ? Math.sin(frame * 0.15) * 1.5 : 0

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(dir, 1)

  // body — white
  ctx.beginPath()
  ctx.ellipse(0, 2, 18, 14, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  fillEllipse(ctx, 0, 6, 12, 7, p.pandaBelly, 0.25)

  // head — white circle
  ctx.beginPath()
  ctx.arc(16, -4, 13, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBody
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()

  // black ears
  ctx.beginPath()
  ctx.arc(8, -14, 5, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.6
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(24, -14, 5, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.6
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.stroke()

  // black eye patches
  ctx.beginPath()
  ctx.ellipse(11, -6, 5, 4.5, -0.2, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.ellipse(21, -6, 5, 4.5, 0.2, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1

  // eyes — white dots in black patches
  dot(ctx, 12, -6, 2.2, '#fff')
  dot(ctx, 22, -6, 2.2, '#fff')
  dot(ctx, 12.6, -6.6, 0.8, p.pandaBlack)
  dot(ctx, 22.6, -6.6, 0.8, p.pandaBlack)

  // nose
  ctx.beginPath()
  ctx.ellipse(16.5, -1, 2.5, 1.8, 0, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.6
  ctx.fill()
  ctx.globalAlpha = 1

  // mouth
  setStroke(ctx, p.line, 1.2)
  ctx.beginPath(); ctx.moveTo(16.5, 0); ctx.lineTo(16.5, 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(14.5, 2, 2, -0.2, Math.PI * 0.5); ctx.stroke()
  ctx.beginPath(); ctx.arc(18.5, 2, 2, Math.PI * 0.5, Math.PI + 0.2); ctx.stroke()
  setStroke(ctx, p.line, 2)

  // arms — black
  const armSwing = state === 'run' ? Math.sin(frame * 0.15) * 4 : 0
  ctx.beginPath()
  ctx.ellipse(-14, 4 + armSwing, 5, 8, 0.3, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(10, 4 - armSwing, 5, 8, -0.3, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBlack
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.stroke()
  setStroke(ctx, p.line, 2)

  // legs — black
  const legFreq = 0.13 + speed * 0.05
  const legAmp = state === 'run' ? 6 : 1
  const pl = [
    { bx: -10, phase: 0 }, { bx: -2, phase: Math.PI },
    { bx: 6, phase: Math.PI * 0.5 }, { bx: 12, phase: Math.PI * 1.5 },
  ]
  for (const { bx, phase } of pl) {
    const swing = state === 'run' ? Math.sin(frame * legFreq * (speed * 0.3 + 0.6) + phase) * legAmp : 0
    ctx.beginPath()
    ctx.ellipse(bx + swing * 0.3, 16, 5, 6, 0, 0, Math.PI * 2)
    ctx.fillStyle = p.pandaBlack
    ctx.globalAlpha = 0.4
    ctx.fill()
    ctx.globalAlpha = 1
    setStroke(ctx, p.line, 1.8)
    ctx.stroke()
  }

  // tail
  ctx.beginPath()
  ctx.arc(-18, 0, 4, 0, Math.PI * 2)
  ctx.fillStyle = p.pandaBody
  ctx.globalAlpha = 0.4
  ctx.fill()
  ctx.globalAlpha = 1
  setStroke(ctx, p.line, 1.5)
  ctx.stroke()

  ctx.restore()
}

function drawMonkeyOnBranch(ctx: CanvasRenderingContext2D, a: Animal, treeInfo: TreeInfo) {
  const p = getPalette()
  const { frame } = a
  const pose = a.monkeyPose ?? 'hang'
  const { x, groundY, scale: s, branchY, branchDir } = treeInfo

  ctx.save()
  ctx.translate(x, groundY)
  ctx.scale(s, s)

  const branchEndX = branchDir * 34

  if (pose === 'hang') {
    const swing = Math.sin(frame * 0.06) * 8
    ctx.translate(branchEndX + swing, branchY + 2)

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
    // sit on branch
    ctx.translate(branchEndX, branchY - 18)

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

// ─── Main component ──────────────────────────────────────────────────────────

export default function PetCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let globalFrame = 0
    let treeInfos: TreeInfo[] = []
    let scenery: Scenery[] = []
    const clickTarget: ClickTarget = { x: 0, y: 0, active: false, timer: 0 }

    function buildScenery(w: number, h: number) {
      scenery = []
      treeInfos = []
      const groundY = h * GROUND_Y_RATIO

      // 3 trees, middle one has a branch for the monkey
      const treeConfigs = [
        { xRatio: 0.1, hasBranch: false, branchDir: 1 as const },
        { xRatio: 0.48, hasBranch: true, branchDir: 1 as const },
        { xRatio: 0.85, hasBranch: false, branchDir: -1 as const },
      ]

      for (let i = 0; i < treeConfigs.length; i++) {
        const cfg = treeConfigs[i]
        const tx = w * cfg.xRatio + rand(-15, 15)
        const s = rand(0.85, 1.15)
        const branchY = cfg.hasBranch ? -32 : 0
        treeInfos.push({
          x: tx,
          groundY,
          scale: s,
          branchY,
          branchDir: cfg.branchDir,
        })
        scenery.push({ type: 'tree', x: tx, scale: s, variant: i })
      }

      const rockCount = Math.max(3, Math.floor(w / 150))
      for (let i = 0; i < rockCount; i++) {
        scenery.push({ type: 'rock', x: rand(40, w - 40), scale: rand(0.5, 1.1), variant: i })
      }

      const grassCount = Math.max(8, Math.floor(w / 50))
      for (let i = 0; i < grassCount; i++) {
        scenery.push({ type: 'grass', x: rand(20, w - 20), scale: rand(0.7, 1.3), variant: i })
      }

      const flowerCount = Math.max(4, Math.floor(w / 100))
      for (let i = 0; i < flowerCount; i++) {
        scenery.push({ type: 'flower', x: rand(30, w - 30), scale: rand(0.6, 1.0), variant: i })
      }

      const order: Record<string, number> = { grass: 0, flower: 0, rock: 1, tree: 2 }
      scenery.sort((a, b) => order[a.type] - order[b.type])
    }

    const animals: Animal[] = [
      {
        type: 'dog', x: 0, y: 0, vx: 0.5, vy: 0,
        dir: 1, frame: 0, state: 'run',
        wanderTimer: 60, wanderVx: 0.5, idleTimer: 0, sitTimer: 0,
        scale: 1, seekTimer: 0,
      },
      {
        type: 'cat', x: 0, y: 0, vx: -0.4, vy: 0,
        dir: -1, frame: 40, state: 'run',
        wanderTimer: 90, wanderVx: -0.4, idleTimer: 0, sitTimer: 0,
        scale: 0.9, seekTimer: 0,
      },
      {
        type: 'elephant', x: 0, y: 0, vx: 0.3, vy: 0,
        dir: 1, frame: 20, state: 'run',
        wanderTimer: 120, wanderVx: 0.3, idleTimer: 0, sitTimer: 0,
        scale: 0.7, seekTimer: 0,
      },
      {
        type: 'rabbit', x: 0, y: 0, vx: 0.6, vy: 0,
        dir: 1, frame: 60, state: 'run',
        wanderTimer: 40, wanderVx: 0.6, idleTimer: 0, sitTimer: 0,
        scale: 0.85, seekTimer: 0,
      },
      {
        type: 'giraffe', x: 0, y: 0, vx: -0.2, vy: 0,
        dir: -1, frame: 10, state: 'run',
        wanderTimer: 100, wanderVx: -0.2, idleTimer: 0, sitTimer: 0,
        scale: 0.65, seekTimer: 0,
      },
      {
        type: 'tiger', x: 0, y: 0, vx: 0.4, vy: 0,
        dir: 1, frame: 30, state: 'run',
        wanderTimer: 80, wanderVx: 0.4, idleTimer: 0, sitTimer: 0,
        scale: 0.8, seekTimer: 0,
      },
      {
        type: 'lion', x: 0, y: 0, vx: -0.3, vy: 0,
        dir: -1, frame: 50, state: 'run',
        wanderTimer: 110, wanderVx: -0.3, idleTimer: 0, sitTimer: 0,
        scale: 0.75, seekTimer: 0,
      },
      {
        type: 'panda', x: 0, y: 0, vx: 0.2, vy: 0,
        dir: 1, frame: 70, state: 'idle',
        wanderTimer: 20, wanderVx: 0, idleTimer: 100, sitTimer: 0,
        scale: 0.75, seekTimer: 0,
      },
      {
        type: 'monkey', x: 0, y: 0, vx: 0, vy: 0,
        dir: 1, frame: 0, state: 'idle',
        wanderTimer: 0, wanderVx: 0, idleTimer: 0, sitTimer: 0,
        scale: 0.7, seekTimer: 0, treeIndex: 1,
        monkeyPose: 'hang', monkeyTimer: MONKEY_SWITCH_INTERVAL,
      },
    ]

    let resizeTimer: ReturnType<typeof setTimeout> | null = null

    function resize() {
      if (!canvas) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (w === 0 || h === 0) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = w * dpr
      canvas.height = h * dpr
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const groundY = h * GROUND_Y_RATIO
      const groundAnimals = animals.filter(a => a.type !== 'monkey')
      const margin = 50
      const usable = w - margin * 2
      for (let i = 0; i < groundAnimals.length; i++) {
        const a = groundAnimals[i]
        if (a.x === 0) {
          const slot = usable / (groundAnimals.length + 1)
          a.x = margin + slot * (i + 1) + rand(-slot * 0.2, slot * 0.2)
        }
        a.y = groundY
        a.x = clamp(a.x, margin, w - margin)
      }
      buildScenery(w, h)
    }

    resize()
    const ro = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 60)
    })
    ro.observe(canvas)

    function onClick(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      clickTarget.x = e.clientX - rect.left
      clickTarget.y = e.clientY - rect.top
      clickTarget.active = true
      clickTarget.timer = SEEK_DURATION
      for (const a of animals) {
        if (a.type !== 'monkey') {
          a.idleTimer = 0
          a.sitTimer = 0
          a.seekTimer = SEEK_DURATION
        }
      }
    }

    canvas.addEventListener('click', onClick)

    // ── Update ─────────────────────────────────────────────────────────────────

    function updateGroundAnimal(a: Animal, w: number, h: number, allAnimals: Animal[]) {
      const groundY = h * GROUND_Y_RATIO
      a.frame++
      a.wanderTimer = Math.max(0, a.wanderTimer - 1)
      a.idleTimer = Math.max(0, a.idleTimer - 1)
      a.sitTimer = Math.max(0, a.sitTimer - 1)
      a.seekTimer = Math.max(0, a.seekTimer - 1)

      // thought bubble
      if (a.thoughtTimer !== undefined && a.thoughtTimer > 0) {
        a.thoughtTimer--
        if (a.thoughtTimer === 0) {
          a.thoughtText = undefined
          a.thoughtTimer = undefined
        }
      }
      // chance to start a thought
      if (!a.thoughtText && a.thoughtTimer === undefined && Math.random() < 0.002) {
        // limit to max 2 active thoughts at once
        const activeCount = allAnimals.filter(o => o.thoughtText).length
        if (activeCount < 2) {
          a.thoughtText = THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)]
          a.thoughtTimer = THOUGHT_DURATION
        }
      }
      // cooldown after thought ends
      if (a.thoughtText === undefined && a.thoughtTimer === undefined && Math.random() < 0.001) {
        a.thoughtTimer = -THOUGHT_COOLDOWN // negative = cooldown
      }
      if (a.thoughtTimer !== undefined && a.thoughtTimer < 0) {
        a.thoughtTimer++
      }

      if (a.wanderTimer === 0) {
        a.wanderTimer = 120 + Math.random() * 200
        const spd = 0.2 + Math.random() * 0.6
        a.wanderVx = (Math.random() > 0.5 ? 1 : -1) * spd
        if (Math.random() < 0.35) {
          a.wanderVx = 0
          a.idleTimer = 80 + Math.random() * 140
          if (Math.random() < 0.4) a.sitTimer = a.idleTimer
        }
      }

      if (a.seekTimer > 0) {
        const dx = clickTarget.x - a.x
        const dist = Math.abs(dx)
        if (dist > 20) a.vx += (dx / dist) * SEEK_FORCE
      } else {
        if (a.idleTimer > 0) {
          a.vx = lerp(a.vx, 0, 0.06)
        } else {
          a.vx = lerp(a.vx, a.wanderVx, 0.025)
        }
      }

      // repel from nearby animals
      for (const other of allAnimals) {
        if (other === a || other.type === 'monkey') continue
        const dx = a.x - other.x
        const dist = Math.abs(dx)
        if (dist < REPEL_DIST && dist > 0.1) {
          a.vx += (dx / dist) * REPEL_FORCE * (1 - dist / REPEL_DIST)
        }
      }

      if (a.x < 40) a.vx += 0.15
      if (a.x > w - 40) a.vx -= 0.15

      const maxSpd = a.seekTimer > 0 ? MAX_SPEED_SEEK : MAX_SPEED_NORMAL
      const spd = Math.abs(a.vx)
      if (spd > maxSpd) a.vx = (a.vx / spd) * maxSpd

      a.vx *= DAMPING
      a.x += a.vx
      a.y = groundY
      a.x = clamp(a.x, 30, w - 30)

      if (a.sitTimer > 0) a.state = 'sit'
      else if (a.idleTimer > 0) a.state = 'idle'
      else a.state = Math.abs(a.vx) > 0.2 ? 'run' : 'idle'

      if (a.vx > 0.08) a.dir = 1
      else if (a.vx < -0.08) a.dir = -1
    }

    function updateMonkey(a: Animal) {
      a.frame++
      a.monkeyTimer = (a.monkeyTimer ?? MONKEY_SWITCH_INTERVAL) - 1
      if (a.monkeyTimer <= 0) {
        a.monkeyPose = a.monkeyPose === 'hang' ? 'sit' : 'hang'
        a.monkeyTimer = MONKEY_SWITCH_INTERVAL + Math.random() * 120
      }
    }

    // ── Draw ───────────────────────────────────────────────────────────────────

    function drawGroundLine(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
      const groundY = h * GROUND_Y_RATIO
      ctx.save()
      ctx.globalAlpha = 0.18
      setStroke(ctx, color, 1.2)
      ctx.beginPath()
      ctx.moveTo(10, groundY + 6)
      ctx.lineTo(w - 10, groundY + 6)
      ctx.stroke()
      ctx.restore()
    }

    function drawClickRipple(ctx: CanvasRenderingContext2D) {
      if (!clickTarget.active || clickTarget.timer <= 0) return
      const progress = 1 - clickTarget.timer / SEEK_DURATION
      const alpha = 1 - progress
      const radius = 8 + progress * 30

      ctx.save()
      ctx.globalAlpha = alpha * 0.3
      const p = getPalette()
      setStroke(ctx, p.flowerPetals[0], 1.5)
      ctx.beginPath()
      ctx.arc(clickTarget.x, clickTarget.y, radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    function tick() {
      rafId = requestAnimationFrame(tick)
      if (!canvas || !ctx) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (w === 0 || h === 0) return

      globalFrame++
      clickTarget.timer = Math.max(0, clickTarget.timer - 1)
      if (clickTarget.timer === 0) clickTarget.active = false

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const dark = document.documentElement.classList.contains('dark')
      const color = dark ? '#9ca3af' : '#4b5563'
      const groundY = h * GROUND_Y_RATIO

      drawGroundLine(ctx, w, h, color)

      // scenery
      for (const s of scenery) {
        switch (s.type) {
          case 'tree': {
            const ti = treeInfos.find(t => t.x === s.x)
            if (ti) drawTree(ctx, ti, s.variant)
            break
          }
          case 'rock':
            drawRock(ctx, s.x, groundY + 4, s.scale, s.variant)
            break
          case 'grass':
            drawGrass(ctx, s.x, groundY + 2, s.scale, s.variant, globalFrame)
            break
          case 'flower':
            drawFlower(ctx, s.x, groundY + 2, s.scale, s.variant, globalFrame)
            break
        }
      }

      drawClickRipple(ctx)

      // ground animals
      const groundAnimals = animals.filter(a => a.type !== 'monkey')
      const monkeyAnimal = animals.find(a => a.type === 'monkey')

      for (const a of groundAnimals) {
        updateGroundAnimal(a, w, h, animals)

        ctx.save()
        ctx.globalAlpha = dark ? 0.08 : 0.05
        ctx.beginPath()
        ctx.ellipse(a.x, groundY + 6, 16 * a.scale, 3 * a.scale, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#000'
        ctx.fill()
        ctx.restore()

        ctx.save()
        ctx.translate(a.x, a.y)
        ctx.scale(a.scale, a.scale)
        ctx.translate(-a.x, -a.y)

        switch (a.type) {
          case 'dog': drawDog(ctx, a); break
          case 'cat': drawCat(ctx, a); break
          case 'elephant': drawElephant(ctx, a); break
          case 'rabbit': drawRabbit(ctx, a); break
          case 'giraffe': drawGiraffe(ctx, a); break
          case 'tiger': drawTiger(ctx, a); break
          case 'lion': drawLion(ctx, a); break
          case 'panda': drawPanda(ctx, a); break
        }

        ctx.restore()

        // thought bubble
        if (a.thoughtText && a.thoughtTimer && a.thoughtTimer > 0) {
          const bubbleY = a.y - 30 * a.scale
          drawThoughtBubble(ctx, a.x, bubbleY, a.thoughtText, THOUGHT_DURATION - a.thoughtTimer, a.scale)
        }
      }

      // monkey on tree branch
      if (monkeyAnimal) {
        updateMonkey(monkeyAnimal)
        // monkey thoughts
        if (monkeyAnimal.thoughtTimer !== undefined && monkeyAnimal.thoughtTimer > 0) {
          monkeyAnimal.thoughtTimer--
          if (monkeyAnimal.thoughtTimer === 0) {
            monkeyAnimal.thoughtText = undefined
            monkeyAnimal.thoughtTimer = undefined
          }
        }
        if (!monkeyAnimal.thoughtText && monkeyAnimal.thoughtTimer === undefined && Math.random() < 0.002) {
          const activeCount = animals.filter(o => o.thoughtText).length
          if (activeCount < 2) {
            monkeyAnimal.thoughtText = THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)]
            monkeyAnimal.thoughtTimer = THOUGHT_DURATION
          }
        }
        const ti = clamp(monkeyAnimal.treeIndex ?? 1, 0, treeInfos.length - 1)
        const tree = treeInfos[ti]
        if (tree) drawMonkeyOnBranch(ctx, monkeyAnimal, tree)
        // monkey bubble
        if (monkeyAnimal.thoughtText && monkeyAnimal.thoughtTimer && monkeyAnimal.thoughtTimer > 0) {
          const mx = tree ? tree.x : 0
          const my = tree ? tree.groundY + tree.branchY * tree.scale - 50 : 0
          drawThoughtBubble(ctx, mx, my, monkeyAnimal.thoughtText, THOUGHT_DURATION - monkeyAnimal.thoughtTimer, monkeyAnimal.scale)
        }
      }
    }

    tick()

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      canvas.removeEventListener('click', onClick)
      if (resizeTimer) clearTimeout(resizeTimer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full block"
      style={{ height: '200px', cursor: 'pointer' }}
    />
  )

}