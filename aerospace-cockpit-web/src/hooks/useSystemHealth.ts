'use client'

import { useState, useEffect } from 'react'

export interface PartitionStatus {
  flightControl: {
    state: 'HEALTHY' | 'DEGRADED' | 'FAILED'
    cpu: number
    memory: number
    wcet: number
  }
  navigation: {
    state: 'HEALTHY' | 'DEGRADED' | 'FAILED'
    cpu: number
    memory: number
    gpsLock: boolean
  }
  communications: {
    state: 'HEALTHY' | 'DEGRADED' | 'FAILED'
    cpu: number
    memory: number
    linkQuality: number
  }
  healthMonitor: {
    state: 'HEALTHY' | 'DEGRADED' | 'FAILED'
    cpu: number
    memory: number
  }
}

export interface SystemHealth {
  overall: 'NOMINAL' | 'DEGRADED' | 'CRITICAL'
  cpu: number
  memory: number
  bandwidth: number
}

export function useSystemHealth() {
  const [partitionStatus, setPartitionStatus] = useState<PartitionStatus>({
    flightControl: {
      state: 'HEALTHY',
      cpu: 45,
      memory: 62,
      wcet: 14.2
    },
    navigation: {
      state: 'HEALTHY',
      cpu: 32,
      memory: 48,
      gpsLock: true
    },
    communications: {
      state: 'HEALTHY',
      cpu: 28,
      memory: 35,
      linkQuality: 98
    },
    healthMonitor: {
      state: 'HEALTHY',
      cpu: 15,
      memory: 22
    }
  })

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'NOMINAL',
    cpu: 42,
    memory: 58,
    bandwidth: 76
  })

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slight variations in system metrics
      setPartitionStatus(prev => ({
        flightControl: {
          ...prev.flightControl,
          cpu: Math.max(40, Math.min(50, prev.flightControl.cpu + (Math.random() - 0.5) * 4)),
          memory: Math.max(60, Math.min(65, prev.flightControl.memory + (Math.random() - 0.5) * 2))
        },
        navigation: {
          ...prev.navigation,
          cpu: Math.max(28, Math.min(36, prev.navigation.cpu + (Math.random() - 0.5) * 3)),
          memory: Math.max(45, Math.min(52, prev.navigation.memory + (Math.random() - 0.5) * 2))
        },
        communications: {
          ...prev.communications,
          cpu: Math.max(25, Math.min(32, prev.communications.cpu + (Math.random() - 0.5) * 3)),
          linkQuality: Math.max(95, Math.min(100, prev.communications.linkQuality + (Math.random() - 0.5) * 2))
        },
        healthMonitor: prev.healthMonitor
      }))

      setSystemHealth(prev => ({
        ...prev,
        cpu: Math.max(38, Math.min(48, prev.cpu + (Math.random() - 0.5) * 4)),
        memory: Math.max(55, Math.min(62, prev.memory + (Math.random() - 0.5) * 3)),
        bandwidth: Math.max(72, Math.min(80, prev.bandwidth + (Math.random() - 0.5) * 3))
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return { partitionStatus, systemHealth }
}
