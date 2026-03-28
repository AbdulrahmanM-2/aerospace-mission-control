'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ControlPanel() {
  const [throttle, setThrottle] = useState(75)
  const [mode, setMode] = useState('AUTO')
  const [systems, setSystems] = useState({
    rcs: true,
    sas: true,
    lights: true,
  })

  const modes = ['MANUAL', 'AUTO', 'APPROACH', 'DOCK']

  return (
    <div className="h-full cockpit-panel p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 h-full">
        
        {/* Left - Throttle Control */}
        <div className="flex flex-col justify-center">
          <div className="text-xs text-cyan-400 mb-3 font-mono">THROTTLE CONTROL</div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={throttle}
                onChange={(e) => setThrottle(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-cyan-500
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-cyan-400
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-cyan-500/50"
              />
            </div>
            <div className="text-2xl font-mono text-cyan-400 font-bold tabular-nums w-16 text-right">
              {throttle}<span className="text-sm opacity-50">%</span>
            </div>
          </div>
          
          {/* Throttle indicator */}
          <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                throttle > 80 ? 'bg-red-500' :
                throttle > 50 ? 'bg-amber-500' :
                'bg-green-500'
              }`}
              animate={{ width: `${throttle}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Center - Mode Selection */}
        <div className="flex flex-col justify-center px-6 border-x border-cyan-500/20">
          <div className="text-xs text-cyan-400 mb-3 font-mono text-center">FLIGHT MODE</div>
          <div className="grid grid-cols-2 gap-2">
            {modes.map((m) => (
              <motion.button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded font-mono text-sm border transition-all ${
                  mode === m
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/50'
                    : 'bg-slate-900/50 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {m}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right - System Toggles */}
        <div className="flex flex-col justify-center">
          <div className="text-xs text-cyan-400 mb-3 font-mono">SYSTEM CONTROLS</div>
          <div className="grid grid-cols-3 gap-3">
            <SystemToggle
              label="RCS"
              active={systems.rcs}
              onToggle={() => setSystems(s => ({ ...s, rcs: !s.rcs }))}
            />
            <SystemToggle
              label="SAS"
              active={systems.sas}
              onToggle={() => setSystems(s => ({ ...s, sas: !s.sas }))}
            />
            <SystemToggle
              label="LIGHTS"
              active={systems.lights}
              onToggle={() => setSystems(s => ({ ...s, lights: !s.lights }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SystemToggle({ label, active, onToggle }: { 
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <motion.button
      onClick={onToggle}
      className={`relative px-3 py-2 rounded border font-mono text-xs transition-all ${
        active
          ? 'bg-green-500/20 border-green-500 text-green-400'
          : 'bg-slate-900/50 border-slate-700 text-slate-500'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center justify-center gap-2">
        <motion.div
          className={`w-2 h-2 rounded-full ${active ? 'bg-green-400' : 'bg-slate-600'}`}
          animate={active ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
        />
        <span>{label}</span>
      </div>
      
      {active && (
        <motion.div
          className="absolute inset-0 border border-green-400 rounded"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  )
}
