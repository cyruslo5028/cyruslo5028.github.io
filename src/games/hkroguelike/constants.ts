// === Tunable game constants ===
// All gameplay numbers live here so balancing stays in one place.

export const ARENA_WIDTH = 960
export const ARENA_HEIGHT = 640

export const TICK_HZ = 60
export const TICK_DT = 1 / TICK_HZ
export const MAX_TICKS_PER_FRAME = 5

// Player
export const PLAYER_RADIUS = 16
export const PLAYER_BASE_HP = 100
export const PLAYER_BASE_SPEED = 230
export const PLAYER_BASE_ATTACK_DAMAGE = 14
export const PLAYER_BASE_ATTACK_RATE = 2.4 // shots per second
export const PLAYER_BASE_ATTACK_RANGE = 360

// Archero "stop to fire" mechanic: how long player must stand still before auto-fire starts.
export const PLAYER_STILL_BEFORE_FIRE = 0.08
// I-frames after taking damage
export const PLAYER_INVULN_AFTER_HIT = 0.55

// Projectile
export const KNIFE_RADIUS = 6
export const KNIFE_SPEED = 540
export const KNIFE_LIFETIME = 1.4

// Enemies
export const ENEMY_DEFAULT_RADIUS = 18

// Room
export const ROOM_PADDING = 36 // walls inset
export const ROOMS_PER_FLOOR = 15
export const FLOOR_COUNT = 4

// Camera
export const CAMERA_LERP = 0.12

// Visual
export const NEON_PRIMARY = '#ff4fd8'
export const NEON_CYAN = '#36d6ff'
export const NEON_GOLD = '#ffd16a'
export const NEON_LIME = '#93ff66'
