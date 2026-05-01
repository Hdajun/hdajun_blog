// ─── 物理引擎：运动更新、碰撞、寻路 ──────────────────────────────────────────

import type { Animal, FoodItem, ClickTarget, TreeInfo, WeatherType } from './types'
import {
  DAMPING, MAX_SPEED_NORMAL, MAX_SPEED_SEEK, SEEK_FORCE, SEEK_DURATION,
  REPEL_DIST, REPEL_FORCE, FOOD_EAT_DIST, FOOD_SEEK_SPEED, FOOD_SEEK_FORCE,
  EAT_DURATION, JUMP_CHANCE, JUMP_VELOCITY, JUMP_GRAVITY, LOOK_CHANCE,
  LOOK_DURATION, MOOD_FEED_BONUS, MOOD_SEEK_BONUS, MOOD_DECAY_RATE,
  FOOD_COLORS, FOOD_LIFETIME, GROUND_Y_RATIO, FOOTPRINT_CHANCE,
  RAIN_SHELTER_DIST,
} from './constants'
import { clamp } from './utils'

/** 是否处于夜间（22:00 - 06:00） */
export function isNighttime(): boolean {
  const h = new Date().getHours()
  return h >= 22 || h < 6
}

/** 判断动物是否在某棵树底下躲雨 */
function isUnderTree(a: Animal, treeInfos: TreeInfo[]): boolean {
  for (const t of treeInfos) {
    if (Math.abs(a.x - t.x) < RAIN_SHELTER_DIST) return true
  }
  return false
}

/** 找最近的树，返回其x坐标 */
function findNearestTreeX(a: Animal, treeInfos: TreeInfo[]): number | null {
  let nearest: number | null = null
  let minDist = Infinity
  for (const t of treeInfos) {
    const d = Math.abs(a.x - t.x)
    if (d < minDist) {
      minDist = d
      nearest = t.x
    }
  }
  return minDist < 400 ? nearest : null
}

