'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { Animal, FoodItem, Scenery, TreeInfo, ClickTarget, Footprint, PetCanvasConfig, ThoughtScene } from './types'
import {
  GROUND_Y_RATIO, SEEK_DURATION, MONKEY_SWITCH_INTERVAL, MAX_FOODS,
  FOOD_LIFETIME, FOOD_TYPES, LOOK_DURATION, EAT_DURATION,
  DEFAULT_ANIMAL_CONFIGS, FOOTPRINT_LIFETIME, FOOTPRINT_CHANCE, THOUGHT_DURATION,
  WEATHER_CHECK_INTERVAL,
} from './constants'
import { getPalette, rand, clamp } from './utils'
import { drawGroundAnimal, drawMonkey } from './animals'
import { drawBirdFlying, drawBirdPerched } from './animals/drawBird'
import { drawScenery, drawThemeGround } from './scenery'
import { getDesertLayout } from './scenery/drawDesert'
import { getGardenLayout } from './scenery/drawGarden'
import { getVillageLayout } from './scenery/drawVillage'
import { drawFoodItem, drawEatEmote, drawFoodNearMouth } from './food'
import { drawThoughtBubble, drawLookEmote, updateThought } from './thoughts'
import { updateGroundAnimal, updateMonkey, updateFoods, updateBird, isNighttime } from './physics'
import { createWeatherState, drawWeather, detectWeather } from './weather'
import type { WeatherState } from './weather'
import { usePetConfig, DEFAULT_PET_CONFIG } from '@/contexts/PetConfigContext'

// ─── localStorage fallback (when no PetConfigProvider) ───────────────────────

const LEGACY_NAMES_KEY = 'petcanvas-names'

function loadNamesFallback(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(LEGACY_NAMES_KEY) || '{}') } catch { return {} }
}

function saveNamesFallback(names: Record<string, string>) {
  try { localStorage.setItem(LEGACY_NAMES_KEY, JSON.stringify(names)) } catch {}
}

// ─── Hit test ─────────────────────────────────────────────────────────────────

const ANIMAL_HITBOX: Record<string, { hw: number; hh: number; oy: number }> = {
  dog:      { hw: 30, hh: 28, oy: -4 },
  cat:      { hw: 22, hh: 30, oy: -10 },
  elephant: { hw: 36, hh: 34, oy: -6 },
  rabbit:   { hw: 18, hh: 30, oy: -8 },
  giraffe:  { hw: 26, hh: 54, oy: -22 },
  tiger:    { hw: 28, hh: 26, oy: -4 },
  lion:     { hw: 30, hh: 30, oy: -6 },
  panda:    { hw: 26, hh: 26, oy: -4 },
  hedgehog: { hw: 22, hh: 22, oy: -4 },
  pig:      { hw: 30, hh: 26, oy: -2 },
  snake:    { hw: 36, hh: 12, oy: -2 },
  bird:     { hw: 20, hh: 20, oy: -6 },
}

function hitTestAnimal(cx: number, cy: number, animal: Animal, canvasHeight: number): boolean {
  if (animal.type === 'monkey') return false
  // 鸟在飞行中不可点击
  if (animal.type === 'bird' && !animal.birdOnGround) return false
  const groundY = canvasHeight * GROUND_Y_RATIO
  const box = ANIMAL_HITBOX[animal.type]
  if (!box) return false
  const s = animal.scale
  const left = animal.x - box.hw * s
  const right = animal.x + box.hw * s
  const top = (groundY + (animal.jumpOffset || 0)) + box.oy * s
  const bottom = (groundY + (animal.jumpOffset || 0)) + 10 * s
  return cx >= left && cx <= right && cy >= top && cy <= bottom
}

// ─── Name Input overlay ───────────────────────────────────────────────────────

interface NameInputState {
  visible: boolean
  animalType: string
  x: number
  y: number
  value: string
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PetCanvas({ height = 200, thoughts, thoughtScene }: { height?: number; thoughts?: string[]; thoughtScene?: ThoughtScene }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nameInput, setNameInput] = useState<NameInputState>({ visible: false, animalType: '', x: 0, y: 0, value: '' })
  const animalsRef = useRef<Animal[] | null>(null)
  const thoughtsPropRef = useRef(thoughts)
  thoughtsPropRef.current = thoughts
  const thoughtSceneRef = useRef(thoughtScene)
  thoughtSceneRef.current = thoughtScene

