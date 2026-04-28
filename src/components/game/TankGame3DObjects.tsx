import React, { useEffect, useMemo } from 'react'
import { Grid, useTexture } from '@react-three/drei'
import { DoubleSide, SRGBColorSpace, type Texture } from 'three'
import { CELL_SIZE, GAME_HEIGHT, GAME_WIDTH, NEON_SIGN_TEXTURES, type EnemyTank, type NeonSign, type PlayerTank, type WorldState } from './tankGameModel'
import { toScenePosition } from './tankGame3DCoords'

void React

export function TankGameArena({ world }: { world: WorldState }) {
  const textures = useTexture([...NEON_SIGN_TEXTURES])

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace
      texture.anisotropy = 8
      texture.needsUpdate = true
    })
  }, [textures])

  const wallCells = useMemo(() => {
    const cells: Array<{ key: string; col: number; row: number; height: number }> = []

    world.map.walls.forEach((row, rowIndex) => {
      row.forEach((isWall, colIndex) => {
        if (!isWall) {
          return
        }

        cells.push({
          key: `${colIndex}-${rowIndex}`,
          col: colIndex,
          row: rowIndex,
          height: 58 + Math.round(normalizeNoise(rowIndex * 13.17 + colIndex * 7.31) * 56),
        })
      })
    })

    return cells
  }, [world.map.walls])

  return (
    <group>
      <GroundPlane />
      <Grid
        position={[0, 0.14, 0]}
        args={[GAME_WIDTH, GAME_HEIGHT]}
        cellColor="#1e293b"
        sectionColor="#22d3ee"
        fadeDistance={920}
        fadeStrength={1}
        cellThickness={0.5}
        sectionThickness={1.1}
        infiniteGrid={false}
      />

      {wallCells.map((cell) => (
        <WallBlock key={cell.key} col={cell.col} row={cell.row} height={cell.height} />
      ))}

      {world.map.signs.map((sign) => (
        <NeonBillboard key={sign.id} sign={sign} texture={pickTexture(textures, sign.texture)} />
      ))}

      {world.enemies.map((enemy) => (
        <TankModel key={enemy.id} tank={enemy} primary="#f43f5e" accent="#a855f7" enemy />
      ))}

      <TankModel tank={world.player} primary="#22d3ee" accent="#67e8f9" enemy={false} invulnerable={world.player.invulnerable > 0} />

      {world.bullets.map((bullet) => (
        <mesh
          key={bullet.id}
          position={toScenePosition(bullet.x, bullet.y, 10)}
          castShadow
        >
          <sphereGeometry args={[bullet.radius, 14, 14]} />
          <meshStandardMaterial
            color={bullet.fromEnemy ? '#ffe4ea' : bullet.crit ? '#fde68a' : '#d5fbff'}
            emissive={bullet.fromEnemy ? '#fb7185' : bullet.crit ? '#f59e0b' : '#22d3ee'}
            emissiveIntensity={bullet.fromEnemy ? 1.8 : bullet.crit ? 2.8 : 2.2}
            toneMapped={false}
          />
        </mesh>
      ))}

      {world.particles.map((particle) => (
        <mesh key={particle.id} position={toScenePosition(particle.x, particle.y, 6 + particle.size * 0.4)}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshStandardMaterial color={particle.color} emissive={particle.color} emissiveIntensity={1.7} toneMapped={false} transparent opacity={particle.life / particle.maxLife} />
        </mesh>
      ))}

      {world.flashes.map((flash) => (
        <mesh key={flash.id} position={toScenePosition(flash.x, flash.y, 12)} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[flash.radius * 0.5, flash.radius, 32]} />
          <meshBasicMaterial color={flash.color} transparent opacity={flash.life / flash.maxLife} side={DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function GroundPlane() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[GAME_WIDTH, GAME_HEIGHT]} />
        <meshStandardMaterial color="#05070d" metalness={0.1} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]}>
        <planeGeometry args={[GAME_WIDTH, GAME_HEIGHT]} />
        <meshBasicMaterial color="#07111f" transparent opacity={0.45} toneMapped={false} />
      </mesh>
    </>
  )
}

function WallBlock({ col, row, height }: { col: number; row: number; height: number }) {
  return (
    <mesh position={toScenePosition(col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2, height / 2)} castShadow receiveShadow>
      <boxGeometry args={[CELL_SIZE, height, CELL_SIZE]} />
      <meshStandardMaterial color="#111827" emissive="#312e81" emissiveIntensity={0.16} metalness={0.32} roughness={0.55} />
    </mesh>
  )
}