/** 更新地面动物 */
export function updateGroundAnimal(
  a: Animal,
  w: number,
  h: number,
  allAnimals: Animal[],
  foods: FoodItem[],
  clickTarget: ClickTarget,
  isNight: boolean,
  weather: WeatherType,
  treeInfos: TreeInfo[]
) {
  const groundY = h * GROUND_Y_RATIO
  a.frame++
  a.wanderTimer = Math.max(0, a.wanderTimer - 1)
  a.idleTimer = Math.max(0, a.idleTimer - 1)
  a.sitTimer = Math.max(0, a.sitTimer - 1)
  a.seekTimer = Math.max(0, a.seekTimer - 1)
  a.excitementTimer = Math.max(0, a.excitementTimer - 1)
  a.eatingTimer = Math.max(0, a.eatingTimer - 1)

  // ── mood decay ──
  a.mood = Math.max(0, a.mood - MOOD_DECAY_RATE)

  // ── jump physics ──
  if (a.jumpOffset !== 0 || a.jumpVY !== 0) {
    a.jumpOffset += a.jumpVY
    a.jumpVY += JUMP_GRAVITY
    if (a.jumpOffset >= 0) {
      a.jumpOffset = 0
      a.jumpVY = 0
    }
  }

  // ── night: go to sleep near center ──
  if (isNight && a.state !== 'eat') {
    // walk towards center slowly
    const centerX = w * 0.5
    const dx = centerX - a.x
    if (Math.abs(dx) > 80) {
      a.vx += Math.sign(dx) * 0.02
    } else {
      a.idleTimer = 200
      a.sitTimer = 200
      a.vx *= 0.9
    }
  }

  // ── rain: seek shelter under trees ──
  if (weather === 'rainy' && a.state !== 'eat') {
    if (!isUnderTree(a, treeInfos)) {
      const treeX = findNearestTreeX(a, treeInfos)
      if (treeX !== null) {
        const dx = treeX - a.x
        if (Math.abs(dx) > 15) {
          a.vx += Math.sign(dx) * 0.08
        } else {
          // 到了树下，停下
          a.idleTimer = 60
          a.sitTimer = 60
          a.vx *= 0.85
        }
      }
    } else {
      // 在树下，坐着不动
      if (a.idleTimer <= 0 && Math.random() < 0.03) {
        a.idleTimer = 80
        a.sitTimer = 80
      }
      a.vx *= 0.92
    }
  }

  // random jump (mood affects jump frequency)
  const jumpChance = isNight ? JUMP_CHANCE * 0.2 : JUMP_CHANCE * (0.5 + (a.mood / 100) * 0.8)
  if (a.jumpOffset === 0 && a.state !== 'eat' && Math.random() < jumpChance) {
    a.jumpVY = JUMP_VELOCITY * (0.6 + Math.random() * 0.5)
  }

  // look around
  a.lookTimer = Math.max(0, a.lookTimer - 1)
  if (a.lookTimer === 0 && a.state === 'idle' && Math.random() < LOOK_CHANCE) {
    a.lookTimer = LOOK_DURATION
  }

  // ── eating state ──
  if (a.eatingTimer > 0) {
    a.state = 'eat'
    a.vx *= 0.85
    a.vx *= DAMPING
    a.x += a.vx
    a.y = groundY
    a.x = clamp(a.x, 30, w - 30)
    return { leftFootprint: false, rightFootprint: false }
  }

  // ── find nearest uneaten food ──
  let nearestFood: FoodItem | null = null
  let nearestDist = Infinity
  for (const f of foods) {
    if (f.eaten) continue
    const dx = f.x - a.x
    const dy = f.y - groundY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < nearestDist) {
      nearestDist = dist
      nearestFood = f
    }
  }

  // seek food or wander
  if (nearestFood && nearestDist < 250) {
    const dx = nearestFood.x - a.x
    const dist = Math.abs(dx)
    if (dist > FOOD_EAT_DIST) {
      a.vx += (dx / Math.max(dist, 0.1)) * FOOD_SEEK_FORCE
      if (a.jumpOffset === 0 && Math.random() < 0.02) {
        a.jumpVY = JUMP_VELOCITY * 0.3
      }
    } else {
      // eat!
      nearestFood.eaten = true
      nearestFood.eatAnim = 0
      a.eatingTimer = EAT_DURATION
      a.eatFoodType = nearestFood.type
      a.vx = 0
      a.mood = Math.min(100, a.mood + MOOD_FEED_BONUS)
      // spawn particles
      const foodColor = FOOD_COLORS[nearestFood.type]
      nearestFood.particles = []
      for (let i = 0; i < 8; i++) {
        nearestFood.particles.push({
          x: nearestFood.x, y: nearestFood.y,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 3 - 1,
          life: 1,
          color: i % 2 === 0 ? foodColor : '#FFD700',
        })
      }
    }
    const spd = Math.abs(a.vx)
    if (spd > FOOD_SEEK_SPEED) a.vx = (a.vx / spd) * FOOD_SEEK_SPEED
  } else if (a.seekTimer > 0) {
    const dx = clickTarget.x - a.x
    const dist = Math.abs(dx)
    if (dist > 20) a.vx += (dx / dist) * SEEK_FORCE
  } else {
    if (a.wanderTimer === 0) {
      a.wanderTimer = 80 + Math.random() * 160
      const spd = isNight ? 0.1 + Math.random() * 0.2 : 0.3 + Math.random() * 0.7
      a.wanderVx = (Math.random() > 0.5 ? 1 : -1) * spd
      if (Math.random() < (isNight ? 0.6 : 0.3)) {
        a.wanderVx = 0
        a.idleTimer = 50 + Math.random() * (isNight ? 300 : 100)
        if (Math.random() < 0.35) a.sitTimer = a.idleTimer
      }
    }
    if (a.idleTimer > 0) {
      a.vx = a.vx * (1 - 0.06)  // lerp to 0
    } else {
      a.vx = a.vx + (a.wanderVx - a.vx) * 0.04
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

  if (a.eatingTimer > 0) a.state = 'eat'
  else if (a.sitTimer > 0) a.state = 'sit'
  else if (a.idleTimer > 0) a.state = 'idle'
  else a.state = Math.abs(a.vx) > 0.15 ? 'run' : 'idle'

  if (a.vx > 0.08) a.dir = 1
  else if (a.vx < -0.08) a.dir = -1

  // footprints
  const leftFootprint = a.state === 'run' && Math.random() < FOOTPRINT_CHANCE
  return { leftFootprint }
}

/** 更新猴子（双模态：树上 / 地面） */
export function updateMonkey(
  a: Animal,
  w: number,
  h: number,
  foods: FoodItem[],
  treeInfos: TreeInfo[],
  isNight: boolean,
) {
  a.frame++
  a.monkeyTimer = Math.max(0, (a.monkeyTimer ?? 0) - 1)

  if (a.monkeyOnGround) {
    // ── 地面模式 ────────────────────────────────────────────────────────────
    const groundY = h * GROUND_Y_RATIO

    // jump physics
    if (a.jumpOffset !== 0 || a.jumpVY !== 0) {
      a.jumpOffset += a.jumpVY
      a.jumpVY += JUMP_GRAVITY
      if (a.jumpOffset >= 0) { a.jumpOffset = 0; a.jumpVY = 0 }
    }

    // mood decay
    a.mood = Math.max(0, a.mood - MOOD_DECAY_RATE)
    a.eatingTimer = Math.max(0, a.eatingTimer - 1)
    a.wanderTimer = Math.max(0, a.wanderTimer - 1)
    a.idleTimer = Math.max(0, a.idleTimer - 1)

    // eating state – stay put
    if (a.eatingTimer > 0) {
      a.state = 'eat'
      a.vx *= DAMPING
      a.x = clamp(a.x + a.vx, 30, w - 30)
      a.y = groundY
      return
    }

    // find nearest uneaten food
    let nearestFood: FoodItem | null = null
    let nearestDist = Infinity
    for (const f of foods) {
      if (f.eaten) continue
      const dist = Math.abs(f.x - a.x)
      if (dist < nearestDist) { nearestDist = dist; nearestFood = f }
    }

    if (nearestFood && nearestDist < 280) {
      const dx = nearestFood.x - a.x
      const dist = Math.abs(dx)
      if (dist > FOOD_EAT_DIST) {
        a.vx += (dx / Math.max(dist, 0.1)) * FOOD_SEEK_FORCE
      } else {
        nearestFood.eaten = true
        nearestFood.eatAnim = 0
        a.eatingTimer = EAT_DURATION
        a.eatFoodType = nearestFood.type
        a.vx = 0
        a.mood = Math.min(100, a.mood + MOOD_FEED_BONUS)
        const foodColor = FOOD_COLORS[nearestFood.type]
        nearestFood.particles = []
        for (let i = 0; i < 8; i++) {
          nearestFood.particles.push({
            x: nearestFood.x, y: nearestFood.y,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 3 - 1,
            life: 1,
            color: i % 2 === 0 ? foodColor : '#FFD700',
          })
        }
      }
    } else {
      // wander
      if (a.wanderTimer === 0) {
        a.wanderTimer = 60 + Math.floor(Math.random() * 120)
        const spd = isNight ? 0.15 + Math.random() * 0.2 : 0.4 + Math.random() * 0.9
        a.wanderVx = (Math.random() > 0.5 ? 1 : -1) * spd
        if (Math.random() < (isNight ? 0.6 : 0.3)) {
          a.wanderVx = 0
          a.idleTimer = 40 + Math.floor(Math.random() * 80)
        }
      }
      a.vx += a.idleTimer > 0
        ? (0 - a.vx) * 0.1
        : (a.wanderVx - a.vx) * 0.05
    }

    // random jump (monkey jumps more eagerly)
    if (a.jumpOffset === 0 && Math.random() < JUMP_CHANCE * 2) {
      a.jumpVY = JUMP_VELOCITY * (0.7 + Math.random() * 0.5)
    }

    // boundary
    if (a.x < 40) a.vx += 0.2
    if (a.x > w - 40) a.vx -= 0.2
    const spd = Math.abs(a.vx)
    if (spd > MAX_SPEED_NORMAL * 1.3) a.vx = (a.vx / spd) * MAX_SPEED_NORMAL * 1.3
    a.vx *= DAMPING
    a.x = clamp(a.x + a.vx, 30, w - 30)
    a.y = groundY

    a.state = a.idleTimer > 0 ? 'idle' : (Math.abs(a.vx) > 0.15 ? 'run' : 'idle')
    if (a.vx > 0.08) a.dir = 1
    else if (a.vx < -0.08) a.dir = -1

    // try to climb tree when timer expires
    if (a.monkeyTimer === 0 && a.eatingTimer === 0) {
      const branchTrees = treeInfos
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => t.branchY !== 0)
      if (branchTrees.length > 0) {
        let nearest = branchTrees[0]
        for (const bt of branchTrees) {
          if (Math.abs(bt.t.x - a.x) < Math.abs(nearest.t.x - a.x)) nearest = bt
        }
        const distToTree = Math.abs(nearest.t.x - a.x)
        if (distToTree < 28) {
          // climb!
          a.monkeyOnGround = false
          a.monkeyPose = Math.random() > 0.5 ? 'hang' : 'sit'
          a.treeIndex = nearest.i
          a.monkeyTimer = 90 + Math.floor(Math.random() * 90)  // 1.5-3s on tree
          a.jumpOffset = 0; a.jumpVY = 0; a.vx = 0
        } else {
          // walk toward tree first, retry soon
          a.wanderVx = Math.sign(nearest.t.x - a.x) * 0.8
          a.idleTimer = 0
          a.monkeyTimer = 40
        }
      } else {
        // no branchable tree, stay on ground a while
        a.monkeyTimer = 300 + Math.floor(Math.random() * 200)
      }
    }

  } else {
    // ── 树上模式 ────────────────────────────────────────────────────────────
    if (a.monkeyTimer === 0) {
      if (Math.random() < 0.65) {
        // come down to ground (~65% chance after each pose)
        const ti = a.treeIndex ?? 0
        const tree = treeInfos[ti]
        if (tree) {
          a.x = tree.x + (Math.random() > 0.5 ? 1 : -1) * 18
          a.y = tree.groundY
        }
        a.monkeyOnGround = true
        a.vx = 0
        a.wanderTimer = 0
        a.idleTimer = 30
        a.monkeyTimer = 300 + Math.floor(Math.random() * 200)  // 5-8s on ground
      } else {
        // switch pose and stay a bit longer
        a.monkeyPose = a.monkeyPose === 'hang' ? 'sit' : 'hang'
        a.monkeyTimer = 90 + Math.floor(Math.random() * 90)
      }
    }
    a.state = 'idle'
  }
}

/** 更新食物列表 */
export function updateFoods(foods: FoodItem[]) {
  for (let i = foods.length - 1; i >= 0; i--) {
    const f = foods[i]
    if (f.eaten) {
      f.eatAnim += 0.06
      if (f.particles) {
        for (const pt of f.particles) {
          pt.x += pt.vx
          pt.y += pt.vy
          pt.vy += 0.12
          pt.life -= 0.025
        }
      }
      if (f.eatAnim >= 1) {
        foods.splice(i, 1)
      }
    } else {
      f.timer--
      if (f.timer <= 0) {
        foods.splice(i, 1)
      }
    }
  }
}