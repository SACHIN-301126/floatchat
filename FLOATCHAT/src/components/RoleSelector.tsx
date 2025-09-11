import React from 'react';
import { motion } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Users, GraduationCap, Building, FileText } from 'lucide-react';

export type UserRole = 'scientist' | 'policymaker' | 'student' | 'citizen';

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roleConfig = {
  scientist: {
    label: 'Scientist',
    icon: Users,
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Full access to raw data, exports, and advanced analytics'
  },
  policymaker: {
    label: 'Policymaker', 
    icon: Building,
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Policy-focused summaries and actionable insights'
  },
  student: {
    label: 'Student',
    icon: GraduationCap,
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
    description: 'Interactive learning with guided explanations'
  },
  citizen: {
    label: 'Citizen/Journalist',
    icon: FileText,
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    description: 'Public-friendly visualizations and sharable content'
  }
};

export function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const currentConfig = roleConfig[currentRole];
  const Icon = currentConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-cyan-400" />
        <span className="text-sm font-medium text-slate-300">Role:</span>
      </div>
      
      <Select value={currentRole} onValueChange={onRoleChange}>
        <SelectTrigger 
          className="w-48 glass-card border-slate-600 glow-focus"
          aria-label="Select user role"
        >
          <SelectValue>
            <Badge className={`${currentConfig.color} border font-medium`}>
              <Icon className="w-4 h-4 mr-2" />
              {currentConfig.label}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="glass-card border-slate-600">
          {Object.entries(roleConfig).map(([role, config]) => {
            const RoleIcon = config.icon;
            return (
              <SelectItem 
                key={role} 
                value={role}
                className="focus:bg-cyan-500/10 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <RoleIcon className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{config.label}</div>
                    <div className="text-xs text-slate-400">{config.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      <div className="text-xs text-slate-400 max-w-xs">
        {currentConfig.description}
      </div>
    </motion.div>
  );
}