'use client'

import { useState, useEffect, useRef } from 'react'
import { Slider, Switch } from 'antd'
import { useTheme } from 'next-themes'
import PetCanvas from '@/components/PetCanvas'
import { usePetConfig } from '@/contexts/PetConfigContext'
import type { AnimalType, WeatherType, Animal, TreeInfo } from '@/components/PetCanvas/types'
import { DEFAULT_ANIMAL_CONFIGS, PALETTE_LIGHT, PALETTE_DARK, SCENE_THEME_CONFIGS, DEFAULT_THEME_PROPS } from '@/components/PetCanvas/constants'
import { drawGroundAnimal, drawMonkey } from '@/components/PetCanvas/animals'

// ─── 动物元数据 ───────────────────────────────────────────────────────────────

const ANIMAL_META: Record<AnimalType, { label: string }> = {
  dog:      { label: '狗狗' },
  cat:      { label: '猫猫' },
  elephant: { label: '大象' },
  rabbit:   { label: '兔兔' },
  giraffe:  { label: '长颈鹿' },
  tiger:    { label: '老虎' },
  lion:     { label: '狮子' },
  panda:    { label: '熊猫' },
  monkey:   { label: '猴子' },
}

const ALL_TYPES = DEFAULT_ANIMAL_CONFIGS.map(c => c.type)

const WEATHER_OPTIONS: { type: WeatherType; label: string; desc: string; icon: React.ReactNode }[] = [
  { type: 'sunny', label: '晴天', desc: '阳光明媚', icon: <SunSVG /> },
  { type: 'rainy', label: '雨天', desc: '淅淅沥沥', icon: <RainSVG /> },
  { type: 'night', label: '夜晚', desc: '繁星满天', icon: <NightSVG /> },
  { type: 'snow',  label: '雪天', desc: '白雪纷纷', icon: <SnowSVG /> },
]

const GLOBAL_SCENE_ITEMS = [
  { key: 'footprints', label: '脚印' },
  { key: 'thoughts',   label: '气泡' },
  { key: 'groundLine', label: '地面线' },
]

// ─── SVG 天气图标 ─────────────────────────────────────────────────────────────

function SunSVG() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="6" fill="#FCD34D" />
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const x1 = 14 + Math.cos(rad) * 9
        const y1 = 14 + Math.sin(rad) * 9
        const x2 = 14 + Math.cos(rad) * 12.5
        const y2 = 14 + Math.sin(rad) * 12.5
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
      })}
    </svg>
  )
}

function RainSVG() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <ellipse cx="12" cy="11" rx="7" ry="5" fill="#9CA3AF" />
      <ellipse cx="17" cy="10" rx="5.5" ry="4" fill="#9CA3AF" />
      <ellipse cx="10" cy="13" rx="6" ry="3.5" fill="#9CA3AF" />
      <line x1="9"  y1="18" x2="7"  y2="23" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="14" y1="18" x2="12" y2="23" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="19" y1="18" x2="17" y2="23" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function NightSVG() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      {/* crescent moon */}
      <path
        d="M16 6a8 8 0 1 1-8 8 6 6 0 0 0 8-8z"
        fill="#FDE68A"
      />
      {/* small stars */}
      <circle cx="22" cy="7" r="1.2" fill="#E5E7EB" />
      <circle cx="19" cy="3" r="0.9" fill="#E5E7EB" />
      <circle cx="25" cy="12" r="0.8" fill="#E5E7EB" />
    </svg>
  )
}

function SnowSVG() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <ellipse cx="12" cy="10" rx="7" ry="5" fill="#D1D5DB" />
      <ellipse cx="17" cy="9"  rx="5.5" ry="4" fill="#D1D5DB" />
      <ellipse cx="10" cy="12" rx="6" ry="3.5" fill="#D1D5DB" />
      <circle cx="9"  cy="19" r="1.6" fill="#A5B4FC" />
      <circle cx="14" cy="22" r="1.4" fill="#A5B4FC" />
      <circle cx="19" cy="19" r="1.6" fill="#A5B4FC" />
      <circle cx="7"  cy="24" r="1.0" fill="#C7D2FE" />
      <circle cx="21" cy="24" r="1.0" fill="#C7D2FE" />
    </svg>
  )
}

// ─── SVG 场景主题图标 ─────────────────────────────────────────────────────────

