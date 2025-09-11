import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wifi, 
  Database, 
  Activity, 
  Clock, 
  Users, 
  Globe,
  Zap,
  TrendingUp
} from 'lucide-react';

interface StatusBarProps {
  user?: any;
  isLiveMode?: boolean;
}

export function StatusBar({ user, isLiveMode }: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState({
    connection: 'Connected',
    dataSync: 'Real-time',
    floatsActive: 3847,
    dataLatency: '< 1s',
    uptime: '99.9%'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const statusItems = [
    {
      icon: Wifi,
      label: 'Connection',
      value: systemStatus.connection,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/20'
    },
    {
      icon: Database,
      label: 'Data Sync',
      value: systemStatus.dataSync,
      color: 'text-cyan-teal',
      bgColor: 'bg-cyan-teal/20'
    },
    {
      icon: Activity,
      label: 'Active Floats',
      value: systemStatus.floatsActive.toLocaleString(),
      color: 'text-ocean-blue-light',
      bgColor: 'bg-ocean-blue/20'
    },
    {
      icon: Zap,
      label: 'Latency',
      value: systemStatus.dataLatency,
      color: 'text-coral-orange',
      bgColor: 'bg-coral-orange/20'
    },
    {
      icon: TrendingUp,
      label: 'Uptime',
      value: systemStatus.uptime,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/20'
    }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-t border-slate-600/30 px-6 py-3 flex items-center justify-between text-sm"
    >
      {/* Left Section - System Status */}
      <div className="flex items-center gap-6">
        {statusItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2"
          >
            <div className={`p-1 rounded ${item.bgColor}`}>
              <item.icon className={`w-3 h-3 ${item.color}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">{item.label}</span>
              <span className={`text-xs font-medium ${item.color}`}>{item.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Center Section - Live Mode Indicator */}
      {isLiveMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 glass-card px-3 py-1 border border-emerald-400/30"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-emerald-400 rounded-full"
          ></motion.div>
          <span className="text-emerald-400 font-medium text-xs">LIVE DATA MODE</span>
        </motion.div>
      )}

      {/* Right Section - Time & User Info */}
      <div className="flex items-center gap-6">
        {/* Current Time */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Clock className="w-3 h-3 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Current Time (UTC)</span>
            <span className="text-xs font-medium text-cyan-teal">
              {formatTime(currentTime)} • {formatDate(currentTime)}
            </span>
          </div>
        </motion.div>

        {/* User Session Info */}
        {user && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <Users className="w-3 h-3 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Session</span>
              <span className="text-xs font-medium text-slate-300">
                {user.role} • {user.stats.totalChats} chats
              </span>
            </div>
          </motion.div>
        )}

        {/* Global Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2"
        >
          <Globe className="w-3 h-3 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Coverage</span>
            <span className="text-xs font-medium text-ocean-blue-light">Global Ocean 89%</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}