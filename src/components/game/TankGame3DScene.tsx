import React, { Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import { TankGameArena } from './TankGame3DObjects'
import { toWorldPosition } from './tankGame3DCoords'
import type { WorldState } from './tankGameModel'

void React

const pointerPlane = new Plane(new Vector3(0, 1, 0), 0)
const pointerVector = new Vector3()
const baseCamera = { x: 0, y: 560, z: 440 }

type TankGame3DSceneProps = {
  world: WorldState
  cameraZoom: number
  onAim: (point: { x: number; y: number }) => void
  onPointerDown: () => void | Promise<void>
  onPointerUp: () => void
  onPointerLeave: () => void
}

export function TankGame3DScene({ world, cameraZoom, onAim, onPointerDown, onPointerUp, onPointerLeave }: TankGame3DSceneProps) {
  return (
    <Canvas
      className="h-full w-full"
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [baseCamera.x, baseCamera.y, baseCamera.z], fov: 34, near: 1, far: 1800 }}
      gl={{ antialias: true }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      <PointerAimBridge onAim={onAim} />
      <SceneRig shake={world.shake} cameraZoom={cameraZoom} />
      <color attach="background" args={['#02040a']} />
      <fog attach="fog" args={['#02040a', 520, 1180]} />
      <ambientLight color="#60a5fa" intensity={0.58} />
      <hemisphereLight args={['#22d3ee', '#020617', 0.72]} />
      <directionalLight position={[180, 320, 120]} intensity={1.2} color="#dbeafe" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[0, 180, 0]} intensity={8} distance={900} color="#a855f7" />
      <pointLight position={[-240, 110, -180]} intensity={7} distance={620} color="#22d3ee" />
      <pointLight position={[240, 120, 180]} intensity={6.5} distance={620} color="#f43f5e" />

      <Suspense fallback={null}>
        <TankGameArena world={world} />
      </Suspense>

      <EffectComposer>
        <Bloom intensity={1.75} luminanceThreshold={0.12} luminanceSmoothing={0.18} mipmapBlur radius={0.92} />
      </EffectComposer>
    </Canvas>
  )
}

function PointerAimBridge({ onAim }: { onAim: (point: { x: number; y: number }) => void }) {
  const { camera, gl } = useThree()

  useEffect(() => {
    const raycaster = new Raycaster()
    const pointer = new Vector2()

    const handlePointerMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)

      if (raycaster.ray.intersectPlane(pointerPlane, pointerVector)) {
        onAim(toWorldPosition(pointerVector.x, pointerVector.z))
      }
    }

    gl.domElement.addEventListener('pointermove', handlePointerMove)
    return () => {
      gl.domElement.removeEventListener('pointermove', handlePointerMove)
    }
  }, [camera, gl, onAim])

  return null
}

function SceneRig({ shake, cameraZoom }: { shake: number, cameraZoom: number }) {
  const { camera } = useThree()

  useFrame(() => {
    const jitterX = shake > 0 ? (Math.random() - 0.5) * shake * 1.8 : 0
    const jitterZ = shake > 0 ? (Math.random() - 0.5) * shake * 1.5 : 0
    // Invert zoom so larger value means closer (zoom in)
    const distanceMultiplier = 1 / cameraZoom
    camera.position.set(
      (baseCamera.x + jitterX) * distanceMultiplier,
      baseCamera.y * distanceMultiplier,
      (baseCamera.z + jitterZ) * distanceMultiplier
    )
    camera.lookAt(0, 0, 0)
  })

  return null
}
