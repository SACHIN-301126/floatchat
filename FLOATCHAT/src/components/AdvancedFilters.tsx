import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Filter, X, Plus, ChevronDown, ChevronUp, Calendar, 
  MapPin, Thermometer, Droplets, Layers, Activity,
  Settings, RefreshCw, Download, Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export interface FilterValues {
  // Geographic filters
  regions: string[];
  coordinates: {
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
  };
  
  // Temporal filters
  dateRange: {
    startDate: string;
    endDate: string;
  };
  seasons: string[];
  
  // Environmental filters
  temperature: {
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
  };
  salinity: {
    min: number;
    max: number;
  };
  depth: {
    min: number;
    max: number;
    unit: 'meters' | 'feet';
  };
  
  // Data quality filters
  qualityFlags: string[];
  dataCompleteness: number;
  
  // Float/Instrument filters
  floatStatus: string[];
  instrumentTypes: string[];
  floatIds: string[];
  
  // Data type filters
  measurements: string[];
  profiles: string[];
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  onRefresh: () => void;
  loading: boolean;
  initialFilters?: Partial<FilterValues>;
}

const defaultFilters: FilterValues = {
  regions: [],
  coordinates: {
    latMin: -90,
    latMax: 90,
    lonMin: -180,
    lonMax: 180
  },
  dateRange: {
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  seasons: [],
  temperature: {
    min: -2,
    max: 35,
    unit: 'celsius'
  },
  salinity: {
    min: 0,
    max: 40
  },
  depth: {
    min: 0,
    max: 6000,
    unit: 'meters'
  },
  qualityFlags: [],
  dataCompleteness: 80,
  floatStatus: [],
  instrumentTypes: [],
  floatIds: [],
  measurements: [],
  profiles: []
};

const regionOptions = [
  'Global Ocean', 'North Pacific', 'South Pacific', 'North Atlantic', 
  'South Atlantic', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean',
  'Mediterranean Sea', 'Caribbean Sea', 'Gulf of Mexico', 'Baltic Sea',
  'Chukchi Sea', 'Beaufort Sea', 'Labrador Sea'
];

const seasonOptions = [
  'Spring', 'Summer', 'Fall', 'Winter'
];

const qualityFlagOptions = [
  'Good Data', 'Probably Good', 'Probably Bad', 'Bad Data',
  'Changed Value', 'Value Below Detection', 'Value in Excess'
];

const floatStatusOptions = [
  'Active', 'Inactive', 'Deployed', 'Recovered', 'Lost'
];

const instrumentTypeOptions = [
  'APEX', 'SOLO', 'NOVA', 'ARVOR', 'PROVOR', 'NAVIS'
];

const measurementOptions = [
  'Temperature', 'Salinity', 'Pressure', 'Oxygen', 'pH',
  'Nitrate', 'Chlorophyll', 'Backscatter', 'CDOM'
];

const profileOptions = [
  'CTD', 'BGC', 'Deep', 'Shallow', 'Surface'
];

export function AdvancedFilters({ 
  onFilterChange, 
  onRefresh, 
  loading, 
  initialFilters = {} 
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    ...defaultFilters,
    ...initialFilters
  });
  const [activeTab, setActiveTab] = useState('geographic');
  const [filterPresets, setFilterPresets] = useState<{ name: string; filters: FilterValues }[]>([]);

  const updateFilter = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const updateNestedFilter = (key: keyof FilterValues, subKey: string, value: any) => {
    const newFilters = {
      ...filters,
      [key]: {
        ...filters[key],
        [subKey]: value
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const saveFilterPreset = () => {
    const presetName = prompt('Enter preset name:');
    if (presetName) {
      const newPreset = { name: presetName, filters };
      setFilterPresets([...filterPresets, newPreset]);
    }
  };

  const loadFilterPreset = (preset: { name: string; filters: FilterValues }) => {
    setFilters(preset.filters);
    onFilterChange(preset.filters);
  };

  const exportFilters = () => {
    const dataStr = JSON.stringify(filters, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ocean-data-filters.json';
    link.click();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.regions.length > 0) count++;
    if (filters.seasons.length > 0) count++;
    if (filters.qualityFlags.length > 0) count++;
    if (filters.floatStatus.length > 0) count++;
    if (filters.instrumentTypes.length > 0) count++;
    if (filters.measurements.length > 0) count++;
    if (filters.profiles.length > 0) count++;
    if (filters.floatIds.length > 0) count++;
    if (filters.temperature.min > -2 || filters.temperature.max < 35) count++;
    if (filters.salinity.min > 0 || filters.salinity.max < 40) count++;
    if (filters.depth.min > 0 || filters.depth.max < 6000) count++;
    if (filters.dataCompleteness !== 80) count++;
    return count;
  };

  const removeFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case 'regions':
        updateFilter('regions', filters.regions.filter(r => r !== value));
        break;
      case 'seasons':
        updateFilter('seasons', filters.seasons.filter(s => s !== value));
        break;
      case 'qualityFlags':
        updateFilter('qualityFlags', filters.qualityFlags.filter(q => q !== value));
        break;
      case 'floatStatus':
        updateFilter('floatStatus', filters.floatStatus.filter(f => f !== value));
        break;
      case 'instrumentTypes':
        updateFilter('instrumentTypes', filters.instrumentTypes.filter(i => i !== value));
        break;
      case 'measurements':
        updateFilter('measurements', filters.measurements.filter(m => m !== value));
        break;
      case 'profiles':
        updateFilter('profiles', filters.profiles.filter(p => p !== value));
        break;
      case 'temperature':
        updateFilter('temperature', { ...filters.temperature, min: -2, max: 35 });
        break;
      case 'salinity':
        updateFilter('salinity', { min: 0, max: 40 });
        break;
      case 'depth':
        updateFilter('depth', { ...filters.depth, min: 0, max: 6000 });
        break;
      case 'dataCompleteness':
        updateFilter('dataCompleteness', 80);
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Advanced Filters</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2 bg-cyan-teal/20 text-cyan-teal">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="glass-card border-slate-600/30"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="glass-card border-slate-600/30"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportFilters}
              className="glass-card border-slate-600/30"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Filter Tags */}
        <div className="flex items-center gap-2 flex-wrap max-w-lg">
          {filters.regions.map(region => (
            <Badge
              key={region}
              variant="outline"
              className="bg-cyan-teal/20 text-cyan-teal border-cyan-teal/30 cursor-pointer hover:bg-cyan-teal/30"
              onClick={() => removeFilter('regions', region)}
            >
              {region}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          
          {filters.seasons.map(season => (
            <Badge
              key={season}
              variant="outline"
              className="bg-ocean-blue/20 text-ocean-blue-light border-ocean-blue/30 cursor-pointer hover:bg-ocean-blue/30"
              onClick={() => removeFilter('seasons', season)}
            >
              {season}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          
          {(filters.temperature.min > -2 || filters.temperature.max < 35) && (
            <Badge
              variant="outline"
              className="bg-coral-orange/20 text-coral-orange border-coral-orange/30 cursor-pointer hover:bg-coral-orange/30"
              onClick={() => removeFilter('temperature')}
            >
              Temp: {filters.temperature.min}°-{filters.temperature.max}°
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="glass-card border-slate-600/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-cyan-teal" />
                    Filter Configuration
                  </CardTitle>
                  
                  {/* Filter Presets */}
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(value) => {
                      const preset = filterPresets.find(p => p.name === value);
                      if (preset) loadFilterPreset(preset);
                    }}>
                      <SelectTrigger className="w-40 bg-slate-800/50 border-slate-600/30">
                        <SelectValue placeholder="Load Preset" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterPresets.map(preset => (
                          <SelectItem key={preset.name} value={preset.name}>
                            {preset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveFilterPreset}
                      className="border-slate-600/30"
                    >
                      Save Preset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="geographic" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Geographic
                    </TabsTrigger>
                    <TabsTrigger value="temporal" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Temporal
                    </TabsTrigger>
                    <TabsTrigger value="environmental" className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4" />
                      Environmental
                    </TabsTrigger>
                    <TabsTrigger value="quality" className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Quality
                    </TabsTrigger>
                    <TabsTrigger value="instruments" className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Instruments
                    </TabsTrigger>
                  </TabsList>

                  {/* Geographic Filters */}
                  <TabsContent value="geographic" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label>Ocean Regions</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {regionOptions.map(region => (
                            <div key={region} className="flex items-center space-x-2">
                              <Checkbox
                                id={`region-${region}`}
                                checked={filters.regions.includes(region)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilter('regions', [...filters.regions, region]);
                                  } else {
                                    updateFilter('regions', filters.regions.filter(r => r !== region));
                                  }
                                }}
                              />
                              <Label htmlFor={`region-${region}`} className="text-sm">
                                {region}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label>Coordinate Bounds</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-slate-400">Latitude Range</Label>
                            <div className="flex items-center gap-2 mt-2">
                              <Input
                                type="number"
                                placeholder="Min"
                                value={filters.coordinates.latMin}
                                onChange={(e) => updateNestedFilter('coordinates', 'latMin', parseFloat(e.target.value))}
                                className="bg-slate-800/50 border-slate-600/30"
                              />
                              <span className="text-slate-400">to</span>
                              <Input
                                type="number"
                                placeholder="Max"
                                value={filters.coordinates.latMax}
                                onChange={(e) => updateNestedFilter('coordinates', 'latMax', parseFloat(e.target.value))}
                                className="bg-slate-800/50 border-slate-600/30"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-slate-400">Longitude Range</Label>
                            <div className="flex items-center gap-2 mt-2">
                              <Input
                                type="number"
                                placeholder="Min"
                                value={filters.coordinates.lonMin}
                                onChange={(e) => updateNestedFilter('coordinates', 'lonMin', parseFloat(e.target.value))}
                                className="bg-slate-800/50 border-slate-600/30"
                              />
                              <span className="text-slate-400">to</span>
                              <Input
                                type="number"
                                placeholder="Max"
                                value={filters.coordinates.lonMax}
                                onChange={(e) => updateNestedFilter('coordinates', 'lonMax', parseFloat(e.target.value))}
                                className="bg-slate-800/50 border-slate-600/30"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Temporal Filters */}
                  <TabsContent value="temporal" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label>Date Range</Label>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-slate-400">Start Date</Label>
                            <Input
                              type="date"
                              value={filters.dateRange.startDate}
                              onChange={(e) => updateNestedFilter('dateRange', 'startDate', e.target.value)}
                              className="bg-slate-800/50 border-slate-600/30"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-400">End Date</Label>
                            <Input
                              type="date"
                              value={filters.dateRange.endDate}
                              onChange={(e) => updateNestedFilter('dateRange', 'endDate', e.target.value)}
                              className="bg-slate-800/50 border-slate-600/30"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label>Seasons</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {seasonOptions.map(season => (
                            <div key={season} className="flex items-center space-x-2">
                              <Checkbox
                                id={`season-${season}`}
                                checked={filters.seasons.includes(season)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilter('seasons', [...filters.seasons, season]);
                                  } else {
                                    updateFilter('seasons', filters.seasons.filter(s => s !== season));
                                  }
                                }}
                              />
                              <Label htmlFor={`season-${season}`} className="text-sm">
                                {season}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Environmental Filters */}
                  <TabsContent value="environmental" className="space-y-6">
                    <div className="space-y-6">
                      {/* Temperature */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Label className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-coral-orange" />
                            Temperature Range
                          </Label>
                          <Select
                            value={filters.temperature.unit}
                            onValueChange={(value: 'celsius' | 'fahrenheit') => 
                              updateNestedFilter('temperature', 'unit', value)
                            }
                          >
                            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-600/30">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="celsius">°C</SelectItem>
                              <SelectItem value="fahrenheit">°F</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="px-4">
                          <Slider
                            value={[filters.temperature.min, filters.temperature.max]}
                            onValueChange={([min, max]) => {
                              updateNestedFilter('temperature', 'min', min);
                              updateNestedFilter('temperature', 'max', max);
                            }}
                            min={-5}
                            max={40}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>{filters.temperature.min}°</span>
                            <span>{filters.temperature.max}°</span>
                          </div>
                        </div>
                      </div>

                      {/* Salinity */}
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-cyan-teal" />
                          Salinity Range (PSU)
                        </Label>
                        <div className="px-4">
                          <Slider
                            value={[filters.salinity.min, filters.salinity.max]}
                            onValueChange={([min, max]) => {
                              updateNestedFilter('salinity', 'min', min);
                              updateNestedFilter('salinity', 'max', max);
                            }}
                            min={0}
                            max={45}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>{filters.salinity.min} PSU</span>
                            <span>{filters.salinity.max} PSU</span>
                          </div>
                        </div>
                      </div>

                      {/* Depth */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Label className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-ocean-blue" />
                            Depth Range
                          </Label>
                          <Select
                            value={filters.depth.unit}
                            onValueChange={(value: 'meters' | 'feet') => 
                              updateNestedFilter('depth', 'unit', value)
                            }
                          >
                            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-600/30">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="meters">Meters</SelectItem>
                              <SelectItem value="feet">Feet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="px-4">
                          <Slider
                            value={[filters.depth.min, filters.depth.max]}
                            onValueChange={([min, max]) => {
                              updateNestedFilter('depth', 'min', min);
                              updateNestedFilter('depth', 'max', max);
                            }}
                            min={0}
                            max={7000}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>{filters.depth.min}m</span>
                            <span>{filters.depth.max}m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Quality Filters */}
                  <TabsContent value="quality" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label>Quality Flags</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {qualityFlagOptions.map(flag => (
                            <div key={flag} className="flex items-center space-x-2">
                              <Checkbox
                                id={`quality-${flag}`}
                                checked={filters.qualityFlags.includes(flag)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilter('qualityFlags', [...filters.qualityFlags, flag]);
                                  } else {
                                    updateFilter('qualityFlags', filters.qualityFlags.filter(q => q !== flag));
                                  }
                                }}
                              />
                              <Label htmlFor={`quality-${flag}`} className="text-sm">
                                {flag}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label>Data Completeness Threshold</Label>
                        <div className="px-4">
                          <Slider
                            value={[filters.dataCompleteness]}
                            onValueChange={([value]) => updateFilter('dataCompleteness', value)}
                            min={0}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>0%</span>
                            <span className="font-medium text-cyan-teal">{filters.dataCompleteness}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Instruments Filters */}
                  <TabsContent value="instruments" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label>Float Status</Label>
                        <div className="space-y-2">
                          {floatStatusOptions.map(status => (
                            <div key={status} className="flex items-center space-x-2">
                              <Checkbox
                                id={`status-${status}`}
                                checked={filters.floatStatus.includes(status)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilter('floatStatus', [...filters.floatStatus, status]);
                                  } else {
                                    updateFilter('floatStatus', filters.floatStatus.filter(s => s !== status));
                                  }
                                }}
                              />
                              <Label htmlFor={`status-${status}`} className="text-sm">
                                {status}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label>Instrument Types</Label>
                        <div className="space-y-2">
                          {instrumentTypeOptions.map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`instrument-${type}`}
                                checked={filters.instrumentTypes.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilter('instrumentTypes', [...filters.instrumentTypes, type]);
                                  } else {
                                    updateFilter('instrumentTypes', filters.instrumentTypes.filter(t => t !== type));
                                  }
                                }}
                              />
                              <Label htmlFor={`instrument-${type}`} className="text-sm">
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label>Measurement Types</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {measurementOptions.map(measurement => (
                            <div key={measurement} className="flex items-center space-x-2">
                              <Checkbox
                                id={`measurement-${measurement}`}
                                checked={filters.measurements.includes(measurement)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilter('measurements', [...filters.measurements, measurement]);
                                  } else {
                                    updateFilter('measurements', filters.measurements.filter(m => m !== measurement));
                                  }
                                }}
                              />
                              <Label htmlFor={`measurement-${measurement}`} className="text-sm">
                                {measurement}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label>Profile Types</Label>
                        <div className="space-y-2">
                          {profileOptions.map(profile => (
                            <div key={profile} className="flex items-center space-x-2">
                              <Checkbox
                                id={`profile-${profile}`}
                                checked={filters.profiles.includes(profile)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilter('profiles', [...filters.profiles, profile]);
                                  } else {
                                    updateFilter('profiles', filters.profiles.filter(p => p !== profile));
                                  }
                                }}
                              />
                              <Label htmlFor={`profile-${profile}`} className="text-sm">
                                {profile}
                              </Label>
                            </div>
                          ))}
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <Label>Float IDs</Label>
                          <Input
                            placeholder="Enter float IDs separated by commas"
                            value={filters.floatIds.join(', ')}
                            onChange={(e) => {
                              const ids = e.target.value.split(',').map(id => id.trim()).filter(id => id);
                              updateFilter('floatIds', ids);
                            }}
                            className="bg-slate-800/50 border-slate-600/30 mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}