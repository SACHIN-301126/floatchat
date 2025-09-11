import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { X, Calendar, TrendingUp, Thermometer, Droplets, Gauge, Clock, MapPin, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

interface FloatChartViewProps {
  float: Float;
  onClose: () => void;
}

type TimeRange = 'current' | 'week' | 'month' | 'year' | 'all';

// Mock historical data generation
const generateHistoricalData = (float: Float, days: number) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Add some realistic variation
    const tempVariation = (Math.sin(i / 10) * 2) + (Math.random() - 0.5) * 1;
    const salinityVariation = (Math.sin(i / 15) * 0.5) + (Math.random() - 0.5) * 0.2;
    const depthVariation = Math.abs(Math.sin(i / 20) * 500) + (Math.random() * 100);
    
    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      temperature: Math.max(0, (float.temperature || 15) + tempVariation),
      salinity: Math.max(30, (float.salinity || 34.5) + salinityVariation),
      depth: Math.max(0, Math.min(2000, (float.depth || 1000) + depthVariation)),
      pressure: ((float.depth || 1000) + depthVariation) / 10, // Approximate pressure from depth
      oxygen: Math.max(0, 8 + (Math.random() - 0.5) * 2),
      ph: Math.max(7.5, Math.min(8.5, 8.1 + (Math.random() - 0.5) * 0.3))
    });
  }
  
  return data;
};

export function FloatChartView({ float, onClose }: FloatChartViewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [activeChart, setActiveChart] = useState('temperature');
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    // Generate historical data based on time range
    const days = {
      current: 1,
      week: 7,
      month: 30,
      year: 365,
      all: 730 // 2 years
    }[timeRange];

    const data = generateHistoricalData(float, days);
    setHistoricalData(data);
  }, [float, timeRange]);

  const timeRangeConfig = {
    current: { label: 'Current', icon: Clock },
    week: { label: 'Week', icon: Calendar },
    month: { label: 'Month', icon: Calendar },
    year: { label: 'Year', icon: Calendar },
    all: { label: 'All Time', icon: TrendingUp }
  };

  const chartConfig = {
    temperature: {
      title: 'Temperature Profile',
      icon: Thermometer,
      color: '#EF4444',
      unit: '°C',
      dataKey: 'temperature'
    },
    salinity: {
      title: 'Salinity Measurements',
      icon: Droplets,
      color: '#06B6D4',
      unit: 'PSU',
      dataKey: 'salinity'
    },
    depth: {
      title: 'Depth Profile',
      icon: Gauge,
      color: '#8B5CF6',
      unit: 'm',
      dataKey: 'depth'
    },
    pressure: {
      title: 'Pressure Readings',
      icon: Gauge,
      color: '#F59E0B',
      unit: 'dbar',
      dataKey: 'pressure'
    }
  };

  const currentConfig = chartConfig[activeChart];
  const Icon = currentConfig.icon;

  // Calculate statistics
  const stats = historicalData.length > 0 ? {
    current: historicalData[historicalData.length - 1]?.[currentConfig.dataKey] || 0,
    average: historicalData.reduce((sum, d) => sum + d[currentConfig.dataKey], 0) / historicalData.length,
    min: Math.min(...historicalData.map(d => d[currentConfig.dataKey])),
    max: Math.max(...historicalData.map(d => d[currentConfig.dataKey])),
    trend: historicalData.length > 1 ? 
      ((historicalData[historicalData.length - 1]?.[currentConfig.dataKey] - historicalData[0]?.[currentConfig.dataKey]) / historicalData.length) * 30 : 0
  } : { current: 0, average: 0, min: 0, max: 0, trend: 0 };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-600">
        <div className="flex items-center gap-4">
          <div className="glass-card p-3 rounded-xl">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Float {float.id} - Data Analysis</h2>
            <div className="flex items-center gap-4 mt-1">
              <Badge className="bg-ocean-blue/20 text-cyan-300 border-ocean-blue/30">
                <MapPin className="w-3 h-3 mr-1" />
                {float.latitude.toFixed(4)}, {float.longitude.toFixed(4)}
              </Badge>
              <Badge className={`border-0 text-xs ${
                float.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
              }`}>
                {float.status}
              </Badge>
            </div>
          </div>
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b border-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Time Range:</span>
            <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
              <SelectTrigger className="w-32 glass-card border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-slate-600">
                {Object.entries(timeRangeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Parameter:</span>
            <Select value={activeChart} onValueChange={setActiveChart}>
              <SelectTrigger className="w-40 glass-card border-slate-600">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: currentConfig.color }} />
                    <span>{currentConfig.title.split(' ')[0]}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="glass-card border-slate-600">
                {Object.entries(chartConfig).map(([key, config]) => {
                  const ChartIcon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-3">
                        <ChartIcon className="w-4 h-4" style={{ color: config.color }} />
                        <span>{config.title}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="glass-card border-cyan-500/30">
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="glass-card border-cyan-500/30">
            Download Chart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Statistics Panel */}
          <div className="col-span-3">
            <Card className="glass-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: currentConfig.color }} />
                  {currentConfig.title} Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 glass-card rounded-lg">
                    <div className="text-2xl font-bold text-white">{stats.current.toFixed(2)}</div>
                    <div className="text-xs text-slate-400">Current</div>
                    <div className="text-xs text-cyan-400">{currentConfig.unit}</div>
                  </div>
                  
                  <div className="text-center p-3 glass-card rounded-lg">
                    <div className="text-2xl font-bold text-white">{stats.average.toFixed(2)}</div>
                    <div className="text-xs text-slate-400">Average</div>
                    <div className="text-xs text-cyan-400">{currentConfig.unit}</div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Range:</span>
                    <span className="text-white text-sm">{stats.min.toFixed(2)} - {stats.max.toFixed(2)} {currentConfig.unit}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Trend:</span>
                    <Badge className={`text-xs ${
                      stats.trend > 0 
                        ? 'bg-red-500/20 text-red-300' 
                        : stats.trend < 0 
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(3)} {currentConfig.unit}/month
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Data Points:</span>
                    <span className="text-white text-sm">{historicalData.length}</span>
                  </div>
                </div>

                {/* Mini Profile Chart */}
                <div className="pt-4 border-t border-slate-600">
                  <div className="text-sm text-slate-300 mb-2">7-Day Mini Profile</div>
                  <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historicalData.slice(-7)}>
                        <Area 
                          type="monotone" 
                          dataKey={currentConfig.dataKey}
                          stroke={currentConfig.color}
                          fill={`${currentConfig.color}20`}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart */}
          <div className="col-span-9">
            <Card className="glass-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: currentConfig.color }} />
                  {currentConfig.title} - {timeRangeConfig[timeRange].label} View
                </CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return timeRange === 'current' || timeRange === 'week' 
                          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : date.toLocaleDateString('en-US', { month: 'short' });
                      }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `${value} ${currentConfig.unit}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                        color: '#F1F5F9'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value.toFixed(2)} ${currentConfig.unit}`, currentConfig.title]}
                    />
                    <Line
                      type="monotone"
                      dataKey={currentConfig.dataKey}
                      stroke={currentConfig.color}
                      strokeWidth={2}
                      dot={{ fill: currentConfig.color, strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: currentConfig.color }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}