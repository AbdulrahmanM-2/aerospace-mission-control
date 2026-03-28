// Global type definitions for the application

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
  mode: 'MANUAL' | 'AUTO' | 'APPROACH' | 'DOCK'
  power: number
  fuel: number
}

export interface TelemetryMessage {
  id: string
  timestamp: number
  partition: string
  message: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
}

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
