import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users,
    Building2,
    TrendingUp,
    Clock,
    Shield,
    UserPlus,
    Eye,
} from 'lucide-react';
import api from '../../services/api';
import JoinRequestsCard from '../../components/dashboard/JoinRequestsCard';
import styles from './AdminDashboard.module.css';

interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    designation?: string;
    departmentId?: { name: string };
    userId?: { avatar?: string };
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
    checkIn?: string;
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeCount, setEmployeeCount] = useState(0);
    const [departmentCount, setDepartmentCount] = useState(0);
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [empResponse, attendanceResponse, deptResponse] = await Promise.all([
                    api.get('/employees', { params: { limit: 8 } }),
                    api.get('/attendance/today'),
                    api.get('/organizations/departments'),
                ]);

                const empData = empResponse.data?.data;
                const employeesData = empData?.employees || [];
                const attendanceData = attendanceResponse.data.data || [];
                const departments = deptResponse.data.data || [];

                setEmployees(employeesData);
                setEmployeeCount(empData?.pagination?.total || employeesData.length);
                setTodayAttendance(attendanceData);
                setDepartmentCount(departments.length);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const stats = [
        { label: 'Total Employees', value: String(employeeCount), change: '', icon: Users, color: 'blue' },
        { label: 'Departments', value: String(departmentCount), change: '', icon: Building2, color: 'purple' },
        { label: 'Present Today', value: String(todayAttendance.length), change: '', icon: Clock, color: 'green' },
        { label: 'Active Projects', value: '12', change: '', icon: TrendingUp, color: 'orange' },
    ];

    const quickActions = [
        { label: 'Staff Monitoring', icon: Eye, color: 'blue', path: '/attendance/monitoring' },
        { label: 'View Employees', icon: Users, color: 'purple', path: '/employees' },
        { label: 'Create Department', icon: Building2, color: 'green', path: '/departments' },
        { label: 'Manage Roles', icon: Shield, color: 'orange', path: '/settings' },
    ];

    const systemHealth = [
        { label: 'Server Status', status: 'Operational', healthy: true },
        { label: 'Database', status: 'Connected', healthy: true },
        { label: 'API Response', status: '45ms avg', healthy: true },
        { label: 'Storage', status: '68% used', healthy: true },
    ];

    const getEmployeeStatus = (empId: string) => {
        const attendance = todayAttendance.find(
            (a) => a.employeeId?._id === empId || a.employeeId?.employeeId === empId
        );

        if (attendance) {
            if (attendance.status === 'PRESENT') {
                return { text: 'Present', class: styles.statusPresent };
            } else if (attendance.status === 'ON_LEAVE') {
                return { text: 'On Leave', class: styles.statusLeave };
            }
        }
        return { text: 'Not Checked In', class: styles.statusAbsent };
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back! Here's your organization overview</p>
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
                            {stat.change && <span className={styles.statChange}>{stat.change}</span>}
                        </div>
                    );
                })}
            </div>

            <div className={styles.mainGrid}>
                {/* Pending Join Requests - Priority Section */}
                <JoinRequestsCard />

                {/* Employees Section */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><UserPlus size={18} /> Employees</h3>
                        <Link to="/employees">View All</Link>
                    </div>
                    <div className={styles.employeeList}>
                        {loading ? (
                            <p className={styles.loadingText}>Loading...</p>
                        ) : employees.length === 0 ? (
                            <p className={styles.emptyText}>No employees found</p>
                        ) : (
                            employees.map((emp) => {
                                const status = getEmployeeStatus(emp._id);
                                return (
                                    <div key={emp._id} className={styles.employeeItem}>
                                        <div className={styles.employeeAvatar}>
                                            {emp.userId?.avatar ? (
                                                <img src={emp.userId.avatar} alt="" />
                                            ) : (
                                                `${emp.firstName[0]}${emp.lastName?.[0] || ''}`
                                            )}
                                        </div>
                                        <div className={styles.employeeInfo}>
                                            <span className={styles.employeeName}>{emp.firstName} {emp.lastName}</span>
                                            <span className={styles.employeeRole}>{emp.designation || 'Employee'}</span>
                                        </div>
                                        <span className={`${styles.statusBadge} ${status.class}`}>
                                            {status.text}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><Clock size={18} /> Quick Actions</h3>
                    </div>
                    <div className={styles.quickActions}>
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <button key={index} className={styles.quickActionBtn} onClick={() => navigate(action.path)}>
                                    <div className={`${styles.actionIcon} ${styles[action.color]}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span>{action.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* System Health */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><Shield size={18} /> System Health</h3>
                    </div>
                    <div className={styles.healthList}>
                        {systemHealth.map((item, index) => (
                            <div key={index} className={styles.healthItem}>
                                <span className={styles.healthLabel}>{item.label}</span>
                                <div className={styles.healthStatus}>
                                    <span className={item.healthy ? styles.healthy : styles.unhealthy}>
                                        {item.status}
                                    </span>
                                    <div className={`${styles.statusDot} ${item.healthy ? styles.healthy : styles.unhealthy}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
