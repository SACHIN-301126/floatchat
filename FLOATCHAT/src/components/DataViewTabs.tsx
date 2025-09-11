import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Map, Database, Download, Filter, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { OceanTrendsChart } from './OceanTrendsChart';
import { MapViewTabs } from './MapViewTabs';

interface ChartDataUpdate {
  type: 'temperature' | 'salinity' | 'combined' | 'metrics';
  data: any[];
  metrics?: any;
  analysis?: string;
}

interface DataViewTabsProps {
  floats: any[];
  selectedFloat: any;
  onFloatSelect: (float: any) => void;
  oceanData: any;
  appliedFilters?: any;
  chartDataUpdate?: ChartDataUpdate | null;
}

export const DataViewTabs: React.FC<DataViewTabsProps> = ({
  floats,
  selectedFloat,
  onFloatSelect,
  oceanData,
  appliedFilters,
  chartDataUpdate
}) => {
  const [activeView, setActiveView] = useState<'chart' | 'map' | 'data'>('chart');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const filteredFloats = floats.filter(float => 
    float.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    float.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFloats = [...filteredFloats].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'temperature') return (b.temperature || 0) - (a.temperature || 0);
    if (sortBy === 'depth') return (b.depth || 0) - (a.depth || 0);
    return 0;
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-600/30">
          <button
            onClick={() => setActiveView('chart')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === 'chart'
                ? 'bg-cyan-teal text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Chart
          </button>
          <button
            onClick={() => setActiveView('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === 'map'
                ? 'bg-cyan-teal text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Map className="w-4 h-4" />
            Map
          </button>
          <button
            onClick={() => setActiveView('data')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === 'data'
                ? 'bg-cyan-teal text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Database className="w-4 h-4" />
            Data
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="glass-card border-slate-600/30">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" className="glass-card border-slate-600/30">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Applied Filters Summary */}
      {appliedFilters && (
        <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
          <span>Applied filters:</span>
          {appliedFilters.regions?.length > 0 && (
            <Badge variant="outline" className="bg-cyan-teal/10 text-cyan-teal border-cyan-teal/30">
              {appliedFilters.regions[0]}
            </Badge>
          )}
          {appliedFilters.temperature && (appliedFilters.temperature.min > -2 || appliedFilters.temperature.max < 35) && (
            <Badge variant="outline" className="bg-coral-orange/10 text-coral-orange border-coral-orange/30">
              {appliedFilters.temperature.min}°-{appliedFilters.temperature.max}°C
            </Badge>
          )}
          {appliedFilters.depth && (appliedFilters.depth.min > 0 || appliedFilters.depth.max < 6000) && (
            <Badge variant="outline" className="bg-ocean-blue/10 text-ocean-blue-light border-ocean-blue/30">
              {appliedFilters.depth.min}-{appliedFilters.depth.max}m
            </Badge>
          )}
          {appliedFilters.floatStatus?.length > 0 && (
            <Badge variant="outline" className="bg-green-600/10 text-green-400 border-green-600/30">
              {appliedFilters.floatStatus.join(', ')}
            </Badge>
          )}
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {activeView === 'chart' && (
            <motion.div
              key="chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-h-0"
            >
              <div className="h-full">
                <OceanTrendsChart 
                  dynamicData={chartDataUpdate?.data}
                  dynamicMetrics={chartDataUpdate?.metrics}
                  analysisText={chartDataUpdate?.analysis}
                />
              </div>
            </motion.div>
          )}

          {activeView === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card flex-1 min-h-0"
            >
              <div className="h-full">
                <MapViewTabs
                  floats={floats}
                  selectedFloat={selectedFloat}
                  onFloatSelect={onFloatSelect}
                />
              </div>
            </motion.div>
          )}

          {activeView === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Data Controls */}
              <div className="glass-card flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-4 border-b border-slate-600/30 flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search floats by ID or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 bg-slate-800/50 border-slate-600/30"
                      />
                    </div>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-600/30 text-white text-sm"
                    >
                      <option value="date">Sort by Date</option>
                      <option value="temperature">Sort by Temperature</option>
                      <option value="depth">Sort by Depth</option>
                    </select>
                  </div>
                  
                  <Badge variant="outline" className="border-cyan-teal/30 text-cyan-teal">
                    {filteredFloats.length} floats
                  </Badge>
                </div>

                {/* Data Table - Full Height Scrollable Area */}
                <div className="flex-1 overflow-hidden relative">
                  <div className="absolute inset-0 overflow-y-auto">
                    <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-sm">
                    <tr className="border-b border-slate-600/30">
                      <th className="text-left py-1.5 px-2 font-medium text-slate-300">Float ID</th>
                      <th className="text-left py-1.5 px-2 font-medium text-slate-300">Location</th>
                      <th className="text-left py-1.5 px-2 font-medium text-slate-300">Temp</th>
                      <th className="text-left py-1.5 px-2 font-medium text-slate-300">Salinity</th>
                      <th className="text-left py-1.5 px-2 font-medium text-slate-300">Depth</th>
                      <th className="text-left py-1.5 px-2 font-medium text-slate-300">Status</th>
                      <th className="text-left py-1.5 px-2 font-medium text-slate-300">Updated</th>
                      <th className="text-left py-1.5 px-2 font-medium text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFloats.map((float, index) => (
                      <motion.tr
                        key={float.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-700/50 hover:bg-slate-800/30 cursor-pointer"
                        onClick={() => onFloatSelect(float)}
                      >
                        <td className="py-1.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-cyan-teal rounded-full"></div>
                            <span className="text-white font-mono">{float.id}</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-slate-300">
                          {float.latitude?.toFixed(1) || 'N/A'}°, {float.longitude?.toFixed(1) || 'N/A'}°
                        </td>
                        <td className="py-1.5 px-2">
                          <span className="text-coral-orange font-medium">
                            {float.temperature?.toFixed(1) || 'N/A'}°C
                          </span>
                        </td>
                        <td className="py-1.5 px-2">
                          <span className="text-cyan-teal font-medium">
                            {float.salinity?.toFixed(1) || 'N/A'}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-slate-300">
                          {float.depth?.toLocaleString() || 'N/A'}m
                        </td>
                        <td className="py-1.5 px-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-1.5 py-0.5 ${
                              float.status === 'active' 
                                ? 'border-green-500/30 text-green-400' 
                                : 'border-yellow-500/30 text-yellow-400'
                            }`}
                          >
                            {float.status}
                          </Badge>
                        </td>
                        <td className="py-1.5 px-2 text-slate-300">
                          {new Date(float.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        <td className="py-1.5 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFloatSelect(float);
                            }}
                            className="text-cyan-teal hover:text-cyan-teal-light h-6 px-2 text-xs"
                          >
                            View
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                    </table>
                  </div>
                </div>

                {filteredFloats.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <p>No floats found matching your search criteria.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};