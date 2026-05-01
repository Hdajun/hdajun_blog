// ─── 天气系统：晴天太阳、雨天乌云雨滴、夜晚星空、雪天 ─────────────────────────

import type { WeatherType, RainDrop, Star, Cloud, SnowFlake, TreeInfo } from './types'
import { RAIN_DROP_COUNT, STAR_COUNT, CLOUD_COUNT } from './constants'
import { rand } from './utils'

// ─── 初始化天气元素 ──────────────────────────────────────────────────────────

/** 初始化雨滴 */
export function initRainDrops(w: number, h: number): RainDrop[] {
  const drops: RainDrop[] = []
  for (let i = 0; i < RAIN_DROP_COUNT; i++) {
    drops.push({
      x: rand(0, w),
      y: rand(-h, h),
      speed: rand(4, 8),
      length: rand(8, 18),
    })
  }
  return drops
}

/** 初始化星星 */
export function initStars(): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random() * 0.6, // 只在上半区域
      size: rand(0.5, 2.2),
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: rand(0.02, 0.06),
    })
  }
  return stars
}

/** 初始化乌云 */
export function initClouds(w: number): Cloud[] {
  const clouds: Cloud[] = []
  for (let i = 0; i < CLOUD_COUNT; i++) {
    clouds.push({
      x: rand(-50, w + 50),
      y: rand(8, 35),
      width: rand(60, 130),
      height: rand(20, 40),
      speed: rand(0.15, 0.4),
      opacity: rand(0.5, 0.8),
    })
  }
  return clouds
}

// ─── 天气判定 ────────────────────────────────────────────────────────────────

/** 根据当前小时判定天气（可扩展为接入真实天气API） */
export function detectWeather(): WeatherType {
  const h = new Date().getHours()
  // 22:00 - 06:00 夜晚
  if (h >= 22 || h < 6) return 'night'
  // 简单用日期模拟：日期不满5则雨天，否则晴天
  // 后续可接入真实天气API
  const day = new Date().getDate()
  if (day % 7 === 0 || day % 7 === 3) return 'rainy'
  return 'sunny'
}

// ─── 绘制晴天太阳 ───────────────────────────────────────────────────────────

export function drawSun(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) {
  const cx = w - 50
  const cy = 36
  const r = 15

  ctx.save()

  // 晴天天空暖色渐变（顶部淡黄 → 透明）
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55)
  skyGrad.addColorStop(0, 'rgba(254,243,199,0.38)')
  skyGrad.addColorStop(0.5, 'rgba(253,230,138,0.12)')
  skyGrad.addColorStop(1, 'rgba(253,230,138,0)')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h * 0.55)

  // 超大柔光晕（多层叠加）
  const outerGlowR = r * 5 + Math.sin(frame * 0.018) * 4
  const outerGlow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, outerGlowR)
  outerGlow.addColorStop(0, 'rgba(253,230,138,0.18)')
  outerGlow.addColorStop(0.4, 'rgba(253,224,71,0.08)')
  outerGlow.addColorStop(1, 'rgba(253,224,71,0)')
  ctx.fillStyle = outerGlow
  ctx.beginPath()
  ctx.arc(cx, cy, outerGlowR, 0, Math.PI * 2)
  ctx.fill()

  const innerGlowR = r * 2.2 + Math.sin(frame * 0.025) * 2
  const innerGlow = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, innerGlowR)
  innerGlow.addColorStop(0, 'rgba(254,243,199,0.55)')
  innerGlow.addColorStop(1, 'rgba(253,224,71,0)')
  ctx.fillStyle = innerGlow
  ctx.beginPath()
  ctx.arc(cx, cy, innerGlowR, 0, Math.PI * 2)
  ctx.fill()

  // 太阳体（白芯 → 黄 → 琥珀）
  const bodyGrad = ctx.createRadialGradient(cx - 3, cy - 4, 1, cx, cy, r)
  bodyGrad.addColorStop(0, '#FFFBEB')
  bodyGrad.addColorStop(0.4, '#FDE68A')
  bodyGrad.addColorStop(1, '#FBBF24')
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // 柔光线（长短交替，用渐变透明度）
  const rayCount = 12
  ctx.lineCap = 'round'
  for (let i = 0; i < rayCount; i++) {
    const angle = (Math.PI * 2 / rayCount) * i + frame * 0.004
    const isLong = i % 2 === 0
    const baseLen = isLong ? 10 + Math.sin(frame * 0.04 + i) * 2.5 : 5
    const startR = r + 3
    const x1 = cx + Math.cos(angle) * startR
    const y1 = cy + Math.sin(angle) * startR
    const x2 = cx + Math.cos(angle) * (startR + baseLen)
    const y2 = cy + Math.sin(angle) * (startR + baseLen)
    const rayGrad = ctx.createLinearGradient(x1, y1, x2, y2)
    rayGrad.addColorStop(0, isLong ? 'rgba(251,191,36,0.6)' : 'rgba(251,191,36,0.35)')
    rayGrad.addColorStop(1, 'rgba(251,191,36,0)')
    ctx.strokeStyle = rayGrad
    ctx.lineWidth = isLong ? 1.8 : 1.2
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  ctx.restore()
}

