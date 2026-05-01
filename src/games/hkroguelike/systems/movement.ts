import type { World } from '../core/World'

// Particles + floating texts: simple ageing/gravity update.
export function updateParticles(world: World, dt: number) {
  for (let i = world.particles.length - 1; i >= 0; i -= 1) {
    const p = world.particles[i]
    p.age += dt
    if (p.age >= p.ttl) { world.particles.splice(i, 1); continue }
    p.pos.x += p.vel.x * dt
    p.pos.y += p.vel.y * dt
    // mild gravity / drag
    p.vel.x *= 0.94
    p.vel.y = p.vel.y * 0.94 + 60 * dt
  }
  for (let i = world.floats.length - 1; i >= 0; i -= 1) {
    const f = world.floats[i]
    f.age += dt
    if (f.age >= f.ttl) { world.floats.splice(i, 1); continue }
    f.pos.y += f.vy * dt
    f.vy *= 0.92
  }
}

export function decayCamera(world: World, dt: number) {
  if (world.shake > 0) world.shake = Math.max(0, world.shake - dt * 22)
  if (world.hitStop > 0) world.hitStop = Math.max(0, world.hitStop - dt)
}
