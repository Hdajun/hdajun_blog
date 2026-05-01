// ─── 场景绘制注册表 ────────────────────────────────────────────────────────────

import type { Scenery, TreeInfo, Palette } from '../types'
import { drawTree } from './drawTree'
import { drawRock } from './drawRock'
import { drawGrass, drawFlower } from './drawGrassFlower'
import {
  drawDesertGround,
  drawCactus,
  drawDeadTree,
  drawDune,
  drawTumbleweed,
} from './drawDesert'
import {
  drawGardenGround,
  drawFlowerBed,
  drawFence,
  drawFountain,
  drawPetals,
  drawMushroom,
  drawBush,
} from './drawGarden'
import {
  drawVillageGround,
  drawCottage,
  drawLantern,
  drawAncientTree,
  drawBambooFence,
  drawSmoke,
  drawClothesLine,
  drawMudWall,
} from './drawVillage'
export {
  drawTree,
  drawRock,
  drawGrass,
  drawFlower,
  drawCactus,
  drawDeadTree,
  drawDune,
  drawTumbleweed,
  drawFlowerBed,
  drawFence,
  drawFountain,
  drawCottage,
  drawLantern,
  drawAncientTree,
  drawBambooFence,
}

/** 按主题绘制地面色调覆盖层（在 groundLine 之前调用） */
export function drawThemeGround(
  ctx: CanvasRenderingContext2D,
  theme: string,
  w: number,
  h: number,
  groundY: number,
) {
  switch (theme) {
    case 'desert':
      drawDesertGround(ctx, w, h, groundY)
      break
    case 'garden':
      drawGardenGround(ctx, w, h, groundY)
      break
    case 'village':
      drawVillageGround(ctx, w, h, groundY)
      break
  }
}

/** 绘制所有场景元素 */
export function drawScenery(
  ctx: CanvasRenderingContext2D,
  scenery: Scenery[],
  treeInfos: TreeInfo[],
  groundY: number,
  frame: number,
  palette: Palette,
  isNight = false,
) {
  for (const s of scenery) {
    switch (s.type) {
      // ── 森林 ──
      case 'tree': {
        const ti = treeInfos.find(t => t.x === s.x)
        if (ti) drawTree(ctx, ti, s.variant, palette)
        break
      }
      case 'rock':
        drawRock(ctx, s.x, groundY + 4, s.scale, s.variant, palette)
        break
      case 'grass':
        drawGrass(ctx, s.x, groundY + 2, s.scale, s.variant, frame, palette)
        break
      case 'flower':
        drawFlower(ctx, s.x, groundY + 2, s.scale, s.variant, frame, palette)
        break

      // ── 沙漠 ──
      case 'dune':
        drawDune(ctx, s.x, groundY, s.scale, s.variant)
        break
      case 'cactus':
        drawCactus(ctx, s.x, groundY, s.scale, s.variant)
        break
      case 'deadTree':
        drawDeadTree(ctx, s.x, groundY, s.scale, s.variant)
        break
      case 'tumbleweed':
        drawTumbleweed(ctx, s.x, groundY, s.scale, s.variant, frame)
        break

      // ── 花园 ──
      case 'fence':
        drawFence(ctx, s.x, groundY, s.scale, s.variant)
        break
      case 'flowerBed':
        drawFlowerBed(ctx, s.x, groundY, s.scale, s.variant, frame, palette)
        break
      case 'fountain':
        drawFountain(ctx, s.x, groundY, s.scale, s.variant, frame)
        break
      case 'petals':
        // 全屏落花，x/scale/variant 仅作占位
        drawPetals(
          ctx,
          ctx.canvas.width / (window?.devicePixelRatio || 1),
          groundY,
          frame,
          palette,
        )
        break
      case 'mushroom':
        drawMushroom(ctx, s.x, groundY, s.scale, s.variant)
        break
      case 'bush':
        drawBush(ctx, s.x, groundY, s.scale, s.variant)
        break

      // ── 古村落 ──
      case 'bambooFence':
        drawBambooFence(ctx, s.x, groundY, s.scale, s.variant)
        break
      case 'cottage':
        drawCottage(ctx, s.x, groundY, s.scale, s.variant)
        break
      case 'lantern':
        drawLantern(ctx, s.x, groundY, s.scale, s.variant, isNight)
        break
      case 'ancientTree':
        drawAncientTree(ctx, s.x, groundY, s.scale, s.variant, frame, palette)
        break
      case 'smoke':
        drawSmoke(ctx, s.x, groundY, s.scale, s.variant, frame)
        break
      case 'clothesLine':
        drawClothesLine(ctx, s.x, groundY, s.scale, s.variant, frame)
        break
      case 'mudWall':
        drawMudWall(ctx, s.x, groundY, s.scale, s.variant)
        break
    }
  }
}