'use client'

import { useState, useEffect } from 'react'

export interface FlightData {
  attitude: {
    pitch: number
    roll: number
    yaw: number
  }
  altitude: number
  velocity: number
  speed: number
  heading: number
  mode: string
  power: number
  fuel: number
}

export function useFlightData() {
  const [flightData, setFlightData] = useState<FlightData>({
    attitude: { pitch: 0, roll: 0, yaw: 0 },
    altitude: 408,
    velocity: 7.66,
    speed: 7.66,
    heading: 90,
    mode: 'AUTO',
    power: 87,
    fuel: 94
  })

  useEffect(() => {
    // Simulate realistic flight dynamics at 20Hz
    const interval = setInterval(() => {
      setFlightData(prev => {
        // Gentle oscillations for realistic spacecraft motion
        const pitchChange = (Math.random() - 0.5) * 0.3
        const rollChange = (Math.random() - 0.5) * 0.2
        const yawChange = (Math.random() - 0.5) * 0.15

        const newPitch = Math.max(-25, Math.min(25, prev.attitude.pitch + pitchChange))
        const newRoll = Math.max(-30, Math.min(30, prev.attitude.roll + rollChange))
        const newYaw = (prev.attitude.yaw + yawChange + 360) % 360

        return {
          ...prev,
          attitude: {
            pitch: newPitch,
            roll: newRoll,
            yaw: newYaw
          },
          altitude: 408 + (Math.random() - 0.5) * 1,
          velocity: 7.66 + (Math.random() - 0.5) * 0.05,
          speed: 7.66 + (Math.random() - 0.5) * 0.05,
          power: Math.max(85, Math.min(90, prev.power + (Math.random() - 0.5) * 2)),
          fuel: Math.max(92, Math.min(95, prev.fuel + (Math.random() - 0.5) * 0.5))
        }
      })
    }, 50) // 20Hz update rate

    return () => clearInterval(interval)
  }, [])

  return { flightData }
}
