import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Clock,
    FileText,
    CheckCircle,
    XCircle,
    UserPlus,
    Calendar,
    Gift,
    Briefcase,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    Eye,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import JoinRequestsCard from '../../components/dashboard/JoinRequestsCard';
import styles from './HRDashboard.module.css';

interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    designation?: string;
    departmentId?: { name: string };
    status?: string;
    createdAt: string;
}

interface AttendanceRecord {
    _id: string;
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        employeeId: string;
    };
    status: string;
    isLate: boolean;
    checkIn?: string;
    checkOut?: string;
}


interface LeaveRequest {
    _id: string;
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        employeeId: string;
    };
    leaveTypeId: {
        _id: string;
        name: string;
        code: string;
        color?: string;
    };
    startDate: string;
    endDate: string;
    days: number;
    reason?: string;
    status: string;
    createdAt: string;
}

const HRDashboard = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeCount, setEmployeeCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
    const [leavesLoading, setLeavesLoading] = useState(true);
    const [expandedLeave, setExpandedLeave] = useState<string | null>(null);
    const [processingLeave, setProcessingLeave] = useState<string | null>(null);
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
    const [attendanceStats, setAttendanceStats] = useState({
        present: 0,
        late: 0,
        absent: 0,
        onLeave: 0,
        total: 0,
    });

    useEffect(() => {
        const fetchEmployeesAndAttendance = async () => {
            try {
                // Fetch employees and today's attendance in parallel
                const [empResponse, attendanceResponse] = await Promise.all([
                    api.get('/employees', { params: { limit: 10 } }),
                    api.get('/attendance/today'),
                ]);
                // Handle response: {success: true, data: {employees: [...], pagination: {...}}}
                const empData = empResponse.data?.data;
                const employeesData = empData?.employees || [];
                const attendanceData = attendanceResponse.data.data || [];

                console.log('Employees API response:', empResponse.data);
                console.log('Employees found:', employeesData.length);

                setEmployees(employeesData);
                setEmployeeCount(empData?.pagination?.total || employeesData.length);
                setTodayAttendance(attendanceData);

                // Calculate attendance stats - only Present, Absent, On Leave
                const present = attendanceData.filter((a: AttendanceRecord) => a.status === 'PRESENT').length;
                const total = employeesData.length || empResponse.data.data?.pagination?.total || 0;
                const checkedIn = attendanceData.length;
                const absent = Math.max(0, total - checkedIn);

                setAttendanceStats({
                    present,
                    late: 0, // Removed - no longer tracking late
                    absent,
                    onLeave: 0, // Will be updated when we have leave data
                    total,
                });
            } catch (error) {
                console.error('Failed to fetch employees/attendance:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployeesAndAttendance();
    }, []);

    useEffect(() => {
        const fetchPendingLeaves = async () => {
            try {
                const response = await api.get('/leave/pending');
                setPendingLeaves(response.data.data || []);
            } catch (error) {
                console.error('Failed to fetch pending leaves:', error);
            } finally {
                setLeavesLoading(false);
            }
        };
        fetchPendingLeaves();
    }, []);

    const stats = [
        { label: 'Pending Leaves', value: String(pendingLeaves.length), icon: FileText, color: 'orange' },
        { label: 'Total Employees', value: String(employeeCount), icon: Users, color: 'green' },
        { label: 'On Leave', value: '12', icon: Calendar, color: 'blue' },
        { label: 'Open Positions', value: '5', icon: Briefcase, color: 'purple' },
    ];

    const upcomingEvents = [
        { name: 'John Smith', event: 'Birthday', date: 'Jan 15', icon: Gift },
        { name: 'Emily & Mike', event: 'Work Anniversary', date: 'Jan 18', icon: TrendingUp },
        { name: 'Sarah Brown', event: 'Birthday', date: 'Jan 22', icon: Gift },
    ];

    const handleApprove = async (leaveId: string) => {
        setProcessingLeave(leaveId);
        try {
            await api.put(`/leave/requests/${leaveId}/approve`, { status: 'APPROVED' });
            setPendingLeaves(prev => prev.filter(l => l._id !== leaveId));
            toast.success('Leave request approved');
        } catch (error) {
            console.error('Failed to approve leave:', error);
            toast.error('Failed to approve leave request');
        } finally {
            setProcessingLeave(null);
        }
    };

    const handleReject = async (leaveId: string) => {
        const reason = prompt('Rejection reason (optional):');
        setProcessingLeave(leaveId);
        try {
            await api.put(`/leave/requests/${leaveId}/approve`, {
                status: 'REJECTED',
                reason: reason || undefined
            });
            setPendingLeaves(prev => prev.filter(l => l._id !== leaveId));
            toast.success('Leave request rejected');
        } catch (error) {
            console.error('Failed to reject leave:', error);
            toast.error('Failed to reject leave request');
        } finally {
            setProcessingLeave(null);
        }
    };

    const toggleExpand = (leaveId: string) => {
        setExpandedLeave(prev => prev === leaveId ? null : leaveId);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const formatFullDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>HR Dashboard</h1>
                    <p>Manage employees, leaves, and attendance</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles[stat.color]}`}>
                                <Icon size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{stat.value}</span>
                                <span className={styles.statLabel}>{stat.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.mainGrid}>
                {/* Pending Leave Requests */}
                <div className={`${styles.card} ${styles.wideCard}`}>
                    <div className={styles.cardHeader}>
                        <h3><FileText size={18} /> Pending Leave Requests</h3>
                        <Link to="/leave">View All</Link>
                    </div>
                    <div className={styles.leaveTable}>
                        {leavesLoading ? (
                            <p style={{ padding: '1rem', color: '#64748b' }}>Loading...</p>
                        ) : pendingLeaves.length === 0 ? (
                            <p style={{ padding: '1rem', color: '#64748b' }}>No pending leave requests</p>
                        ) : (
                            <>
                                <div className={styles.tableHeader}>
                                    <span>Employee</span>
                                    <span>Type</span>
                                    <span>Duration</span>
                                    <span>Dates</span>
                                    <span>Actions</span>
                                </div>
                                {pendingLeaves.map((leave) => (
                                    <div key={leave._id} className={styles.leaveCardWrapper}>
                                        <div
                                            className={`${styles.tableRow} ${styles.clickableRow}`}
                                            onClick={() => toggleExpand(leave._id)}
                                        >
                                            <span className={styles.employeeName}>
                                                {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                                                <span className={styles.expandIcon}>
                                                    {expandedLeave === leave._id ?
                                                        <ChevronUp size={14} /> :
                                                        <ChevronDown size={14} />
                                                    }
                                                </span>
                                            </span>
                                            <span className={styles.leaveType}>{leave.leaveTypeId?.name}</span>
                                            <span>{leave.days} day{leave.days > 1 ? 's' : ''}</span>
                                            <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                                            <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className={styles.approveBtn}
                                                    onClick={() => handleApprove(leave._id)}
                                                    disabled={processingLeave === leave._id}
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button
                                                    className={styles.rejectBtn}
                                                    onClick={() => handleReject(leave._id)}
                                                    disabled={processingLeave === leave._id}
                                                    title="Reject"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expandable Leave Details - Professional Email Format */}
                                        {expandedLeave === leave._id && (
                                            <div className={styles.leaveExpanded}>
                                                <div className={styles.emailContainer}>
                                                    <div className={styles.emailHeader}>
                                                        <strong>Subject:</strong> Leave Request - {leave.leaveTypeId?.name} ({leave.days} day{leave.days > 1 ? 's' : ''})
                                                    </div>
                                                    <div className={styles.emailBody}>
                                                        <p>Dear HR Manager,</p>
                                                        <p>
                                                            I am writing to formally request <strong>{leave.leaveTypeId?.name}</strong> from{' '}
                                                            <strong>{formatFullDate(leave.startDate)}</strong> to{' '}
                                                            <strong>{formatFullDate(leave.endDate)}</strong> ({leave.days} day{leave.days > 1 ? 's' : ''}).
                                                        </p>
                                                        {leave.reason && (
                                                            <>
                                                                <p><strong>Reason:</strong></p>
                                                                <p className={styles.reasonText}>{leave.reason}</p>
                                                            </>
                                                        )}
                                                        <p>
                                                            I kindly request your approval for this leave. Please let me know if you
                                                            require any additional information.
                                                        </p>
                                                        <p className={styles.emailSignature}>
                                                            Best regards,<br />
                                                            <strong>{leave.employeeId?.firstName} {leave.employeeId?.lastName}</strong><br />
                                                            <span className={styles.employeeIdText}>Employee ID: {leave.employeeId?.employeeId}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Pending Join Requests */}
                <JoinRequestsCard />

                {/* Staff Monitoring Quick Access */}
                <Link to="/attendance/monitoring" className={styles.card} style={{ textDecoration: 'none' }}>
                    <div className={styles.cardHeader}>
                        <h3><Eye size={18} /> Staff Monitoring</h3>
                    </div>
                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                        <Eye size={48} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                            Monitor attendance & performance of all staff including Admin and HR
                        </p>
                    </div>
                </Link>

                {/* Today's Attendance */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><Clock size={18} /> Today's Attendance</h3>
                    </div>
                    <div className={styles.attendanceStats}>
                        <div className={styles.attendanceCircle}>
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" className={styles.circleBack} />
                                <circle cx="50" cy="50" r="45" className={styles.circleFront}
                                    strokeDasharray="283"
                                    strokeDashoffset={attendanceStats.total > 0
                                        ? 283 - (283 * (attendanceStats.present + attendanceStats.late) / attendanceStats.total)
                                        : 283} />
                            </svg>
                            <div className={styles.circleText}>
                                <span className={styles.circleValue}>
                                    {attendanceStats.total > 0
                                        ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
                                        : 0}%
                                </span>
                                <span className={styles.circleLabel}>Present</span>
                            </div>
                        </div>
                        <div className={styles.attendanceBreakdown}>
                            <div className={styles.breakdownItem}>
                                <span className={styles.dotGreen}></span>
                                <span>Present: {attendanceStats.present}</span>
                            </div>
                            <div className={styles.breakdownItem}>
                                <span className={styles.dotRed}></span>
                                <span>Absent: {attendanceStats.absent}</span>
                            </div>
                            <div className={styles.breakdownItem}>
                                <span className={styles.dotBlue}></span>
                                <span>On Leave: {attendanceStats.onLeave}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Employees */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><UserPlus size={18} /> Employees</h3>
                        <Link to="/employees">View All</Link>
                    </div>
                    <div className={styles.hiresList}>
                        {loading ? (
                            <p style={{ padding: '1rem', color: '#64748b' }}>Loading...</p>
                        ) : employees.length === 0 ? (
                            <p style={{ padding: '1rem', color: '#64748b' }}>No employees found</p>
                        ) : (
                            employees.map((emp) => {
                                // Find attendance record for this employee
                                const attendance = todayAttendance.find(
                                    (a) => a.employeeId?._id === emp._id || a.employeeId?.employeeId === emp._id
                                );

                                // Determine status - only Present, On Leave, or Not Checked In
                                let statusText = 'Not Checked In';
                                let statusClass = styles.statusAbsent;

                                if (attendance) {
                                    if (attendance.status === 'PRESENT') {
                                        statusText = 'Present';
                                        statusClass = styles.statusPresent;
                                    } else if (attendance.status === 'ON_LEAVE') {
                                        statusText = 'On Leave';
                                        statusClass = styles.statusLeave;
                                    }
                                }

                                return (
                                    <div key={emp._id} className={styles.hireItem}>
                                        <div className={styles.hireAvatar}>
                                            {emp.firstName[0]}{emp.lastName?.[0] || ''}
                                        </div>
                                        <div className={styles.hireInfo}>
                                            <span className={styles.hireName}>{emp.firstName} {emp.lastName}</span>
                                            <span className={styles.hireRole}>{emp.designation || 'Employee'} • {emp.departmentId?.name || 'No Dept'}</span>
                                        </div>
                                        <span className={`${styles.statusBadge} ${statusClass}`}>
                                            {statusText}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><Calendar size={18} /> Upcoming Events</h3>
                    </div>
                    <div className={styles.eventsList}>
                        {upcomingEvents.map((event, index) => {
                            const Icon = event.icon;
                            return (
                                <div key={index} className={styles.eventItem}>
                                    <div className={styles.eventIcon}>
                                        <Icon size={18} />
                                    </div>
                                    <div className={styles.eventInfo}>
                                        <span className={styles.eventName}>{event.name}</span>
                                        <span className={styles.eventType}>{event.event}</span>
                                    </div>
                                    <span className={styles.eventDate}>{event.date}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