/** 森林：彩色大树+小动物+小花 */
function ForestIcon({ active }: { active: boolean }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      {/* 天空底色（选中时淡蓝） */}
      {active && <rect x="0" y="0" width="32" height="32" rx="8" fill="#EEF2FF" />}
      
      {/* 地面草地 */}
      <ellipse cx="16" cy="29.5" rx="13" ry="2" fill="#86EFAC" opacity="0.45" />
      <ellipse cx="16" cy="29" rx="12" ry="1.5" fill="#BBF7D0" opacity="0.35" />
      
      {/* ── 左侧小石头 ── */}
      <ellipse cx="6" cy="27" rx="3" ry="2" fill="#78716C" opacity="0.5" />
      <ellipse cx="6" cy="26.5" rx="2.5" ry="1.5" fill="#A8A29E" opacity="0.6" />
      <ellipse cx="5" cy="26" rx="1" ry="0.6" fill="white" opacity="0.3" />
      
      {/* ── 右侧小花 ── */}
      {/* 花瓣（4片小圆） */}
      {[0, 90, 180, 270].map((deg, i) => {
        const r = (deg * Math.PI) / 180
        return (
          <circle
            key={i}
            cx={25 + Math.cos(r) * 1.8}
            cy={26 + Math.sin(r) * 1.8}
            r="1.2"
            fill="#F9A8D4"
            opacity="0.75"
          />
        )
      })}
      {/* 花心 */}
      <circle cx="25" cy="26" r="0.9" fill="#FCD34D" opacity="0.85" />
      
      {/* ── 主树干 ── */}
      {/* 树干阴影 */}
      <rect x="14" y="20.5" width="4.5" height="9" rx="2" fill="#78350F" opacity="0.2" />
      {/* 树干主体 */}
      <rect x="13.5" y="20" width="5" height="9" rx="2" fill="#92400E" opacity="0.85" />
      {/* 树干高光 */}
      <rect x="14.2" y="20.5" width="1.5" height="8" rx="0.8" fill="#D97706" opacity="0.4" />
      
      {/* ── 树冠（多层圆形叠加） ── */}
      {/* 底层阴影 */}
      <circle cx="16" cy="17.5" r="7.5" fill="#15803D" opacity="0.25" />
      {/* 树冠底层（深绿） */}
      <circle cx="16" cy="17" r="7" fill="#15803D" opacity="0.9" />
      {/* 树冠中层 */}
      <circle cx="16" cy="15.5" r="6.2" fill="#16A34A" opacity="0.85" />
      {/* 树冠左球 */}
      <circle cx="11" cy="17" r="5" fill="#22C55E" opacity="0.8" />
      {/* 树冠右球 */}
      <circle cx="21" cy="17" r="5" fill="#22C55E" opacity="0.8" />
      {/* 树冠顶部亮层 */}
      <circle cx="16" cy="12.5" r="4.5" fill="#4ADE80" opacity="0.75" />
      {/* 高光点 */}
      <circle cx="14.5" cy="11.5" r="2" fill="#BBF7D0" opacity="0.45" />
      <circle cx="13.5" cy="10.5" r="1" fill="#BBF7D0" opacity="0.6" />
      
      {/* ── 可爱小松鼠（树干上） ── */}
      {/* 身体 */}
      <ellipse cx="18.5" cy="23" rx="2" ry="2.5" fill="#D97706" opacity="0.8" />
      {/* 头 */}
      <circle cx="18.5" cy="21" r="1.5" fill="#F59E0B" opacity="0.85" />
      {/* 耳朵 */}
      <circle cx="17.8" cy="20" r="0.6" fill="#F59E0B" opacity="0.8" />
      <circle cx="19.2" cy="20" r="0.6" fill="#F59E0B" opacity="0.8" />
      {/* 眼睛 */}
      <circle cx="18" cy="21" r="0.3" fill="#1C1917" opacity="0.8" />
      <circle cx="19" cy="21" r="0.3" fill="#1C1917" opacity="0.8" />
      {/* 大尾巴（蓬松） */}
      <ellipse cx="20" cy="24" rx="2.5" ry="3.5" transform="rotate(30 20 24)" fill="#D97706" opacity="0.7" />
      <ellipse cx="20.5" cy="23.5" rx="2" ry="3" transform="rotate(30 20.5 23.5)" fill="#FDE68A" opacity="0.4" />
      
      {/* ── 树叶上的小瓢虫 ── */}
      {/* 身体 */}
      <ellipse cx="12" cy="14" rx="1.2" ry="1.5" fill="#DC2626" opacity="0.85" />
      {/* 黑点 */}
      <circle cx="11.5" cy="13.5" r="0.3" fill="#1C1917" opacity="0.7" />
      <circle cx="12.5" cy="13.5" r="0.3" fill="#1C1917" opacity="0.7" />
      <circle cx="12" cy="14.5" r="0.3" fill="#1C1917" opacity="0.7" />
      {/* 头 */}
      <circle cx="12" cy="12.8" r="0.5" fill="#1C1917" opacity="0.8" />
    </svg>
  )
}

