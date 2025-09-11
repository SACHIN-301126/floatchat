import React from 'react';
import { 
  MapPin, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Calendar,
  Activity,
  X
} from 'lucide-react';

interface Float {
  id: string;
  latitude: number;
  longitude: number;
  temperature: number;
  salinity: number;
  depth: number;
  date: string;
  status: string;
}

interface FloatDetailsProps {
  float: Float | null;
  onClose: () => void;
}

export function FloatDetails({ float, onClose }: FloatDetailsProps) {
  if (!float) return null;

  const details = [
    {
      label: 'Float ID',
      value: float.id,
      icon: Activity
    },
    {
      label: 'Location',
      value: `${float.latitude.toFixed(3)}°, ${float.longitude.toFixed(3)}°`,
      icon: MapPin
    },
    {
      label: 'Temperature',
      value: `${float.temperature.toFixed(1)}°C`,
      icon: Thermometer,
      color: 'text-orange-400'
    },
    {
      label: 'Salinity',
      value: `${float.salinity.toFixed(2)} PSU`,
      icon: Droplets,
      color: 'text-cyan-400'
    },
    {
      label: 'Depth',
      value: `${float.depth.toFixed(0)} m`,
      icon: Gauge,
      color: 'text-purple-400'
    },
    {
      label: 'Last Update',
      value: new Date(float.date).toLocaleDateString(),
      icon: Calendar
    }
  ];

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            float.status === 'active' ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <h4 className="text-sm font-semibold text-white">Float {float.id}</h4>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-400 text-xs">Temperature</span>
          <span className="text-orange-400 text-xs font-medium">{float.temperature.toFixed(1)}°C</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-xs">Salinity</span>
          <span className="text-cyan-400 text-xs font-medium">{float.salinity.toFixed(2)} PSU</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-xs">Depth</span>
          <span className="text-purple-400 text-xs font-medium">{float.depth.toFixed(0)} m</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-xs">Position</span>
          <span className="text-white text-xs">{float.latitude.toFixed(2)}°, {float.longitude.toFixed(2)}°</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800">
        <button className="w-full bg-blue-600/20 text-blue-300 py-2 px-3 rounded-lg hover:bg-blue-600/30 transition-colors text-xs">
          View Full Profile
        </button>
      </div>
    </div>
  );
}