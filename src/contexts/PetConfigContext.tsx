'use client'

import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'
import type { Animal, PetCanvasConfig, CustomThoughts, ThoughtScene } from '@/components/PetCanvas/types'
import { DEFAULT_THEME_PROPS, THOUGHTS, THOUGHTS_SAD, THOUGHTS_HAPPY, THOUGHTS_NIGHT, THOUGHTS_404 } from '@/components/PetCanvas/constants'

// ─── 构建默认自定义气泡配置 ─────────────────────────────────────────────────

export const DEFAULT_CUSTOM_THOUGHTS: CustomThoughts = {
  day: {
    normal: [...THOUGHTS],
    happy: [...THOUGHTS_HAPPY],
    sad: [...THOUGHTS_SAD],
  },
  night: {
    normal: [...THOUGHTS_NIGHT],
    happy: [],
    sad: [],
  },
  notfound: {
    normal: [...THOUGHTS_404],
    happy: [],
    sad: [],
  },
}

// ─── 默认配置 ──────────────────────────────────────────────────────────────────

export const DEFAULT_PET_CONFIG: PetCanvasConfig = {
  names: {},
  visible: {},
  scales: {},
  accessories: {},
  weather: { mode: 'auto', manualType: 'sunny', rainIntensity: 1.0, starDensity: 40 },
  scenery: {
    theme: 'forest',
    themeProps: DEFAULT_THEME_PROPS,
    footprints: true,
    thoughts: true,
    groundLine: true,
  },
  customThoughts: DEFAULT_CUSTOM_THOUGHTS,
}

const STORAGE_KEY = 'petcanvas-config'
const LEGACY_NAMES_KEY = 'petcanvas-names'

function deepMergeCustomThoughts(base: CustomThoughts, override: Partial<CustomThoughts>): CustomThoughts {
  const scenes: ThoughtScene[] = ['day', 'night', 'notfound']
  const result: CustomThoughts = { ...base }
  for (const scene of scenes) {
    const o = override[scene]
    if (o) {
      result[scene] = {
        normal: o.normal ?? base[scene].normal,
        happy:  o.happy  ?? base[scene].happy,
        sad:    o.sad    ?? base[scene].sad,
      }
    }
  }
  return result
}

function loadConfig(): PetCanvasConfig {
  if (typeof window === 'undefined') return DEFAULT_PET_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_PET_CONFIG,
        ...parsed,
        weather: { ...DEFAULT_PET_CONFIG.weather, ...parsed.weather },
        scenery: {
          ...DEFAULT_PET_CONFIG.scenery,
          ...parsed.scenery,
          // 深合并 themeProps，保证新主题有默认值
          themeProps: {
            ...DEFAULT_THEME_PROPS,
            ...parsed.scenery?.themeProps,
          },
        },
        customThoughts: parsed.customThoughts
          ? deepMergeCustomThoughts(DEFAULT_CUSTOM_THOUGHTS, parsed.customThoughts)
          : DEFAULT_CUSTOM_THOUGHTS,
      }
    }
    // 迁移旧 key
    const legacyNames = JSON.parse(localStorage.getItem(LEGACY_NAMES_KEY) || '{}')
    return { ...DEFAULT_PET_CONFIG, names: legacyNames }
  } catch {
    return DEFAULT_PET_CONFIG
  }
}

function saveConfig(config: PetCanvasConfig) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)) } catch {}
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface PetConfigContextValue {
  config: PetCanvasConfig
  updateConfig: (partial: Partial<PetCanvasConfig>) => void
  animalsRef: React.MutableRefObject<Animal[] | null>
}

const PetConfigContext = createContext<PetConfigContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PetConfigProvider({ children }: { children: React.ReactNode }) {
  // 始终以默认值启动（服务端/客户端一致），避免 hydration mismatch
  const [config, setConfig] = useState<PetCanvasConfig>(DEFAULT_PET_CONFIG)
  const animalsRef = useRef<Animal[] | null>(null)

  // 客户端挂载后再读 localStorage
  useEffect(() => {
    setConfig(loadConfig())
  }, [])

  const updateConfig = useCallback((partial: Partial<PetCanvasConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...partial }
      saveConfig(next)
      return next
    })
  }, [])

  return (
    <PetConfigContext.Provider value={{ config, updateConfig, animalsRef }}>
      {children}
    </PetConfigContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePetConfig() {
  return useContext(PetConfigContext)
}