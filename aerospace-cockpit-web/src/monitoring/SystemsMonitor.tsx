'use client'

import { motion } from 'framer-motion'
import type { PartitionStatus } from '@/hooks/useSystemHealth'

interface SystemsMonitorProps {
  partitionStatus: PartitionStatus
  className?: string
}

export default function SystemsMonitor({ partitionStatus, className }: SystemsMonitorProps) {
  return (
    <div className={`cockpit-panel p-4 ${className}`}>
      <div className="text-xs text-cyan-400 mb-3 flex justify-between">
        <span className="font-mono">PARTITION MONITORING</span>
        <span className="text-green-400">● ALL SYSTEMS GO</span>
      </div>

      <div className="space-y-3">
        <PartitionCard 
          name="FLIGHT CONTROL" 
          partition={partitionStatus.flightControl}
          extra={`WCET: ${partitionStatus.flightControl.wcet}ms`}
        />
        <PartitionCard 
          name="NAVIGATION" 
          partition={partitionStatus.navigation}
          extra={partitionStatus.navigation.gpsLock ? 'GPS: LOCK' : 'GPS: SEARCHING'}
        />
        <PartitionCard 
          name="COMMUNICATIONS" 
          partition={partitionStatus.communications}
          extra={`LINK: ${partitionStatus.communications.linkQuality}%`}
        />
        <PartitionCard 
          name="HEALTH MONITOR" 
          partition={partitionStatus.healthMonitor}
        />
      </div>
    </div>
  )
}

function PartitionCard({ name, partition, extra }: any) {
  const isHealthy = partition.state === 'HEALTHY'

  return (
    <div className="border border-cyan-500/20 rounded p-2 bg-slate-900/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-green-400' : 'bg-amber-400'}`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-mono text-cyan-400">{name}</span>
        </div>
        <span className={`text-[10px] font-mono ${isHealthy ? 'text-green-400' : 'text-amber-400'}`}>
          {partition.state}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] text-cyan-400/70">
        <div>CPU: {partition.cpu}%</div>
        <div>MEM: {partition.memory}%</div>
      </div>

      {extra && (
        <div className="text-[10px] text-cyan-400/50 mt-1">{extra}</div>
      )}
    </div>
  )
}