  // ── configRef: always fresh, updated on every render before effects ──
  const petConfig = usePetConfig()
  const configRef = useRef<PetCanvasConfig>(DEFAULT_PET_CONFIG)
  configRef.current = petConfig ? petConfig.config : DEFAULT_PET_CONFIG

  const updateConfigRef = useRef(petConfig?.updateConfig)
  updateConfigRef.current = petConfig?.updateConfig

  // Sync names & scales to animals when context config changes
  useEffect(() => {
    if (!petConfig || !animalsRef.current) return
    const { names, scales } = petConfig.config
    for (const a of animalsRef.current) {
      a.name = names[a.type] || undefined
      const defaultCfg = DEFAULT_ANIMAL_CONFIGS.find(c => c.type === a.type)
      if (defaultCfg && scales[a.type] !== undefined) {
        a.scale = defaultCfg.scale * scales[a.type]
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petConfig?.config.names, petConfig?.config.scales])

  // Expose animalsRef to context so /pet page can read mood
  useEffect(() => {
    if (petConfig && animalsRef.current) petConfig.animalsRef.current = animalsRef.current
  }, [petConfig])

  // submit name → context or localStorage fallback
  const handleNameSubmit = useCallback(() => {
    if (!nameInput.visible || !animalsRef.current) return
    const name = nameInput.value.trim()
    for (const a of animalsRef.current) {
      if (a.type === nameInput.animalType) a.name = name || undefined
    }
    const names: Record<string, string> = {}
    for (const a of animalsRef.current) { if (a.name) names[a.type] = a.name }
    if (updateConfigRef.current) {
      updateConfigRef.current({ names })
    } else {
      saveNamesFallback(names)
    }
    setNameInput(prev => ({ ...prev, visible: false }))
  }, [nameInput])

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
    const footprints: Footprint[] = []
    let isNight = isNighttime()

    // ── weather ──
    let autoWeatherType = detectWeather()
    let weatherState: WeatherState | null = null
    let lastEffectiveWeather = ''
    let lastTheme = ''

    const weatherInterval = setInterval(() => {
      isNight = isNighttime()
      autoWeatherType = detectWeather()
    }, WEATHER_CHECK_INTERVAL)

    // ── tab visibility ──
    let isVisible = true
    const onVisibility = () => { isVisible = !document.hidden }
    document.addEventListener('visibilitychange', onVisibility)

    // ── build animals (read initial config from configRef, already populated) ──
    const initCfg = configRef.current
    const initNames = Object.keys(initCfg.names).length ? initCfg.names : loadNamesFallback()

    const animals: Animal[] = DEFAULT_ANIMAL_CONFIGS.map(cfg => ({
      type: cfg.type,
      x: 0, y: 0,
      vx: cfg.vx, vy: 0,
      dir: cfg.dir, frame: cfg.frame, state: cfg.state,
      wanderTimer: cfg.wanderTimer, wanderVx: cfg.wanderVx,
      idleTimer: cfg.idleTimer, sitTimer: cfg.sitTimer,
      scale: initCfg.scales[cfg.type] !== undefined
        ? cfg.scale * initCfg.scales[cfg.type]
        : cfg.scale,
      seekTimer: 0,
      treeIndex: cfg.treeIndex,
      monkeyPose: cfg.monkeyPose,
      // monkey starts on ground with a short timer so it walks immediately
      monkeyOnGround: cfg.type === 'monkey' ? true : undefined,
      monkeyTimer: cfg.type === 'monkey' ? 80 : (cfg.monkeyPose ? MONKEY_SWITCH_INTERVAL : undefined),
      birdOnGround: cfg.type === 'bird' ? true : undefined,
      birdFlyY: 0,
      birdFlyVY: 0,
      birdFlapPhase: 0,
      birdPerchTimer: cfg.type === 'bird' ? 60 + Math.floor(Math.random() * 200) : undefined,
      birdPerchX: undefined,
      birdPerchY: undefined,
      birdTreeIndex: undefined,
      jumpOffset: 0, jumpVY: 0, lookTimer: 0, excitementTimer: 0, eatingTimer: 0,
      canJump: cfg.canJump ?? true,
      mood: 60,
      name: initNames[cfg.type] || undefined,
      visible: true,
      accessories: [],
    }))

    const foods: FoodItem[] = []
    animalsRef.current = animals
    if (petConfig) petConfig.animalsRef.current = animals

    // ── scenery builder（主题感知） ──
    function buildScenery(w: number, h: number) {
      scenery = []
      treeInfos = []
      const groundY = h * GROUND_Y_RATIO
      const theme = configRef.current.scenery.theme || 'forest'

      if (theme === 'forest') {
        const treeConfigs = [
          { xRatio: 0.1, hasBranch: false, branchDir: 1 as const },
          { xRatio: 0.48, hasBranch: true, branchDir: 1 as const },
          { xRatio: 0.85, hasBranch: false, branchDir: -1 as const },
        ]
        for (let i = 0; i < treeConfigs.length; i++) {
          const { xRatio, hasBranch, branchDir } = treeConfigs[i]
          const tx = w * xRatio + rand(-15, 15)
          const s = rand(0.85, 1.15)
          treeInfos.push({ x: tx, groundY, scale: s, branchY: hasBranch ? -32 : 0, branchDir })
          scenery.push({ type: 'tree', x: tx, scale: s, variant: i })
        }
        const rockCount = Math.max(3, Math.floor(w / 150))
        for (let i = 0; i < rockCount; i++)
          scenery.push({ type: 'rock', x: rand(40, w - 40), scale: rand(0.5, 1.1), variant: i })
        const grassCount = Math.max(8, Math.floor(w / 50))
        for (let i = 0; i < grassCount; i++)
          scenery.push({ type: 'grass', x: rand(20, w - 20), scale: rand(0.7, 1.3), variant: i })
        const flowerCount = Math.max(4, Math.floor(w / 100))
        for (let i = 0; i < flowerCount; i++)
          scenery.push({ type: 'flower', x: rand(30, w - 30), scale: rand(0.6, 1.0), variant: i })
        const order: Record<string, number> = { grass: 0, flower: 0, rock: 1, tree: 2 }
        scenery.sort((a, b) => order[a.type] - order[b.type])

      } else if (theme === 'desert') {
        const items = getDesertLayout(w, h)
        const drawOrder: Record<string, number> = { dune: 0, deadTree: 1, cactus: 2, tumbleweed: 3 }
        items.sort((a, b) => (drawOrder[a.type] ?? 5) - (drawOrder[b.type] ?? 5))
        for (const it of items) scenery.push({ type: it.type as never, x: it.x, scale: it.scale, variant: it.variant })

      } else if (theme === 'garden') {
        const items = getGardenLayout(w, h)
        const drawOrder: Record<string, number> = { fence: 0, flowerBed: 1, fountain: 2, petals: 3 }
        items.sort((a, b) => (drawOrder[a.type] ?? 5) - (drawOrder[b.type] ?? 5))
        for (const it of items) scenery.push({ type: it.type as never, x: it.x, scale: it.scale, variant: it.variant })

      } else if (theme === 'village') {
        const items = getVillageLayout(w, h)
        const drawOrder: Record<string, number> = { bambooFence: 0, cottage: 1, lantern: 2, ancientTree: 3 }
        items.sort((a, b) => (drawOrder[a.type] ?? 5) - (drawOrder[b.type] ?? 5))
        for (const it of items) {
          scenery.push({ type: it.type as never, x: it.x, scale: it.scale, variant: it.variant })
          // 古树提供攀爬点
          if (it.type === 'ancientTree') {
            treeInfos.push({
              x: it.x, groundY, scale: it.scale,
              branchY: -45, branchDir: it.variant % 2 === 0 ? 1 : -1,
            })
          }
        }

      }
    }

    // ── resize ──
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
      const margin = 50
      const usable = w - margin * 2
      const groundAnimals = animals.filter(a => a.type !== 'monkey' && a.type !== 'bird')
      for (let i = 0; i < groundAnimals.length; i++) {
        const a = groundAnimals[i]
        if (a.x === 0) {
          const slot = usable / (groundAnimals.length + 1)
          a.x = margin + slot * (i + 1) + rand(-slot * 0.2, slot * 0.2)
        }
        a.y = groundY
        a.x = clamp(a.x, margin, w - margin)
      }
      // give monkey an initial ground position if not yet placed
      const monkeyA = animals.find(a => a.type === 'monkey')
      if (monkeyA && monkeyA.monkeyOnGround && monkeyA.x === 0) {
        monkeyA.x = w * 0.5 + rand(-w * 0.15, w * 0.15)
        monkeyA.y = groundY
      }
      // give bird an initial position — start flying
      const birdA = animals.find(a => a.type === 'bird')
      if (birdA && birdA.x === 0) {
        birdA.x = w * 0.5 + rand(-w * 0.15, w * 0.15)
        birdA.y = groundY
        birdA.birdOnGround = false
        birdA.birdFlyY = -30
        birdA.birdFlyVY = 0
        birdA.birdFlyTimer = 200 + Math.floor(Math.random() * 200)
        birdA.wanderVx = (Math.random() > 0.5 ? 1 : -1) * 1.6
      }
      buildScenery(w, h)
      lastEffectiveWeather = ''  // force weather rebuild on resize
    }

    resize()
    const ro = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 60)
    })
    ro.observe(canvas)

    // ── pointer handler ──
    function handlePointer(cx: number, cy: number) {
      const h = canvas!.offsetHeight
      for (const a of animals) {
        if (hitTestAnimal(cx, cy, a, h)) {
          setNameInput({ visible: true, animalType: a.type, x: cx, y: cy - 10, value: a.name || '' })
          a.excitementTimer = 20
          if (a.jumpOffset === 0) a.jumpVY = -3.5 * 0.4
          return
        }
      }
      if (foods.length < MAX_FOODS) {
        const foodType = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)]
        const groundY = h * GROUND_Y_RATIO
        foods.push({ x: cx, y: Math.min(cy, groundY - 5), type: foodType, timer: FOOD_LIFETIME, eaten: false, eatAnim: 0, particles: [] })
        for (const a of animals) {
          if ((a.type !== 'monkey' || a.monkeyOnGround) && (a.type !== 'bird' || a.birdOnGround) && Math.abs(a.x - cx) < 300) a.excitementTimer = 30
        }
      }
      clickTarget.x = cx
      clickTarget.y = cy
      clickTarget.active = true
      clickTarget.timer = SEEK_DURATION
      for (const a of animals) {
        if (a.type !== 'monkey' && a.type !== 'bird' && Math.abs(a.x - cx) < 200)
          a.mood = Math.min(100, a.mood + 5)
      }
    }

    function onClick(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      handlePointer(e.clientX - rect.left, e.clientY - rect.top)
    }
    function onTouch(e: TouchEvent) {
      e.preventDefault()
      const rect = canvas!.getBoundingClientRect()
      const t = e.touches[0]
      if (t) handlePointer(t.clientX - rect.left, t.clientY - rect.top)
    }
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('touchstart', onTouch, { passive: false })

    // ── ground line ──
    function drawGroundLine(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
      const groundY = h * GROUND_Y_RATIO
      ctx.save()
      ctx.globalAlpha = 0.18
      ctx.strokeStyle = color
      ctx.lineWidth = 1.2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(10, groundY + 6)
      ctx.lineTo(w - 10, groundY + 6)
      ctx.stroke()
      ctx.restore()
    }

    // ── footprints ──
    function drawFootprints(ctx: CanvasRenderingContext2D) {
      for (let i = footprints.length - 1; i >= 0; i--) {
        const fp = footprints[i]
        fp.life--
        if (fp.life <= 0) { footprints.splice(i, 1); continue }
        const alpha = (fp.life / FOOTPRINT_LIFETIME) * 0.12
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(fp.x, fp.y)
        ctx.scale(fp.dir, 1)
        ctx.scale(fp.scale, fp.scale)
        ctx.fillStyle = '#888'
        ctx.beginPath(); ctx.ellipse(0, 0, 3, 2, 0, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(4, -3, 1.5, 1, -0.3, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(4, 3, 1.5, 1, 0.3, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(-2, -3, 1.5, 1, -0.3, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(-2, 3, 1.5, 1, 0.3, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
    }

    // ── click ripple ──
    function drawClickRipple(ctx: CanvasRenderingContext2D) {
      if (!clickTarget.active || clickTarget.timer <= 0) return
      const progress = 1 - clickTarget.timer / SEEK_DURATION
      const p = getPalette()
      ctx.save()
      ctx.globalAlpha = (1 - progress) * 0.3
      ctx.strokeStyle = p.flowerPetals[0]
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.arc(clickTarget.x, clickTarget.y, 8 + progress * 30, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // ── game loop ──
    function tick() {
      rafId = requestAnimationFrame(tick)
      if (!isVisible) return
      if (!canvas || !ctx) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (w === 0 || h === 0) return

      globalFrame++
      clickTarget.timer = Math.max(0, clickTarget.timer - 1)
      if (clickTarget.timer === 0) clickTarget.active = false

      updateFoods(foods)

      // ── effective weather (manual override or auto) ──
      const cfg = configRef.current
      const effectiveWeather = cfg.weather.mode === 'manual'
        ? cfg.weather.manualType
        : autoWeatherType
      if (!weatherState || effectiveWeather !== lastEffectiveWeather) {
        weatherState = createWeatherState(w, h, effectiveWeather)
        lastEffectiveWeather = effectiveWeather
      }

      // ── theme change detection → rebuild scenery ──
      const currentTheme = cfg.scenery.theme || 'forest'
      if (currentTheme !== lastTheme) {
        buildScenery(w, h)
        lastTheme = currentTheme
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawWeather(ctx, weatherState, w, h, globalFrame)

      const p = getPalette()
      const groundY = h * GROUND_Y_RATIO

      // 主题地面色调
      drawThemeGround(ctx, currentTheme, w, h, groundY)
      if (cfg.scenery.groundLine) drawGroundLine(ctx, w, h, p.line)

      // 按主题 + 道具开关过滤场景元素
      const sc = cfg.scenery
      const themeProps = sc.themeProps?.[currentTheme] ?? {}
      const visibleScenery = scenery.filter(s => themeProps[s.type] !== false)
      const hasClimbable = currentTheme === 'forest'
        ? (themeProps.trees !== false)
        : (currentTheme === 'village' ? themeProps.ancientTree !== false : false)
      const visibleTreeInfos = hasClimbable ? treeInfos : []
      drawScenery(ctx, visibleScenery, visibleTreeInfos, groundY, globalFrame, p, isNight)

      drawClickRipple(ctx)
      if (sc.footprints) drawFootprints(ctx)

      for (const f of foods) drawFoodItem(ctx, f, globalFrame, p)

      const groundAnimals = animals.filter(a => a.type !== 'monkey' && a.type !== 'bird')
      const monkeyAnimal = animals.find(a => a.type === 'monkey')
      const birdAnimal = animals.find(a => a.type === 'bird')

      for (const a of groundAnimals) {
        // always update physics for mood/movement consistency
        const result = updateGroundAnimal(a, w, h, animals, foods, clickTarget, isNight, effectiveWeather, treeInfos)
        updateThought(a, isNight, animals, thoughtsPropRef.current ?? cfg.customThoughts, thoughtSceneRef.current)

        // skip drawing if hidden
        if (cfg.visible[a.type] === false) continue

        if (result?.leftFootprint && sc.footprints) {
          footprints.push({
            x: a.x + a.dir * 5,
            y: groundY + 4,
            life: FOOTPRINT_LIFETIME,
            dir: a.dir,
            scale: a.scale * 0.6,
          })
        }

        // shadow
        ctx.save()
        ctx.globalAlpha = 0.06
        ctx.beginPath()
        ctx.ellipse(a.x, groundY + 6, 16 * a.scale, 3 * a.scale, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#000'
        ctx.fill()
        ctx.restore()

        // body
        ctx.save()
        const drawY = a.y + (a.jumpOffset || 0)
        ctx.translate(a.x, drawY)
        ctx.scale(a.scale, a.scale)
        ctx.translate(-a.x, -a.y)
        if (a.state === 'eat' && a.eatingTimer > 0) {
          const squish = Math.sin((1 - a.eatingTimer / EAT_DURATION) * Math.PI * 6) * 0.05
          ctx.translate(a.x, a.y); ctx.scale(1 + squish, 1 - squish); ctx.translate(-a.x, -a.y)
        }
        if (a.lookTimer > 0 && a.state === 'idle') {
          const headTilt = Math.sin((1 - a.lookTimer / LOOK_DURATION) * Math.PI * 2) * 0.06
          ctx.translate(a.x, a.y); ctx.rotate(headTilt * a.dir); ctx.translate(-a.x, -a.y)
        }
        drawGroundAnimal(ctx, a, p)
        ctx.restore()

        // emotes
        if (a.state === 'eat' && a.eatingTimer > 0) {
          const drawY2 = a.y + (a.jumpOffset || 0)
          drawEatEmote(ctx, a.x, drawY2 - 15 * a.scale, a.scale, a.frame)
          if (a.eatFoodType && a.eatingTimer > EAT_DURATION * 0.3)
            drawFoodNearMouth(ctx, a.eatFoodType, a.x + a.dir * 12 * a.scale, drawY2 - 5 * a.scale, (a.eatingTimer / EAT_DURATION) * 0.6, a.frame, p)
        }
        if (a.lookTimer > 0 && a.state === 'idle')
          drawLookEmote(ctx, a.x, drawY, a.dir, a.scale, a.frame, a.lookTimer)
        if (sc.thoughts && a.thoughtText && a.thoughtTimer && a.thoughtTimer > 0)
          drawThoughtBubble(ctx, a.x, drawY - 30 * a.scale, a.thoughtText, THOUGHT_DURATION - a.thoughtTimer, a.scale)

        if (a.name) {
          ctx.save()
          ctx.globalAlpha = 0.55
          ctx.font = '9px "PingFang SC", "Microsoft YaHei", sans-serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = isNight || effectiveWeather === 'night' ? '#9ca3af' : '#6b7280'
          ctx.fillText(a.name, a.x, groundY + 18 * a.scale)
          ctx.restore()
        }
      }

      // monkey
      if (monkeyAnimal && cfg.visible['monkey'] !== false) {
        // if trees are hidden while monkey is on tree, force it down
        if (!monkeyAnimal.monkeyOnGround && visibleTreeInfos.length === 0) {
          monkeyAnimal.monkeyOnGround = true
          monkeyAnimal.x = clamp(monkeyAnimal.x || w / 2, 30, w - 30)
          monkeyAnimal.y = groundY
          monkeyAnimal.vx = 0
          monkeyAnimal.monkeyTimer = 0
        }

        updateMonkey(monkeyAnimal, w, h, foods, visibleTreeInfos, isNight)
        updateThought(monkeyAnimal, isNight, animals, thoughtsPropRef.current ?? cfg.customThoughts, thoughtSceneRef.current)

        if (monkeyAnimal.monkeyOnGround) {
          // ── ground drawing ──
          const mDrawY = monkeyAnimal.y + (monkeyAnimal.jumpOffset || 0)

          // shadow
          ctx.save()
          ctx.globalAlpha = 0.06
          ctx.beginPath()
          ctx.ellipse(monkeyAnimal.x, groundY + 6, 14 * monkeyAnimal.scale, 3 * monkeyAnimal.scale, 0, 0, Math.PI * 2)
          ctx.fillStyle = '#000'
          ctx.fill()
          ctx.restore()

          ctx.save()
          ctx.translate(monkeyAnimal.x, mDrawY)
          ctx.scale(monkeyAnimal.scale, monkeyAnimal.scale)
          ctx.translate(-monkeyAnimal.x, -monkeyAnimal.y)
          if (monkeyAnimal.state === 'eat' && monkeyAnimal.eatingTimer > 0) {
            const squish = Math.sin((1 - monkeyAnimal.eatingTimer / EAT_DURATION) * Math.PI * 6) * 0.05
            ctx.translate(monkeyAnimal.x, monkeyAnimal.y)
            ctx.scale(1 + squish, 1 - squish)
            ctx.translate(-monkeyAnimal.x, -monkeyAnimal.y)
          }
          drawGroundAnimal(ctx, monkeyAnimal, p)
          ctx.restore()

          // emotes
          if (monkeyAnimal.state === 'eat' && monkeyAnimal.eatingTimer > 0) {
            drawEatEmote(ctx, monkeyAnimal.x, mDrawY - 32 * monkeyAnimal.scale, monkeyAnimal.scale, monkeyAnimal.frame)
            if (monkeyAnimal.eatFoodType && monkeyAnimal.eatingTimer > EAT_DURATION * 0.3)
              drawFoodNearMouth(ctx, monkeyAnimal.eatFoodType, monkeyAnimal.x + monkeyAnimal.dir * 14 * monkeyAnimal.scale, mDrawY - 18 * monkeyAnimal.scale, (monkeyAnimal.eatingTimer / EAT_DURATION) * 0.6, monkeyAnimal.frame, p)
          }
          if (sc.thoughts && monkeyAnimal.thoughtText && monkeyAnimal.thoughtTimer && monkeyAnimal.thoughtTimer > 0)
            drawThoughtBubble(ctx, monkeyAnimal.x, mDrawY - 38 * monkeyAnimal.scale, monkeyAnimal.thoughtText, THOUGHT_DURATION - monkeyAnimal.thoughtTimer, monkeyAnimal.scale)
          if (monkeyAnimal.name) {
            ctx.save()
            ctx.globalAlpha = 0.55
            ctx.font = '9px "PingFang SC", "Microsoft YaHei", sans-serif'
            ctx.textAlign = 'center'
            ctx.fillStyle = isNight || effectiveWeather === 'night' ? '#9ca3af' : '#6b7280'
            ctx.fillText(monkeyAnimal.name, monkeyAnimal.x, groundY + 18 * monkeyAnimal.scale)
            ctx.restore()
          }
          // footprints
          if (sc.footprints && monkeyAnimal.state === 'run' && Math.random() < FOOTPRINT_CHANCE) {
            footprints.push({ x: monkeyAnimal.x + monkeyAnimal.dir * 4, y: groundY + 4, life: FOOTPRINT_LIFETIME, dir: monkeyAnimal.dir, scale: monkeyAnimal.scale * 0.5 })
          }
        } else {
          // ── tree drawing ──
          if (visibleTreeInfos.length > 0) {
            const ti = clamp(monkeyAnimal.treeIndex ?? 1, 0, visibleTreeInfos.length - 1)
            const tree = visibleTreeInfos[ti]
            if (tree) {
              drawMonkey(ctx, monkeyAnimal, tree, p)
              if (sc.thoughts && monkeyAnimal.thoughtText && monkeyAnimal.thoughtTimer && monkeyAnimal.thoughtTimer > 0) {
                const my = tree.groundY + tree.branchY * tree.scale - 50
                drawThoughtBubble(ctx, tree.x, my, monkeyAnimal.thoughtText, THOUGHT_DURATION - monkeyAnimal.thoughtTimer, monkeyAnimal.scale)
              }
            }
          }
        }
      }

      // ── bird ──
      if (birdAnimal && cfg.visible['bird'] !== false) {
        updateBird(birdAnimal, w, h, foods, isNight, visibleTreeInfos)
        updateThought(birdAnimal, isNight, animals, thoughtsPropRef.current ?? cfg.customThoughts, thoughtSceneRef.current)

        if (birdAnimal.birdOnGround) {
          // ── perched (on tree branch / roof) ──
          const perchX = birdAnimal.birdPerchX ?? birdAnimal.x
          const perchY = birdAnimal.birdPerchY ?? birdAnimal.y
          birdAnimal.x = perchX
          birdAnimal.y = perchY

          ctx.save()
          ctx.translate(perchX, perchY)
          ctx.scale(birdAnimal.scale, birdAnimal.scale)
          ctx.translate(-perchX, -perchY)
          drawBirdPerched(ctx, birdAnimal, p)
          ctx.restore()

          // emotes
          if (birdAnimal.state === 'eat' && birdAnimal.eatingTimer > 0) {
            drawEatEmote(ctx, perchX, perchY - 15 * birdAnimal.scale, birdAnimal.scale, birdAnimal.frame)
          }
          if (sc.thoughts && birdAnimal.thoughtText && birdAnimal.thoughtTimer && birdAnimal.thoughtTimer > 0)
            drawThoughtBubble(ctx, perchX, perchY - 25 * birdAnimal.scale, birdAnimal.thoughtText, THOUGHT_DURATION - birdAnimal.thoughtTimer, birdAnimal.scale)
          if (birdAnimal.name) {
            ctx.save()
            ctx.globalAlpha = 0.55
            ctx.font = '9px "PingFang SC", "Microsoft YaHei", sans-serif'
            ctx.textAlign = 'center'
            ctx.fillStyle = isNight || effectiveWeather === 'night' ? '#9ca3af' : '#6b7280'
            ctx.fillText(birdAnimal.name, perchX, perchY + 18 * birdAnimal.scale)
            ctx.restore()
          }
        } else {
          // ── flying ──
          const flyDrawY = birdAnimal.y + (birdAnimal.birdFlyY ?? 0)

          // shadow on ground
          ctx.save()
          ctx.globalAlpha = 0.03
          ctx.beginPath()
          ctx.ellipse(birdAnimal.x, groundY + 6, 8 * birdAnimal.scale, 1.5 * birdAnimal.scale, 0, 0, Math.PI * 2)
          ctx.fillStyle = '#000'
          ctx.fill()
          ctx.restore()

          ctx.save()
          ctx.translate(birdAnimal.x, flyDrawY)
          ctx.scale(birdAnimal.scale, birdAnimal.scale)
          ctx.translate(-birdAnimal.x, -birdAnimal.y)
          drawBirdFlying(ctx, birdAnimal, p)
          ctx.restore()

          // thought bubble when flying
          if (sc.thoughts && birdAnimal.thoughtText && birdAnimal.thoughtTimer && birdAnimal.thoughtTimer > 0)
            drawThoughtBubble(ctx, birdAnimal.x, flyDrawY - 20 * birdAnimal.scale, birdAnimal.thoughtText, THOUGHT_DURATION - birdAnimal.thoughtTimer, birdAnimal.scale)
          if (birdAnimal.name) {
            ctx.save()
            ctx.globalAlpha = 0.55
            ctx.font = '9px "PingFang SC", "Microsoft YaHei", sans-serif'
            ctx.textAlign = 'center'
            ctx.fillStyle = isNight || effectiveWeather === 'night' ? '#9ca3af' : '#6b7280'
            ctx.fillText(birdAnimal.name, birdAnimal.x, flyDrawY + 15 * birdAnimal.scale)
            ctx.restore()
          }
        }
      }
    }

    tick()

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchstart', onTouch)
      if (resizeTimer) clearTimeout(resizeTimer)
      clearInterval(weatherInterval)
      document.removeEventListener('visibilitychange', onVisibility)
      // names fallback save (when no context)
      if (!updateConfigRef.current) {
        const names: Record<string, string> = {}
        for (const a of animals) { if (a.name) names[a.type] = a.name }
        saveNamesFallback(names)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ height: `${height}px`, cursor: 'pointer' }}
      />
      {nameInput.visible && (
        <div className="absolute z-10" style={{ left: nameInput.x, top: nameInput.y, transform: 'translate(-50%, -100%)' }}>
          <div className="flex items-center gap-1 rounded-lg bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-200 dark:border-gray-600 px-2 py-1 backdrop-blur-sm">
            <input
              autoFocus
              className="w-20 bg-transparent text-xs text-gray-700 dark:text-gray-200 outline-none placeholder:text-gray-400"
              placeholder="起个名字"
              value={nameInput.value}
              maxLength={6}
              onChange={e => setNameInput(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={e => {
                if (e.key === 'Enter') handleNameSubmit()
                if (e.key === 'Escape') setNameInput(prev => ({ ...prev, visible: false }))
              }}
              onBlur={handleNameSubmit}
            />
            <button
              className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium flex-shrink-0"
              onMouseDown={e => { e.preventDefault(); handleNameSubmit() }}
            >✓</button>
          </div>
          <div
            className="mx-auto w-2 h-2 rotate-45 bg-white/95 dark:bg-gray-800/95 border-b border-r border-gray-200 dark:border-gray-600 -mt-1"
            style={{ marginLeft: 'calc(50% - 4px)' }}
          />
        </div>
      )}
    </div>
  )
}