'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function MainViewport() {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={55} />
        
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
          <pointLight position={[10, -5, -10]} intensity={0.3} color="#ec4899" />
          
          {/* Space environment */}
          <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          {/* Planet */}
          <Planet position={[0, -60, -40]} />
          
          {/* Spacecraft */}
          <Spacecraft position={[0, 0, 0]} />
          
          {/* Grid for reference */}
          <gridHelper args={[50, 50, 0x00ffff, 0x004455]} position={[0, -2, 0]} />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={40}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

function Spacecraft({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += 0.002
    }
  })

  return (
    <group ref={meshRef} position={position}>
      {/* Main hull */}
      <mesh castShadow>
        <boxGeometry args={[2.5, 0.8, 5]} />
        <meshStandardMaterial 
          color="#1e293b" 
          metalness={0.9} 
          roughness={0.2}
          emissive="#1e40af"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Cockpit canopy */}
      <mesh position={[0, 0.4, 1.8]} castShadow>
        <sphereGeometry args={[0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#0ea5e9" 
          metalness={0.3} 
          roughness={0.1}
          transparent
          opacity={0.7}
          emissive="#06b6d4"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Wings */}
      <Wing position={[-2.5, 0, 0]} rotation={[0, 0, Math.PI / 8]} />
      <Wing position={[2.5, 0, 0]} rotation={[0, 0, -Math.PI / 8]} scale={[-1, 1, 1]} />
      
      {/* Engines */}
      <Engine position={[-1, -0.2, -2.3]} />
      <Engine position={[1, -0.2, -2.3]} />
      
      {/* Tail fins */}
      <mesh position={[0, 0.8, -2]} castShadow>
        <boxGeometry args={[0.2, 1.2, 1]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Navigation lights */}
      <pointLight position={[-2, 0, 1]} color="#ef4444" intensity={1} distance={3} />
      <pointLight position={[2, 0, 1]} color="#22c55e" intensity={1} distance={3} />
    </group>
  )
}

function Wing({ position, rotation, scale }: any) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      <boxGeometry args={[2.5, 0.15, 2]} />
      <meshStandardMaterial 
        color="#475569" 
        metalness={0.9} 
        roughness={0.15}
      />
    </mesh>
  )
}

function Engine({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null)
  
  useFrame((state) => {
    if (lightRef.current) {
      // Pulsing engine glow
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 4) * 0.5
    }
  })

  return (
    <group position={position}>
      {/* Engine housing */}
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.35, 1, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Engine glow */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.2, 16]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#60a5fa"
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Engine light */}
      <pointLight ref={lightRef} color="#60a5fa" intensity={2} distance={8} />
    </group>
  )
}

function Planet({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0003
    }
  })

  return (
    <group position={position}>
      {/* Planet surface */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[35, 64, 64]} />
        <meshStandardMaterial 
          color="#1e40af"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh scale={1.08}>
        <sphereGeometry args={[35, 32, 32]} />
        <meshBasicMaterial 
          color="#60a5fa"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Atmospheric rim */}
      <mesh scale={1.05}>
        <sphereGeometry args={[35, 32, 32]} />
        <meshBasicMaterial 
          color="#7dd3fc"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}
