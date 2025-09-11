import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, Thermometer, Droplets, MapPin, Calendar, Signal, AlertTriangle, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface FloatHealthData {
  batteryLevel: number;
  signalStrength: number;
  lastTransmission: string;
  cycleCount: number;
  dataQuality: number;
  operationalDays: number;
}

interface HistoricalData {
  date: string;
  temperature: number;
  salinity: number;
  depth: number;
}

interface EnhancedFloatDetailsProps {
  float: Float;
  onClose: () => void;
}

const generateHealthData = (): FloatHealthData => ({
  batteryLevel: 85 + Math.random() * 15,
  signalStrength: 70 + Math.random() * 30,
  lastTransmission: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  cycleCount: Math.floor(50 + Math.random() * 200),
  dataQuality: 90 + Math.random() * 10,
  operationalDays: Math.floor(100 + Math.random() * 500)
});

const generateHistoricalData = (): HistoricalData[] => {
  const data: HistoricalData[] = [];
  const now = Date.now();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      temperature: 14 + Math.sin((i / 30) * 2 * Math.PI) * 3 + (Math.random() - 0.5) * 1,
      salinity: 34.5 + (Math.random() - 0.5) * 0.5,
      depth: 2000 + (Math.random() - 0.5) * 200
    });
  }
  
  return data;
};

export const EnhancedFloatDetails: React.FC<EnhancedFloatDetailsProps> = ({
  float,
  onClose
}) => {
  const [healthData, setHealthData] = useState<FloatHealthData>(generateHealthData());
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>(generateHistoricalData());
  const [activeTab, setActiveTab] = useState('overview');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        setHealthData(prev => ({
          ...prev,
          batteryLevel: Math.max(0, prev.batteryLevel + (Math.random() - 0.5) * 0.1),
          signalStrength: Math.max(0, Math.min(100, prev.signalStrength + (Math.random() - 0.5) * 2)),
          lastTransmission: new Date().toISOString()
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getHealthStatus = () => {
    const avgHealth = (healthData.batteryLevel + healthData.signalStrength + healthData.dataQuality) / 3;
    if (avgHealth > 80) return { status: 'Excellent', color: 'text-green-400', icon: CheckCircle };
    if (avgHealth > 60) return { status: 'Good', color: 'text-cyan-teal', icon: Activity };
    return { status: 'Warning', color: 'text-coral-orange', icon: AlertTriangle };
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-600/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean-blue to-cyan-teal flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Float {float.id}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <HealthIcon className={`w-4 h-4 ${healthStatus.color}`} />
                  <span className={`text-sm ${healthStatus.color}`}>{healthStatus.status}</span>
                  {isLive && (
                    <Badge variant="outline" className="border-green-400/30 text-green-400">
                      <Zap className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Current Measurements */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="glass-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-coral-orange/20">
                        <Thermometer className="w-5 h-5 text-coral-orange" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Temperature</p>
                        <p className="text-xl font-semibold text-white">{float.temperature?.toFixed(1) || 'N/A'}°C</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="glass-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-teal/20">
                        <Droplets className="w-5 h-5 text-cyan-teal" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Salinity</p>
                        <p className="text-xl font-semibold text-white">{float.salinity?.toFixed(1) || 'N/A'} PSU</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="glass-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-ocean-blue/20">
                        <Activity className="w-5 h-5 text-ocean-blue-light" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Depth</p>
                        <p className="text-xl font-semibold text-white">{float.depth?.toLocaleString() || 'N/A'}m</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <Card className="glass-card p-4 space-y-4">
                    <h4 className="font-semibold text-white">Quick Stats</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last Updated</span>
                        <span className="text-white">{new Date(float.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cycle Count</span>
                        <span className="text-white">{healthData.cycleCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Operational Days</span>
                        <span className="text-white">{healthData.operationalDays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Data Quality</span>
                        <span className="text-green-400">{healthData.dataQuality.toFixed(1)}%</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="glass-card p-4 space-y-4">
                    <h4 className="font-semibold text-white">Location Info</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Latitude</span>
                        <span className="text-white">{float.latitude?.toFixed(4) || 'N/A'}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Longitude</span>
                        <span className="text-white">{float.longitude?.toFixed(4) || 'N/A'}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Region</span>
                        <span className="text-white">Pacific Ocean</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nearest Port</span>
                        <span className="text-white">~850km SW</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="health" className="space-y-6">
                {/* Health Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="glass-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Battery Level</span>
                      <span className="text-sm font-medium text-white">{healthData.batteryLevel.toFixed(1)}%</span>
                    </div>
                    <Progress value={healthData.batteryLevel} className="h-2" />
                    <p className="text-xs text-slate-500">Est. {Math.floor(healthData.batteryLevel * 3)} days remaining</p>
                  </Card>

                  <Card className="glass-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Signal Strength</span>
                      <span className="text-sm font-medium text-white">{healthData.signalStrength.toFixed(1)}%</span>
                    </div>
                    <Progress value={healthData.signalStrength} className="h-2" />
                    <div className="flex items-center gap-1">
                      <Signal className="w-3 h-3 text-cyan-teal" />
                      <p className="text-xs text-slate-500">Strong connection</p>
                    </div>
                  </Card>

                  <Card className="glass-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Data Quality</span>
                      <span className="text-sm font-medium text-white">{healthData.dataQuality.toFixed(1)}%</span>
                    </div>
                    <Progress value={healthData.dataQuality} className="h-2" />
                    <p className="text-xs text-slate-500">Excellent data integrity</p>
                  </Card>
                </div>

                {/* System Status */}
                <Card className="glass-card p-6">
                  <h4 className="font-semibold text-white mb-4">System Status</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-slate-400">Temperature Sensor</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-slate-400">Salinity Sensor</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-slate-400">GPS Module</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-slate-400">Communication</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Online</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-slate-400">Pressure Sensor</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-slate-400">Last Transmission</span>
                        <span className="text-white">{new Date(healthData.lastTransmission).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-semibold text-white">30-Day Trend Analysis</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Stable conditions</span>
                    </div>
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#94A3B8"
                          fontSize={10}
                          tickFormatter={(value) => new Date(value).toLocaleDateString().split('/')[0]}
                        />
                        <YAxis stroke="#94A3B8" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            border: '1px solid rgba(148, 163, 184, 0.3)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#F97316"
                          strokeWidth={2}
                          dot={{ fill: '#F97316', r: 3 }}
                          name="Temperature (°C)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="space-y-6">
                <Card className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-cyan-teal" />
                    <h4 className="font-semibold text-white">Geographic Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Current Position</p>
                        <p className="text-white">{float.latitude?.toFixed(6) || 'N/A'}°, {float.longitude?.toFixed(6) || 'N/A'}°</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Ocean Basin</p>
                        <p className="text-white">Pacific Ocean</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Water Mass</p>
                        <p className="text-white">North Pacific Central Water</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Deployment Date</p>
                        <p className="text-white">January 15, 2024</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Sea Floor Depth</p>
                        <p className="text-white">4,200m</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Current Depth</p>
                        <p className="text-white">{float.depth?.toLocaleString() || 'N/A'}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Distance Traveled</p>
                        <p className="text-white">127 km</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Next Surface</p>
                        <p className="text-white">In 8 days</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};