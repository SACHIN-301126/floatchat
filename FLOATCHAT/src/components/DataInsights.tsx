import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Thermometer,
  Droplets,
  Layers,
  MapPin,
  Calendar,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { Badge } from './ui/badge';

interface DataInsightsProps {
  oceanData: any;
  appliedFilters?: any;
}

export function DataInsights({ oceanData, appliedFilters }: DataInsightsProps) {
  // Generate insights based on ocean data
  const generateInsights = () => {
    if (!oceanData || !oceanData.floats || oceanData.floats.length === 0) {
      return [];
    }

    const insights = [];
    const floats = oceanData.floats;
    const temperatures = floats.map(f => f.temperature).filter(t => t !== undefined);
    const salinities = floats.map(f => f.salinity).filter(s => s !== undefined);
    const depths = floats.map(f => f.depth).filter(d => d !== undefined);

    // Temperature insights
    if (temperatures.length > 0) {
      const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
      const maxTemp = Math.max(...temperatures);
      const minTemp = Math.min(...temperatures);
      
      insights.push({
        type: 'temperature',
        title: 'Temperature Analysis',
        value: `${avgTemp.toFixed(1)}°C`,
        change: avgTemp > 15 ? 'up' : 'down',
        description: `Range: ${minTemp.toFixed(1)}°C to ${maxTemp.toFixed(1)}°C`,
        icon: Thermometer,
        color: avgTemp > 20 ? 'text-coral-orange' : avgTemp > 10 ? 'text-cyan-teal' : 'text-ocean-blue'
      });
    }

    // Salinity insights
    if (salinities.length > 0) {
      const avgSalinity = salinities.reduce((a, b) => a + b, 0) / salinities.length;
      const maxSalinity = Math.max(...salinities);
      const minSalinity = Math.min(...salinities);
      
      insights.push({
        type: 'salinity',
        title: 'Salinity Levels',
        value: `${avgSalinity.toFixed(2)} PSU`,
        change: avgSalinity > 35 ? 'up' : 'down',
        description: `Range: ${minSalinity.toFixed(2)} to ${maxSalinity.toFixed(2)} PSU`,
        icon: Droplets,
        color: 'text-cyan-teal'
      });
    }

    // Depth insights
    if (depths.length > 0) {
      const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
      const maxDepth = Math.max(...depths);
      
      insights.push({
        type: 'depth',
        title: 'Depth Coverage',
        value: `${avgDepth.toFixed(0)}m`,
        change: 'neutral',
        description: `Max depth: ${maxDepth.toFixed(0)}m`,
        icon: Layers,
        color: 'text-ocean-blue-light'
      });
    }

    // Activity insights
    const activeFloats = floats.filter(f => f.status === 'Active').length;
    const totalFloats = floats.length;
    
    insights.push({
      type: 'activity',
      title: 'Float Activity',
      value: `${activeFloats}/${totalFloats}`,
      change: activeFloats > totalFloats * 0.8 ? 'up' : activeFloats > totalFloats * 0.5 ? 'neutral' : 'down',
      description: `${((activeFloats / totalFloats) * 100).toFixed(1)}% active`,
      icon: Activity,
      color: activeFloats > totalFloats * 0.8 ? 'text-emerald-400' : 'text-coral-orange'
    });

    // Geographic insights
    if (floats.length > 0) {
      const regions = [...new Set(floats.map(f => f.region || 'Unknown'))];
      insights.push({
        type: 'geographic',
        title: 'Regional Coverage',
        value: `${regions.length} regions`,
        change: 'neutral',
        description: regions.slice(0, 3).join(', '),
        icon: MapPin,
        color: 'text-purple-400'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-coral-orange" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const qualityMetrics = [
    {
      label: 'Data Quality',
      value: appliedFilters?.dataCompleteness || 85,
      unit: '%',
      color: 'text-emerald-400'
    },
    {
      label: 'Temporal Coverage',
      value: 92,
      unit: '%',
      color: 'text-cyan-teal'
    },
    {
      label: 'Spatial Resolution',
      value: 78,
      unit: '%',
      color: 'text-ocean-blue-light'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-cyan-teal" />
          <h3 className="font-semibold text-white">Data Insights</h3>
          <Badge variant="secondary" className="ml-auto">
            {insights.length} metrics
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4 hover:bg-slate-600/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-slate-600/30`}>
                    <insight.icon className={`w-4 h-4 ${insight.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{insight.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className={`font-semibold ${insight.color}`}>{insight.value}</span>
                    {getChangeIcon(insight.change)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quality Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-coral-orange" />
          <h3 className="font-semibold text-white">Quality Metrics</h3>
        </div>

        <div className="space-y-4">
          {qualityMetrics.map((metric, index) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{metric.label}</span>
                <span className={`font-medium ${metric.color}`}>
                  {metric.value}{metric.unit}
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                  className={`h-2 rounded-full ${
                    metric.value > 80 ? 'bg-emerald-400' : 
                    metric.value > 60 ? 'bg-cyan-teal' : 'bg-coral-orange'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Current Filter Summary */}
      {appliedFilters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Active Filters</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">
                {appliedFilters.dateRange?.startDate} to {appliedFilters.dateRange?.endDate}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">
                {appliedFilters.regions?.join(', ') || 'Global Ocean'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">
                {appliedFilters.temperature?.min}°C to {appliedFilters.temperature?.max}°C
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">
                {appliedFilters.depth?.min}m to {appliedFilters.depth?.max}m depth
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}