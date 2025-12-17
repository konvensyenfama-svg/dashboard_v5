import { supabase } from './supabaseClient';
import { ChartDataPoint, FilterOptions, AttendanceStats, AttendanceLists, Student } from '../types';

// Helper to parse date string for sorting purposes only
const parseDateForSort = (dateStr: string): number => {
  if (!dateStr) return 0;
  const parts = dateStr.split(/[-/]/);
  
  if (parts.length === 3) {
    // Check if first part is year (YYYY-MM-DD)
    if (parts[0].length === 4) {
      return new Date(dateStr).getTime();
    }
    // Assume DD-MM-YYYY or DD/MM/YYYY
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
  }
  return new Date(dateStr).getTime();
};

export const fetchFilterOptions = async (): Promise<FilterOptions> => {
  try {
    // 1. Fetch raw pairs of date and session from pendaftaran
    const { data: pendaftaranData, error: kError } = await supabase
      .from('pendaftaran')
      .select('tarikh_kehadiran, sesi')
      .range(0, 4999); 

    if (kError) throw new Error(`Ralat table 'pendaftaran': ${kError.message}`);

    // 2. Fetch unique wings from senarai_peserta_penuh
    const { data: pesertaData, error: pError } = await supabase
      .from('senarai_peserta_penuh')
      .select('wing_negeri')
      .range(0, 4999);

    if (pError) throw new Error(`Ralat table 'senarai_peserta_penuh': ${pError.message}`);

    // 3. Process Dates and Sessions
    const scheduleMap: Record<string, string[]> = {};
    const uniqueDates = new Set<string>();
    const uniqueSessions = new Set<string>();

    (pendaftaranData || []).forEach((item: any) => {
      if (item.tarikh_kehadiran && item.sesi) {
        // Use original string from DB
        const dateStr = item.tarikh_kehadiran;
        const sessionStr = item.sesi;

        // --- SPECIFIC RULE FOR 16-12-2025 ---
        // Jika tarikh 16-12-2025, hanya benarkan sesi 'Pitching Projek RMK-13'
        if (dateStr === '16-12-2025') {
          if (sessionStr !== 'Pitching Projek RMK-13') {
            return; // Skip this record if it's not the specific session
          }
        }
        // ------------------------------------
        
        uniqueDates.add(dateStr);
        uniqueSessions.add(sessionStr);

        // Build schedule map for cascading filter
        if (!scheduleMap[dateStr]) {
          scheduleMap[dateStr] = [];
        }
        if (!scheduleMap[dateStr].includes(sessionStr)) {
          scheduleMap[dateStr].push(sessionStr);
        }
      }
    });

    // Sort dates chronologically using the helper
    const sortedDates = Array.from(uniqueDates).sort((a, b) => {
      return parseDateForSort(a) - parseDateForSort(b);
    });

    // Sort sessions (Session 1, Session 2...)
    const sortedSessions = Array.from(uniqueSessions).sort();

    // Sort Wings
    const wings = Array.from(new Set((pesertaData || []).map((item: any) => item.wing_negeri).filter((x: any) => typeof x === 'string'))) as string[];
    wings.sort();

    return { 
      dates: sortedDates, 
      sessions: sortedSessions, 
      wings,
      scheduleMap
    };
  } catch (error: any) {
    console.error("Error fetching filter options:", error);
    throw error;
  }
};

