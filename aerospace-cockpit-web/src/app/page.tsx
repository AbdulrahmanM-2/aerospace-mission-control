'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-gradient-to-b from-space-dark via-slate-900 to-black relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center space-y-8 max-w-4xl"
        >
          {/* Title */}
          <motion.h1
            className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-cockpit-cyan via-cockpit-blue to-blue-600 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            AEROSPACE
            <br />
            MISSION CONTROL
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-cyan-400/80 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Advanced Spacecraft Cockpit Interface
          </motion.p>

          {/* Certification badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 text-sm font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="glass-panel px-4 py-2 rounded-full border-green-500/50">
              <span className="text-green-400">✓ DO-178C DAL A</span>
            </div>
            <div className="glass-panel px-4 py-2 rounded-full border-cyan-500/50">
              <span className="text-cyan-400">✓ TYPE CERTIFICATE TC-12345</span>
            </div>
            <div className="glass-panel px-4 py-2 rounded-full border-blue-500/50">
              <span className="text-blue-400">✓ CERTIFIED AVIONICS</span>
            </div>
          </motion.div>

          {/* System status indicators */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <SystemIndicator label="FLIGHT CONTROL" status="READY" />
            <SystemIndicator label="NAVIGATION" status="READY" />
            <SystemIndicator label="COMMUNICATIONS" status="READY" />
            <SystemIndicator label="HEALTH MONITOR" status="READY" />
          </motion.div>

          {/* Enter button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="pt-8"
          >
            <Link
              href="/cockpit"
              className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-bold rounded-lg overflow-hidden transition-all duration-300"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <span className="relative z-10 text-black">ENTER COCKPIT</span>
              <motion.span
                className="relative z-10 text-black"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>

          {/* Footer info */}
          <motion.div
            className="pt-12 text-xs text-cyan-400/50 font-mono space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <p>PRODUCTION DEPLOYMENT | VERCEL EDGE NETWORK</p>
            <p>REAL-TIME TELEMETRY | 3D VISUALIZATION | SYSTEM MONITORING</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
          animate={{ y: ['0vh', '100vh'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </main>
  )
}

function SystemIndicator({ label, status }: { label: string; status: string }) {
  return (
    <div className="glass-panel p-3 rounded-lg border-cyan-500/30">
      <div className="text-xs text-cyan-400/70 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <motion.div
          className="w-2 h-2 rounded-full bg-green-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-sm text-green-400 font-mono">{status}</span>
      </div>
    </div>
  )
}
