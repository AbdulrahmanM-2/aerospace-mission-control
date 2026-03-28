'use client'

import { useState, useEffect } from 'react'

export interface TelemetryMessage {
  id: string
  timestamp: number
  partition: string
  message: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
}

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryMessage[]>([])
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    const messages = [
      { partition: 'FC', message: 'Control law executed [WCET: 14.2ms]', level: 'INFO' as const },
      { partition: 'FC', message: 'PID output: Elevator -2.3°', level: 'INFO' as const },
      { partition: 'NAV', message: 'GPS lock acquired [12 satellites]', level: 'SUCCESS' as const },
      { partition: 'NAV', message: 'Position updated [408.2 km]', level: 'INFO' as const },
      { partition: 'COMM', message: 'Telemetry packet transmitted', level: 'INFO' as const },
      { partition: 'COMM', message: 'Link quality: 98.5%', level: 'SUCCESS' as const },
      { partition: 'HM', message: 'All partitions nominal', level: 'SUCCESS' as const },
      { partition: 'HM', message: 'CPU usage: 45%', level: 'INFO' as const },
      { partition: 'FC', message: 'Attitude stable [±0.5°]', level: 'SUCCESS' as const },
      { partition: 'NAV', message: 'Orbit calculations updated', level: 'INFO' as const },
    ]

    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)]
      const newMessage: TelemetryMessage = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        ...msg
      }

      setTelemetry(prev => [newMessage, ...prev].slice(0, 50))
    }, 2000) // New message every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return { telemetry, connected }
}
