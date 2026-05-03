// ─── PetCanvas 类型定义 ────────────────────────────────────────────────────────

export type AnimalType = 'dog' | 'cat' | 'monkey' | 'elephant' | 'rabbit' | 'giraffe' | 'tiger' | 'lion' | 'panda' | 'hedgehog' | 'pig' | 'snake' | 'bird'
export type AnimalState = 'run' | 'idle' | 'sit' | 'eat'
export type MonkeyPose = 'hang' | 'sit'
export type FoodType = 'fish' | 'bone' | 'banana' | 'worm'

export interface Animal {
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
  monkeyOnGround?: boolean
  thoughtText?: string
  thoughtTimer?: number
  // vitality
  jumpOffset: number
  jumpVY: number
  lookTimer: number
  excitementTimer: number
  // behavior traits
  canJump: boolean   // 是否会跳跃（蛇不会跳）
  // eating
  eatingTimer: number
  eatFoodType?: FoodType
  // mood
  mood: number // 0-100, higher = happier
  // name
  name?: string
  // config-driven fields
  visible: boolean
  accessories: Accessory[]
  // bird flight fields
  birdOnGround?: boolean   // true=停歇中, false=飞行中
  birdFlyY?: number        // 飞行时 Y 偏移（负值=在天上）
  birdFlyVY?: number       // 飞行垂直速度
  birdFlapPhase?: number   // 翅膀扇动相位
  birdPerchTimer?: number  // 停歇计时器（倒计时后起飞）
  birdFlyTimer?: number    // 飞行计时器（倒计时后找停歇点）
  birdPerchX?: number      // 停歇位置 X
  birdPerchY?: number      // 停歇位置 Y
  birdTreeIndex?: number   // 停在哪棵树上
}

export interface FoodItem {
  x: number
  y: number
  type: FoodType
  timer: number
  eaten: boolean
  eatAnim: number // 0..1 eat animation progress
  particles?: { x: number; y: number; vx: number; vy: number; life: number; color: string }[]
}

export type SceneTheme = 'forest' | 'desert' | 'garden' | 'village'

export type SceneryElementType =
  | 'tree' | 'rock' | 'grass' | 'flower'
  | 'cactus' | 'deadTree' | 'dune' | 'tumbleweed'
  | 'flowerBed' | 'fence' | 'fountain' | 'arch' | 'petals' | 'mushroom' | 'bush'
  | 'cottage' | 'lantern' | 'ancientTree' | 'bambooFence' | 'smoke' | 'clothesLine' | 'mudWall'

export interface Scenery {
  type: SceneryElementType
  x: number
  scale: number
  variant: number
}

export interface TreeInfo {
  x: number
  groundY: number
  scale: number
  branchY: number
  branchDir: 1 | -1
}

export interface ClickTarget {
  x: number
  y: number
  active: boolean
  timer: number
}

/** 动物绘制函数签名 */
export type DrawAnimalFn = (ctx: CanvasRenderingContext2D, animal: Animal, palette: Palette) => void

/** 调色板 */
export interface Palette {
  line: string
  trunk: string
  trunkDark: string
  foliage: string
  foliageDark: string
  foliageLight: string
  grass: string
  grassDark: string
  flowerPetals: string[]
  flowerCenter: string
  rock: string
  rockDark: string
  rockLight: string
  dogBody: string
  dogBelly: string
  catBody: string
  catBelly: string
  elephantBody: string
  elephantBelly: string
  rabbitBody: string
  rabbitBelly: string
  rabbitEar: string
  giraffeBody: string
  giraffeBelly: string
  giraffeSpot: string
  monkeyBody: string
  monkeyBelly: string
  monkeyFace: string
  tigerBody: string
  tigerBelly: string
  tigerStripe: string
  lionBody: string
  lionBelly: string
  lionMane: string
  pandaBody: string
  pandaBlack: string
  pandaBelly: string
  hedgehogBody: string
  hedgehogBelly: string
  hedgehogSpine: string
  pigBody: string
  pigBelly: string
  pigSnout: string
  snakeBody: string
  snakeBelly: string
  snakePattern: string
  birdBody: string
  birdBelly: string
  birdWing: string
  birdBeak: string
}

/** 脚印 */
export interface Footprint {
  x: number
  y: number
  life: number // 剩余生命帧数
  dir: 1 | -1
  scale: number
}

// ─── 装饰 ──────────────────────────────────────────────────────────────────────

export type AccessoryType = 'hat' | 'scarf' | 'glasses' | 'bowtie' | 'crown' | 'wings'

export interface Accessory {
  type: AccessoryType
  variant: number
}

// ─── 天气配置 ───────────────────────────────────────────────────────────────────

/** 天气类型 */
export type WeatherType = 'sunny' | 'rainy' | 'night' | 'snow'

export interface WeatherConfig {
  mode: 'auto' | 'manual'
  manualType: WeatherType
  rainIntensity: number  // 0.3 ~ 1.5
  starDensity: number    // 10 ~ 80
}

// ─── 场景配置 ───────────────────────────────────────────────────────────────────

export interface SceneryConfig {
  theme: SceneTheme
  themeProps: Record<string, Record<string, boolean>>
  footprints: boolean
  thoughts: boolean
  groundLine: boolean
}

// ─── 全局宠物配置 ──────────────────────────────────────────────────────────────

export interface PetCanvasConfig {
  names: Record<string, string>
  visible: Record<string, boolean>
  scales: Record<string, number>
  accessories: Record<string, Accessory[]>
  weather: WeatherConfig
  scenery: SceneryConfig
}

/** 雨滴粒子 */
export interface RainDrop {
  x: number
  y: number
  speed: number
  length: number
}

/** 星星 */
export interface Star {
  x: number // 0..1 ratio
  y: number // 0..1 ratio
  size: number
  twinklePhase: number
  twinkleSpeed: number
}

/** 乌云 */
export interface Cloud {
  x: number
  y: number
  width: number
  height: number
  speed: number
  opacity: number
}

/** 雪花 */
export interface SnowFlake {
  x: number
  y: number
  r: number     // 半径
  speed: number
  drift: number // 水平漂移速度
  phase: number // 摇摆相位
}