import { useState, useEffect } from 'react';
import { Search, Users, Clock, AlertCircle, CheckCircle, XCircle, Filter, Calendar, AlertTriangle, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './StaffMonitoring.module.css';

interface StaffMember {
    _id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    designation?: string;
    department?: string;
    avatar?: string;
    role: string;
    todayStatus: string;
    stats: {
        totalDays: number;
        presentDays: number;
        lateDays: number;
        totalWorkHours: string;
        avgWorkHours: string;
        onTimeRate: string;
    };
}

const StaffMonitoring = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    // Selection state
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

    // Warning modal state
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [warningSeverity, setWarningSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [isSubmittingWarning, setIsSubmittingWarning] = useState(false);
    const [singleWarningTarget, setSingleWarningTarget] = useState<string | null>(null);

    useEffect(() => {
        fetchStaffMonitoring();
    }, [searchQuery, roleFilter, dateRange]);

    const fetchStaffMonitoring = async () => {
        try {
            setLoading(true);
            const params: any = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            };
            if (searchQuery) params.search = searchQuery;
            if (roleFilter !== 'all') params.role = roleFilter;

            const response = await api.get('/attendance/staff-monitoring', { params });
            setStaff(response.data.data || []);
        } catch (error: any) {
            console.error('Failed to fetch staff monitoring data:', error);
            toast.error('Failed to load staff monitoring data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Checked In':
                return <CheckCircle size={16} className={styles.statusCheckedIn} />;
            case 'Checked Out':
                return <CheckCircle size={16} className={styles.statusCheckedOut} />;
            case 'On Leave':
                return <Calendar size={16} className={styles.statusOnLeave} />;
            default:
                return <XCircle size={16} className={styles.statusNotCheckedIn} />;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Checked In':
                return styles.badgeSuccess;
            case 'Checked Out':
                return styles.badgeInfo;
            case 'On Leave':
                return styles.badgeWarning;
            default:
                return styles.badgeDanger;
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'Admin':
                return styles.roleAdmin;
            case 'HR Manager':
                return styles.roleHR;
            default:
                return styles.roleEmployee;
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    // Selection handlers
    const handleSelectAll = () => {
        if (selectedEmployees.size === staff.length) {
            setSelectedEmployees(new Set());
        } else {
            setSelectedEmployees(new Set(staff.map(s => s._id)));
        }
    };

    const handleSelectEmployee = (employeeId: string) => {
        const newSelected = new Set(selectedEmployees);
        if (newSelected.has(employeeId)) {
            newSelected.delete(employeeId);
        } else {
            newSelected.add(employeeId);
        }
        setSelectedEmployees(newSelected);
    };

    // Warning handlers
    const openWarningModal = (singleEmployeeId?: string) => {
        if (singleEmployeeId) {
            setSingleWarningTarget(singleEmployeeId);
        } else {
            setSingleWarningTarget(null);
        }
        setWarningMessage('');
        setWarningSeverity('MEDIUM');
        setShowWarningModal(true);
    };

    const closeWarningModal = () => {
        setShowWarningModal(false);
        setWarningMessage('');
        setWarningSeverity('MEDIUM');
        setSingleWarningTarget(null);
    };

    const submitWarning = async () => {
        const targetIds = singleWarningTarget
            ? [singleWarningTarget]
            : Array.from(selectedEmployees);

        if (targetIds.length === 0) {
            toast.error('No employees selected');
            return;
        }

        if (!warningMessage.trim() || warningMessage.length < 5) {
            toast.error('Warning message must be at least 5 characters');
            return;
        }

        try {
            setIsSubmittingWarning(true);
            await api.post('/warnings', {
                employeeIds: targetIds,
                message: warningMessage.trim(),
                severity: warningSeverity,
            });

            toast.success(`Warning issued to ${targetIds.length} employee(s)`);
            closeWarningModal();
            setSelectedEmployees(new Set());
        } catch (error: any) {
            console.error('Failed to issue warning:', error);
            toast.error(error.response?.data?.error?.message || 'Failed to issue warning');
        } finally {
            setIsSubmittingWarning(false);
        }
    };

    // Calculate summary stats
    const summaryStats = {
        total: staff.length,
        checkedIn: staff.filter(s => s.todayStatus === 'Checked In').length,
        checkedOut: staff.filter(s => s.todayStatus === 'Checked Out').length,
        notCheckedIn: staff.filter(s => s.todayStatus === 'Not Checked In').length,
        onLeave: staff.filter(s => s.todayStatus === 'On Leave').length,
    };

    const isAllSelected = staff.length > 0 && selectedEmployees.size === staff.length;
    const isSomeSelected = selectedEmployees.size > 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>Staff Monitoring</h1>
                    <p>Monitor attendance and performance of all staff members</p>
                </div>
                {isSomeSelected && (
                    <div className={styles.bulkActions}>
                        <span className={styles.selectedCount}>
                            {selectedEmployees.size} selected
                        </span>
                        <button
                            className={styles.bulkWarningBtn}
                            onClick={() => openWarningModal()}
                        >
                            <AlertTriangle size={16} />
                            Issue Warning
                        </button>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className={styles.summaryCards}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                        <Users size={24} />
                    </div>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryValue}>{summaryStats.total}</span>
                        <span className={styles.summaryLabel}>Total Staff</span>
                    </div>
                </div>
                <div className={`${styles.summaryCard} ${styles.success}`}>
                    <div className={styles.summaryIcon}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryValue}>{summaryStats.checkedIn}</span>
                        <span className={styles.summaryLabel}>Checked In</span>
                    </div>
                </div>
                <div className={`${styles.summaryCard} ${styles.info}`}>
                    <div className={styles.summaryIcon}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryValue}>{summaryStats.checkedOut}</span>
                        <span className={styles.summaryLabel}>Checked Out</span>
                    </div>
                </div>
                <div className={`${styles.summaryCard} ${styles.danger}`}>
                    <div className={styles.summaryIcon}>
                        <XCircle size={24} />
                    </div>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryValue}>{summaryStats.notCheckedIn}</span>
                        <span className={styles.summaryLabel}>Not Checked In</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.selectAllWrapper}>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            disabled={staff.length === 0}
                        />
                        <span className={styles.checkmark}></span>
                        <span className={styles.selectAllLabel}>
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </span>
                    </label>
                </div>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <Filter size={16} />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className={styles.select}
                    >
                        <option value="all">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Employee">Employee</option>
                    </select>
                </div>
                <div className={styles.dateFilters}>
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className={styles.dateInput}
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className={styles.dateInput}
                    />
                </div>
            </div>

            {/* Staff Grid */}
            {loading ? (
                <div className={styles.loading}>Loading staff data...</div>
            ) : staff.length === 0 ? (
                <div className={styles.emptyState}>
                    <Users size={48} />
                    <h3>No staff members found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {staff.map((member) => (
                        <div
                            key={member._id}
                            className={`${styles.card} ${selectedEmployees.has(member._id) ? styles.cardSelected : ''}`}
                        >
                            <div className={styles.cardHeader}>
                                <label className={styles.cardCheckbox}>
                                    <input
                                        type="checkbox"
                                        checked={selectedEmployees.has(member._id)}
                                        onChange={() => handleSelectEmployee(member._id)}
                                    />
                                    <span className={styles.checkmark}></span>
                                </label>
                                <div className={styles.avatar}>
                                    {member.avatar ? (
                                        <img src={member.avatar} alt="" />
                                    ) : (
                                        getInitials(member.firstName, member.lastName)
                                    )}
                                </div>
                                <span className={`${styles.roleBadge} ${getRoleBadgeClass(member.role)}`}>
                                    {member.role}
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                <h3>{member.firstName} {member.lastName}</h3>
                                <p className={styles.designation}>{member.designation || 'Staff'}</p>
                                <p className={styles.employeeId}>{member.employeeId}</p>

                                <div className={`${styles.todayStatus} ${getStatusClass(member.todayStatus)}`}>
                                    {getStatusIcon(member.todayStatus)}
                                    <span>{member.todayStatus}</span>
                                </div>
                            </div>
                            <div className={styles.cardStats}>
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>{member.stats.presentDays}</span>
                                    <span className={styles.statLabel}>Days Present</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>{member.stats.avgWorkHours}h</span>
                                    <span className={styles.statLabel}>Avg Hours/Day</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>{member.stats.onTimeRate}%</span>
                                    <span className={styles.statLabel}>On-Time Rate</span>
                                </div>
                            </div>
                            <div className={styles.cardActions}>
                                <button
                                    className={styles.warningBtn}
                                    onClick={() => openWarningModal(member._id)}
                                    title="Issue Warning"
                                >
                                    <AlertTriangle size={14} />
                                    Warning
                                </button>
                            </div>
                            {parseInt(member.stats.onTimeRate) < 80 && (
                                <div className={styles.warningBanner}>
                                    <AlertCircle size={14} />
                                    <span>Low on-time rate</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Warning Modal */}
            {showWarningModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>
                                <AlertTriangle size={20} />
                                Issue Warning
                            </h2>
                            <button className={styles.closeBtn} onClick={closeWarningModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <p className={styles.modalInfo}>
                                {singleWarningTarget
                                    ? `Issuing warning to 1 employee`
                                    : `Issuing warning to ${selectedEmployees.size} employee(s)`
                                }
                            </p>

                            <div className={styles.formGroup}>
                                <label>Severity</label>
                                <div className={styles.severityOptions}>
                                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                                        <button
                                            key={level}
                                            className={`${styles.severityBtn} ${styles[`severity${level}`]} ${warningSeverity === level ? styles.active : ''}`}
                                            onClick={() => setWarningSeverity(level)}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Warning Message</label>
                                <textarea
                                    value={warningMessage}
                                    onChange={(e) => setWarningMessage(e.target.value)}
                                    placeholder="Enter warning message..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelBtn}
                                onClick={closeWarningModal}
                                disabled={isSubmittingWarning}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.submitBtn}
                                onClick={submitWarning}
                                disabled={isSubmittingWarning || !warningMessage.trim()}
                            >
                                {isSubmittingWarning ? 'Issuing...' : 'Issue Warning'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffMonitoring;
