import React from 'react';
import { Users, UserCheck, Percent } from 'lucide-react';
import { AttendanceStats } from '../types';

interface StatsCardProps {
  stats: AttendanceStats;
  loading: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Kehadiran Semasa',
      value: `${stats.presentParticipants} / ${stats.totalParticipants}`,
      subLabel: 'Peserta Hadir / Sasaran',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      label: 'Purata Kehadiran',
      value: `${stats.attendancePercentage.toFixed(1)}%`,
      subLabel: 'Peratusan Keseluruhan',
      icon: Percent,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      label: 'Tidak Hadir',
      value: stats.totalParticipants - stats.presentParticipants,
      subLabel: 'Peserta Belum Daftar',
      icon: UserCheck,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className={`bg-white rounded-xl p-6 shadow-sm border ${card.border} hover:shadow-md transition-shadow`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{card.value}</h3>
                <p className="text-xs text-gray-400 mt-2">{card.subLabel}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCard;