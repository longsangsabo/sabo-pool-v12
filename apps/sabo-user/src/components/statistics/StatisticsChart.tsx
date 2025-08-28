import React from 'react';
import { clsx } from 'clsx';

interface StatisticsChartProps {
  type?: 'line' | 'bar' | 'pie' | 'area';
  data?: any[];
  title?: string;
  className?: string;
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({
  type = 'line',
  data = [],
  title = 'Statistics',
  className
}) => {
  return (
    <div className={clsx('statistics-chart bg-white rounded-lg p-6', className)}>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="text-gray-500">
        Statistics chart component will be implemented here.
        <br />
        Chart type: {type}
        <br />
        Data points: {data.length}
      </div>
    </div>
  );
};

export default StatisticsChart;
