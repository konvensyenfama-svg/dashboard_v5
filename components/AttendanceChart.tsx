import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface AttendanceChartProps {
  data: ChartDataPoint[];
  loading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Access the original data object from the payload
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-lg text-sm z-50">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        <p className="text-blue-600 font-medium">
          Hadir: <span className="font-bold">{data.hadir}</span>
        </p>
        <p className="text-emerald-600 font-medium">
          Total: <span className="font-bold">{data.total}</span>
        </p>
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-4">
          <span className="text-gray-500 text-xs">Peratusan:</span>
          <span className={`font-bold ${data.peratus >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {data.peratus}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="h-[500px] w-full bg-gray-100 rounded-xl animate-pulse"></div>;
  }

  if (data.length === 0) {
    return (
      <div className="h-[400px] w-full bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">
        Tiada data untuk dipaparkan
      </div>
    );
  }

  // Calculate dynamic height based on number of items
  // Reduced to 60px per item to decrease the gap (kecilkan gap)
  const chartHeight = Math.max(data.length * 60, 400);
  const barSize = 32; 

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Analisa Mengikut Wing / Negeri</h3>
          <p className="text-sm text-gray-400">Perbandingan kehadiran dengan sasaran</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          {data.length} Kategori
        </div>
      </div>
      
      <div style={{ height: `${chartHeight}px`, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
            // Negative barGap forces the second bar to overlap the first one completely
            barGap={-barSize} 
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f8fafc" />
            
            <XAxis 
              type="number"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            
            <YAxis 
              dataKey="name" 
              type="category" 
              width={140}
              tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} 
              tickLine={false}
              axisLine={false}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            
            {/* Background Bar (Total) - Changed to Green (#bbf7d0 / emerald-200) */}
            <Bar 
              dataKey="total" 
              fill="#bbf7d0" 
              radius={[0, 6, 6, 0]} 
              barSize={barSize}
              // No animation for background makes it feel more solid
              isAnimationActive={false} 
            />
            
            {/* Foreground Bar (Hadir) */}
            <Bar 
              dataKey="hadir" 
              fill="url(#barGradient)" 
              radius={[0, 6, 6, 0]} 
              barSize={barSize}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;