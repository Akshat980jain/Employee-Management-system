import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Building2, User, Clock } from 'lucide-react';
import api from '../../services/api';
import styles from './EmployeeDetail.module.css';

interface EmployeeDetail {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: string;
    employmentType: string;
    workLocation: string;
    joinDate: string;
    designation?: string;
    department?: { id: string; name: string };
    manager?: { id: string; firstName: string; lastName: string };
    statusHistory: any[];
    leaveBalances: any[];
}

const EmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await api.get(`/employees/${id}`);
                setEmployee(response.data.data);
            } catch (error) {
                console.error('Failed to fetch employee:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id]);

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!employee) {
        return <div className={styles.notFound}>Employee not found</div>;
    }

    return (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                Back to Employees
            </button>

            <div className={styles.header}>
                <div className={styles.avatar}>
                    {employee.firstName[0]}{employee.lastName[0]}
                </div>
                <div className={styles.headerInfo}>
                    <h1>{employee.firstName} {employee.lastName}</h1>
                    <p>{employee.designation || 'No designation'}</p>
                    <span className={`${styles.status} ${styles[employee.status.toLowerCase().replace('_', '')]}`}>
                        {employee.status.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.section}>
                    <h2>Personal Information</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <Mail size={18} />
                            <div>
                                <span className={styles.label}>Email</span>
                                <span className={styles.value}>{employee.email}</span>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Phone size={18} />
                            <div>
                                <span className={styles.label}>Phone</span>
                                <span className={styles.value}>{employee.phone || 'Not provided'}</span>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <User size={18} />
                            <div>
                                <span className={styles.label}>Employee ID</span>
                                <span className={styles.value}>{employee.employeeId}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2>Employment Details</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <Building2 size={18} />
                            <div>
                                <span className={styles.label}>Department</span>
                                <span className={styles.value}>{employee.department?.name || 'Unassigned'}</span>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <User size={18} />
                            <div>
                                <span className={styles.label}>Manager</span>
                                <span className={styles.value}>
                                    {employee.manager
                                        ? `${employee.manager.firstName} ${employee.manager.lastName}`
                                        : 'No manager assigned'
                                    }
                                </span>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Calendar size={18} />
                            <div>
                                <span className={styles.label}>Join Date</span>
                                <span className={styles.value}>
                                    {new Date(employee.joinDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Clock size={18} />
                            <div>
                                <span className={styles.label}>Work Type</span>
                                <span className={styles.value}>
                                    {employee.employmentType.replace('_', ' ')} • {employee.workLocation}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2>Leave Balances</h2>
                    {employee.leaveBalances.length === 0 ? (
                        <p className={styles.empty}>No leave balances configured</p>
                    ) : (
                        <div className={styles.balanceGrid}>
                            {employee.leaveBalances.map((balance: any) => {
                                const available = balance.opening + balance.accrued + balance.carryForward + balance.adjustment - balance.used;
                                return (
                                    <div key={balance.id} className={styles.balanceCard}>
                                        <span className={styles.balanceType}>{balance.leaveType?.name}</span>
                                        <span className={styles.balanceValue}>{available} days</span>
                                        <span className={styles.balanceUsed}>Used: {balance.used}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={styles.section}>
                    <h2>Status History</h2>
                    {employee.statusHistory.length === 0 ? (
                        <p className={styles.empty}>No status changes recorded</p>
                    ) : (
                        <div className={styles.timeline}>
                            {employee.statusHistory.map((history: any, index: number) => (
                                <div key={index} className={styles.timelineItem}>
                                    <div className={styles.timelineDot} />
                                    <div className={styles.timelineContent}>
                                        <span className={styles.timelineStatus}>
                                            {history.fromStatus && `${history.fromStatus} → `}{history.toStatus}
                                        </span>
                                        <span className={styles.timelineDate}>
                                            {new Date(history.createdAt).toLocaleDateString()}
                                        </span>
                                        {history.notes && <p className={styles.timelineNotes}>{history.notes}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetail;
