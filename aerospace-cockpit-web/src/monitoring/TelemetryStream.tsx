'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { TelemetryMessage } from '@/hooks/useTelemetry'
import { format } from 'date-fns'

interface TelemetryStreamProps {
  data: TelemetryMessage[]
  className?: string
}

export default function TelemetryStream({ data, className }: TelemetryStreamProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'SUCCESS': return 'text-green-400'
      case 'WARNING': return 'text-amber-400'
      case 'ERROR': return 'text-red-400'
      default: return 'text-cyan-400'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'SUCCESS': return '✓'
      case 'WARNING': return '⚠'
      case 'ERROR': return '✗'
      default: return '●'
    }
  }

  return (
    <div className={`cockpit-panel p-3 ${className}`}>
      <div className="text-xs text-cyan-400 mb-2 flex justify-between items-center">
        <span className="font-mono">TELEMETRY STREAM</span>
        <div className="flex items-center gap-1">
          <motion.div
            className="w-1.5 h-1.5 bg-green-400 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-green-400 text-[10px]">LIVE</span>
        </div>
      </div>

      <div className="space-y-1 max-h-full overflow-y-auto pr-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {data.slice(0, 12).map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-[11px] font-mono flex items-start gap-2 ${getLevelColor(msg.level)} py-1 border-l-2 ${
                msg.level === 'SUCCESS' ? 'border-green-500/30' :
                msg.level === 'WARNING' ? 'border-amber-500/30' :
                msg.level === 'ERROR' ? 'border-red-500/30' :
                'border-cyan-500/30'
              } pl-2`}
            >
              <span className="opacity-50 shrink-0 w-12">
                {format(msg.timestamp, 'HH:mm:ss')}
              </span>
              <span className="font-bold shrink-0 w-10">
                [{msg.partition}]
              </span>
              <span className="shrink-0 w-3">
                {getLevelIcon(msg.level)}
              </span>
              <span className="opacity-80 flex-1">
                {msg.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
