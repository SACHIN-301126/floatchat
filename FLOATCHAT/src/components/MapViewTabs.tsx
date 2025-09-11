import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Map, Database, Filter, Thermometer, Waves, Gauge, Droplets, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { OceanMap } from './OceanMap';
import { FloatChartView } from './FloatChartView';

interface Float {
  id: string;
  latitude?: number;
  longitude?: number;
  temperature?: number;
  salinity?: number;
  depth?: number;
  date: string;
  status: string;
}

interface MapViewTabsProps {
  floats: Float[];
  selectedFloat: Float | null;
  onFloatSelect: (float: Float | null) => void;
}

type DataLayer = 'temperature' | 'salinity' | 'pressure' | 'current' | 'oxygen' | 'ph';

const dataLayerConfig = {
  temperature: {
    label: 'Temperature',
    icon: Thermometer,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    unit: '°C'
  },
  salinity: {
    label: 'Salinity',
    icon: Droplets,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    unit: 'PSU'
  },
  pressure: {
    label: 'Pressure',
    icon: Gauge,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    unit: 'dbar'
  },
  current: {
    label: 'Current',
    icon: Waves,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    unit: 'm/s'
  },
  oxygen: {
    label: 'Oxygen',
    icon: TrendingUp,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    unit: 'mg/L'
  },
  ph: {
    label: 'pH Level',
    icon: Filter,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    unit: 'pH'
  }
};

export function MapViewTabs({ floats, selectedFloat, onFloatSelect }: MapViewTabsProps) {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedDataLayer, setSelectedDataLayer] = useState<DataLayer>('temperature');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value !== 'chart' && selectedFloat) {
      // Clear selection when switching away from chart view
      onFloatSelect(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-600">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
          <div className="flex items-center justify-between">
            <TabsList className="glass-card">
              <TabsTrigger 
                value="chart" 
                className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"
              >
                <BarChart3 className="w-4 h-4" />
                Chart
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"
              >
                <Map className="w-4 h-4" />
                Map
              </TabsTrigger>
              <TabsTrigger 
                value="data" 
                className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"
              >
                <Database className="w-4 h-4" />
                Data
              </TabsTrigger>
            </TabsList>

            {/* Data Layer Selector (for Map tab) */}
            {activeTab === 'map' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">Layer:</span>
                <Select value={selectedDataLayer} onValueChange={(value: DataLayer) => setSelectedDataLayer(value)}>
                  <SelectTrigger className="w-40 glass-card border-slate-600">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {React.createElement(dataLayerConfig[selectedDataLayer].icon, { 
                          className: `w-4 h-4 ${dataLayerConfig[selectedDataLayer].color}` 
                        })}
                        <span>{dataLayerConfig[selectedDataLayer].label}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-card border-slate-600">
                    {Object.entries(dataLayerConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${config.color}`} />
                            <span>{config.label}</span>
                            <Badge className={`${config.bgColor} ${config.color} border-0 text-xs`}>
                              {config.unit}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="mt-4 flex-1">
            <TabsContent value="chart" className="h-full m-0">
              <AnimatePresence mode="wait">
                {selectedFloat ? (
                  <motion.div
                    key="chart-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <FloatChartView float={selectedFloat} onClose={() => onFloatSelect(null)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-full"
                  >
                    <div className="glass-card p-8 text-center">
                      <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Select a Float to View Charts</h3>
                      <p className="text-slate-400 mb-4">
                        Click on any ARGO float on the map to view detailed time-series charts and historical data.
                      </p>
                      <Button
                        onClick={() => setActiveTab('map')}
                        variant="outline"
                        className="glass-card border-cyan-500/30 hover:border-cyan-500/50"
                      >
                        <Map className="w-4 h-4 mr-2" />
                        Go to Map
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="map" className="h-full m-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full"
              >
                <OceanMap
                  floats={floats}
                  selectedFloat={selectedFloat}
                  onFloatSelect={onFloatSelect}
                  dataLayer={selectedDataLayer}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="data" className="h-full m-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full overflow-auto"
              >
                <div className="p-4">
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Database className="w-6 h-6 text-cyan-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-white">ARGO Float Data Table</h3>
                          <p className="text-slate-400 text-sm">{floats.length} active floats</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="glass-card border-cyan-500/30">
                        Export CSV
                      </Button>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-600">
                            <th className="text-left py-3 px-2 text-slate-300">Float ID</th>
                            <th className="text-left py-3 px-2 text-slate-300">Latitude</th>
                            <th className="text-left py-3 px-2 text-slate-300">Longitude</th>
                            <th className="text-left py-3 px-2 text-slate-300">Temperature</th>
                            <th className="text-left py-3 px-2 text-slate-300">Salinity</th>
                            <th className="text-left py-3 px-2 text-slate-300">Depth</th>
                            <th className="text-left py-3 px-2 text-slate-300">Status</th>
                            <th className="text-left py-3 px-2 text-slate-300">Last Update</th>
                          </tr>
                        </thead>
                        <tbody>
                          {floats.slice(0, 50).map((float) => (
                            <motion.tr
                              key={float.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="border-b border-slate-700/50 hover:bg-slate-700/20 cursor-pointer transition-colors"
                              onClick={() => onFloatSelect(float)}
                            >
                              <td className="py-3 px-2 text-cyan-400 font-medium">{float.id}</td>
                              <td className="py-3 px-2 text-slate-300">{float.latitude?.toFixed(4) || 'N/A'}</td>
                              <td className="py-3 px-2 text-slate-300">{float.longitude?.toFixed(4) || 'N/A'}</td>
                              <td className="py-3 px-2 text-slate-300">{float.temperature?.toFixed(2) || 'N/A'}°C</td>
                              <td className="py-3 px-2 text-slate-300">{float.salinity?.toFixed(2) || 'N/A'} PSU</td>
                              <td className="py-3 px-2 text-slate-300">{float.depth?.toFixed(0) || 'N/A'}m</td>
                              <td className="py-3 px-2">
                                <Badge className={
                                  float.status === 'active' 
                                    ? 'bg-green-500/20 text-green-300' 
                                    : 'bg-gray-500/20 text-gray-300'
                                }>
                                  {float.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-2 text-slate-400 text-xs">{float.date}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {floats.length > 50 && (
                      <div className="mt-6 text-center">
                        <p className="text-slate-400 text-sm">
                          Showing first 50 floats. Use filters to narrow down results.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}