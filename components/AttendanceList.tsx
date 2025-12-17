import React, { useState } from 'react';
import { CheckCircle2, XCircle, Search } from 'lucide-react';
import { Student, AttendanceLists } from '../types';

interface AttendanceListProps {
  lists: AttendanceLists;
  loading: boolean;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ lists, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'present' | 'absent'>('present');

  if (loading) {
    return <div className="h-64 w-full bg-gray-100 rounded-xl animate-pulse mt-6"></div>;
  }

  const currentList = activeTab === 'present' ? lists.present : lists.absent;
  const filteredList = currentList.filter(student => 
    student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.no_pekerja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-800">Senarai Kehadiran Peserta</h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau no. pekerja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('present')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'present' 
                ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Hadir ({lists.present.length})
          </button>
          <button
            onClick={() => setActiveTab('absent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'absent' 
                ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Tidak Hadir ({lists.absent.length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-medium">No. Pekerja</th>
              <th className="px-6 py-3 font-medium">Nama Peserta</th>
              <th className="px-6 py-3 font-medium">Wing / Negeri</th>
              <th className="px-6 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredList.length > 0 ? (
              filteredList.map((student, index) => (
                <tr key={`${student.no_pekerja}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 font-mono text-gray-600">{student.no_pekerja}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{student.nama}</td>
                  <td className="px-6 py-3 text-gray-600">{student.wing}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === 'present' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {activeTab === 'present' ? 'Hadir' : 'Belum Daftar'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Tiada rekod dijumpai untuk carian ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceList;