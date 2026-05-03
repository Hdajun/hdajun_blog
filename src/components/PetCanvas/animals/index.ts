import type { Animal, Palette, TreeInfo, DrawAnimalFn } from '../types'
import { drawDog } from './drawDog'
import { drawCat } from './drawCat'
import { drawElephant } from './drawElephant'
import { drawRabbit } from './drawRabbit'
import { drawGiraffe } from './drawGiraffe'
import { drawTiger } from './drawTiger'
import { drawLion } from './drawLion'
import { drawPanda } from './drawPanda'
import { drawMonkeyOnBranch, drawMonkeyOnGround } from './drawMonkey'
import { drawHedgehog } from './drawHedgehog'
import { drawPig } from './drawPig'
import { drawSnake } from './drawSnake'
import { drawBirdOnGround, drawBirdFlying, drawBirdPerched } from './drawBird'

/** 地面动物的绘制注册表 */
const groundAnimalDrawers: Record<string, DrawAnimalFn> = {
  dog: drawDog,
  cat: drawCat,
  elephant: drawElephant,
  rabbit: drawRabbit,
  giraffe: drawGiraffe,
  tiger: drawTiger,
  lion: drawLion,
  panda: drawPanda,
  monkey: drawMonkeyOnGround,
  hedgehog: drawHedgehog,
  pig: drawPig,
  snake: drawSnake,
  bird: drawBirdOnGround,
}

/** 绘制地面动物（通过 type 分发） */
export function drawGroundAnimal(ctx: CanvasRenderingContext2D, animal: Animal, palette: Palette) {
  const drawer = groundAnimalDrawers[animal.type]
  if (drawer) {
    drawer(ctx, animal, palette)
  }
}

/** 绘制树上的猴子 */
export function drawMonkey(ctx: CanvasRenderingContext2D, animal: Animal, treeInfo: TreeInfo, palette: Palette) {
  drawMonkeyOnBranch(ctx, animal, treeInfo, palette)
}

export { drawDog, drawCat, drawElephant, drawRabbit, drawGiraffe, drawTiger, drawLion, drawPanda, drawMonkeyOnBranch, drawMonkeyOnGround, drawHedgehog, drawPig, drawSnake, drawBirdOnGround, drawBirdFlying, drawBirdPerched }