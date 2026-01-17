import { useState, useEffect } from 'react';
import { Plus, Calendar, Check, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Leave.module.css';

interface LeaveRequest {
    _id: string;
    employeeId: { firstName: string; lastName: string };
    leaveTypeId: { name: string; code: string; color: string };
    startDate: string;
    endDate: string;
    days: number;
    reason?: string;
    status: string;
    createdAt: string;
}

interface LeaveType {
    _id: string;
    name: string;
    code: string;
    color: string;
}

const Leave = () => {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [formData, setFormData] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: '',
    });

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            const [requestsRes, typesRes] = await Promise.all([
                api.get('/leave/requests', { params: statusFilter ? { status: statusFilter } : {} }),
                api.get('/leave/types'),
            ]);
            setRequests(requestsRes.data.data?.requests || []);
            setLeaveTypes(typesRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch leave data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/leave/requests', formData);
            toast.success('Leave request submitted');
            setShowModal(false);
            setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to submit request');
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await api.put(`/leave/requests/${id}/approve`, { status: 'APPROVED' });
            toast.success('Request approved');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to approve');
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.put(`/leave/requests/${id}/approve`, { status: 'REJECTED', rejectionReason: 'Rejected by admin' });
            toast.success('Request rejected');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to reject');
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: '#f59e0b',
            APPROVED: '#10b981',
            REJECTED: '#ef4444',
            CANCELLED: '#6b7280',
        };
        return colors[status] || '#6b7280';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Leave Management</h1>
                    <p>Request and manage time off</p>
                </div>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    New Request
                </button>
            </div>

            <div className={styles.filters}>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.select}
                >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : requests.length === 0 ? (
                <div className={styles.emptyState}>
                    <Calendar size={48} />
                    <h3>No leave requests</h3>
                    <p>Submit a new leave request to get started</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {requests.map((req) => (
                        <div key={req._id} className={styles.card}>
                            <div className={styles.cardLeft}>
                                <div
                                    className={styles.leaveType}
                                    style={{ backgroundColor: `${req.leaveTypeId?.color}20`, color: req.leaveTypeId?.color }}
                                >
                                    {req.leaveTypeId?.code || 'N/A'}
                                </div>
                                <div className={styles.cardInfo}>
                                    <h3>{req.leaveTypeId?.name || 'Leave'}</h3>
                                    <div className={styles.dates}>
                                        <Calendar size={14} />
                                        <span>
                                            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                        </span>
                                        <span className={styles.days}>{req.days} days</span>
                                    </div>
                                    {req.reason && <p className={styles.reason}>{req.reason}</p>}
                                </div>
                            </div>
                            <div className={styles.cardRight}>
                                <span
                                    className={styles.status}
                                    style={{ backgroundColor: `${getStatusColor(req.status)}15`, color: getStatusColor(req.status) }}
                                >
                                    {req.status}
                                </span>
                                {req.status === 'PENDING' && (
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.approveBtn}
                                            onClick={() => handleApprove(req._id)}
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            className={styles.rejectBtn}
                                            onClick={() => handleReject(req._id)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Request Leave</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Leave Type</label>
                                <select
                                    value={formData.leaveTypeId}
                                    onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                                    required
                                >
                                    <option value="">Select type</option>
                                    {leaveTypes.map((lt) => (
                                        <option key={lt._id} value={lt._id}>{lt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Reason</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="Brief reason for leave..."
                                    rows={3}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leave;
