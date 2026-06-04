import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    Clock,
    FileText,
    DollarSign,
    Target,
    Star,
    MessageSquare,
    Sparkles,
    Bot,
    Calendar,
    CheckCircle,
    Lightbulb,
    LogIn,
    LogOut as LogOutIcon,
    ArrowRightLeft,
    Monitor
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import CorrectionRequestModal from '../CorrectionRequestModal';
import toast from 'react-hot-toast';
import styles from './Sidebar.module.css';

// Define menu items with role access control
const allMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'HR Manager', 'Employee'] },
    { path: '/employees', icon: Users, label: 'Employees', roles: ['Admin', 'HR Manager'] },
    { path: '/departments', icon: Building2, label: 'Departments', roles: ['Admin'] },
    { path: '/attendance', icon: Clock, label: 'Attendance', roles: ['Admin', 'HR Manager', 'Employee'] },
    { path: '/attendance/monitoring', icon: Monitor, label: 'Staff Monitoring', roles: ['Admin', 'HR Manager'] },
    { path: '/leave', icon: FileText, label: 'Leave', roles: ['Admin', 'HR Manager', 'Employee'] },
    { path: '/payroll', icon: DollarSign, label: 'Payroll', roles: ['Admin', 'HR Manager'] },
    { path: '/goals', icon: Target, label: 'Goals', roles: ['Admin', 'HR Manager', 'Employee'] },
    { path: '/reviews', icon: Star, label: 'Reviews', roles: ['Admin', 'HR Manager', 'Employee'] },
    { path: '/feedback', icon: MessageSquare, label: 'Feedback', roles: ['Admin', 'HR Manager', 'Employee'] },
    { path: '/ai-insights', icon: Sparkles, label: 'AI Insights', roles: ['Admin', 'HR Manager'] },
    { path: '/hr-chatbot', icon: Bot, label: 'HR Chatbot', roles: ['Admin', 'HR Manager', 'Employee'] },
    { path: '/transfer', icon: ArrowRightLeft, label: 'Transfer Org', roles: ['Admin', 'HR Manager', 'Employee'] },
    { path: '/transfer/incoming', icon: ArrowRightLeft, label: 'Transfer Requests', roles: ['Admin', 'HR Manager'] },
];

const tips = [
    "Regular breaks boost productivity by up to 30%!",
    "Set daily goals to stay focused and motivated.",
    "Celebrate small wins to maintain momentum.",
    "Collaboration drives innovation forward.",
    "Work-life balance leads to better performance.",
];

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const { isCheckedIn, sessions, totalWorkMinutes, loading, fetchStatus, checkIn, checkOut } = useAttendanceStore();
    const [currentTip, setCurrentTip] = useState(0);
    const [showCorrectionModal, setShowCorrectionModal] = useState(false);
    const today = new Date();

    // Get user's role
    const getUserRole = (): string => {
        if (!user) return 'Employee';
        const roles = (user as any)?.roles || [];
        for (const role of roles) {
            const roleName = typeof role === 'string' ? role : role?.name || '';
            if (roleName.toLowerCase().includes('admin')) return 'Admin';
            if (roleName.toLowerCase().includes('hr')) return 'HR Manager';
        }
        return 'Employee';
    };

    const userRole = getUserRole();

    // Filter menu items based on user role
    const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

    // Fetch current attendance status on mount
    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    useEffect(() => {
        // Rotate tips every 10 seconds
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % tips.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

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

    // Mini calendar helpers
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const renderMiniCalendar = () => {
        const daysInMonth = getDaysInMonth(today);
        const firstDay = getFirstDayOfMonth(today);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<span key={`empty-${i}`} className={styles.calendarDayEmpty}></span>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today.getDate();
            days.push(
                <span
                    key={day}
                    className={`${styles.calendarDay} ${isToday ? styles.calendarToday : ''}`}
                >
                    {day}
                </span>
            );
        }

        return days;
    };

    return (
        <aside className={styles.sidebar}>
            <nav className={styles.nav}>
                <ul className={styles.menu}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        // Improved active state logic:
                        // - Exact match for specific paths like /transfer, /attendance
                        // - For sub-routes (e.g., /attendance/monitoring), only that item should be active
                        // - Parent routes should NOT be active when on a sub-route that has its own menu item

                        // Check if there's a more specific menu item that matches the current path
                        const hasMoreSpecificMatch = menuItems.some(
                            other => other.path !== item.path &&
                                other.path.startsWith(item.path + '/') &&
                                location.pathname.startsWith(other.path)
                        );

                        const isActive = hasMoreSpecificMatch
                            ? false  // Don't highlight parent if child is active
                            : (location.pathname === item.path ||
                                (item.path !== '/dashboard' &&
                                    item.path !== '/attendance' &&
                                    item.path !== '/transfer' &&
                                    location.pathname.startsWith(item.path + '/')));

                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                                >
                                    <Icon size={20} className={styles.menuIcon} />
                                    <span className={styles.menuLabel}>{item.label}</span>
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Clock In/Out Button */}
            <button
                className={`${styles.clockBtn} ${isCheckedIn ? styles.clockedIn : ''}`}
                onClick={handleClockAction}
                disabled={loading}
            >
                {isCheckedIn ? <LogOutIcon size={18} /> : <LogIn size={18} />}
                <span>{loading ? 'Processing...' : isCheckedIn ? 'Clock Out' : 'Clock In'}</span>
            </button>

            {/* Quick Stats */}
            <div className={styles.statsCard}>
                <div className={styles.statsHeader}>
                    <span>Today's Attendance</span>
                </div>
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <CheckCircle size={14} className={sessions.length > 0 ? styles.statIconGreen : styles.statIconGray} />
                        <span>{sessions.length > 0 ? `${sessions.length} session${sessions.length > 1 ? 's' : ''}` : 'No sessions'}</span>
                    </div>
                    <div className={styles.statItem}>
                        <Clock size={14} className={styles.statIconBlue} />
                        <span>
                            {totalWorkMinutes > 0
                                ? `${Math.floor(totalWorkMinutes / 60)}h ${totalWorkMinutes % 60}m worked`
                                : isCheckedIn ? 'Working...' : '0h 0m'
                            }
                        </span>
                    </div>
                </div>
                {sessions.length > 0 && !isCheckedIn && (
                    <button
                        className={styles.correctionBtn}
                        onClick={() => setShowCorrectionModal(true)}
                    >
                        📝 Request Correction
                    </button>
                )}
            </div>

            {/* Mini Calendar */}
            <div className={styles.calendarCard}>
                <div className={styles.calendarHeader}>
                    <Calendar size={14} />
                    <span>{today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className={styles.calendarDays}>
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className={styles.calendarGrid}>
                    {renderMiniCalendar()}
                </div>
            </div>

            {/* Daily Tip */}
            <div className={styles.tipCard}>
                <Lightbulb size={16} className={styles.tipIcon} />
                <p>{tips[currentTip]}</p>
            </div>

            {/* Company Branding */}
            <div className={styles.branding}>
                <div className={styles.brandingLogo}>
                    <span>●●●</span>
                </div>
                <span className={styles.brandingName}>StaffSphere</span>
                <span className={styles.brandingVersion}>v1.0.0</span>
            </div>

            {/* Correction Request Modal */}
            <CorrectionRequestModal
                isOpen={showCorrectionModal}
                onClose={() => setShowCorrectionModal(false)}
                onSuccess={() => fetchStatus()}
            />
        </aside>
    );
};

export default Sidebar;
