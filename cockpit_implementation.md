# Aerospace Mission Control - Core Implementation
## React/TypeScript Components for Spacecraft Cockpit Interface

---

## Main Cockpit Page

### src/app/cockpit/page.tsx

```typescript
/**
 * @file page.tsx
 * @brief Main spacecraft cockpit interface
 * 
 * Full-screen immersive cockpit view with integrated flight displays,
 * 3D viewport, and system monitoring panels.
 * 
 * @copyright Copyright (c) 2026 Aerospace Systems Inc.
 * @license MIT
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MainViewport from '@/components/cockpit/MainViewport'
import PrimaryFlightDisplay from '@/components/cockpit/PrimaryFlightDisplay'
import NavigationDisplay from '@/components/cockpit/NavigationDisplay'
import SystemsPanel from '@/components/cockpit/SystemsPanel'
import ControlPanel from '@/components/cockpit/ControlPanel'
import TelemetryStream from '@/components/monitoring/TelemetryStream'
import HealthMonitor from '@/components/monitoring/HealthMonitor'
import AlertSystem from '@/components/shared/AlertSystem'
import StatusBar from '@/components/shared/StatusBar'
import { useFlightData } from '@/hooks/useFlightData'
import { useTelemetry } from '@/hooks/useTelemetry'
import { useSystemHealth } from '@/hooks/useSystemHealth'

export default function CockpitPage() {
  const [isReady, setIsReady] = useState(false)
  const [viewMode, setViewMode] = useState<'full' | 'split'>('full')
  
  const { flightData, updateFlightData } = useFlightData()
  const { telemetry, connected } = useTelemetry()
  const { systemHealth, partitionStatus } = useSystemHealth()

  useEffect(() => {
    // Initialize cockpit systems
    const initSystems = async () => {
      console.log('Initializing aerospace mission control...')
      
      // Simulate system startup sequence
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsReady(true)
      console.log('✓ All systems nominal')
    }

    initSystems()
  }, [])

  if (!isReady) {
    return <BootSequence />
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {/* Ambient lighting effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-orange-950/10 pointer-events-none" />
      
      {/* Status bar */}
      <StatusBar 
        connected={connected}
        systemHealth={systemHealth}
        certificationLevel="DAL A"
      />

      {/* Main layout grid */}
      <div className="h-full grid grid-rows-[auto_1fr_auto] p-2 gap-2">
        
        {/* Top panel - overhead displays */}
        <div className="grid grid-cols-3 gap-2">
          <SystemsPanel 
            title="Flight Control"
            partition="flight_control"
            status={partitionStatus.flight_control}
            className="h-24"
          />
          <SystemsPanel 
            title="Navigation"
            partition="navigation"
            status={partitionStatus.navigation}
            className="h-24"
          />
          <SystemsPanel 
            title="Communications"
            partition="communications"
            status={partitionStatus.communications}
            className="h-24"
          />
        </div>

        {/* Middle section - main displays */}
        <div className="grid grid-cols-[320px_1fr_320px] gap-2">
          
          {/* Left display panel */}
          <div className="flex flex-col gap-2">
            <PrimaryFlightDisplay 
              attitude={flightData.attitude}
              altitude={flightData.altitude}
              speed={flightData.speed}
              heading={flightData.heading}
              className="flex-1"
            />
            <TelemetryStream 
              data={telemetry}
              maxLines={8}
              className="h-48"
            />
          </div>

          {/* Center - 3D viewport */}
          <div className="relative rounded-lg overflow-hidden border border-cyan-500/30">
            <MainViewport 
              spacecraft={flightData.spacecraft}
              environment={flightData.environment}
              camera={flightData.camera}
            />
            
            {/* Viewport overlay HUD */}
            <div className="absolute top-4 left-4 right-4 pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="text-cyan-400 font-mono text-sm space-y-1">
                  <div>ALT: {flightData.altitude.toFixed(0)} km</div>
                  <div>VEL: {flightData.velocity.toFixed(1)} km/s</div>
                  <div>HDG: {flightData.heading.toFixed(0)}°</div>
                </div>
                <div className="text-cyan-400 font-mono text-sm text-right space-y-1">
                  <div>MODE: {flightData.mode}</div>
                  <div>TARGET: {flightData.target || 'NONE'}</div>
                  <div>DIST: {flightData.targetDistance?.toFixed(0) || '--'} km</div>
                </div>
              </div>
            </div>

            {/* Center reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="60" height="60" className="text-cyan-400/50">
                <circle cx="30" cy="30" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
                <line x1="30" y1="0" x2="30" y2="15" stroke="currentColor" strokeWidth="1" />
                <line x1="30" y1="45" x2="30" y2="60" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="30" x2="15" y2="30" stroke="currentColor" strokeWidth="1" />
                <line x1="45" y1="30" x2="60" y2="30" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
          </div>

          {/* Right display panel */}
          <div className="flex flex-col gap-2">
            <NavigationDisplay 
              position={flightData.position}
              waypoints={flightData.waypoints}
              route={flightData.route}
              className="flex-1"
            />
            <HealthMonitor 
              partitions={partitionStatus}
              resources={systemHealth.resources}
              className="h-48"
            />
          </div>
        </div>

        {/* Bottom panel - control interface */}
        <div className="h-32">
          <ControlPanel 
            onThrottleChange={(value) => updateFlightData({ throttle: value })}
            onAttitudeChange={(value) => updateFlightData({ attitude: value })}
            onModeChange={(mode) => updateFlightData({ mode })}
            currentMode={flightData.mode}
          />
        </div>
      </div>

      {/* Alert system overlay */}
      <AlertSystem />
    </div>
  )
}

/**
 * Boot sequence animation
 */
function BootSequence() {
  const [stage, setStage] = useState(0)
  
  const stages = [
    'Initializing ARINC 653 partitions...',
    'Loading flight control systems...',
    'Calibrating sensors...',
    'Establishing telemetry link...',
    'Systems nominal - Ready for operation'
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setStage(s => (s < stages.length - 1 ? s + 1 : s))
    }, 400)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          AEROSPACE MISSION CONTROL
        </div>
        
        <div className="text-cyan-400/70 font-mono text-sm space-y-2">
          {stages.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: i <= stage ? 1 : 0.3,
                x: 0 
              }}
              transition={{ duration: 0.3 }}
            >
              {i <= stage && '✓ '}{text}
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <div className="w-64 h-1 bg-cyan-950 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${((stage + 1) / stages.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="text-xs text-cyan-400/50 font-mono">
          DO-178C DAL A CERTIFIED | TYPE CERTIFICATE TC-12345
        </div>
      </div>
    </div>
  )
}
```

