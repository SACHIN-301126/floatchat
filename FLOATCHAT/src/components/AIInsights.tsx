import React, { useState } from 'react';
import { 
  TrendingDown,
  Thermometer,
  Activity,
  BarChart3
} from 'lucide-react';

interface AIInsightsProps {
  oceanData: any;
  onGetInsights: (query: string, data: any) => Promise<{ insight: string; timestamp: string }>;
}

export function AIInsights({ oceanData, onGetInsights }: AIInsightsProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Static insight cards based on the image
  const insightCards = [
    {
      id: 'cooling-trend',
      title: 'Cooling Trend',
      subtitle: '300 profiles',
      description: 'The region shows cooling of 42.31°C per year, indicating significant climate change effects or natural variability.',
      icon: TrendingDown,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
      borderColor: 'border-cyan-400/20'
    },
    {
      id: 'temperature-variability', 
      title: 'Temperature Variability',
      subtitle: 'High temperature variation detected 158.5°C to 162.1°C',
      description: 'Temperature variations indicate the presence of vertical mixing effects or climate anomalies.',
      icon: Thermometer,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10', 
      borderColor: 'border-orange-400/20'
    },
    {
      id: 'seasonal-patterns',
      title: 'Seasonal Patterns',
      subtitle: 'Data spans multiple seasons with clear temperature cycles ranging from winter minimum to summer...',
      description: 'Data spans multiple seasons with clear temperature cycles where changes range from month to months (May-June).',
      icon: Activity,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/20'
    }
  ];

  return (
    <div className="bg-slate-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Powered by AI</span>
        </div>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insightCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`p-4 rounded-lg border ${card.bgColor} ${card.borderColor} hover:border-opacity-40 transition-all cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${card.bgColor} mt-1`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white text-sm">{card.title}</h4>
                    <div className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      300
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                    {card.subtitle}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}