import React from 'react';
import { clsx } from 'clsx';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  Trophy, 
  Calendar,
  Clock,
  Percent,
  Zap,
  Award
} from 'lucide-react';

interface StatisticData {
  label: string;
  value: number;
  previousValue?: number;
  unit?: string;
  format?: 'number' | 'percentage' | 'time' | 'currency';
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

interface ChartData {
  period: string;
  value: number;
  label?: string;
}

interface PlayerStatisticsProps {
  overallStats: StatisticData[];
  chartData: ChartData[];
  chartType?: 'line' | 'bar' | 'area';
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  onTimeframeChange?: (timeframe: string) => void;
  className?: string;
}

export const PlayerStatistics: React.FC<PlayerStatisticsProps> = ({
  overallStats,
  chartData,
  chartType = 'line',
  timeframe = 'month',
  onTimeframeChange,
  className
}) => {
  const formatValue = (value: number, format?: string, unit?: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'time':
        return `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      default:
        return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
    }
  };

  const getTrendIcon = (current: number, previous?: number) => {
    if (!previous) return null;
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getTrendColor = (current: number, previous?: number) => {
    if (!previous) return 'text-gray-600';
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatColor = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-600';
      case 'green': return 'bg-green-50 border-green-200 text-green-600';
      case 'yellow': return 'bg-yellow-50 border-yellow-200 text-yellow-600';
      case 'red': return 'bg-red-50 border-red-200 text-red-600';
      case 'purple': return 'bg-purple-50 border-purple-200 text-purple-600';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const maxValue = Math.max(...chartData.map(d => d.value));
  
  const timeframes = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Performance Statistics</h3>
          <p className="text-sm text-gray-600">Track your gaming progress and achievements</p>
        </div>
        
        <div className="flex space-x-2">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange?.(tf.value)}
              className={clsx(
                'px-3 py-1 text-sm font-medium rounded-lg transition-colors',
                timeframe === tf.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overallStats.map((stat, index) => {
          const StatIcon = stat.icon || BarChart3;
          const trendIcon = getTrendIcon(stat.value, stat.previousValue);
          const trendColor = getTrendColor(stat.value, stat.previousValue);
          
          return (
            <div 
              key={index}
              className={clsx(
                'p-4 rounded-lg border',
                getStatColor(stat.color)
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <StatIcon className="w-5 h-5" />
                {trendIcon}
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {formatValue(stat.value, stat.format, stat.unit)}
                </div>
                <div className="text-sm font-medium opacity-80">
                  {stat.label}
                </div>
                
                {stat.previousValue && (
                  <div className={clsx('text-xs', trendColor)}>
                    {stat.value > stat.previousValue && '+'}
                    {formatValue(stat.value - stat.previousValue, stat.format, stat.unit)}
                    {' vs last period'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Performance Trend</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BarChart3 className="w-4 h-4" />
            <span className="capitalize">{chartType} Chart</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Chart Visualization */}
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full mb-2">
                  {chartType === 'bar' && (
                    <div 
                      className="bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600"
                      style={{ 
                        height: `${Math.max((data.value / maxValue) * 200, 4)}px`,
                        width: '100%'
                      }}
                    />
                  )}
                  
                  {chartType === 'line' && index > 0 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line
                        x1="0"
                        y1={200 - (chartData[index - 1].value / maxValue) * 200}
                        x2="100%"
                        y2={200 - (data.value / maxValue) * 200}
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                  
                  {chartType === 'line' && (
                    <div 
                      className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2"
                      style={{ 
                        bottom: `${(data.value / maxValue) * 200}px`,
                        left: '50%'
                      }}
                    />
                  )}
                </div>
                
                <div className="text-xs text-gray-600 text-center">
                  {data.period}
                </div>
                <div className="text-xs font-semibold text-gray-900">
                  {data.value}
                </div>
              </div>
            ))}
          </div>
          
          {/* Chart Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Performance Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-5 h-5 text-yellow-500" />
            <h4 className="text-lg font-semibold text-gray-900">Recent Achievements</h4>
          </div>
          
          <div className="space-y-3">
            {[
              { name: 'Perfect Game', date: '2 days ago', points: 100 },
              { name: 'Win Streak x5', date: '1 week ago', points: 75 },
              { name: 'Tournament Victory', date: '2 weeks ago', points: 200 }
            ].map((achievement, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="font-medium text-gray-900">{achievement.name}</div>
                  <div className="text-sm text-gray-600">{achievement.date}</div>
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  +{achievement.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-orange-500" />
            <h4 className="text-lg font-semibold text-gray-900">Quick Stats</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Match Duration</span>
              <span className="font-semibold">12:34</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Favorite Time to Play</span>
              <span className="font-semibold">Evening (7-9 PM)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Most Active Day</span>
              <span className="font-semibold">Saturday</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Play Time</span>
              <span className="font-semibold">127 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
