import React from 'react';
import { Filter, X, Plus } from 'lucide-react';

interface DataFiltersProps {
  onFilterChange: (filters: any) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function DataFilters({ onFilterChange, onRefresh, loading }: DataFiltersProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-sm font-medium">Advanced Filters</span>
          <span className="text-slate-500 text-sm">Expand</span>
        </div>
        
        {/* Active Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-cyan-600/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
            <span>Chukchi Sea</span>
            <X className="w-3 h-3 cursor-pointer hover:text-cyan-100" />
          </div>
          
          <div className="flex items-center gap-2 bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">
            <span>2023-2023</span>
            <X className="w-3 h-3 cursor-pointer hover:text-blue-100" />
          </div>
          
          <button className="flex items-center gap-1 text-slate-400 hover:text-white text-sm">
            <Plus className="w-4 h-4" />
            Add Filter
          </button>
        </div>
      </div>
    </div>
  );
}