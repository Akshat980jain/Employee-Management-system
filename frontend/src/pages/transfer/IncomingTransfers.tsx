import { useState, useEffect } from 'react';
import { FileCheck, Eye, Check, X, Clock, Building2, User } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './IncomingTransfers.module.css';

interface TransferRequest {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
    };
    fromOrganizationId: { _id: string; name: string };
    toOrganizationId: { _id: string; name: string };
    offerLetterUrl: string;
    requestedRole: string;
    message?: string;
    status: string;
    expiresAt: string;
    createdAt: string;
}

const IncomingTransfers = () => {
    const [requests, setRequests] = useState<TransferRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/transfer-requests/incoming');
            setRequests(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async (requestId: string) => {
        try {
            const response = await api.get(`/transfer-requests/${requestId}/document`, {
                responseType: 'blob'
            });
            const url = URL.createObjectURL(response.data);
            setPreviewUrl(url);
        } catch (error) {
            toast.error('Failed to load document');
        }
    };

    const handleApprove = async (requestId: string) => {
        setProcessingId(requestId);
        try {
            await api.put(`/transfer-requests/${requestId}/approve`);
            toast.success('Transfer approved! Employee has been transferred.');
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to approve');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: string) => {
        setProcessingId(requestId);
        try {
            await api.put(`/transfer-requests/${requestId}/reject`, {
                rejectionReason
            });
            toast.success('Transfer request rejected');
            setRejectingId(null);
            setRejectionReason('');
            fetchRequests();
        } catch (error) {
            toast.error('Failed to reject request');
        } finally {
            setProcessingId(null);
        }
    };

    const getDaysRemaining = (expiresAt: string) => {
        const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} days left` : 'Expired';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1><FileCheck size={24} /> Incoming Transfer Requests</h1>
                <p>Review and verify offer letters from employees requesting to join</p>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : requests.length === 0 ? (
                <div className={styles.emptyState}>
                    <FileCheck size={48} />
                    <h3>No Pending Requests</h3>
                    <p>There are no transfer requests waiting for verification</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {requests.map((request) => (
                        <div key={request._id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>
                                        {request.userId?.avatar ? (
                                            <img src={request.userId.avatar} alt="" />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <h3>{request.userId?.firstName} {request.userId?.lastName}</h3>
                                        <span>{request.userId?.email}</span>
                                    </div>
                                </div>
                                <div className={styles.expiry}>
                                    <Clock size={14} />
                                    {getDaysRemaining(request.expiresAt)}
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.detail}>
                                    <Building2 size={16} />
                                    <span>From: {request.fromOrganizationId?.name}</span>
                                </div>
                                <div className={styles.detail}>
                                    <span className={styles.roleTag}>{request.requestedRole}</span>
                                </div>
                                {request.message && (
                                    <p className={styles.message}>"{request.message}"</p>
                                )}
                                <div className={styles.meta}>
                                    Submitted on {formatDate(request.createdAt)}
                                </div>
                            </div>

                            <div className={styles.cardActions}>
                                <button
                                    className={styles.previewBtn}
                                    onClick={() => handlePreview(request._id)}
                                >
                                    <Eye size={16} />
                                    View Offer Letter
                                </button>

                                {rejectingId === request._id ? (
                                    <div className={styles.rejectForm}>
                                        <input
                                            type="text"
                                            placeholder="Reason for rejection (optional)"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        <div className={styles.rejectActions}>
                                            <button
                                                onClick={() => handleReject(request._id)}
                                                disabled={processingId === request._id}
                                            >
                                                Confirm
                                            </button>
                                            <button onClick={() => setRejectingId(null)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.actionBtns}>
                                        <button
                                            className={styles.approveBtn}
                                            onClick={() => handleApprove(request._id)}
                                            disabled={processingId === request._id}
                                        >
                                            <Check size={16} />
                                            Approve
                                        </button>
                                        <button
                                            className={styles.rejectBtn}
                                            onClick={() => setRejectingId(request._id)}
                                            disabled={processingId === request._id}
                                        >
                                            <X size={16} />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Document Preview Modal */}
            {previewUrl && (
                <div className={styles.modal} onClick={() => setPreviewUrl(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Offer Letter Preview</h3>
                            <button onClick={() => setPreviewUrl(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <iframe src={previewUrl} title="Offer Letter Preview" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomingTransfers;
