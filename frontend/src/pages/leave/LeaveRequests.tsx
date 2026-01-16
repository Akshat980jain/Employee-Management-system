import { useEffect, useState } from 'react';
import { Plus, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './LeaveRequests.module.css';

const LeaveRequests = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [balances, setBalances] = useState<any[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [requestsRes, balancesRes, typesRes] = await Promise.all([
                api.get('/leave/my/requests'),
                api.get('/leave/my/balances'),
                api.get('/leave/types'),
            ]);
            setRequests(requestsRes.data.data);
            setBalances(balancesRes.data.data);
            setLeaveTypes(typesRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
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
            toast.error(error.response?.data?.error?.message || 'Failed to submit');
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this request?')) return;
        try {
            await api.delete(`/leave/requests/${id}`);
            toast.success('Leave request cancelled');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to cancel');
        }
    };

    const statusColors: Record<string, string> = {
        PENDING: 'warning',
        APPROVED: 'success',
        AUTO_APPROVED: 'success',
        REJECTED: 'danger',
        CANCELLED: 'muted',
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Leave Management</h1>
                    <p>Request and track your leaves</p>
                </div>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Request Leave
                </button>
            </div>

            <div className={styles.balancesGrid}>
                {balances.map((balance) => {
                    const available = balance.opening + balance.accrued + balance.carryForward + balance.adjustment - balance.used;
                    return (
                        <div key={balance.id} className={styles.balanceCard}>
                            <div className={styles.balanceHeader}>
                                <span className={styles.balanceType}>{balance.leaveType?.name}</span>
                                <span className={styles.balanceCode}>{balance.leaveType?.code}</span>
                            </div>
                            <div className={styles.balanceValue}>{available}</div>
                            <div className={styles.balanceLabel}>days available</div>
                            <div className={styles.balanceUsed}>Used: {balance.used} | Total: {balance.accrued}</div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.section}>
                <h2>My Leave Requests</h2>
                <div className={styles.requestsList}>
                    {loading ? (
                        <p className={styles.loading}>Loading...</p>
                    ) : requests.length === 0 ? (
                        <p className={styles.empty}>No leave requests found</p>
                    ) : (
                        requests.map((request) => (
                            <div key={request.id} className={styles.requestCard}>
                                <div className={styles.requestInfo}>
                                    <div className={styles.requestType}>
                                        <Calendar size={18} />
                                        <span>{request.leaveType?.name}</span>
                                    </div>
                                    <div className={styles.requestDates}>
                                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                        <span className={styles.requestDays}>({request.days} days)</span>
                                    </div>
                                    {request.reason && <p className={styles.requestReason}>{request.reason}</p>}
                                </div>
                                <div className={styles.requestActions}>
                                    <span className={`${styles.status} ${styles[statusColors[request.status]]}`}>
                                        {request.status === 'AUTO_APPROVED' ? 'Auto Approved' : request.status}
                                    </span>
                                    {request.status === 'PENDING' && (
                                        <button
                                            className={styles.cancelBtn}
                                            onClick={() => handleCancel(request.id)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

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
                                    {leaveTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
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
                                <label>Reason (Optional)</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelModalBtn} onClick={() => setShowModal(false)}>
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

export default LeaveRequests;
