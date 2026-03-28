'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import MainViewport from '@/components/cockpit/MainViewport'
import PrimaryFlightDisplay from '@/components/displays/PrimaryFlightDisplay'
import SystemsMonitor from '@/components/monitoring/SystemsMonitor'
import TelemetryStream from '@/components/monitoring/TelemetryStream'
import StatusBar from '@/components/shared/StatusBar'
import ControlPanel from '@/components/cockpit/ControlPanel'
import { useFlightData } from '@/hooks/useFlightData'
import { useTelemetry } from '@/hooks/useTelemetry'
import { useSystemHealth } from '@/hooks/useSystemHealth'
import { useEffect, useState } from 'react';
import { loadAircraft } from '../lib/simulation/aircraft_models/boeing737.json';

export default function AircraftPanel({ aircraft }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadAircraft(aircraft).then(setData);
  }, [aircraft]);

  if (!data) return <div>Loading aircraft data...</div>;

  return (
    <div className="aircraft-panel">
      <h2>{data.name}</h2>
      <p>Type: {data.type}</p>
      <p>Max Speed: {data.maxSpeedKts} knots</p>
      <p>Cruise Altitude: {data.cruiseAltitudeFt} ft</p>
      <h3>Engines:</h3>
      <ul>
        {data.engines.map((e, idx) => (
          <li key={idx}>{e.type} ({e.thrustLbf} lbf)</li>
        ))}
      </ul>
    </div>
  );
    }
export const loadAircraft = async (fileName) => {
  const data = await import(`../aircrafts_models/${fileName}.json`);
  return data.default;
};
export default function CockpitPage() {
  const { flightData } = useFlightData()
  const { telemetry, connected } = useTelemetry()
  const { partitionStatus, systemHealth } = useSystemHealth()

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {/* Background gradient for atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-orange-950/5 pointer-events-none" />
      
      {/* Status bar at top */}
      <StatusBar 
        connected={connected}
        systemHealth={systemHealth}
      />

      {/* Main cockpit grid */}
      <div className="h-full grid grid-rows-[auto_1fr_auto] p-2 gap-2 pt-14">
        
        {/* Top panel - System status indicators */}
        <div className="grid grid-cols-4 gap-2">
          <SystemStatusPanel 
            title="FLIGHT CONTROL"
            status={partitionStatus.flightControl}
          />
          <SystemStatusPanel 
            title="NAVIGATION"
            status={partitionStatus.navigation}
          />
          <SystemStatusPanel 
            title="COMMUNICATIONS"
            status={partitionStatus.communications}
          />
          <SystemStatusPanel 
            title="HEALTH MONITOR"
            status={partitionStatus.healthMonitor}
          />
        </div>

        {/* Middle section - Main displays */}
        <div className="grid grid-cols-[340px_1fr_340px] gap-2">
          
          {/* Left panel */}
          <div className="flex flex-col gap-2">
            <PrimaryFlightDisplay 
              attitude={flightData.attitude}
              altitude={flightData.altitude}
              speed={flightData.speed}
              heading={flightData.heading}
              className="flex-1"
            />
            <TelemetryStream 
              data={telemetry}
              className="h-40"
            />
          </div>

          {/* Center - 3D Viewport */}
          <div className="relative rounded-lg overflow-hidden border border-cyan-500/30 bg-black">
            <Suspense fallback={<ViewportLoader />}>
              <MainViewport />
            </Suspense>
            
            {/* HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top HUD */}
              <div className="absolute top-4 left-4 right-4 flex justify-between text-cyan-400 font-mono text-sm">
                <div className="space-y-1">
                  <div>ALT: {flightData.altitude.toFixed(0)} km</div>
                  <div>VEL: {flightData.velocity.toFixed(2)} km/s</div>
                  <div>HDG: {flightData.heading.toFixed(0)}°</div>
                </div>
                <div className="text-right space-y-1">
                  <div>MODE: {flightData.mode}</div>
                  <div>PWR: {flightData.power}%</div>
                  <div>FUEL: {flightData.fuel}%</div>
                </div>
              </div>

              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <svg width="60" height="60" className="text-cyan-400/40">
                  <circle cx="30" cy="30" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="30" y1="0" x2="30" y2="12" stroke="currentColor" strokeWidth="1" />
                  <line x1="30" y1="48" x2="30" y2="60" stroke="currentColor" strokeWidth="1" />
                  <line x1="0" y1="30" x2="12" y2="30" stroke="currentColor" strokeWidth="1" />
                  <line x1="48" y1="30" x2="60" y2="30" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>

              {/* Corner brackets */}
              <svg className="absolute inset-0 w-full h-full text-cyan-400/20 pointer-events-none">
                {/* Top-left */}
                <path d="M 20 4 L 4 4 L 4 20" fill="none" stroke="currentColor" strokeWidth="1" />
                {/* Top-right */}
                <path d="M -20 4 L -4 4 L -4 20" fill="none" stroke="currentColor" strokeWidth="1" transform="translate(100%, 0) scale(-1, 1)" />
                {/* Bottom-left */}
                <path d="M 20 -4 L 4 -4 L 4 -20" fill="none" stroke="currentColor" strokeWidth="1" transform="translate(0, 100%) scale(1, -1)" />
                {/* Bottom-right */}
                <path d="M -20 -4 L -4 -4 L -4 -20" fill="none" stroke="currentColor" strokeWidth="1" transform="translate(100%, 100%) scale(-1, -1)" />
              </svg>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-2">
            <SystemsMonitor 
              partitionStatus={partitionStatus}
              className="flex-1"
            />
            <div className="cockpit-panel p-3 h-40">
              <div className="text-xs text-cyan-400 mb-2 flex justify-between">
                <span>SYSTEM RESOURCES</span>
                <span className="text-green-400">● NOMINAL</span>
              </div>
              <div className="space-y-2">
                <ResourceBar label="CPU" value={systemHealth.cpu} />
                <ResourceBar label="MEMORY" value={systemHealth.memory} />
                <ResourceBar label="BANDWIDTH" value={systemHealth.bandwidth} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom panel - Controls */}
        <ControlPanel />
      </div>
    </div>
  )
}

function SystemStatusPanel({ title, status }: { title: string, status: any }) {
  const isHealthy = status.state === 'HEALTHY'
  
  return (
    <motion.div
      className="cockpit-panel p-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-xs text-cyan-400/70 mb-2">{title}</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-400' : 'bg-amber-400'}`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className={`text-sm font-mono ${isHealthy ? 'text-green-400' : 'text-amber-400'}`}>
            {status.state}
          </span>
        </div>
        <div className="text-xs text-cyan-400/50">
          {status.cpu}% CPU
        </div>
      </div>
    </motion.div>
  )
}

function ResourceBar({ label, value }: { label: string, value: number }) {
  const getColor = (val: number) => {
    if (val > 80) return 'bg-red-500'
    if (val > 60) return 'bg-amber-500'
    return 'bg-green-500'
  }

  return (
    <div>
      <div className="flex justify-between text-xs text-cyan-400/70 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )
}

function ViewportLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <motion.div
          className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-cyan-400 font-mono text-sm">Initializing 3D Viewport...</p>
      </div>
    </div>
  )
}
