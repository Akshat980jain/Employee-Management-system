import { useState, useEffect } from 'react';
import {
    Calendar,
    TrendingUp,
    FileText,
    Star,
    Bell,
    LogIn,
    LogOut as LogOutIcon,
    Sun,
    Coffee,
    AlertTriangle,
    Eye
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './EmployeeDashboard.module.css';

interface Warning {
    _id: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    isRead: boolean;
    issuedBy: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

const EmployeeDashboard = () => {
    const { user } = useAuthStore();
    const { isCheckedIn, loading, fetchStatus, checkIn, checkOut } = useAttendanceStore();
    const today = new Date();

    // Warnings state
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch attendance status on mount
    useEffect(() => {
        fetchStatus();
        fetchWarnings();
    }, [fetchStatus]);

    const fetchWarnings = async () => {
        try {
            const response = await api.get('/warnings/my');
            setWarnings(response.data.data || []);
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error: any) {
            console.error('Failed to fetch warnings:', error);
        }
    };

    const markWarningAsRead = async (warningId: string) => {
        try {
            await api.patch(`/warnings/${warningId}/read`);
            setWarnings(prev =>
                prev.map(w => w._id === warningId ? { ...w, isRead: true } : w)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Warning acknowledged');
        } catch (error: any) {
            console.error('Failed to mark warning as read:', error);
            toast.error('Failed to acknowledge warning');
        }
    };

    const leaveBalance = [
        { type: 'Annual Leave', used: 5, total: 20, color: 'blue' },
        { type: 'Sick Leave', used: 2, total: 10, color: 'orange' },
        { type: 'Personal', used: 1, total: 3, color: 'purple' },
    ];

    const recentRequests = [
        { type: 'Vacation', dates: 'Dec 24 - Dec 26', status: 'Approved' },
        { type: 'Sick Leave', dates: 'Dec 15', status: 'Approved' },
        { type: 'Personal', dates: 'Nov 28', status: 'Approved' },
    ];

    const upcomingHolidays = [
        { name: 'Republic Day', date: 'Jan 26', day: 'Sunday' },
        { name: 'Holi', date: 'Mar 14', day: 'Friday' },
        { name: 'Good Friday', date: 'Apr 18', day: 'Friday' },
    ];

    const announcements = [
        { title: 'Office Closure Notice', content: 'Office will be closed on Jan 26 for Republic Day.', date: 'Jan 10', priority: 'high' },
        { title: 'Team Building Event', content: 'Join us for a team outing on Feb 15!', date: 'Jan 8', priority: 'medium' },
        { title: 'New Policy Update', content: 'Updated work from home policy effective Feb 1.', date: 'Jan 5', priority: 'low' },
    ];

    const handleClockAction = async () => {
        try {
            if (isCheckedIn) {
                await checkOut();
                toast.success('Checked out successfully!');
            } else {
                await checkIn();
                toast.success('Checked in successfully!');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Action failed');
        }
    };

    const getGreeting = () => {
        const hour = today.getHours();
        if (hour < 12) return { text: 'Good Morning', icon: Sun };
        if (hour < 17) return { text: 'Good Afternoon', icon: Coffee };
        return { text: 'Good Evening', icon: Star };
    };

    const getSeverityClass = (severity: string) => {
        switch (severity) {
            case 'LOW':
                return styles.severityLow;
            case 'MEDIUM':
                return styles.severityMedium;
            case 'HIGH':
                return styles.severityHigh;
            default:
                return styles.severityMedium;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const greeting = getGreeting();
    const GreetingIcon = greeting.icon;

    return (
        <div className={styles.container}>
            {/* Warnings Alert Banner */}
            {unreadCount > 0 && (
                <div className={styles.warningAlert}>
                    <AlertTriangle size={20} />
                    <span>You have {unreadCount} unread warning(s). Please review them below.</span>
                </div>
            )}

            {/* Welcome Header */}
            <div className={styles.welcomeCard}>
                <div className={styles.welcomeContent}>
                    <div className={styles.greetingIcon}>
                        <GreetingIcon size={28} />
                    </div>
                    <div>
                        <h1>{greeting.text}, {user?.firstName}!</h1>
                        <p>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>
                <button
                    className={`${styles.clockBtn} ${isCheckedIn ? styles.clockedIn : ''}`}
                    onClick={handleClockAction}
                    disabled={loading}
                >
                    {isCheckedIn ? <LogOutIcon size={20} /> : <LogIn size={20} />}
                    <span>{loading ? 'Processing...' : isCheckedIn ? 'Clock Out' : 'Clock In'}</span>
                </button>
            </div>

            {/* Warnings Section - Show at top if there are any */}
            {warnings.length > 0 && (
                <div className={`${styles.card} ${styles.warningsCard}`}>
                    <div className={styles.cardHeader}>
                        <h3>
                            <AlertTriangle size={18} />
                            Warnings
                            {unreadCount > 0 && (
                                <span className={styles.unreadBadge}>{unreadCount} new</span>
                            )}
                        </h3>
                    </div>
                    <div className={styles.warningsList}>
                        {warnings.map((warning) => (
                            <div
                                key={warning._id}
                                className={`${styles.warningItem} ${!warning.isRead ? styles.unread : ''}`}
                            >
                                <div className={`${styles.warningSeverity} ${getSeverityClass(warning.severity)}`}>
                                    <AlertTriangle size={16} />
                                    <span>{warning.severity}</span>
                                </div>
                                <div className={styles.warningContent}>
                                    <p className={styles.warningMessage}>{warning.message}</p>
                                    <div className={styles.warningMeta}>
                                        <span>Issued by {warning.issuedBy?.firstName} {warning.issuedBy?.lastName}</span>
                                        <span>•</span>
                                        <span>{formatDate(warning.createdAt)}</span>
                                    </div>
                                </div>
                                {!warning.isRead && (
                                    <button
                                        className={styles.acknowledgeBtn}
                                        onClick={() => markWarningAsRead(warning._id)}
                                        title="Acknowledge Warning"
                                    >
                                        <Eye size={16} />
                                        Acknowledge
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.mainGrid}>
                {/* Leave Balance */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><Calendar size={18} /> Leave Balance</h3>
                        <a href="/leave">Request Leave</a>
                    </div>
                    <div className={styles.leaveBalances}>
                        {leaveBalance.map((leave, index) => (
                            <div key={index} className={styles.leaveItem}>
                                <div className={styles.leaveInfo}>
                                    <span className={styles.leaveType}>{leave.type}</span>
                                    <span className={styles.leaveCount}>{leave.total - leave.used} remaining</span>
                                </div>
                                <div className={styles.leaveBar}>
                                    <div
                                        className={`${styles.leaveProgress} ${styles[leave.color]}`}
                                        style={{ width: `${((leave.total - leave.used) / leave.total) * 100}%` }}
                                    />
                                </div>
                                <span className={styles.leaveUsed}>{leave.used}/{leave.total} used</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Performance */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><TrendingUp size={18} /> My Performance</h3>
                    </div>
                    <div className={styles.performanceContent}>
                        <div className={styles.ratingCircle}>
                            <span className={styles.ratingValue}>4.5</span>
                            <span className={styles.ratingLabel}>Rating</span>
                        </div>
                        <div className={styles.performanceStats}>
                            <div className={styles.perfItem}>
                                <span className={styles.perfValue}>92%</span>
                                <span className={styles.perfLabel}>Goals Met</span>
                            </div>
                            <div className={styles.perfItem}>
                                <span className={styles.perfValue}>15</span>
                                <span className={styles.perfLabel}>Tasks Done</span>
                            </div>
                            <div className={styles.perfItem}>
                                <span className={styles.perfValue}>3</span>
                                <span className={styles.perfLabel}>Awards</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Requests */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><FileText size={18} /> My Leave Requests</h3>
                        <a href="/leave">View All</a>
                    </div>
                    <div className={styles.requestsList}>
                        {recentRequests.map((request, index) => (
                            <div key={index} className={styles.requestItem}>
                                <div className={styles.requestInfo}>
                                    <span className={styles.requestType}>{request.type}</span>
                                    <span className={styles.requestDates}>{request.dates}</span>
                                </div>
                                <span className={`${styles.requestStatus} ${styles[request.status.toLowerCase()]}`}>
                                    {request.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Holidays */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><Star size={18} /> Upcoming Holidays</h3>
                    </div>
                    <div className={styles.holidaysList}>
                        {upcomingHolidays.map((holiday, index) => (
                            <div key={index} className={styles.holidayItem}>
                                <div className={styles.holidayDate}>
                                    <span className={styles.holidayDay}>{holiday.date.split(' ')[1]}</span>
                                    <span className={styles.holidayMonth}>{holiday.date.split(' ')[0]}</span>
                                </div>
                                <div className={styles.holidayInfo}>
                                    <span className={styles.holidayName}>{holiday.name}</span>
                                    <span className={styles.holidayWeekday}>{holiday.day}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Announcements */}
                <div className={`${styles.card} ${styles.wideCard}`}>
                    <div className={styles.cardHeader}>
                        <h3><Bell size={18} /> Announcements</h3>
                    </div>
                    <div className={styles.announcementsList}>
                        {announcements.map((announcement, index) => (
                            <div key={index} className={styles.announcementItem}>
                                <div className={`${styles.priorityDot} ${styles[announcement.priority]}`} />
                                <div className={styles.announcementContent}>
                                    <span className={styles.announcementTitle}>{announcement.title}</span>
                                    <p>{announcement.content}</p>
                                </div>
                                <span className={styles.announcementDate}>{announcement.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
