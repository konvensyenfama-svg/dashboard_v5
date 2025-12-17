import React, { useEffect, useState } from 'react';
import FilterBar from './components/FilterBar';
import StatsCard from './components/StatsCard';
import AttendanceChart from './components/AttendanceChart';
import AttendanceList from './components/AttendanceList';
import { fetchFilterOptions, fetchDashboardData } from './services/dataService';
import { FilterOptions, FilterState, AttendanceStats, ChartDataPoint, AttendanceLists } from './types';
import { LayoutDashboard, AlertCircle, RefreshCcw, Database } from 'lucide-react';

const App: React.FC = () => {
  // State for Dropdown Options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dates: [],
    sessions: [],
    wings: [],
    scheduleMap: {}
  });

  // State for Selected Filters
  const [filters, setFilters] = useState<FilterState>({
    tarikh: '',
    sesi: '',
    wing: 'Semua'
  });

  // Derived state for available sessions based on selected date
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);

  // State for Dashboard Data
  const [stats, setStats] = useState<AttendanceStats>({
    totalParticipants: 0,
    presentParticipants: 0,
    attendancePercentage: 0
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [lists, setLists] = useState<AttendanceLists>({ present: [], absent: [] });
  
  // UI States
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = async () => {
    setLoadingOptions(true);
    setError(null);
    try {
      const options = await fetchFilterOptions();
      setFilterOptions(options);
      
      // Initial Logic:
      // If dates exist, select the first one automatically
      if (options.dates.length > 0 && !filters.tarikh) {
        const firstDate = options.dates[0];
        setFilters(prev => ({ ...prev, tarikh: firstDate }));
        // Sessions will be updated by the useEffect below
      }
    } catch (err: any) {
      console.error("Failed to load options", err);
      setError(err.message || "Gagal menyambung ke pangkalan data.");
    } finally {
      setLoadingOptions(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to update Available Sessions when Date changes
  useEffect(() => {
    if (filters.tarikh && filterOptions.scheduleMap[filters.tarikh]) {
      const sessionsForDate = filterOptions.scheduleMap[filters.tarikh];
      // Sort sessions naturally
      sessionsForDate.sort(); 
      setAvailableSessions(sessionsForDate);

      // If currently selected session is NOT in the new list, reset it
      if (filters.sesi && !sessionsForDate.includes(filters.sesi)) {
        setFilters(prev => ({ ...prev, sesi: '' }));
      }
    } else {
      // If no date selected, show all sessions (or none, depending on preference. Here: all)
      setAvailableSessions(filterOptions.sessions);
    }
  }, [filters.tarikh, filterOptions]);

  // Data Fetching based on Filters
  useEffect(() => {
    if (loadingOptions) return;

    const loadData = async () => {
      setLoadingData(true);
      setError(null);
      try {
        const { stats, chartData, lists } = await fetchDashboardData(
          filters.tarikh, 
          filters.sesi, 
          filters.wing
        );
        setStats(stats);
        setChartData(chartData);
        setLists(lists);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data", err);
        setError(err.message || "Ralat memproses data dari pangkalan data.");
      } finally {
        setLoadingData(false);
      }
    };

    const timeoutId = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, loadingOptions]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRetry = () => {
    loadOptions();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard Kehadiran</h1>
              <p className="text-xs text-gray-500">Live Data</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
             <p className="text-sm font-medium text-gray-600">
               {new Date().toLocaleDateString('ms-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner with Setup Guide */}
        {error && (
          <div className="mb-8 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row items-start gap-4">
              <div className="p-2 bg-red-100 rounded-full shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-800">Ralat Sambungan Database</h3>
                <p className="text-sm text-red-600 mt-1 mb-3 font-mono bg-white/50 p-2 rounded border border-red-100 inline-block">
                  {error}
                </p>
                <div className="text-sm text-red-700 space-y-2">
                  <p>Sila pastikan perkara berikut di Dashboard Supabase anda:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Nama table mestilah <strong>huruf kecil</strong> sepenuhnya (<code>pendaftaran</code> dan <code>senarai_peserta_penuh</code>).</li>
                    <li>Row Level Security (RLS) perlu disemak. Jika diaktifkan, pastikan ada Policy untuk <code>SELECT</code> (public access).</li>
                  </ul>
                </div>
                <button 
                  onClick={handleRetry}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Cuba Lagi
                </button>
              </div>
            </div>

            {/* Schema Guide Helper */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-blue-700" />
                <h3 className="text-md font-bold text-blue-900">Panduan Struktur Table (Schema)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border border-blue-100">
                  <h4 className="font-mono text-sm font-bold text-blue-600 border-b border-gray-100 pb-2 mb-2">table: pendaftaran</h4>
                  <ul className="text-xs text-gray-600 space-y-1 font-mono">
                    <li>tarikh_kehadiran <span className="text-gray-400">(text/date)</span></li>
                    <li>sesi <span className="text-gray-400">(text)</span></li>
                    <li>wing_negeri <span className="text-gray-400">(text)</span></li>
                    <li>nama <span className="text-gray-400">(text)</span></li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border border-blue-100">
                  <h4 className="font-mono text-sm font-bold text-blue-600 border-b border-gray-100 pb-2 mb-2">table: senarai_peserta_penuh</h4>
                  <ul className="text-xs text-gray-600 space-y-1 font-mono">
                    <li>wing_negeri <span className="text-gray-400">(text)</span></li>
                    <li>nama <span className="text-gray-400">(text)</span></li>
                    <li>no_pekerja <span className="text-gray-400">(text)</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <FilterBar 
          options={{...filterOptions, sessions: availableSessions}} 
          values={filters} 
          onChange={handleFilterChange} 
          isLoading={loadingOptions}
        />

        {/* Big Numbers Cards */}
        <StatsCard stats={stats} loading={loadingData && !error} />

        {/* Chart Section */}
        <div className="grid grid-cols-1 gap-6">
          <AttendanceChart data={chartData} loading={loadingData && !error} />
        </div>

        {/* Attendance List */}
        <AttendanceList lists={lists} loading={loadingData && !error} />
      </main>
    </div>
  );
};

export default App;