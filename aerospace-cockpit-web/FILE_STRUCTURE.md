# Complete File Structure

## Configuration Files (Root Level)
- package.json - Dependencies and scripts
- next.config.js - Next.js configuration
- tsconfig.json - TypeScript configuration
- tailwind.config.ts - Tailwind CSS theme
- postcss.config.js - PostCSS configuration
- vercel.json - Vercel deployment settings
- .gitignore - Git ignore rules
- .eslintrc.json - ESLint configuration

## Documentation
- README.md - Project overview and features
- DEPLOYMENT.md - Step-by-step deployment guide
- QUICKSTART.md - 3-minute quick start
- FILE_STRUCTURE.md - This file

## Source Code Structure

### src/app/ - Next.js App Router
- layout.tsx - Root layout with fonts and metadata
- page.tsx - Landing page with animations
- globals.css - Global styles and aerospace theme
- cockpit/page.tsx - Main cockpit interface

### src/components/cockpit/ - Cockpit-specific components
- MainViewport.tsx - 3D spacecraft visualization (Three.js)
- ControlPanel.tsx - Control interface (throttle, modes, systems)

### src/components/displays/ - Flight displays
- PrimaryFlightDisplay.tsx - Attitude indicator with pitch/roll

### src/components/monitoring/ - Monitoring components
- SystemsMonitor.tsx - Partition health monitoring
- TelemetryStream.tsx - Real-time message stream

### src/components/shared/ - Shared components
- StatusBar.tsx - Top navigation and status

### src/components/ui/ - Reusable UI components
- (Empty - ready for custom components)

### src/hooks/ - Custom React hooks
- useFlightData.ts - Flight dynamics simulation
- useTelemetry.ts - Telemetry message stream
- useSystemHealth.ts - System health monitoring

### src/lib/ - Utility libraries
- simulation/ - (Ready for flight simulation code)
- controls/ - (Ready for control algorithms)
- utils/ - (Ready for utility functions)

### src/types/ - TypeScript definitions
- index.ts - Global type definitions

### public/ - Static assets
- assets/ - (Ready for images, models, etc.)

## Total Files: 28
## Components: 6 React components
## Hooks: 3 custom hooks
## Pages: 2 (landing + cockpit)
