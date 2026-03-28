'use client'

import { motion } from 'framer-motion'

interface PFDProps {
  attitude: {
    pitch: number
    roll: number
    yaw: number
  }
  altitude: number
  speed: number
  heading: number
  className?: string
}

export default function PrimaryFlightDisplay({ 
  attitude, 
  altitude, 
  speed, 
  heading,
  className 
}: PFDProps) {
  return (
    <div className={`cockpit-panel p-4 ${className}`}>
      <div className="text-xs text-cyan-400 mb-3 flex justify-between items-center">
        <span className="font-mono">PRIMARY FLIGHT DISPLAY</span>
        <span className="text-green-400 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          NOMINAL
        </span>
      </div>

      {/* Attitude Indicator */}
      <div className="relative h-56 mb-4 bg-gradient-to-b from-sky-900 via-sky-800 to-amber-900 rounded-lg overflow-hidden border border-cyan-500/20">
        <AttitudeIndicator pitch={attitude.pitch} roll={attitude.roll} />
      </div>

      {/* Flight parameters grid */}
      <div className="grid grid-cols-2 gap-2">
        <FlightParam label="ALTITUDE" value={altitude.toFixed(1)} unit="km" />
        <FlightParam label="VELOCITY" value={speed.toFixed(2)} unit="km/s" />
        <FlightParam label="HEADING" value={heading.toFixed(0)} unit="°" />
        <FlightParam label="YAW" value={attitude.yaw.toFixed(1)} unit="°" />
      </div>
    </div>
  )
}

function AttitudeIndicator({ pitch, roll }: { pitch: number, roll: number }) {
  return (
    <div className="relative w-full h-full">
      {/* Rotating horizon */}
      <motion.div
        className="absolute inset-0"
        style={{
          transform: `rotate(${-roll}deg) translateY(${-pitch * 2}px)`
        }}
      >
        {/* Sky */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-sky-600 to-sky-700" />
        
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-amber-800 to-amber-900" />
        
        {/* Horizon line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/90 shadow-lg" />
        
        {/* Pitch ladder */}
        {[-30, -20, -10, 10, 20, 30].map(deg => (
          <div
            key={deg}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: `calc(50% - ${deg * 2}px)` }}
          >
            <div className="flex items-center gap-2 text-white/80 text-xs font-mono">
              <div className="w-10 h-px bg-white/80" />
              <span className="font-bold">{Math.abs(deg)}</span>
              <div className="w-10 h-px bg-white/80" />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Fixed aircraft symbol */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
        <svg width="120" height="120" className="text-yellow-400 drop-shadow-lg">
          <line x1="20" y1="60" x2="40" y2="60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="80" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="60" r="4" fill="currentColor" />
          <line x1="60" y1="60" x2="60" y2="72" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Roll scale */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <RollScale roll={roll} />
      </div>
    </div>
  )
}

function RollScale({ roll }: { roll: number }) {
  return (
    <div className="relative w-48">
      <svg width="192" height="40" className="text-white/70">
        <path
          d="M 16 32 Q 96 8, 176 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {[-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].map(angle => {
          const x = 96 + Math.sin((angle * Math.PI) / 180) * 80
          const y = 32 - Math.cos((angle * Math.PI) / 180) * 24
          const len = angle === 0 ? 10 : [-30, 30, -60, 60].includes(angle) ? 8 : 5
          
          return (
            <line
              key={angle}
              x1={x}
              y1={y}
              x2={x + Math.sin((angle * Math.PI) / 180) * len}
              y2={y - Math.cos((angle * Math.PI) / 180) * len}
              stroke="currentColor"
              strokeWidth={angle === 0 ? 2 : 1.5}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          transform: `translateX(-50%) rotate(${roll}deg)`,
          transformOrigin: '50% 32px'
        }}
      >
        <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[12px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
      </motion.div>
    </div>
  )
}

function FlightParam({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="border border-cyan-500/30 rounded p-2 bg-slate-900/50">
      <div className="text-[10px] text-cyan-400/70 mb-1">{label}</div>
      <div className="font-mono text-xl text-cyan-400 flex items-baseline gap-1">
        <span>{value}</span>
        <span className="text-sm opacity-70">{unit}</span>
      </div>
    </div>
  )
}
