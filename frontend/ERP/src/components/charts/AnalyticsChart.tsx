import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Card from '../ui/Card';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartData[];
  type: 'line' | 'bar' | 'pie';
  height?: number;
  colors?: string[];
}

const COLORS = ['#2563eb', '#059669', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  data,
  type,
  height = 300,
  colors = COLORS,
}) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0] }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {renderChart()}
    </Card>
  );
};

export default AnalyticsChart;