export const fetchDashboardData = async (
  tarikh: string,
  sesi: string,
  selectedWing: string
): Promise<{ stats: AttendanceStats; chartData: ChartDataPoint[]; lists: AttendanceLists }> => {
  
  // 1. Fetch Total Participants (Base Denominator) - Include Name and ID
  let queryTotal = supabase
    .from('senarai_peserta_penuh')
    .select('wing_negeri, nama, no_pekerja')
    .range(0, 9999); 

  if (selectedWing && selectedWing !== 'Semua') {
    queryTotal = queryTotal.eq('wing_negeri', selectedWing);
  }

  const { data: totalDataRaw, error: totalError } = await queryTotal;
  if (totalError) throw new Error(`Gagal membaca 'senarai_peserta_penuh': ${totalError.message}`);


  // 2. Fetch Present Participants (Numerator) - Include Name and ID
  let queryPresent = supabase
    .from('pendaftaran')
    .select('wing_negeri, tarikh_kehadiran, sesi, nama, no_pekerja')
    .range(0, 9999);

  // Apply filters
  if (tarikh) {
     queryPresent = queryPresent.eq('tarikh_kehadiran', tarikh); 
  }

  if (sesi) {
    queryPresent = queryPresent.eq('sesi', sesi);
  } else if (tarikh === '16-12-2025') {
    // Implicit filter for this specific date if no session selected (just in case)
    queryPresent = queryPresent.eq('sesi', 'Pitching Projek RMK-13');
  }

  if (selectedWing && selectedWing !== 'Semua') {
    queryPresent = queryPresent.eq('wing_negeri', selectedWing);
  }

  const { data: presentDataRaw, error: presentError } = await queryPresent;
  if (presentError) throw new Error(`Gagal membaca 'pendaftaran': ${presentError.message}`);

  // --- CALCULATION LOGIC (AVERAGE vs EXACT) ---
  
  // Determine if we need to average the data
  // We average if: Date is selected AND Session is NOT selected
  // Exception: If the date only has 1 session anyway, average is same as exact.
  const uniqueSessionsInResult = new Set((presentDataRaw || []).map((r: any) => r.sesi));
  const numberOfSessions = uniqueSessionsInResult.size;
  
  // Divisor is 1 if a specific session is selected, otherwise it's the number of unique sessions found
  const divisor = (tarikh && !sesi && numberOfSessions > 0) ? numberOfSessions : 1;

  // 3. Process Data for Stats
  const totalParticipants = totalDataRaw?.length || 0;
  
  // Use Average for the "Present" count if applicable
  const rawPresentCount = presentDataRaw?.length || 0;
  const presentParticipants = Math.round(rawPresentCount / divisor);
  
  const attendancePercentage = totalParticipants > 0 
    ? (presentParticipants / totalParticipants) * 100 
    : 0;

  // 4. Process Data for Chart (Grouping by Wing/Negeri)
  const totalMap = new Map<string, number>();
  totalDataRaw?.forEach((row: any) => {
    const w = row.wing_negeri || 'Lain-lain';
    totalMap.set(w, (totalMap.get(w) || 0) + 1);
  });

  const presentMap = new Map<string, number>();
  presentDataRaw?.forEach((row: any) => {
    const w = row.wing_negeri || 'Lain-lain';
    presentMap.set(w, (presentMap.get(w) || 0) + 1);
  });

  const allWings = new Set([...totalMap.keys()]);
  
  const chartData: ChartDataPoint[] = Array.from(allWings).map(wing => {
    const total = totalMap.get(wing) || 0;
    const rawHadir = presentMap.get(wing) || 0;
    
    // Apply average logic to chart data as well
    const hadir = Math.round(rawHadir / divisor);

    return {
      name: wing,
      total,
      hadir,
      peratus: total > 0 ? parseFloat(((hadir / total) * 100).toFixed(1)) : 0
    };
  });

  chartData.sort((a, b) => a.name.localeCompare(b.name));

  // 5. Generate Lists (Present vs Absent)
  // For the LIST, we usually want to see everyone who checked in regardless of session duplicates if looking at a whole day,
  // BUT for "Absent" calculation, if they attended ANY session, they are present.
  
  // Create a Set of present IDs (unique people who attended at least one session in the filter scope)
  const presentIds = new Set(presentDataRaw?.map((p: any) => p.no_pekerja));

  // Present List: Unique list of people who attended
  // We deduplicate by no_pekerja for the display list so it matches the "Headcount" logic better
  const uniquePresentMap = new Map<string, Student>();
  (presentDataRaw || []).forEach((row: any) => {
    if (!uniquePresentMap.has(row.no_pekerja)) {
      uniquePresentMap.set(row.no_pekerja, {
        nama: row.nama || 'Tiada Nama',
        no_pekerja: row.no_pekerja,
        wing: row.wing_negeri
      });
    }
  });
  const presentList = Array.from(uniquePresentMap.values());

  // Absent List = Total List - Present List (matched by no_pekerja)
  const absentList: Student[] = (totalDataRaw || [])
    .filter((row: any) => !presentIds.has(row.no_pekerja))
    .map((row: any) => ({
      nama: row.nama || 'Tiada Nama',
      no_pekerja: row.no_pekerja,
      wing: row.wing_negeri
    }));
    
  // Sort lists alphabetically by name
  presentList.sort((a, b) => a.nama.localeCompare(b.nama));
  absentList.sort((a, b) => a.nama.localeCompare(b.nama));

  return {
    stats: {
      totalParticipants,
      presentParticipants, // This is now the AVERAGE if multiple sessions exist
      attendancePercentage
    },
    chartData,
    lists: {
      present: presentList,
      absent: absentList
    }
  };
};