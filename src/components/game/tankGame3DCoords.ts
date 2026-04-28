import { GAME_HEIGHT, GAME_WIDTH } from './tankGameModel'

export function toScenePosition(x: number, y: number, elevation = 0): [number, number, number] {
  return [x - GAME_WIDTH / 2, elevation, y - GAME_HEIGHT / 2]
}

export function toWorldPosition(x: number, z: number) {
  return {
    x: x + GAME_WIDTH / 2,
    y: z + GAME_HEIGHT / 2,
  }
}
