import React from 'react';
import { motion } from 'motion/react';
import { 
  Thermometer, 
  Droplets, 
  Activity, 
  TrendingUp, 
  MapPin,
  Calendar,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface DataSummaryProps {
  data: {
    totalFloats: number;
    activeFloats: number;
    avgTemperature: number;
    avgSalinity: number;
    dataPoints: number;
  };
  region: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function DataSummary({ data, region, dateRange }: DataSummaryProps) {
  // Use fallback data if not provided
  const displayData = {
    totalFloats: data?.totalFloats || 300,
    activeFloats: data?.activeFloats || 287,
    avgTemperature: data?.avgTemperature || 13.96,
    avgSalinity: data?.avgSalinity || 32.25,
    dataPoints: data?.dataPoints || 15847
  };

  const activePercentage = (displayData.activeFloats / displayData.totalFloats) * 100;
  const qualityScore = 93.3;

  const statCards = [
    {
      title: 'Active Floats',
      value: displayData.activeFloats,
      total: displayData.totalFloats,
      icon: Activity,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      progress: activePercentage
    },
    {
      title: 'Surface Temp',
      value: `${displayData.avgTemperature.toFixed(1)}°C`,
      icon: Thermometer,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      trend: '+2.3°C'
    },
    {
      title: 'Salinity',
      value: `${displayData.avgSalinity.toFixed(1)} PSU`,
      icon: Droplets,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Data Quality',
      value: `${qualityScore}%`,
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      progress: qualityScore
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Quick Stats Grid */}
      <Card className="glass-card glow-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor} glow-hover`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-slate-300 text-sm font-medium">{stat.title}</p>
                      {stat.progress !== undefined && (
                        <div className="flex items-center gap-2 mt-1">
                          <Progress 
                            value={stat.progress} 
                            className="w-16 h-1" 
                            aria-label={`${stat.title} progress: ${stat.progress}%`}
                          />
                          <span className="text-xs text-slate-400">{stat.progress.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                    {stat.trend && (
                      <Badge className="ml-2 bg-green-500/20 text-green-300 text-xs">
                        {stat.trend}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Region Info */}
      <Card className="glass-card glow-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Region Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Area:</span>
              <Badge className="bg-ocean-blue/20 text-cyan-300 border-ocean-blue/30">
                {region === 'global' ? 'Global Ocean' : 'Chukchi Sea'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Period:</span>
              <span className="text-slate-300 text-sm">2023-2023</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Profiles:</span>
              <span className="text-white font-semibold">{displayData.totalFloats}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Data Points:</span>
              <span className="text-cyan-400 font-semibold">{displayData.dataPoints.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Conditions */}
      <Card className="glass-card glow-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Current Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { 
                status: 'Cooling trend detected', 
                color: 'bg-blue-400', 
                severity: 'info',
                description: 'Temperature dropping by 0.3°C/month'
              },
              { 
                status: 'Seasonal variation', 
                color: 'bg-yellow-400', 
                severity: 'normal',
                description: 'Expected winter cooling pattern'
              },
              { 
                status: 'Good data quality', 
                color: 'bg-green-400', 
                severity: 'good',
                description: '93.3% of data passes QC checks'
              }
            ].map((condition, index) => (
              <motion.div
                key={condition.status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-700/20 transition-colors"
              >
                <div className={`w-3 h-3 ${condition.color} rounded-full mt-1 shadow-lg`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-200 font-medium">{condition.status}</p>
                  <p className="text-xs text-slate-400 mt-1">{condition.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}