/** 沙漠：可爱圆润仙人掌 + 温暖沙丘 */
function DesertIcon({ active }: { active: boolean }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      {/* 选中底色 */}
      {active && <rect x="0" y="0" width="32" height="32" rx="8" fill="#FFF7ED" />}

      {/* ── 温暖小太阳（右上角） ── */}
      {/* 外层光晕 */}
      <circle cx="25" cy="7" r="5.5" fill="#FDE68A" opacity="0.18" />
      <circle cx="25" cy="7" r="4" fill="#FDE68A" opacity="0.3" />
      {/* 太阳本体（多层叠加出质感） */}
      <circle cx="25" cy="7" r="3" fill="#FBBF24" />
      <circle cx="25" cy="7" r="2.2" fill="#FCD34D" />
      {/* 太阳高光 */}
      <circle cx="24" cy="6" r="1" fill="#FEF9C3" opacity="0.8" />
      {/* 短光线（圆润末端） */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const x1 = 25 + Math.cos(rad) * 4.2
        const y1 = 7 + Math.sin(rad) * 4.2
        const x2 = 25 + Math.cos(rad) * 5.8
        const y2 = 7 + Math.sin(rad) * 5.8
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FCD34D" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      })}

      {/* ── 远景沙丘（柔和曲线，层次感） ── */}
      <path d="M0 25 Q5 21 11 23 Q17 20 23 23 Q28 21 32 24 L32 32 L0 32 Z" fill="#FDE68A" opacity="0.4" />
      <path d="M0 27 Q4 23.5 10 25.5 Q16 23 22 25.5 Q27 23.5 32 26 L32 32 L0 32 Z" fill="#FCD34D" opacity="0.5" />
      {/* 近景沙丘 */}
      <path d="M0 29 Q8 25.5 16 28 Q24 25.5 32 29 L32 32 L0 32 Z" fill="#FBBF24" opacity="0.6" />
      {/* 沙丘高光线 */}
      <path d="M2 28.5 Q8 26 14 28 Q20 26 28 28.5" stroke="#FEF3C7" strokeWidth="0.6" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* ── 可爱仙人掌（圆润叠加，像森林树冠的手法） ── */}
      {/* 根部阴影 */}
      <ellipse cx="13" cy="27.5" rx="5.5" ry="1.2" fill="#D97706" opacity="0.15" />

      {/* 身体底层（深绿，最大的椭圆） */}
      <ellipse cx="13" cy="20" rx="5" ry="7.5" fill="#15803D" />
      {/* 身体中层 */}
      <ellipse cx="13" cy="19.5" rx="4.2" ry="7" fill="#16A34A" />
      {/* 身体亮层 */}
      <ellipse cx="13" cy="19" rx="3.5" ry="6.5" fill="#22C55E" />
      {/* 身体高光（左侧弧形光泽） */}
      <ellipse cx="11.5" cy="17" rx="1.5" ry="4.5" fill="#4ADE80" opacity="0.5" />
      {/* 顶部高光点 */}
      <circle cx="11.8" cy="14" r="1.2" fill="#BBF7D0" opacity="0.6" />

      {/* 左小臂（圆润的小球） */}
      {/* 连接部分 */}
      <ellipse cx="9.5" cy="18" rx="2.5" ry="1.5" fill="#15803D" />
      {/* 小臂球体底层 */}
      <circle cx="7.5" cy="16.5" r="3" fill="#15803D" />
      <circle cx="7.5" cy="16.2" r="2.5" fill="#16A34A" />
      <circle cx="7.5" cy="16" r="2" fill="#22C55E" />
      {/* 小臂高光 */}
      <circle cx="6.8" cy="15.2" r="0.9" fill="#BBF7D0" opacity="0.5" />

      {/* 右小臂（稍高位置，不对称更自然） */}
      {/* 连接部分 */}
      <ellipse cx="16" cy="16.5" rx="2.2" ry="1.3" fill="#15803D" />
      {/* 小臂球体底层 */}
      <circle cx="18.2" cy="14.8" r="2.8" fill="#15803D" />
      <circle cx="18.2" cy="14.5" r="2.3" fill="#16A34A" />
      <circle cx="18.2" cy="14.3" r="1.8" fill="#22C55E" />
      {/* 小臂高光 */}
      <circle cx="17.6" cy="13.5" r="0.8" fill="#BBF7D0" opacity="0.5" />

      {/* ── 可爱表情 ── */}
      {/* 眼睛（圆润小豆眼） */}
      <circle cx="11.5" cy="19" r="0.9" fill="#14532D" />
      <circle cx="14.5" cy="19" r="0.9" fill="#14532D" />
      {/* 眼睛高光 */}
      <circle cx="11.8" cy="18.6" r="0.35" fill="white" opacity="0.8" />
      <circle cx="14.8" cy="18.6" r="0.35" fill="white" opacity="0.8" />
      {/* 腮红 */}
      <ellipse cx="10.2" cy="20.5" rx="1.2" ry="0.7" fill="#FB923C" opacity="0.35" />
      <ellipse cx="15.8" cy="20.5" rx="1.2" ry="0.7" fill="#FB923C" opacity="0.35" />
      {/* 微笑嘴巴 */}
      <path d="M12 21 Q13 22.2 14 21" stroke="#14532D" strokeWidth="0.7" strokeLinecap="round" fill="none" />

      {/* ── 头顶小花（粉色，可爱点缀） ── */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return <circle key={i} cx={13 + Math.cos(rad) * 1.8} cy={12 + Math.sin(rad) * 1.8} r="1.3" fill="#F9A8D4" opacity="0.85" />
      })}
      {/* 花心 */}
      <circle cx="13" cy="12" r="1.1" fill="#FBBF24" />
      <circle cx="12.7" cy="11.7" r="0.4" fill="#FEF9C3" opacity="0.7" />

      {/* ── 地面小装饰 ── */}
      {/* 小石子 */}
      <ellipse cx="4" cy="29.5" rx="1.3" ry="0.7" fill="#D6D3D1" opacity="0.45" />
      <ellipse cx="23" cy="29" rx="1" ry="0.5" fill="#D6D3D1" opacity="0.35" />
      {/* 小草芽 */}
      <path d="M21 28 Q21.5 26.5 22 28" stroke="#86EFAC" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M27 28.5 Q27.3 27.2 27.8 28.5" stroke="#86EFAC" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  )
}

