import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Thermometer, Zap } from 'lucide-react';

interface Float {
  id: string;
  latitude?: number;
  longitude?: number;
  temperature?: number;
  salinity?: number;
  status: string;
}

type DataLayer = 'temperature' | 'salinity' | 'pressure' | 'current' | 'oxygen' | 'ph';

interface OceanMapProps {
  floats: Float[];
  selectedFloat?: Float;
  onFloatSelect: (float: Float) => void;
  dataLayer?: DataLayer;
}

export function OceanMap({ floats, selectedFloat, onFloatSelect, dataLayer = 'temperature' }: OceanMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHeatmapEnabled, setIsHeatmapEnabled] = useState(false);

  useEffect(() => {
    // In a real implementation, this would initialize a mapping library like Mapbox or Leaflet
    console.log('Map would be initialized with', floats.length, 'floats');
    
    // Draw ocean background with stable texture patterns
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const width = canvas.width;
        const height = canvas.height;
        
        // Create ocean gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0f172a'); // Very dark blue
        gradient.addColorStop(0.3, '#1e293b'); // Dark slate
        gradient.addColorStop(0.6, '#0ea5e9'); // Ocean blue
        gradient.addColorStop(1, '#0284c7'); // Deeper blue
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add stable texture/patterns using seeded random
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 50; i++) {
          const seed = i * 73 + 29; // Seeded random for consistency
          const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
          const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
          const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
          
          ctx.beginPath();
          ctx.arc(
            random1 * width,
            random2 * height,
            random3 * 3 + 1,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = '#60a5fa';
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }
  }, []);  // Remove floats dependency to prevent texture re-generation

  // Convert lat/lng to pixel coordinates (simplified projection)
  const projectToPixels = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  };

  // Generate some sample float data if none provided
  const sampleFloats = floats.length > 0 ? floats : [
    { id: '1', latitude: 70, longitude: -160, temperature: 1.2, salinity: 32.1, status: 'active' },
    { id: '2', latitude: 65, longitude: -150, temperature: 2.1, salinity: 31.8, status: 'active' },
    { id: '3', latitude: 68, longitude: -170, temperature: 0.8, salinity: 32.4, status: 'active' },
    { id: '4', latitude: 72, longitude: -155, temperature: 1.5, salinity: 31.9, status: 'inactive' },
  ];

  // Generate stable distributed floats that don't change position on re-renders
  const distributedFloats = useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => {
      // Use multiple different seeds for more natural distribution
      const baseSeed = i;
      const seed1 = (baseSeed * 73 + 137) % 1000;
      const seed2 = (baseSeed * 193 + 251) % 1000;
      const seed3 = (baseSeed * 317 + 419) % 1000;
      const seed4 = (baseSeed * 523 + 641) % 1000;
      const seed5 = (baseSeed * 769 + 887) % 1000;

      // Create more natural random distribution
      const random1 = Math.sin(seed1 * 0.1) * Math.cos(seed2 * 0.15) * 0.5 + 0.5;
      const random2 = Math.sin(seed2 * 0.12) * Math.cos(seed3 * 0.18) * 0.5 + 0.5;
      const random3 = Math.sin(seed3 * 0.11) * Math.cos(seed1 * 0.14) * 0.5 + 0.5;
      const random4 = Math.sin(seed4 * 0.13) * Math.cos(seed5 * 0.16) * 0.5 + 0.5;
      const random5 = Math.sin(seed5 * 0.17) * Math.cos(seed4 * 0.19) * 0.5 + 0.5;

      const temp = random1 * 35 - 5; // Temperature range -5 to 30°C
      const salinity = 30 + random2 * 6; // Salinity range 30-36 PSU
      const latitude = -80 + random3 * 160; // Lat range -80 to 80
      const longitude = -180 + random4 * 360; // Lng range -180 to 180
      
      let color = 'bg-cyan-400';
      let glowColor = '#06B6D4';
      if (temp > 20) {
        color = 'bg-red-400';
        glowColor = '#F87171';
      } else if (temp > 10) {
        color = 'bg-yellow-400';
        glowColor = '#FBBF24';
      } else if (temp > 0) {
        color = 'bg-cyan-400';
        glowColor = '#22D3EE';
      } else {
        color = 'bg-blue-600';
        glowColor = '#2563EB';
      }
      
      // Create more natural positioning with some clustering
      const clusterX = random3 * 90 + 5; // 5% to 95% across width
      const clusterY = random4 * 90 + 5; // 5% to 95% across height
      
      return {
        id: `auto-${i}`,
        latitude,
        longitude,
        temperature: temp,
        salinity,
        status: random5 > 0.1 ? 'active' : 'inactive',
        color,
        glowColor,
        // Natural scattered positions (percentage-based)
        leftPercent: clusterX,
        topPercent: clusterY
      };
    });
  }, []); // Empty dependency array means this only generates once

  return (
    <div className="space-y-4">
      {/* Map Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Global ARGO Float Network</h2>
            <p className="text-sm text-slate-400">Worldwide ocean temperature and salinity monitoring stations</p>
          </div>
        </div>
        
        {/* Map Controls */}
        <div className="flex items-center gap-4">
          {/* Global ARGO Coverage - moved to left side of controls */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 text-white max-w-xs">
            <div className="text-xs font-medium text-slate-300 mb-2">Global ARGO Coverage</div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-slate-200">Hot</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-slate-200">Warm</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-slate-200">Cool</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-slate-200">Cold</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 mt-2 border-t border-slate-700 pt-2">
              180 floats • 43 regions
            </div>
          </div>

          {/* Heatmap Toggle */}
          <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-sm rounded-lg p-2">
            <Zap className={`w-4 h-4 ${isHeatmapEnabled ? 'text-cyan-400' : 'text-slate-400'}`} />
            <Switch
              checked={isHeatmapEnabled}
              onCheckedChange={setIsHeatmapEnabled}
              className="data-[state=checked]:bg-cyan-500"
            />
            <span className="text-sm text-slate-300">Heatmap</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-96 rounded-xl overflow-hidden bg-slate-800">
        {/* Ocean Background Canvas */}
        <canvas 
          ref={canvasRef}
          width={800}
          height={400}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Overlay gradient for depth effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-900/20 to-blue-950/40"></div>
        
        {/* Geographic Labels */}
        <div className="absolute top-8 left-1/4 text-cyan-300 text-xs font-medium tracking-wider">
          ARCTIC
        </div>
        <div className="absolute top-20 left-16 text-cyan-300 text-xs font-medium tracking-wider">
          ATLANTIC
        </div>
        <div className="absolute top-32 left-20 text-cyan-300 text-xs font-medium tracking-wider">
          GULF OF MEXICO
        </div>
        <div className="absolute top-24 right-24 text-cyan-300 text-xs font-medium tracking-wider">
          MEDITERRANEAN
        </div>
        <div className="absolute top-28 right-16 text-cyan-300 text-xs font-medium tracking-wider">
          MIDDLE EAST
        </div>
        <div className="absolute bottom-24 left-1/3 text-cyan-300 text-xs font-medium tracking-wider">
          SOUTHERN
        </div>
        <div className="absolute bottom-32 right-1/4 text-cyan-300 text-xs font-medium tracking-wider">
          INDIAN
        </div>

        {/* ARGO float markers */}
        <div ref={mapRef} className="absolute inset-0">
          {sampleFloats.map((float, index) => {
            if (mapRef.current) {
              const { width, height } = mapRef.current.getBoundingClientRect();
              const { x, y } = projectToPixels(float.latitude, float.longitude, width, height);
              
              // Color based on selected data layer
              let color = 'bg-cyan-400';
              let glowColor = 'shadow-cyan-400/50';
              let value = float.temperature;
              
              switch (dataLayer) {
                case 'temperature':
                  value = float.temperature;
                  if (value > 20) {
                    color = 'bg-red-400';
                    glowColor = 'shadow-red-400/50';
                  } else if (value > 10) {
                    color = 'bg-yellow-400';
                    glowColor = 'shadow-yellow-400/50';
                  } else if (value > 0) {
                    color = 'bg-cyan-400';
                    glowColor = 'shadow-cyan-400/50';
                  } else {
                    color = 'bg-blue-600';
                    glowColor = 'shadow-blue-600/50';
                  }
                  break;
                case 'salinity':
                  value = float.salinity;
                  if (value > 35) {
                    color = 'bg-purple-400';
                    glowColor = 'shadow-purple-400/50';
                  } else if (value > 34) {
                    color = 'bg-blue-400';
                    glowColor = 'shadow-blue-400/50';
                  } else if (value > 33) {
                    color = 'bg-cyan-400';
                    glowColor = 'shadow-cyan-400/50';
                  } else {
                    color = 'bg-green-400';
                    glowColor = 'shadow-green-400/50';
                  }
                  break;
                default:
                  // For other data layers, use temperature-based coloring as fallback
                  value = float.temperature;
                  if (value > 20) {
                    color = 'bg-red-400';
                    glowColor = 'shadow-red-400/50';
                  } else if (value > 10) {
                    color = 'bg-yellow-400';
                    glowColor = 'shadow-yellow-400/50';
                  } else if (value > 0) {
                    color = 'bg-cyan-400';
                    glowColor = 'shadow-cyan-400/50';
                  } else {
                    color = 'bg-blue-600';
                    glowColor = 'shadow-blue-600/50';
                  }
              }
              
              const heatmapGlow = isHeatmapEnabled ? `${glowColor} shadow-lg` : '';
              
              return (
                <button
                  key={float.id}
                  onClick={() => onFloatSelect(float)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-200 hover:scale-[1.8] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 ${color} ${heatmapGlow} ${
                    selectedFloat?.id === float.id
                      ? 'scale-[2] shadow-lg ring-2 ring-white ring-opacity-75'
                      : 'shadow-sm hover:shadow-xl'
                  }`}
                  style={{
                    left: `${Math.max(6, Math.min(width - 6, x))}px`,
                    top: `${Math.max(6, Math.min(height - 6, y))}px`,
                    zIndex: selectedFloat?.id === float.id ? 20 : 10,
                    boxShadow: isHeatmapEnabled 
                      ? `0 0 ${value > 15 ? '12px' : value > 5 ? '8px' : '4px'} ${color.replace('bg-', '').replace('-400', '').replace('-600', '')}`
                      : undefined
                  }}
                  title={`Float ${float.id} - ${float.temperature.toFixed(1)}°C - ${float.salinity.toFixed(1)} PSU - ${float.status}`}
                  aria-label={`ARGO Float ${float.id}: Temperature ${float.temperature.toFixed(1)}°C, Status ${float.status}`}
                />
              );
            }
            return null;
          })}
          
          {/* Add realistic float distribution */}
          {distributedFloats.map((float) => {
            return (
              <button
                key={`float-${float.id}`}
                onClick={() => onFloatSelect(float)}
                className={`absolute w-1.5 h-1.5 ${float.color} rounded-full opacity-75 hover:opacity-100 hover:scale-125 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white focus:ring-opacity-50 cursor-pointer shadow-sm hover:shadow-md`}
                style={{
                  left: `${float.leftPercent}%`,
                  top: `${float.topPercent}%`,
                  zIndex: 5,
                  boxShadow: isHeatmapEnabled 
                    ? `0 0 ${float.temperature > 15 ? '8px' : float.temperature > 5 ? '6px' : '3px'} ${float.glowColor}`
                    : undefined
                }}
                title={`Auto Float ${float.id}: ${float.temperature.toFixed(1)}°C, ${float.salinity.toFixed(1)} PSU, ${float.status}`}
                aria-label={`ARGO Float ${float.id}: Temperature ${float.temperature.toFixed(1)}°C, Status ${float.status}`}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center justify-between text-white">
        <div className="text-2xl font-bold text-blue-400">300</div>
        <div className="text-2xl font-bold text-cyan-400">43</div>
        <div className="text-lg font-medium text-slate-300">North</div>
      </div>
    </div>
  );
}