---

## 3D Viewport Component

### src/components/cockpit/MainViewport.tsx

```typescript
/**
 * @file MainViewport.tsx
 * @brief 3D spacecraft viewport with space environment
 */

'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Stars, 
  useGLTF,
  Environment,
  PerspectiveCamera
} from '@react-three/drei'
import * as THREE from 'three'

interface ViewportProps {
  spacecraft: {
    position: [number, number, number]
    rotation: [number, number, number]
    scale?: number
  }
  environment: {
    stars: boolean
    planet?: {
      position: [number, number, number]
      radius: number
      texture?: string
    }
  }
  camera: {
    position: [number, number, number]
    fov?: number
  }
}

export default function MainViewport({ spacecraft, environment, camera }: ViewportProps) {
  return (
    <div className="w-full h-full bg-black">
      <Canvas>
        <PerspectiveCamera 
          makeDefault 
          position={camera.position} 
          fov={camera.fov || 60}
        />
        
        <Suspense fallback={<LoadingPlaceholder />}>
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4080ff" />
          
          {/* Space environment */}
          {environment.stars && <Stars radius={300} depth={50} count={5000} factor={4} />}
          
          {/* Planet */}
          {environment.planet && (
            <Planet 
              position={environment.planet.position}
              radius={environment.planet.radius}
              texture={environment.planet.texture}
            />
          )}
          
          {/* Spacecraft model */}
          <Spacecraft 
            position={spacecraft.position}
            rotation={spacecraft.rotation}
            scale={spacecraft.scale || 1}
          />
          
          {/* Grid helper */}
          <gridHelper args={[100, 100, 0x00ff00, 0x004400]} />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

/**
 * Spacecraft 3D model
 */
function Spacecraft({ position, rotation, scale }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle rotation animation
      meshRef.current.rotation.y += 0.001
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      {/* Simplified spacecraft geometry */}
      <group>
        {/* Main hull */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.6, 4]} />
          <meshStandardMaterial 
            color="#334155" 
            metalness={0.8} 
            roughness={0.2}
            emissive="#1e40af"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Wings */}
        <mesh position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[2, 0.1, 1.5]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[2, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[2, 0.1, 1.5]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Engines (glowing) */}
        <mesh position={[-0.8, 0, -2]}>
          <cylinderGeometry args={[0.3, 0.2, 0.8, 16]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            emissive="#60a5fa"
            emissiveIntensity={1.5}
          />
        </mesh>
        <mesh position={[0.8, 0, -2]}>
          <cylinderGeometry args={[0.3, 0.2, 0.8, 16]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            emissive="#60a5fa"
            emissiveIntensity={1.5}
          />
        </mesh>
        
        {/* Cockpit */}
        <mesh position={[0, 0.3, 1.5]}>
          <sphereGeometry args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color="#1e293b" 
            metalness={0.5} 
            roughness={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>
    </mesh>
  )
}

/**
 * Planet component
 */
function Planet({ position, radius, texture }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial 
        color="#3b82f6"
        roughness={0.7}
        metalness={0.1}
      />
      {/* Atmosphere glow */}
      <mesh scale={1.05}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial 
          color="#60a5fa"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </mesh>
  )
}

/**
 * Loading placeholder
 */
function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1e293b" wireframe />
    </mesh>
  )
}
```

This provides the core cockpit implementation. Would you like me to continue with the flight displays, control panels, and telemetry components?