/** 花园：彩色大花+蘑菇+灌木 */
function GardenIcon({ active }: { active: boolean }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      {active && <rect x="0" y="0" width="32" height="32" rx="8" fill="#FDF4FF" />}
      
      {/* 地面草地 */}
      <ellipse cx="16" cy="30" rx="14" ry="2" fill="#86EFAC" opacity="0.45" />
      <ellipse cx="16" cy="29.5" rx="13" ry="1.5" fill="#BBF7D0" opacity="0.35" />
      
      {/* ── 左侧灌木丛（圆润叠加） ── */}
      {/* 底层阴影 */}
      <circle cx="7" cy="24" r="4.5" fill="#15803D" opacity="0.25" />
      {/* 主体（多圆叠加） */}
      <circle cx="7" cy="23" r="4" fill="#16A34A" opacity="0.85" />
      <circle cx="5" cy="22" r="3" fill="#22C55E" opacity="0.8" />
      <circle cx="9" cy="22.5" r="2.8" fill="#22C55E" opacity="0.8" />
      <circle cx="7" cy="20" r="2.5" fill="#4ADE80" opacity="0.75" />
      {/* 高光 */}
      <circle cx="6" cy="21" r="1.5" fill="#BBF7D0" opacity="0.4" />
      
      {/* ── 右侧蘑菇 ── */}
      {/* 菌柄 */}
      <rect x="24" y="23" width="3" height="5" rx="1.5" fill="#FEF3C7" opacity="0.75" />
      {/* 菌盖底层 */}
      <ellipse cx="25.5" cy="23" rx="4.5" ry="2.5" fill="#DC2626" opacity="0.85" />
      {/* 菌盖主体 */}
      <path d="M21 23 Q21 19 25.5 19 Q30 19 30 23 Z" fill="#EF4444" opacity="0.9" />
      <path d="M22 23 Q22 20 25.5 20 Q29 20 29 23 Z" fill="#FCA5A5" opacity="0.5" />
      {/* 白色圆点 */}
      <circle cx="23.5" cy="21" r="1.2" fill="white" opacity="0.85" />
      <circle cx="27" cy="21.5" r="1" fill="white" opacity="0.85" />
      {/* 菌盖高光 */}
      <ellipse cx="24" cy="20" rx="1.8" ry="0.8" fill="white" opacity="0.35" />
      
      {/* ── 中央大花 ── */}
      {/* 茎 */}
      <path d="M16 30 Q15.5 25 16 19" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
      {/* 左叶 */}
      <ellipse cx="12" cy="24" rx="4.5" ry="2.2" transform="rotate(-40 12 24)" fill="#4ADE80" opacity="0.75" />
      <ellipse cx="12.5" cy="23.8" rx="3" ry="1.5" transform="rotate(-40 12.5 23.8)" fill="#BBF7D0" opacity="0.35" />
      {/* 右叶 */}
      <ellipse cx="20" cy="26" rx="4.5" ry="2.2" transform="rotate(40 20 26)" fill="#4ADE80" opacity="0.75" />
      <ellipse cx="19.5" cy="25.8" rx="3" ry="1.5" transform="rotate(40 19.5 25.8)" fill="#BBF7D0" opacity="0.35" />
      
      {/* 花瓣（5片圆形叠加，对齐重构手法） */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const r = (deg * Math.PI) / 180
        const cx = 16 + Math.cos(r) * 6.2
        const cy = 13 + Math.sin(r) * 6.2
        return (
          <g key={i}>
            {/* 花瓣阴影 */}
            <circle cx={cx + 0.3} cy={cy + 0.3} r="3.2" fill="#F472B6" opacity="0.25" />
            {/* 花瓣主体 */}
            <circle cx={cx} cy={cy} r="3" fill="#F9A8D4" opacity="0.85" />
            {/* 花瓣高光 */}
            <circle cx={cx - 0.8} cy={cy - 0.8} r="1.2" fill="white" opacity="0.35" />
          </g>
        )
      })}
      
      {/* 花心底层 */}
      <circle cx="16" cy="13" r="3.5" fill="#D97706" opacity="0.85" />
      {/* 花心主层 */}
      <circle cx="16" cy="13" r="2.8" fill="#FBBF24" opacity="0.9" />
      {/* 花心高光 */}
      <circle cx="15.2" cy="12.2" r="1.2" fill="#FEF9C3" opacity="0.7" />
      
      {/* ── 小蝴蝶（右上角飞舞） ── */}
      {/* 左翅 */}
      <ellipse cx="23" cy="8" rx="3" ry="2" transform="rotate(-25 23 8)" fill="#FDE68A" opacity="0.75" />
      <ellipse cx="23" cy="10" rx="2" ry="1.5" transform="rotate(-15 23 10)" fill="#FEF9C3" opacity="0.65" />
      {/* 右翅 */}
      <ellipse cx="27" cy="8" rx="3" ry="2" transform="rotate(25 27 8)" fill="#FDE68A" opacity="0.75" />
      <ellipse cx="27" cy="10" rx="2" ry="1.5" transform="rotate(15 27 10)" fill="#FEF9C3" opacity="0.65" />
      {/* 身体 */}
      <ellipse cx="25" cy="9" rx="0.6" ry="2" fill="#78350F" opacity="0.75" />
      {/* 触角 */}
      <path d="M24.5 7.5 Q23.5 5.5 23.5 4.5" stroke="#78350F" strokeWidth="0.5" strokeLinecap="round" opacity="0.65" />
      <path d="M25.5 7.5 Q26.5 5.5 26.5 4.5" stroke="#78350F" strokeWidth="0.5" strokeLinecap="round" opacity="0.65" />
      <circle cx="23.5" cy="4.5" r="0.6" fill="#78350F" opacity="0.7" />
      <circle cx="26.5" cy="4.5" r="0.6" fill="#78350F" opacity="0.7" />
    </svg>
  )
}

