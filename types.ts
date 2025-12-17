export interface KehadiranRow {
  no_pekerja: string;
  tarikh_kehadiran: string;
  sesi: string;
  wing_negeri: string;
  nama?: string;
}

export interface PesertaPenuhRow {
  id: number;
  no_pekerja: string;
  wing_negeri: string;
  nama: string;
}

export interface FilterState {
  tarikh: string;
  sesi: string;
  wing: string;
}

export interface AttendanceStats {
  totalParticipants: number;
  presentParticipants: number;
  attendancePercentage: number;
}

export interface ChartDataPoint {
  name: string; // wing_negeri
  hadir: number;
  total: number;
  peratus: number;
}

export interface Student {
  nama: string;
  no_pekerja: string;
  wing: string;
}

export interface AttendanceLists {
  present: Student[];
  absent: Student[];
}

export interface FilterOptions {
  dates: string[];
  sessions: string[]; // Global list of unique sessions
  wings: string[];
  // Mapping to help filter sessions based on date
  scheduleMap: Record<string, string[]>; 
}