// ─── 绘制雨天 ────────────────────────────────────────────────────────────────

/** 绘制阴雨天空背景 */
export function drawRainySky(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65)
  skyGrad.addColorStop(0, 'rgba(55,65,81,0.52)')
  skyGrad.addColorStop(0.5, 'rgba(75,85,99,0.28)')
  skyGrad.addColorStop(1, 'rgba(107,114,128,0)')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h * 0.65)
  ctx.restore()
}

/** 更新并绘制乌云 */
export function drawClouds(ctx: CanvasRenderingContext2D, clouds: Cloud[], w: number) {
  ctx.save()
  for (const c of clouds) {
    c.x += c.speed
    if (c.x > w + c.width) c.x = -c.width - 20

    // 底部阴影层（乌云更厚重）
    ctx.globalAlpha = c.opacity * 0.6
    ctx.fillStyle = '#4B5563'
    fillCloudShape(ctx, c.x + 4, c.y + 6, c.width, c.height)

    ctx.globalAlpha = c.opacity
    ctx.fillStyle = '#6B7280'
    fillCloudShape(ctx, c.x, c.y, c.width, c.height)
    // 亮部（模拟漫射光）
    ctx.fillStyle = '#9CA3AF'
    ctx.globalAlpha = c.opacity * 0.4
    fillCloudShape(ctx, c.x + c.width * 0.1, c.y - c.height * 0.2, c.width * 0.75, c.height * 0.6)
  }
  ctx.restore()
}