/** 古村落：茅草屋+石灯笼+竹子 */
function VillageIcon({ active }: { active: boolean }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      {active && <rect x="0" y="0" width="32" height="32" rx="8" fill="#FFFBEB" />}
      
      {/* 地面夯土 */}
      <ellipse cx="16" cy="30.5" rx="14" ry="2" fill="#D97706" opacity="0.35" />
      <ellipse cx="16" cy="30" rx="13" ry="1.5" fill="#FDE68A" opacity="0.25" />
      
      {/* ── 左侧竹子 ── */}
      {/* 竹竿 */}
      <rect x="5" y="18" width="3" height="12" rx="1.5" fill="#16A34A" opacity="0.8" />
      <rect x="5.5" y="18" width="2" height="12" rx="1" fill="#22C55E" opacity="0.75" />
      {/* 竹节 */}
      <line x1="5" y1="22" x2="8" y2="22" stroke="#14532D" strokeWidth="1" opacity="0.5" />
      <line x1="5" y1="26" x2="8" y2="26" stroke="#14532D" strokeWidth="1" opacity="0.5" />
      {/* 竹叶 */}
      <ellipse cx="4" cy="17" rx="3" ry="1.2" transform="rotate(-40 4 17)" fill="#4ADE80" opacity="0.65" />
      <ellipse cx="9" cy="17.5" rx="3" ry="1.2" transform="rotate(40 9 17.5)" fill="#4ADE80" opacity="0.65" />
      
      {/* ── 右侧石灯笼 ── */}
      {/* 底座 */}
      <rect x="23" y="26" width="5" height="3" rx="1" fill="#78716C" opacity="0.7" />
      {/* 石柱 */}
      <rect x="24" y="20" width="3" height="6" rx="1.5" fill="#A8A29E" opacity="0.7" />
      {/* 灯笼体 */}
      <rect x="23" y="14" width="5" height="6" rx="2" fill="#FDE68A" opacity="0.85" />
      <rect x="23.5" y="14.5" width="2" height="5" rx="1" fill="white" opacity="0.3" />
      {/* 顶帽 */}
      <path d="M22 14 L25.5 10 L29 14 Z" fill="#44403C" opacity="0.8" />
      {/* 流苏 */}
      <line x1="24" y1="20" x2="24" y2="22" stroke="#D97706" strokeWidth="0.8" opacity="0.6" />
      <line x1="25.5" y1="20" x2="25.5" y2="22.5" stroke="#D97706" strokeWidth="0.8" opacity="0.6" />
      <line x1="27" y1="20" x2="27" y2="22" stroke="#D97706" strokeWidth="0.8" opacity="0.6" />
      
      {/* ── 中央茅草屋 ── */}
      {/* 屋身阴影 */}
      <rect x="11.5" y="18.5" width="10" height="11.5" rx="2" fill="#78350F" opacity="0.12" />
      {/* 屋身主体 */}
      <rect x="11" y="18" width="10" height="11.5" rx="2" fill="#FEF3C7" opacity="0.88" />
      {/* 屋身暗面 */}
      <rect x="17" y="18" width="4" height="11.5" rx="2" fill="#D97706" opacity="0.18" />
      {/* 屋身高光 */}
      <rect x="11.5" y="18.5" width="2" height="10.5" rx="1" fill="white" opacity="0.2" />
      
      {/* 门 */}
      <rect x="14" y="23" width="4" height="6.5" rx="2" fill="#92400E" opacity="0.85" />
      <rect x="14.5" y="23.5" width="1.2" height="5.5" rx="0.6" fill="#D97706" opacity="0.3" />
      {/* 门把手 */}
      <circle cx="16.8" cy="26" r="0.8" fill="#FCD34D" opacity="0.9" />
      
      {/* 窗 */}
      <rect x="12.5" y="20" width="3.5" height="3.5" rx="1" fill="#BAE6FD" opacity="0.55" />
      <line x1="12.5" y1="21.75" x2="16" y2="21.75" stroke="#92400E" strokeWidth="0.8" opacity="0.5" />
      <line x1="14.25" y1="20" x2="14.25" y2="23.5" stroke="#92400E" strokeWidth="0.8" opacity="0.5" />
      
      {/* 屋顶阴影 */}
      <path d="M9.5 18.5 L16 6.5 L22.5 18.5 Z" fill="#78350F" opacity="0.15" />
      {/* 屋顶底层 */}
      <path d="M9 18 L16 6 L23 18 Z" fill="#78350F" opacity="0.9" />
      {/* 屋顶主层 */}
      <path d="M9.5 18 L16 7 L22.5 18 Z" fill="#92400E" opacity="0.9" />
      {/* 屋顶高光 */}
      <path d="M11 18 L16 9 L21 18 Z" fill="#D97706" opacity="0.45" />
      
      {/* 茅草纹理 */}
      <line x1="12" y1="15" x2="10" y2="18" stroke="#FDE68A" strokeWidth="0.6" opacity="0.22" />
      <line x1="14" y1="12" x2="11.5" y2="18" stroke="#FDE68A" strokeWidth="0.6" opacity="0.22" />
      <line x1="18" y1="12" x2="20.5" y2="18" stroke="#FDE68A" strokeWidth="0.6" opacity="0.22" />
      <line x1="20" y1="15" x2="22" y2="18" stroke="#FDE68A" strokeWidth="0.6" opacity="0.22" />
      
      {/* 屋脊装饰 */}
      <circle cx="16" cy="6" r="2" fill="#78350F" opacity="0.85" />
      <circle cx="15.3" cy="5.3" r="0.8" fill="#FCD34D" opacity="0.4" />
      
      {/* 屋檐小灯笼 */}
      <ellipse cx="12.5" cy="16" rx="1.5" ry="2" fill="#DC2626" opacity="0.8" />
      <ellipse cx="12" cy="15.5" rx="0.6" ry="1" fill="#FCA5A5" opacity="0.4" />
      {/* 灯笼绳 */}
      <line x1="12.5" y1="14" x2="12.5" y2="12" stroke="#78350F" strokeWidth="0.5" opacity="0.6" />
      {/* 流苏 */}
      <line x1="11.8" y1="18" x2="11.8" y2="19.5" stroke="#FCD34D" strokeWidth="0.4" opacity="0.6" />
      <line x1="12.5" y1="18" x2="12.5" y2="20" stroke="#FCD34D" strokeWidth="0.4" opacity="0.6" />
      <line x1="13.2" y1="18" x2="13.2" y2="19.5" stroke="#FCD34D" strokeWidth="0.4" opacity="0.6" />
    </svg>
  )
}

const THEME_ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  forest:  (a) => <ForestIcon  active={a} />,
  desert:  (a) => <DesertIcon  active={a} />,
  garden:  (a) => <GardenIcon  active={a} />,
  village: (a) => <VillageIcon active={a} />,
}

// ─── SVG 心情脸 ───────────────────────────────────────────────────────────────

function MoodFace({ mood, size = 20 }: { mood: number; size?: number }) {
  const s = size
  const cx = s / 2
  const cy = s / 2
  const r = s / 2 - 1

  if (mood >= 80) {
    // 非常开心：眯眼笑
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <circle cx={cx} cy={cy} r={r} fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.8" />
        <path d={`M${cx-r*0.35} ${cy-r*0.1} q${r*0.12} ${-r*0.18} ${r*0.28} 0`} stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d={`M${cx+r*0.1} ${cy-r*0.1} q${r*0.12} ${-r*0.18} ${r*0.28} 0`} stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d={`M${cx-r*0.45} ${cy+r*0.2} q${r*0.45} ${r*0.38} ${r*0.9} 0`} stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  if (mood >= 60) {
    // 开心：圆眼+微笑
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <circle cx={cx} cy={cy} r={r} fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.8" />
        <circle cx={cx - r*0.28} cy={cy - r*0.12} r={r*0.1} fill="#78350F" />
        <circle cx={cx + r*0.28} cy={cy - r*0.12} r={r*0.1} fill="#78350F" />
        <path d={`M${cx-r*0.38} ${cy+r*0.18} q${r*0.38} ${r*0.3} ${r*0.76} 0`} stroke="#78350F" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  if (mood >= 40) {
    // 平静：圆眼+直线嘴
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <circle cx={cx} cy={cy} r={r} fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.8" />
        <circle cx={cx - r*0.28} cy={cy - r*0.1} r={r*0.09} fill="#6B7280" />
        <circle cx={cx + r*0.28} cy={cy - r*0.1} r={r*0.09} fill="#6B7280" />
        <line x1={cx-r*0.3} y1={cy+r*0.28} x2={cx+r*0.3} y2={cy+r*0.28} stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    )
  }
  if (mood >= 20) {
    // 难过：下垂眼+皱眉
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <circle cx={cx} cy={cy} r={r} fill="#FCA5A5" stroke="#EF4444" strokeWidth="0.8" />
        <circle cx={cx - r*0.28} cy={cy - r*0.05} r={r*0.09} fill="#7F1D1D" />
        <circle cx={cx + r*0.28} cy={cy - r*0.05} r={r*0.09} fill="#7F1D1D" />
        <path d={`M${cx-r*0.4} ${cy-r*0.3} q${r*0.12} ${r*0.15} ${r*0.25} 0`} stroke="#7F1D1D" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d={`M${cx+r*0.15} ${cy-r*0.3} q${r*0.12} ${r*0.15} ${r*0.25} 0`} stroke="#7F1D1D" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d={`M${cx-r*0.38} ${cy+r*0.32} q${r*0.38} ${-r*0.26} ${r*0.76} 0`} stroke="#7F1D1D" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  // 很难过：哭泣脸
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <circle cx={cx} cy={cy} r={r} fill="#FCA5A5" stroke="#EF4444" strokeWidth="0.8" />
      <circle cx={cx - r*0.28} cy={cy - r*0.05} r={r*0.09} fill="#7F1D1D" />
      <circle cx={cx + r*0.28} cy={cy - r*0.05} r={r*0.09} fill="#7F1D1D" />
      <path d={`M${cx-r*0.4} ${cy-r*0.28} q${r*0.12} ${r*0.18} ${r*0.25} 0`} stroke="#7F1D1D" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d={`M${cx+r*0.15} ${cy-r*0.28} q${r*0.12} ${r*0.18} ${r*0.25} 0`} stroke="#7F1D1D" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d={`M${cx-r*0.35} ${cy+r*0.35} q${r*0.35} ${-r*0.32} ${r*0.7} 0`} stroke="#7F1D1D" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      {/* teardrops */}
      <ellipse cx={cx - r*0.38} cy={cy+r*0.1} rx={r*0.07} ry={r*0.12} fill="#93C5FD" />
      <ellipse cx={cx + r*0.38} cy={cy+r*0.1} rx={r*0.07} ry={r*0.12} fill="#93C5FD" />
    </svg>
  )
}

// ─── 进度条颜色 ───────────────────────────────────────────────────────────────

const MOOD_GRADIENT = 'linear-gradient(90deg, #818cf8 0%, #a78bfa 100%)'


// ─── 动物缩略图 Canvas ────────────────────────────────────────────────────────

const MINI_SIZE = 60

function MiniAnimalCanvas({ type, isDark }: { type: AnimalType; isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = MINI_SIZE * dpr
    canvas.height = MINI_SIZE * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, MINI_SIZE, MINI_SIZE)

    const p = isDark ? PALETTE_DARK : PALETTE_LIGHT
    const cx = MINI_SIZE / 2
    // cy at 62% gives visual center near canvas middle for most animals
    const cy = MINI_SIZE * 0.62
    // scale tuned so even tall animals (giraffe) just fit
    const drawScale = (MINI_SIZE / 64) * 0.60

    if (type === 'monkey') {
      // monkey hangs from branch — ground a bit lower, scale matches ground animals
      const treeScale = (MINI_SIZE / 64) * 0.62
      const a: Animal = {
        type: 'monkey', x: cx, y: cy,
        vx: 0, vy: 0, dir: 1, frame: 0, state: 'idle',
        wanderTimer: 0, wanderVx: 0, idleTimer: 100, sitTimer: 0,
        scale: 0.6, seekTimer: 0,
        treeIndex: 0, monkeyPose: 'sit', monkeyTimer: 0,
        jumpOffset: 0, jumpVY: 0, lookTimer: 0, excitementTimer: 0, eatingTimer: 0,
        mood: 80, visible: true, accessories: [],
      }
      const tree: TreeInfo = {
        x: cx, groundY: MINI_SIZE * 0.82, scale: treeScale,
        branchY: -14, branchDir: 1,
      }
      drawMonkey(ctx, a, tree, p)
    } else {
      const a: Animal = {
        type, x: cx, y: cy,
        vx: 0, vy: 0, dir: 1, frame: 0, state: 'idle',
        wanderTimer: 0, wanderVx: 0, idleTimer: 100, sitTimer: 0,
        scale: drawScale, seekTimer: 0,
        jumpOffset: 0, jumpVY: 0, lookTimer: 0, excitementTimer: 0, eatingTimer: 0,
        mood: 80, visible: true, accessories: [],
      }
      ctx.save()
      ctx.translate(a.x, a.y)
      ctx.scale(a.scale, a.scale)
      ctx.translate(-a.x, -a.y)
      drawGroundAnimal(ctx, a, p)
      ctx.restore()
    }
  }, [type, isDark])

  return (
    <canvas
      ref={canvasRef}
      className="block"
      style={{ width: MINI_SIZE, height: MINI_SIZE }}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'pet'     as const, label: '宠物' },
  { key: 'weather' as const, label: '天气' },
  { key: 'scene'   as const, label: '场景' },
]

