// ─── PetCanvas 常量与调色板 ────────────────────────────────────────────────────

import type { Palette } from './types.ts'

// ─── 物理 / 行为参数 ────────────────────────────────────────────────────────────

export const GROUND_Y_RATIO = 0.72
export const DAMPING = 0.96
export const MAX_SPEED_NORMAL = 1.2
export const MAX_SPEED_SEEK = 2.0
export const SEEK_FORCE = 0.15
export const SEEK_DURATION = 180
export const MONKEY_SWITCH_INTERVAL = 300
export const REPEL_DIST = 60
export const REPEL_FORCE = 0.08

// Food
export const FOOD_LIFETIME = 600
export const FOOD_EAT_DIST = 22
export const FOOD_SEEK_SPEED = 2.2
export const FOOD_SEEK_FORCE = 0.18
export const EAT_DURATION = 90
export const MAX_FOODS = 5

// Vitality
export const JUMP_CHANCE = 0.004
export const JUMP_VELOCITY = -3.5
export const JUMP_GRAVITY = 0.25
export const LOOK_CHANCE = 0.006
export const LOOK_DURATION = 40

// Mood
export const MOOD_FEED_BONUS = 15     // 投喂增加心情
export const MOOD_SEEK_BONUS = 5      // 被召唤增加心情
export const MOOD_DECAY_RATE = 0.002  // 每帧自然衰减
export const MOOD_IDLE_THRESHOLD = 30  // 低于此值进入"不开心"行为
export const MOOD_HAPPY_THRESHOLD = 70 // 高于此值进入"开心"行为

// Footprints
export const FOOTPRINT_LIFETIME = 120  // 脚印持续帧数
export const FOOTPRINT_CHANCE = 0.08   // 每帧留下脚印的概率（奔跑时）

// Weather
export const RAIN_DROP_COUNT = 80        // 雨滴数
export const RAIN_SHELTER_DIST = 60      // 动物认为"在树下"的距离
export const MAX_RAIN_PUDDLES = 12       // 最大水坑数
export const STAR_COUNT = 40             // 星星数
export const CLOUD_COUNT = 5             // 乌云数
export const WEATHER_CHECK_INTERVAL = 60000 // 天气检查间隔（ms）

// ─── 调色板 ─────────────────────────────────────────────────────────────────────

