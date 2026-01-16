import { create } from 'zustand';
import api from '../services/api';

interface AttendanceSession {
    checkIn: string;
    checkOut?: string;
    workMinutes?: number;
    isLate?: boolean;
}

interface AttendanceState {
    isCheckedIn: boolean;
    checkInTime: string | null;
    sessions: AttendanceSession[];
    totalWorkMinutes: number;
    loading: boolean;

    // Actions
    fetchStatus: () => Promise<void>;
    checkIn: () => Promise<void>;
    checkOut: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
    isCheckedIn: false,
    checkInTime: null,
    sessions: [],
    totalWorkMinutes: 0,
    loading: false,

    fetchStatus: async () => {
        try {
            const response = await api.get('/attendance/my');
            const todayRecord = response.data.data?.find((record: any) => {
                const recordDate = new Date(record.date).toDateString();
                return recordDate === new Date().toDateString();
            });

            if (todayRecord) {
                const sessions = todayRecord.sessions || [];
                const openSession = sessions.find((s: any) => s.checkIn && !s.checkOut);
                const totalMins = sessions.reduce((sum: number, s: any) => sum + (s.workMinutes || 0), 0);

                if (openSession) {
                    set({
                        isCheckedIn: true,
                        checkInTime: new Date(openSession.checkIn).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        sessions,
                        totalWorkMinutes: totalMins,
                    });
                } else {
                    set({
                        isCheckedIn: false,
                        checkInTime: null,
                        sessions,
                        totalWorkMinutes: totalMins,
                    });
                }
            } else {
                set({
                    isCheckedIn: false,
                    checkInTime: null,
                    sessions: [],
                    totalWorkMinutes: 0,
                });
            }
        } catch (error) {
            console.error('Failed to fetch attendance status:', error);
        }
    },

    checkIn: async () => {
        set({ loading: true });
        try {
            await api.post('/attendance/check-in', {});
            // Refetch to get updated data
            await get().fetchStatus();
        } finally {
            set({ loading: false });
        }
    },

    checkOut: async () => {
        set({ loading: true });
        try {
            await api.post('/attendance/check-out', {});
            // Refetch to get updated data
            await get().fetchStatus();
        } finally {
            set({ loading: false });
        }
    },
}));
