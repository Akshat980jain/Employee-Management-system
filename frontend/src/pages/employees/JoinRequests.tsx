import { useState, useEffect } from 'react';
import { Users, Check, X, Clock, RefreshCw, Mail, Calendar } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './JoinRequests.module.css';

interface JoinRequest {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
        createdAt: string;
    };
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedRole: string;
    message?: string;
    createdAt: string;
    reviewedBy?: { firstName: string; lastName: string };
    reviewedAt?: string;
    rejectionReason?: string;
}

const JoinRequests = () => {
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const [requestsRes, countsRes] = await Promise.all([
                api.get(`/join-requests?status=${statusFilter}`),
                api.get('/join-requests/counts'),
            ]);
            setRequests(requestsRes.data.data || []);
            setCounts(countsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch join requests:', error);
            toast.error('Failed to load join requests');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const handleApprove = async (requestId: string) => {
        if (!confirm('Are you sure you want to approve this request? This will grant the user access to the organization.')) {
            return;
        }

        setProcessingId(requestId);
        try {
            await api.post(`/join-requests/${requestId}/approve`);
            toast.success('Request approved! User now has access.');
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to approve request');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: string) => {
        const reason = prompt('Enter a reason for rejection (optional):');

        setProcessingId(requestId);
        try {
            await api.post(`/join-requests/${requestId}/reject`, { rejectionReason: reason });
            toast.success('Request rejected');
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to reject request');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Join Requests</h1>
                    <p>Manage employee requests to join your organization</p>
                </div>
                <button className={styles.refreshBtn} onClick={fetchRequests} disabled={isLoading}>
                    <RefreshCw size={18} className={isLoading ? styles.spinning : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.pending}`}>
                    <Clock size={24} />
                    <div>
                        <span className={styles.statValue}>{counts.pending}</span>
                        <span className={styles.statLabel}>Pending</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.approved}`}>
                    <Check size={24} />
                    <div>
                        <span className={styles.statValue}>{counts.approved}</span>
                        <span className={styles.statLabel}>Approved</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.rejected}`}>
                    <X size={24} />
                    <div>
                        <span className={styles.statValue}>{counts.rejected}</span>
                        <span className={styles.statLabel}>Rejected</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
                {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        className={`${styles.filterTab} ${statusFilter === status ? styles.active : ''}`}
                        onClick={() => setStatusFilter(status)}
                    >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                        {status === 'PENDING' && counts.pending > 0 && (
                            <span className={styles.badge}>{counts.pending}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            <div className={styles.requestsList}>
                {isLoading ? (
                    <div className={styles.loadingState}>
                        <RefreshCw size={32} className={styles.spinning} />
                        <p>Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Users size={48} />
                        <h3>No {statusFilter.toLowerCase()} requests</h3>
                        <p>
                            {statusFilter === 'PENDING'
                                ? 'All join requests have been processed.'
                                : `No ${statusFilter.toLowerCase()} requests found.`}
                        </p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request._id} className={styles.requestCard}>
                            <div className={styles.userInfo}>
                                <div className={styles.avatar}>
                                    {request.userId.avatar ? (
                                        <img src={request.userId.avatar} alt="" />
                                    ) : (
                                        <span>
                                            {request.userId.firstName.charAt(0)}
                                            {request.userId.lastName.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.userDetails}>
                                    <h3>
                                        {request.userId.firstName} {request.userId.lastName}
                                    </h3>
                                    <div className={styles.meta}>
                                        <span>
                                            <Mail size={14} />
                                            {request.userId.email}
                                        </span>
                                        <span>
                                            <Calendar size={14} />
                                            Requested {formatDate(request.createdAt)}
                                        </span>
                                    </div>
                                    {request.message && (
                                        <p className={styles.message}>
                                            <strong>Message:</strong> {request.message}
                                        </p>
                                    )}
                                    {request.rejectionReason && (
                                        <p className={styles.rejectionReason}>
                                            <strong>Rejection reason:</strong> {request.rejectionReason}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.actions}>
                                {request.status === 'PENDING' ? (
                                    <>
                                        <button
                                            className={styles.approveBtn}
                                            onClick={() => handleApprove(request._id)}
                                            disabled={processingId === request._id}
                                        >
                                            <Check size={18} />
                                            Approve
                                        </button>
                                        <button
                                            className={styles.rejectBtn}
                                            onClick={() => handleReject(request._id)}
                                            disabled={processingId === request._id}
                                        >
                                            <X size={18} />
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <span className={`${styles.statusBadge} ${styles[request.status.toLowerCase()]}`}>
                                        {request.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JoinRequests;
