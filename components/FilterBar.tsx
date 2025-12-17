import React from 'react';
import { Filter, Calendar, Clock, MapPin } from 'lucide-react';
import { FilterOptions, FilterState } from '../types';

interface FilterBarProps {
  options: FilterOptions;
  values: FilterState;
  onChange: (key: keyof FilterState, value: string) => void;
  isLoading: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ options, values, onChange, isLoading }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 mb-4 text-gray-800">
        <Filter className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-lg">Tapisan Data</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarikh Filter */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Tarikh
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={values.tarikh}
              onChange={(e) => onChange('tarikh', e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none text-gray-700"
            >
              <option value="">Pilih Tarikh</option>
              {options.dates.map((date) => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sesi Filter */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Sesi
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={values.sesi}
              onChange={(e) => onChange('sesi', e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none text-gray-700"
            >
              <option value="">Pilih Sesi</option>
              {options.sessions.map((sesi) => (
                <option key={sesi} value={sesi}>{sesi}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Wing/Negeri Filter */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Wing / Negeri
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={values.wing}
              onChange={(e) => onChange('wing', e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none text-gray-700"
            >
              <option value="Semua">Semua Wing/Negeri</option>
              {options.wings.map((wing) => (
                <option key={wing} value={wing}>{wing}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;