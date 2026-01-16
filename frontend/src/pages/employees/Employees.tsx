import { useState, useEffect } from 'react';
import { Search, Mail, Users } from 'lucide-react';
import api from '../../services/api';
import styles from './Employees.module.css';

interface Employee {
    _id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    designation?: string;
    departmentId?: { name: string };
    userId?: { avatar?: string };
    status: string;
    joinDate: string;
}

const Employees = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, [searchQuery, statusFilter]);

    const fetchEmployees = async () => {
        try {
            const params: any = {};
            if (searchQuery) params.search = searchQuery;
            if (statusFilter) params.status = statusFilter;

            const response = await api.get('/employees', { params });
            setEmployees(response.data.data?.employees || []);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: '#10b981',
            HIRED: '#6366f1',
            ON_PROBATION: '#f59e0b',
            ON_LEAVE: '#3b82f6',
            RESIGNED: '#6b7280',
            TERMINATED: '#ef4444',
        };
        return colors[status] || '#6b7280';
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Employees</h1>
                    <p>View all registered employees in your organization</p>
                </div>
                <div className={styles.statsInfo}>
                    <Users size={20} />
                    <span>{employees.length} employees</span>
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.select}
                >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="HIRED">Hired</option>
                    <option value="ON_PROBATION">On Probation</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="RESIGNED">Resigned</option>
                </select>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading employees...</div>
            ) : employees.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>👥</div>
                    <h3>No employees found</h3>
                    <p>Employees will appear here once they register an account</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {employees.map((employee) => (
                        <div key={employee._id} className={styles.card}>
                            {/* Large centered avatar */}
                            <div className={styles.avatarSection}>
                                <div className={styles.avatar}>
                                    {employee.userId?.avatar ? (
                                        <img src={employee.userId.avatar} alt="" className={styles.avatarImg} />
                                    ) : (
                                        getInitials(employee.firstName, employee.lastName)
                                    )}
                                </div>
                            </div>
                            {/* Employee details below */}
                            <div className={styles.cardBody}>
                                <h3>{employee.firstName} {employee.lastName}</h3>
                                <p className={styles.designation}>
                                    {employee.designation || 'Employee'}
                                </p>
                                <span
                                    className={styles.status}
                                    style={{ backgroundColor: `${getStatusColor(employee.status)}15`, color: getStatusColor(employee.status) }}
                                >
                                    {employee.status.replace('_', ' ')}
                                </span>
                                <div className={styles.emailInfo}>
                                    <Mail size={14} />
                                    <span>{employee.email}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Employees;