export default function PetPage() {
  const petConfig = usePetConfig()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'pet' | 'weather' | 'scene'>('pet')
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType>('dog')
  const [nameInput, setNameInput] = useState('')
  const [moodData, setMoodData] = useState<Record<string, number>>({})

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const id = setInterval(() => {
      if (!petConfig?.animalsRef.current) return
      const moods: Record<string, number> = {}
      for (const a of petConfig.animalsRef.current) moods[a.type] = a.mood
      setMoodData(moods)
    }, 500)
    return () => clearInterval(id)
  }, [petConfig])

  useEffect(() => {
    setNameInput(petConfig?.config.names[selectedAnimal] ?? '')
  }, [selectedAnimal, petConfig?.config.names])

  if (!petConfig) return null

  const { config, updateConfig } = petConfig
  const isDark = mounted && resolvedTheme === 'dark'

  const saveName = () => {
    updateConfig({ names: { ...config.names, [selectedAnimal]: nameInput.trim() } })
  }

  const selectedScale = config.scales[selectedAnimal] ?? 1.0
  const selectedVisible = config.visible[selectedAnimal] !== false
  const selectedMood = moodData[selectedAnimal] ?? 60

  // ─── 宠物 Tab ────────────────────────────────────────────────────────────

  const PetTab = (
    <div className="space-y-5">
      {/* 动物选择网格 */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {ALL_TYPES.map(type => {
          const isSelected = selectedAnimal === type
          const isHidden = config.visible[type] === false
          const mood = moodData[type] ?? 60
          return (
            <button
              key={type}
              onClick={() => setSelectedAnimal(type)}
              className={`relative flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all duration-150 ${
                isSelected
                  ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-[0_2px_8px_rgba(99,102,241,0.12)]'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'
              } ${isHidden ? 'opacity-40' : ''}`}
            >
              {isSelected && (
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
              )}

              <div className="flex items-center justify-center" style={{ width: MINI_SIZE, height: MINI_SIZE }}>
                {mounted
                  ? <MiniAnimalCanvas type={type} isDark={isDark} />
                  : <div style={{ width: MINI_SIZE, height: MINI_SIZE }} />
                }
              </div>

              <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate w-full text-center px-1">
                {config.names[type] || ANIMAL_META[type].label}
              </span>
            </button>
          )
        })}
      </div>

      {/* 配置卡 + 心情总览 并排 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* 选中动物配置卡片 */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-5">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-50 dark:border-gray-800">
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center flex-shrink-0" style={{ width: MINI_SIZE, height: MINI_SIZE }}>
              {mounted && <MiniAnimalCanvas type={selectedAnimal} isDark={isDark} />}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                {config.names[selectedAnimal] || ANIMAL_META[selectedAnimal].label}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">点击上方卡片切换</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 名字 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">名字</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 transition-colors min-w-0"
                  placeholder="起个名字（最多 6 字）"
                  maxLength={6}
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                />
                <button
                  onClick={saveName}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors flex-shrink-0"
                >
                  保存
                </button>
              </div>
            </div>

            {/* 可见性 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">在场景中显示</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {selectedVisible ? '已出现在场景中' : '已从场景中隐藏'}
                </p>
              </div>
              <Switch
                size="small"
                checked={selectedVisible}
                onChange={val => updateConfig({ visible: { ...config.visible, [selectedAnimal]: val } })}
              />
            </div>

            {/* 大小 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-700 dark:text-gray-300">大小倍率</label>
                <span className="text-xs font-mono text-indigo-500 dark:text-indigo-400">
                  {selectedScale.toFixed(2)}×
                </span>
              </div>
              <Slider
                min={0.5} max={2.0} step={0.05}
                value={selectedScale}
                onChange={val => updateConfig({ scales: { ...config.scales, [selectedAnimal]: val } })}
                tooltip={{ formatter: v => `${v}×` }}
              />
            </div>

            {/* 心情 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300">当前心情</label>
                <div className="flex items-center gap-1.5">
                  <MoodFace mood={selectedMood} size={18} />
                  <span className="text-xs font-mono text-gray-400">{Math.round(selectedMood)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${selectedMood}%`, background: MOOD_GRADIENT }}
                />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
                投喂食物 +15 · 点击场景 +5 · 自然衰减中
              </p>
            </div>
          </div>
        </div>

        {/* 心情总览卡片 */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-5">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">全员心情</p>
          <div className="space-y-3.5">
            {ALL_TYPES.map(type => {
              const mood = moodData[type] ?? 60
              const name = config.names[type] || ANIMAL_META[type].label
              const isHidden = config.visible[type] === false
              return (
                <div key={type} className={`flex items-center gap-2.5 ${isHidden ? 'opacity-40' : ''}`}>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-12 truncate shrink-0">{name}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${mood}%`, background: MOOD_GRADIENT }}
                    />
                  </div>
                  <MoodFace mood={mood} size={16} />
                  <span className="text-[10px] font-mono text-gray-400 w-5 text-right shrink-0">{Math.round(mood)}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )

  // ─── 天气 Tab ────────────────────────────────────────────────────────────

  const WeatherTab = (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-5">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">天气模式</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {(['auto', 'manual'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => updateConfig({ weather: { ...config.weather, mode } })}
              className={`py-2 text-sm rounded-lg border transition-all ${
                config.weather.mode === mode
                  ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              {mode === 'auto' ? '自动检测' : '手动指定'}
            </button>
          ))}
        </div>

        {config.weather.mode === 'auto' && (
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
            根据本地时间自动切换：22:00–06:00 夜晚，特定日期雨天，其余晴天。
          </p>
        )}

        {config.weather.mode === 'manual' && (
          <>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">选择天气</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WEATHER_OPTIONS.map(({ type, icon, label, desc }) => {
                const isActive = config.weather.manualType === type
                return (
                  <button
                    key={type}
                    onClick={() => updateConfig({ weather: { ...config.weather, mode: 'manual', manualType: type } })}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                      isActive
                        ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-[0_2px_8px_rgba(99,102,241,0.12)]'
                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <span className="flex items-center justify-center w-8 h-8">{icon}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{desc}</span>
                    {isActive && <div className="w-1 h-1 rounded-full bg-indigo-400" />}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )

  // ─── 场景 Tab ────────────────────────────────────────────────────────────

  const currentTheme = config.scenery.theme || 'forest'
  const currentThemeCfg = SCENE_THEME_CONFIGS.find(t => t.id === currentTheme) ?? SCENE_THEME_CONFIGS[0]
  const currentThemeProps = config.scenery.themeProps?.[currentTheme] ?? DEFAULT_THEME_PROPS[currentTheme] ?? {}

  const SceneTab = (
    <div className="space-y-4">
      {/* 主题选择 */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-5">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">场景主题</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">选择整体场景风格</p>
        <div className="grid grid-cols-5 gap-2">
          {SCENE_THEME_CONFIGS.map(t => {
            const isSelected = currentTheme === t.id
            return (
              <button
                key={t.id}
                onClick={() => updateConfig({ scenery: { ...config.scenery, theme: t.id as never } })}
                className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 dark:border-indigo-500'
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className="flex items-center justify-center">{THEME_ICONS[t.id]?.(isSelected)}</span>
                <span className={`text-[10px] font-medium leading-tight text-center ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {t.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 道具开关 + 全局效果，左右各半 */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-5">
        <div className="grid grid-cols-2 gap-5">
          {/* 左：当前主题道具 */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="flex items-center justify-center">{THEME_ICONS[currentTheme]?.(true)}</span>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{currentThemeCfg.label}道具</p>
            </div>
            <div className="space-y-0">
              {currentThemeCfg.props.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
                  <Switch
                    size="small"
                    checked={currentThemeProps[key] !== false}
                    onChange={val => updateConfig({
                      scenery: {
                        ...config.scenery,
                        themeProps: {
                          ...config.scenery.themeProps,
                          [currentTheme]: { ...currentThemeProps, [key]: val },
                        },
                      },
                    })}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => updateConfig({
                scenery: {
                  ...config.scenery,
                  themeProps: {
                    ...config.scenery.themeProps,
                    [currentTheme]: { ...DEFAULT_THEME_PROPS[currentTheme] },
                  },
                },
              })}
              className="mt-3 w-full py-1.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-800 rounded-lg hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
            >
              恢复默认
            </button>
          </div>

          {/* 右：全局效果 */}
          <div className="border-l border-gray-100 dark:border-gray-800 pl-5">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">全局效果</p>
            <div className="space-y-0">
              {GLOBAL_SCENE_ITEMS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
                  <Switch
                    size="small"
                    checked={config.scenery[key as 'footprints' | 'thoughts' | 'groundLine']}
                    onChange={val => updateConfig({ scenery: { ...config.scenery, [key]: val } })}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const tabContent = { pet: PetTab, weather: WeatherTab, scene: SceneTab }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="pt-6">
      {/* 画布预览区 */}
      <div className="mb-8 rounded-2xl overflow-hidden">
        <PetCanvas height={200} />
      </div>

      {/* 下划线 Tab 栏 */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 mb-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`pb-3 px-5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {tabContent[activeTab]}
    </div>
  )
}