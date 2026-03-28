'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { SystemHealth } from '@/hooks/useSystemHealth'

interface StatusBarProps {
  connected: boolean
  systemHealth: SystemHealth
}

export default function StatusBar({ connected, systemHealth }: StatusBarProps) {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-cyan-500/30 h-12"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left - Logo and Title */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <motion.div
                className="absolute inset-0 bg-cyan-500/30 rounded blur"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                AEROSPACE MISSION CONTROL
              </h1>
              <p className="text-[10px] text-cyan-400/50 font-mono">DO-178C DAL A | TC-12345</p>
            </div>
          </Link>
        </div>

        {/* Center - Mission Time */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="text-cyan-400/70">
            <span className="opacity-50">MET:</span>{' '}
            <MissionTimer />
          </div>
          <div className="text-cyan-400/70">
            <span className="opacity-50">MODE:</span>{' '}
            <span className="text-green-400">OPERATIONAL</span>
          </div>
        </div>

        {/* Right - System Status */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <motion.div
              className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}
              animate={{ opacity: connected ? [0.5, 1, 0.5] : 1 }}
              transition={{ duration: 2, repeat: connected ? Infinity : 0 }}
            />
            <span className={`text-xs font-mono ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? 'TELEMETRY LINK' : 'OFFLINE'}
            </span>
          </div>

          {/* System Health */}
          <div className="flex items-center gap-2 px-3 py-1 rounded border border-cyan-500/30 bg-slate-900/50">
            <span className="text-[10px] text-cyan-400/50">SYSTEM:</span>
            <span className={`text-xs font-mono font-bold ${
              systemHealth.overall === 'NOMINAL' ? 'text-green-400' :
              systemHealth.overall === 'DEGRADED' ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {systemHealth.overall}
            </span>
          </div>

          {/* Certification Badge */}
          <div className="px-3 py-1 rounded border border-green-500/50 bg-green-500/10">
            <span className="text-[10px] text-green-400 font-mono font-bold">✓ CERTIFIED</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MissionTimer() {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = time % 60

  return (
    <span className="text-cyan-400 tabular-nums">
      {hours.toString().padStart(2, '0')}:
      {minutes.toString().padStart(2, '0')}:
      {seconds.toString().padStart(2, '0')}
    </span>
  )
}

// Add missing imports
import { useState, useEffect } from 'react'
