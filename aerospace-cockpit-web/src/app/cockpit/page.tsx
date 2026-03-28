// src/app/cockpit/page.tsx
import { useEffect, useState, Suspense } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useFlightData } from '@/hooks/useFlightData';
import StatusBar from '@/components/StatusBar';
import SystemStatusPanel from '@/components/SystemStatusPanel';
import PrimaryFlightDisplay from '@/components/PrimaryFlightDisplay';
import TelemetryStream from '@/components/TelemetryStream';
import SystemsMonitor from '@/components/SystemsMonitor';
import MainViewport from '@/components/MainViewport';

// Import all aircraft JSON
import boeing737 from '../lib/simulation/aircraft_models/boeing737.json';
import cessna172 from '../lib/simulation/aircraft_models/cessna172.json';

const AIRCRAFTS = {
  'Boeing 737': boeing737,
  'Cessna 172': cessna172,
};

export default function CockpitPage() {
  const { flightData } = useFlightData();
  const { telemetry, connected } = useTelemetry();
  const { partitionStatus, systemHealth } = useSystemHealth();

  const [selectedAircraft, setSelectedAircraft] = useState('Boeing 737');
  const [aircraftData, setAircraftData] = useState(AIRCRAFTS[selectedAircraft]);

  // Update aircraft data whenever selection changes
  useEffect(() => {
    setAircraftData(AIRCRAFTS[selectedAircraft]);
  }, [selectedAircraft]);

  if (!aircraftData) return <div>Loading aircraft data...</div>;

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-orange-950/5 pointer-events-none" />

      <StatusBar connected={connected} systemHealth={systemHealth} />

      <div className="h-full grid grid-rows-[auto_1fr_auto] p-2 gap-2 pt-14">

        {/* Top panel */}
        <div className="grid grid-cols-4 gap-2">
          <SystemStatusPanel title="FLIGHT CONTROL" status={partitionStatus.flightControl} />
          <SystemStatusPanel title="NAVIGATION" status={partitionStatus.navigation} />
          <SystemStatusPanel title="COMMUNICATIONS" status={partitionStatus.communications} />
          <SystemStatusPanel title="HEALTH MONITOR" status={partitionStatus.healthMonitor} />
        </div>

        {/* Middle cockpit section */}
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
            <TelemetryStream data={telemetry} className="h-40" />
          </div>

          {/* Center - 3D viewport */}
          <div className="relative rounded-lg overflow-hidden border border-cyan-500/30 bg-black">
            <Suspense fallback={<div>Loading viewport...</div>}>
              <MainViewport aircraft={aircraftData} />
            </Suspense>

            {/* HUD overlay */}
            <div className="absolute inset-0 pointer-events-none">
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
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-2">
            <SystemsMonitor partitionStatus={partitionStatus} className="flex-1" />
            <div className="cockpit-panel p-3 h-40 flex flex-col gap-2">
              <select
                value={selectedAircraft}
                onChange={(e) => setSelectedAircraft(e.target.value)}
                className="p-1 rounded bg-gray-800 text-white"
              >
                {Object.keys(AIRCRAFTS).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <h2>{aircraftData.name}</h2>
              <p>Type: {aircraftData.type}</p>
              <p>Max Speed: {aircraftData.maxSpeedKts} knots</p>
              <p>Cruise Altitude: {aircraftData.cruiseAltitudeFt} ft</p>
              <h3>Engines:</h3>
              <ul>
                {aircraftData.engines.map((e, idx) => (
                  <li key={idx}>{e.type} ({e.thrustLbf} lbf)</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
