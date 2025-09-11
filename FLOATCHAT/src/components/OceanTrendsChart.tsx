import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Thermometer, Droplets, Waves } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface TrendData {
  date: string;
  tempUpper: number;
  tempLower: number;
  temperature: number;
  salinity: number;
  depth: number;
  quality: number;
}

interface KeyMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

const generateTrendData = (): TrendData[] => {
  const data: TrendData[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 12; i++) {
    const baseTemp = 14.3 + Math.sin((i / 12) * 2 * Math.PI) * 2;
    const variation = (Math.random() - 0.5) * 1;
    
    data.push({
      date: months[i],
      temperature: baseTemp + variation,
      tempUpper: baseTemp + variation + 1.5,
      tempLower: baseTemp + variation - 1.5,
      salinity: 34.5 + (Math.random() - 0.5) * 0.8,
      depth: 2000 + (Math.random() - 0.5) * 500,
      quality: 90 + Math.random() * 10
    });
  }
  
  return data;
};

const keyMetrics: KeyMetric[] = [
  {
    label: 'Avg Temperature',
    value: '14.3°C',
    change: '+3.53°C',
    trend: 'up',
    icon: <Thermometer className="w-4 h-4" />,
    color: 'text-coral-orange'
  },
  {
    label: 'Salinity Level',
    value: '34.7 PSU',
    change: '-0.2 PSU',
    trend: 'down',
    icon: <Droplets className="w-4 h-4" />,
    color: 'text-cyan-teal'
  },
  {
    label: 'Active Floats',
    value: '300',
    change: '+43',
    trend: 'up',
    icon: <Activity className="w-4 h-4" />,
    color: 'text-green-400'
  },
  {
    label: 'Data Quality',
    value: '95.7%',
    change: '+2.3%',
    trend: 'up',
    icon: <Waves className="w-4 h-4" />,
    color: 'text-ocean-blue-light'
  }
];

interface OceanTrendsChartProps {
  dynamicData?: TrendData[];
  dynamicMetrics?: KeyMetric[];
  analysisText?: string;
}

export const OceanTrendsChart: React.FC<OceanTrendsChartProps> = ({ 
  dynamicData, 
  dynamicMetrics,
  analysisText 
}) => {
  const [activeTab, setActiveTab] = useState('temperature');
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  
  // Use dynamic data if provided, otherwise fall back to generated data
  const trendData = dynamicData || generateTrendData();
  const displayMetrics = dynamicMetrics || keyMetrics;

  // Show animation when data is updated
  useEffect(() => {
    if (dynamicData) {
      setIsDataUpdated(true);
      const timer = setTimeout(() => setIsDataUpdated(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [dynamicData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-slate-600/30">
          <p className="text-white font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)}${entry.name === 'Temperature' ? '°C' : entry.name === 'Salinity' ? ' PSU' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Ocean Data Trends</h3>
          <p className="text-sm text-slate-400">Real-time analysis of ocean conditions</p>
        </div>
        <Badge variant="outline" className="border-cyan-teal/30 text-cyan-teal">
          2023-2024 Data
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        {isDataUpdated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-4 mb-2"
          >
            <div className="glass-card p-3 border border-cyan-teal/30 bg-cyan-teal/10">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-cyan-teal border-t-transparent rounded-full"
                />
                <span className="text-cyan-teal font-medium text-sm">
                  Chart data updated based on AI analysis
                  {analysisText && ` • ${analysisText}`}
                </span>
              </div>
            </div>
          </motion.div>
        )}
        {displayMetrics.map((metric, index) => {
          // Handle different icon types
          const renderIcon = () => {
            if (typeof metric.icon === 'string') {
              switch (metric.icon) {
                case 'Thermometer':
                  return <Thermometer className="w-4 h-4" />;
                case 'Droplets':
                  return <Droplets className="w-4 h-4" />;
                case 'Activity':
                  return <Activity className="w-4 h-4" />;
                case 'Waves':
                  return <Waves className="w-4 h-4" />;
                default:
                  return <Activity className="w-4 h-4" />;
              }
            }
            return metric.icon; // React component
          };
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-4 rounded-xl ${isDataUpdated ? 'ring-2 ring-cyan-teal/50' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg bg-slate-800/50 ${metric.color}`}>
                  {renderIcon()}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  ) : (
                    <Activity className="w-3 h-3 text-slate-400" />
                  )}
                  <span className={metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-slate-400'}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-white">{metric.value}</p>
                <p className="text-xs text-slate-400">{metric.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="temperature" className="data-[state=active]:bg-ocean-blue">
            Temperature
          </TabsTrigger>
          <TabsTrigger value="salinity" className="data-[state=active]:bg-cyan-teal">
            Salinity
          </TabsTrigger>
          <TabsTrigger value="combined" className="data-[state=active]:bg-coral-orange">
            Combined
          </TabsTrigger>
        </TabsList>

        <TabsContent value="temperature" className="space-y-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#94A3B8"
                  fontSize={12}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#F97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#temperatureGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="tempUpper"
                  stroke="#FB923C"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tempLower"
                  stroke="#FB923C"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-coral-orange rounded-full"></div>
              <span>Temperature (°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-coral-orange-light border-dashed"></div>
              <span>Temperature Range</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="salinity" className="space-y-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#94A3B8"
                  fontSize={12}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="salinity"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#22D3EE', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="combined" className="space-y-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="temp"
                  stroke="#F97316"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="sal"
                  orientation="right"
                  stroke="#06B6D4"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#F97316"
                  strokeWidth={2}
                  name="Temperature"
                  dot={{ fill: '#F97316', r: 3 }}
                />
                <Line
                  yAxisId="sal"
                  type="monotone"
                  dataKey="salinity"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  name="Salinity"
                  dot={{ fill: '#06B6D4', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      {/* Environmental Impact Section */}
      <div className="glass-card p-4 rounded-xl">
        <h4 className="font-semibold text-white mb-3">Environmental Impact</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Ocean Health</span>
              <span className="text-sm font-medium text-green-400">Good</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full w-3/4"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Climate Impact</span>
              <span className="text-sm font-medium text-yellow-400">Moderate</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          • Ocean health affects local weather patterns<br/>
          • Marine life depends on stable temperatures<br/>
          • Temperature fluctuations indicate climate anomalies
        </p>
      </div>
    </Card>
  );
};