export const PALETTE_LIGHT: Palette = {
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

export const PALETTE_DARK: Palette = {
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

// ─── 气泡文本 ──────────────────────────────────────────────────────────────────

export const THOUGHTS = [
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
  '有吃的吗？我好饿！',
  '那个鱼干看起来好好吃~',
  '骨头！我要骨头！',
  '香蕉是世界上最棒的！',
  '吃饱了才有力气卖萌',
  '感谢投喂~',
  '再来一个嘛！',
]

/** 不开心时的气泡 */
export const THOUGHTS_SAD = [
  '好无聊啊…',
  '有人吗？',
  '怎么没人理我',
  '我想出去玩…',
  '有点孤单呢',
  '好饿…',
  '有人能陪我吗？',
  '好想被摸摸头',
  '什么时候才有吃的',
  '闷闷不乐…',
]

/** 开心时的气泡 */
export const THOUGHTS_HAPPY = [
  '好开心呀！',
  '嘿嘿嘿~',
  '我是最幸福的！',
  '今天的阳光好暖~',
  '耶！最爱这个！',
  '心情满分！',
  '生活真美好~',
  '有吃有喝好幸福！',
  '再来再来！',
  '每天都这么开心就好啦！',
]

/** 夜间（睡眠中）气泡 */
export const THOUGHTS_NIGHT = [
  'Zzz…',
  '呼…呼…',
  '好困…',
  '晚安~',
  '不想起来…',
  '做梦中…',
  '…zzz',
]

export const THOUGHT_DURATION = 300
export const THOUGHT_COOLDOWN = 300

// ─── 食物 ──────────────────────────────────────────────────────────────────────

export const FOOD_TYPES: Array<'fish' | 'bone' | 'banana'> = ['fish', 'bone', 'banana']
export const FOOD_COLORS: Record<string, string> = { fish: '#60A5FA', bone: '#F5F5F4', banana: '#FDE047' }

// ─── 默认动物配置 ──────────────────────────────────────────────────────────────

export const DEFAULT_ANIMAL_CONFIGS: Array<{
  type: import('./types.ts').AnimalType
  vx: number
  dir: 1 | -1
  frame: number
  state: import('./types.ts').AnimalState
  wanderTimer: number
  wanderVx: number
  idleTimer: number
  sitTimer: number
  scale: number
  treeIndex?: number
  monkeyPose?: import('./types.ts').MonkeyPose
}> = [
  { type: 'dog',      vx:  0.5, dir:  1, frame:   0, state: 'run',  wanderTimer:  60, wanderVx:  0.5, idleTimer: 0, sitTimer: 0, scale: 1    },
  { type: 'cat',      vx: -0.4, dir: -1, frame:  40, state: 'run',  wanderTimer:  90, wanderVx: -0.4, idleTimer: 0, sitTimer: 0, scale: 0.9  },
  { type: 'elephant', vx:  0.3, dir:  1, frame:  20, state: 'run',  wanderTimer: 120, wanderVx:  0.3, idleTimer: 0, sitTimer: 0, scale: 0.7  },
  { type: 'rabbit',   vx:  0.6, dir:  1, frame:  60, state: 'run',  wanderTimer:  40, wanderVx:  0.6, idleTimer: 0, sitTimer: 0, scale: 0.85 },
  { type: 'giraffe',  vx: -0.2, dir: -1, frame:  10, state: 'run',  wanderTimer: 100, wanderVx: -0.2, idleTimer: 0, sitTimer: 0, scale: 0.65 },
  { type: 'tiger',    vx:  0.4, dir:  1, frame:  30, state: 'run',  wanderTimer:  80, wanderVx:  0.4, idleTimer: 0, sitTimer: 0, scale: 0.8  },
  { type: 'lion',     vx: -0.3, dir: -1, frame:  50, state: 'run',  wanderTimer: 110, wanderVx: -0.3, idleTimer: 0, sitTimer: 0, scale: 0.75 },
  { type: 'panda',    vx:  0.2, dir:  1, frame:  70, state: 'idle', wanderTimer:  20, wanderVx:  0,   idleTimer: 100, sitTimer: 0, scale: 0.75 },
  { type: 'monkey',   vx:  0,   dir:  1, frame:   0, state: 'idle', wanderTimer:   0, wanderVx:  0,   idleTimer: 0, sitTimer: 0, scale: 0.7, treeIndex: 1, monkeyPose: 'hang' },
]

// ─── 场景主题配置 ─────────────────────────────────────────────────────────────

export interface ThemePropItem { key: string; label: string }

export interface SceneThemeConfig {
  id: string
  label: string
  emoji: string
  description: string
  props: ThemePropItem[]
  defaultProps: Record<string, boolean>
}

export const SCENE_THEME_CONFIGS: SceneThemeConfig[] = [
  {
    id: 'forest',
    label: '森林',
    emoji: '🌲',
    description: '郁郁葱葱',
    props: [
      { key: 'trees',   label: '树木' },
      { key: 'rocks',   label: '石头' },
      { key: 'grass',   label: '草地' },
      { key: 'flowers', label: '花朵' },
    ],
    defaultProps: { trees: true, rocks: true, grass: true, flowers: true },
  },
  {
    id: 'desert',
    label: '沙漠',
    emoji: '🏜️',
    description: '大漠孤烟',
    props: [
      { key: 'cactus',      label: '仙人掌' },
      { key: 'deadTree',    label: '枯木' },
      { key: 'dune',        label: '沙丘' },
      { key: 'tumbleweed',  label: '风滚草' },
    ],
    defaultProps: { cactus: true, deadTree: true, dune: true, tumbleweed: true },
  },
  {
    id: 'garden',
    label: '花园',
    emoji: '🌸',
    description: '繁花似锦',
    props: [
      { key: 'flowerBed', label: '花圃' },
      { key: 'fence',     label: '篱笆' },
      { key: 'fountain',  label: '喷泉' },
      { key: 'petals',    label: '落花' },
    ],
    defaultProps: { flowerBed: true, fence: true, fountain: true, petals: true },
  },
  {
    id: 'village',
    label: '古村落',
    emoji: '🏘️',
    description: '宁静朴素',
    props: [
      { key: 'cottage',     label: '茅草屋' },
      { key: 'lantern',     label: '石灯笼' },
      { key: 'ancientTree', label: '古树' },
      { key: 'bambooFence', label: '竹篱笆' },
    ],
    defaultProps: { cottage: true, lantern: true, ancientTree: true, bambooFence: true },
  },
]

export const DEFAULT_THEME_PROPS: Record<string, Record<string, boolean>> =
  Object.fromEntries(SCENE_THEME_CONFIGS.map(c => [c.id, { ...c.defaultProps }]))