function fillCloudShape(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath()
  ctx.ellipse(x, y, w * 0.3, h * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + w * 0.25, y - h * 0.2, w * 0.28, h * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + w * 0.5, y, w * 0.3, h * 0.45, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + w * 0.15, y + h * 0.1, w * 0.35, h * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()
}

/** 更新并绘制雨滴 */
export function drawRain(ctx: CanvasRenderingContext2D, drops: RainDrop[], w: number, h: number) {
  const groundY = h * 0.72
  ctx.save()
  ctx.strokeStyle = 'rgba(147,197,253,0.5)'
  ctx.lineWidth = 1
  ctx.lineCap = 'round'
  for (const d of drops) {
    d.y += d.speed
    d.x -= 0.5 // 轻微倾斜
    if (d.y > groundY + 5) {
      d.y = rand(-20, -5)
      d.x = rand(-10, w + 10)
    }
    ctx.beginPath()
    ctx.moveTo(d.x, d.y)
    ctx.lineTo(d.x + 0.5, d.y + d.length)
    ctx.stroke()
  }
  ctx.restore()
}

// ─── 绘制夜晚星空 ────────────────────────────────────────────────────────────

export function drawNightSky(ctx: CanvasRenderingContext2D, w: number, h: number, stars: Star[], frame: number) {
  ctx.save()

  // 夜空渐变：足够深让星星可见
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75)
  skyGrad.addColorStop(0, 'rgba(15,12,50,0.72)')
  skyGrad.addColorStop(0.6, 'rgba(20,16,60,0.45)')
  skyGrad.addColorStop(1, 'rgba(20,16,60,0)')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h * 0.75)

  // 星星
  for (const s of stars) {
    const sx = s.x * w
    const sy = s.y * h
    const twinkle = Math.sin(frame * s.twinkleSpeed + s.twinklePhase) * 0.4 + 0.6
    ctx.globalAlpha = twinkle * 0.9
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(sx, sy, s.size, 0, Math.PI * 2)
    ctx.fill()

    // 大星星加十字光芒
    if (s.size > 1.5) {
      ctx.globalAlpha = twinkle * 0.3
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 0.5
      const cr = s.size * 2.5
      ctx.beginPath()
      ctx.moveTo(sx - cr, sy)
      ctx.lineTo(sx + cr, sy)
      ctx.moveTo(sx, sy - cr)
      ctx.lineTo(sx, sy + cr)
      ctx.stroke()
    }
  }

  // 月亮
  const moonX = w - 50
  const moonY = 30
  const moonR = 14

  // 月光光晕
  ctx.globalAlpha = 0.15
  const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 3)
  moonGlow.addColorStop(0, 'rgba(253,230,138,0.3)')
  moonGlow.addColorStop(1, 'rgba(253,230,138,0)')
  ctx.fillStyle = moonGlow
  ctx.beginPath()
  ctx.arc(moonX, moonY, moonR * 3, 0, Math.PI * 2)
  ctx.fill()

  // 月亮体
  ctx.globalAlpha = 0.8
  ctx.fillStyle = '#FDE68A'
  ctx.beginPath()
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2)
  ctx.fill()

  // 月牙阴影（遮住一部分形成弯月）
  ctx.globalAlpha = 0.85
  ctx.fillStyle = ctx.canvas.width > 0 ? 'rgba(30,27,75,0.7)' : '#1e1b4b'
  ctx.beginPath()
  ctx.arc(moonX + 6, moonY - 2, moonR - 1, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// ─── 雨天地面效果 ────────────────────────────────────────────────────────────

/** 绘制简单的溅水涟漪 */
export function drawPuddles(ctx: CanvasRenderingContext2D, w: number, groundY: number, frame: number) {
  ctx.save()
  const puddleCount = 3
  for (let i = 0; i < puddleCount; i++) {
    const px = w * (0.15 + i * 0.35)
    const py = groundY + 8
    const pw = 25 + i * 5
    const ripple = Math.sin(frame * 0.06 + i * 2) * 0.3 + 0.5

    ctx.globalAlpha = 0.12 * ripple
    ctx.fillStyle = '#93C5FD'
    ctx.beginPath()
    ctx.ellipse(px, py, pw, 4, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

// ─── 雪天 ────────────────────────────────────────────────────────────────────

const SNOW_COUNT = 40

export function initSnowFlakes(w: number, h: number): SnowFlake[] {
  const flakes: SnowFlake[] = []
  for (let i = 0; i < SNOW_COUNT; i++) {
    flakes.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(1.5, 3.8),
      speed: rand(0.4, 1.1),
      drift: rand(-0.3, 0.3),
      phase: Math.random() * Math.PI * 2,
    })
  }
  return flakes
}

export function drawSnow(ctx: CanvasRenderingContext2D, flakes: SnowFlake[], w: number, h: number, frame: number) {
  const groundY = h * 0.72
  ctx.save()

  // 冬日天空：钢蓝灰渐变
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75)
  skyGrad.addColorStop(0,    'rgba(100,130,175,0.65)')
  skyGrad.addColorStop(0.45, 'rgba(150,175,210,0.38)')
  skyGrad.addColorStop(1,    'rgba(190,210,230,0)')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h * 0.75)

  // 积云（三块，无阴影）
  ctx.globalAlpha = 0.52
  ctx.fillStyle = '#B8C8DC'
  fillCloudShape(ctx, -w * 0.05, 8, w * 0.44, 34)
  ctx.globalAlpha = 0.44
  ctx.fillStyle = '#C5D4E3'
  fillCloudShape(ctx, w * 0.38, 5, w * 0.37, 29)
  ctx.globalAlpha = 0.38
  ctx.fillStyle = '#CDD8E8'
  fillCloudShape(ctx, w * 0.70, 12, w * 0.34, 26)
  ctx.globalAlpha = 1

  // 地面积雪
  const sgW = w * 0.56
  const sgGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 16)
  sgGrad.addColorStop(0, 'rgba(230,240,250,0.85)')
  sgGrad.addColorStop(1, 'rgba(210,225,240,0)')
  ctx.fillStyle = sgGrad
  ctx.beginPath()
  ctx.ellipse(w * 0.5, groundY + 5, sgW, 11, 0, 0, Math.PI * 2)
  ctx.fill()

  // 雪花：用"深色底层 + 白色面层"双圆技巧替代 shadowBlur
  ctx.lineCap = 'round'
  for (const f of flakes) {
    f.y += f.speed
    f.x += f.drift + Math.sin(frame * 0.02 + f.phase) * 0.3
    if (f.y > groundY + 4) { f.y = rand(-12, 0); f.x = rand(0, w) }
    if (f.x < -4) f.x = w + 4
    if (f.x > w + 4) f.x = -4

    const alpha = 0.7 + Math.sin(frame * 0.03 + f.phase) * 0.18
    ctx.globalAlpha = alpha

    if (f.r >= 2.8) {
      // 六角雪花：先画蓝灰底色（偏大），再画白色面层
      ctx.save()
      ctx.translate(f.x, f.y)
      ctx.rotate(frame * 0.006 + f.phase)
      // 底层（蓝灰，略粗略大，制造对比边）
      ctx.strokeStyle = 'rgba(130,160,210,0.7)'
      ctx.lineWidth = 2.2
      drawHexStar(ctx, f.r * 1.18)
      // 面层（白色）
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 1.0
      drawHexStar(ctx, f.r * 1.0)
      ctx.restore()
    } else {
      // 小圆雪花：底层蓝灰圆 + 白色圆
      ctx.fillStyle = 'rgba(130,160,210,0.55)'
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.r + 0.8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.restore()
}

/** 在当前坐标原点画六角星（不含 save/restore，由调用方处理变换） */
function drawHexStar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath()
  for (let arm = 0; arm < 6; arm++) {
    const a = (Math.PI / 3) * arm
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  ctx.stroke()
}

// ─── 综合天气绘制入口 ────────────────────────────────────────────────────────

export interface WeatherState {
  type: WeatherType
  rainDrops: RainDrop[]
  stars: Star[]
  clouds: Cloud[]
  snowFlakes: SnowFlake[]
}

/** 创建初始天气状态 */
export function createWeatherState(w: number, h: number, type: WeatherType): WeatherState {
  return {
    type,
    rainDrops: type === 'rainy' ? initRainDrops(w, h) : [],
    stars: type === 'night' ? initStars() : [],
    clouds: type === 'rainy' ? initClouds(w) : [],
    snowFlakes: type === 'snow' ? initSnowFlakes(w, h) : [],
  }
}

/** 绘制天气（统一入口） */
export function drawWeather(ctx: CanvasRenderingContext2D, weather: WeatherState, w: number, h: number, frame: number) {
  if (weather.type === 'sunny') {
    drawSun(ctx, w, h, frame)
  } else if (weather.type === 'rainy') {
    drawRainySky(ctx, w, h)
    drawClouds(ctx, weather.clouds, w)
    drawRain(ctx, weather.rainDrops, w, h)
    drawPuddles(ctx, w, h * 0.72, frame)
  } else if (weather.type === 'night') {
    drawNightSky(ctx, w, h, weather.stars, frame)
  } else if (weather.type === 'snow') {
    drawSnow(ctx, weather.snowFlakes, w, h, frame)
  }
}