import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Attendance.module.css';

interface AttendanceSession {
    checkIn: string;
    checkOut?: string;
    workMinutes?: number;
    isLate?: boolean;
}

interface AttendanceRecord {
    _id: string;
    employeeId: { firstName: string; lastName: string; employeeId: string };
    date: string;
    checkIn?: string;
    checkOut?: string;
    workMinutes?: number;
    status: string;
    isLate: boolean;
    sessions?: AttendanceSession[];
}

const Attendance = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [checking, setChecking] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [currentSessionTime, setCurrentSessionTime] = useState<string | null>(null);

    useEffect(() => {
        fetchAttendance();
    }, [currentDate]);

    const fetchAttendance = async () => {
        try {
            const startDate = new Date(currentDate);
            startDate.setDate(1);
            const endDate = new Date(currentDate);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);

            // Fetch employee's own attendance records
            const response = await api.get('/attendance/my', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                }
            });
            // The API returns data directly as an array
            const data = response.data.data || [];
            setRecords(data);

            // Check today's status
            const todayRecord = data.find((record: AttendanceRecord) => {
                const recordDate = new Date(record.date).toDateString();
                return recordDate === new Date().toDateString();
            });

            if (todayRecord) {
                const sessions = todayRecord.sessions || [];
                const openSession = sessions.find((s: AttendanceSession) => s.checkIn && !s.checkOut);
                if (openSession) {
                    setIsCheckedIn(true);
                    setCurrentSessionTime(new Date(openSession.checkIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }));
                } else {
                    setIsCheckedIn(false);
                    setCurrentSessionTime(null);
                }
            } else {
                setIsCheckedIn(false);
                setCurrentSessionTime(null);
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        setChecking(true);
        try {
            await api.post('/attendance/check-in', {});
            toast.success('Checked in successfully!');
            fetchAttendance();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Check-in failed');
        } finally {
            setChecking(false);
        }
    };

    const handleCheckOut = async () => {
        setChecking(true);
        try {
            await api.post('/attendance/check-out', {});
            toast.success('Checked out successfully!');
            fetchAttendance();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Check-out failed');
        } finally {
            setChecking(false);
        }
    };

    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '--:--';
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return '0h 0m';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    };


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Attendance</h1>
                    <p>Track your work hours {currentSessionTime && isCheckedIn && <span>(Session started at {currentSessionTime})</span>}</p>
                </div>
                <div className={styles.actions}>
                    {isCheckedIn ? (
                        <button
                            className={styles.checkOutBtn}
                            onClick={handleCheckOut}
                            disabled={checking}
                        >
                            <XCircle size={18} />
                            {checking ? 'Processing...' : 'Clock Out'}
                        </button>
                    ) : (
                        <button
                            className={styles.checkInBtn}
                            onClick={handleCheckIn}
                            disabled={checking}
                        >
                            <CheckCircle size={18} />
                            {checking ? 'Processing...' : 'Clock In'}
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{records.filter(r => r.checkIn).length}</span>
                        <span className={styles.statLabel}>Present Days</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <Clock size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{records.filter(r => r.isLate).length}</span>
                        <span className={styles.statLabel}>Late Days</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                        <Clock size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>
                            {formatDuration(records.reduce((sum, r) => sum + (r.workMinutes || 0), 0))}
                        </span>
                        <span className={styles.statLabel}>Total Hours</span>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <h3>Attendance History</h3>
                    <div className={styles.monthNav}>
                        <button onClick={prevMonth}><ChevronLeft size={18} /></button>
                        <span>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={nextMonth}><ChevronRight size={18} /></button>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : records.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Calendar size={48} />
                        <p>No attendance records for this month</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Session</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Duration</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.flatMap((record) => {
                                const sessions = record.sessions && record.sessions.length > 0
                                    ? record.sessions
                                    : [{ checkIn: record.checkIn, checkOut: record.checkOut, workMinutes: record.workMinutes, isLate: record.isLate }];

                                return sessions.map((session, idx) => (
                                    <tr key={`${record._id}-${idx}`}>
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                        <td>#{idx + 1}</td>
                                        <td className={session.isLate ? styles.late : ''}>
                                            {formatTime(session.checkIn)}
                                            {session.isLate && <span className={styles.lateTag}>Late</span>}
                                        </td>
                                        <td>{session.checkOut ? formatTime(session.checkOut) : <span className={styles.activeTag}>Active</span>}</td>
                                        <td>{formatDuration(session.workMinutes)}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[record.status.toLowerCase()]}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ));
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Attendance;