function NeonBillboard({ sign, texture }: { sign: NeonSign; texture: Texture }) {
  const transform = getSignTransform(sign)

  return (
    <group position={transform.position} rotation={[0, transform.rotationY, 0]}>
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[sign.width + 8, sign.height + 8]} />
        <meshBasicMaterial color={sign.tint} transparent opacity={0.18} side={DoubleSide} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[sign.width, sign.height]} />
        <meshStandardMaterial
          map={texture}
          transparent
          side={DoubleSide}
          emissive={sign.tint}
          emissiveMap={texture}
          emissiveIntensity={2.6}
          metalness={0.18}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>
      <pointLight color={sign.tint} intensity={sign.floating ? 26 : 18} distance={145} decay={2} />
    </group>
  )
}

function TankModel({
  tank,
  primary,
  accent,
  enemy,
  invulnerable = false,
}: {
  tank: PlayerTank | EnemyTank
  primary: string
  accent: string
  enemy: boolean
  invulnerable?: boolean
}) {
  const yaw = Math.PI / 2 - tank.angle
  const glowIntensity = invulnerable ? 3.2 : enemy ? 2.1 : 2.8

  return (
    <group position={toScenePosition(tank.x, tank.y, 14)} rotation={[0, yaw, 0]}>
      <mesh position={[0, -2.5, 0]} castShadow>
        <boxGeometry args={[30, 8, 24]} />
        <meshStandardMaterial color="#020617" emissive={primary} emissiveIntensity={glowIntensity * 0.16} metalness={0.7} roughness={0.28} />
      </mesh>

      <mesh position={[-11, -2.5, 0]} castShadow>
        <boxGeometry args={[6, 7, 30]} />
        <meshStandardMaterial color="#0f172a" emissive={primary} emissiveIntensity={glowIntensity * 0.12} metalness={0.55} roughness={0.4} />
      </mesh>

      <mesh position={[11, -2.5, 0]} castShadow>
        <boxGeometry args={[6, 7, 30]} />
        <meshStandardMaterial color="#0f172a" emissive={primary} emissiveIntensity={glowIntensity * 0.12} metalness={0.55} roughness={0.4} />
      </mesh>

      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[24, 12, 22]} />
        <meshStandardMaterial color="#111827" emissive={primary} emissiveIntensity={glowIntensity * 0.18} metalness={0.62} roughness={0.3} />
      </mesh>

      <mesh position={[0, 11.5, 0]} castShadow>
        <cylinderGeometry args={[8, 9, 8, 24]} />
        <meshStandardMaterial color="#040b16" emissive={accent} emissiveIntensity={glowIntensity * 0.22} metalness={0.65} roughness={0.24} />
      </mesh>

      <mesh position={[0, 11.5, 18]} castShadow>
        <boxGeometry args={[4.5, 4.5, 28]} />
        <meshStandardMaterial color="#dbeafe" emissive={primary} emissiveIntensity={glowIntensity * 0.24} metalness={0.48} roughness={0.18} />
      </mesh>

      <mesh position={[0, 15, -2]}>
        <sphereGeometry args={[2.8, 16, 16]} />
        <meshStandardMaterial color="#ecfeff" emissive={accent} emissiveIntensity={glowIntensity * 0.42} toneMapped={false} />
      </mesh>
    </group>
  )
}

function getSignTransform(sign: NeonSign) {
  const base = toScenePosition(sign.x, sign.y, sign.elevation)
  const offset = CELL_SIZE / 2 + (sign.floating ? 10 : 2)

  switch (sign.side) {
    case 'north':
      return {
        position: [base[0], base[1], base[2] - offset] as [number, number, number],
        rotationY: 0,
      }
    case 'south':
      return {
        position: [base[0], base[1], base[2] + offset] as [number, number, number],
        rotationY: Math.PI,
      }
    case 'east':
      return {
        position: [base[0] + offset, base[1], base[2]] as [number, number, number],
        rotationY: -Math.PI / 2,
      }
    case 'west':
      return {
        position: [base[0] - offset, base[1], base[2]] as [number, number, number],
        rotationY: Math.PI / 2,
      }
    default:
      return {
        position: base,
        rotationY: 0,
      }
  }
}

function pickTexture(textures: Texture[], target: string) {
  const index = NEON_SIGN_TEXTURES.findIndex((value) => value === target)
  return textures[Math.max(0, index)]
}

function normalizeNoise(value: number) {
  return (Math.sin(value) + 1) / 2
}
