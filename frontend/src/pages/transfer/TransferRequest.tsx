import { useState, useEffect } from 'react';
import { Building2, Upload, Send, FileText, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './TransferRequest.module.css';

interface Organization {
    _id: string;
    id?: string;
    name: string;
    slug?: string;
}

interface TransferRequest {
    _id: string;
    toOrganizationId: { _id: string; name: string };
    fromOrganizationId: { _id: string; name: string };
    status: string;
    requestedRole: string;
    expiresAt: string;
    createdAt: string;
}

const TransferRequest = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [myRequests, setMyRequests] = useState<TransferRequest[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [requestedRole, setRequestedRole] = useState('Employee');
    const [message, setMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchOrganizations();
        fetchMyRequests();
    }, []);

    const fetchOrganizations = async () => {
        setLoadingOrgs(true);
        try {
            // Use public endpoint to get all registered organizations
            const response = await api.get('/organizations/public');
            setOrganizations(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        } finally {
            setLoadingOrgs(false);
        }
    };

    const fetchMyRequests = async () => {
        try {
            const response = await api.get('/transfer-requests/my');
            setMyRequests(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedOrgId) {
            toast.error('Please select a target organization');
            return;
        }

        if (!file) {
            toast.error('Please upload your offer letter');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('toOrganizationId', selectedOrgId);
            formData.append('requestedRole', requestedRole);
            formData.append('message', message);
            formData.append('offerLetter', file);

            await api.post('/transfer-requests', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Transfer request submitted successfully!');
            setSelectedOrgId('');
            setFile(null);
            setMessage('');
            fetchMyRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (requestId: string) => {
        try {
            await api.delete(`/transfer-requests/${requestId}`);
            toast.success('Request cancelled');
            fetchMyRequests();
        } catch (error) {
            toast.error('Failed to cancel request');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusStyles: Record<string, string> = {
            PENDING: styles.statusPending,
            APPROVED: styles.statusApproved,
            REJECTED: styles.statusRejected,
            EXPIRED: styles.statusExpired,
            CANCELLED: styles.statusCancelled,
        };
        return statusStyles[status] || styles.statusPending;
    };

    const getDaysRemaining = (expiresAt: string) => {
        const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} days left` : 'Expired';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1><Building2 size={24} /> Transfer to Another Organization</h1>
                <p>Submit a request to transfer to a new organization with your offer letter</p>
            </div>

            <div className={styles.content}>
                {/* New Request Form */}
                <div className={styles.card}>
                    <h2>Submit Transfer Request</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Organization Dropdown */}
                        <div className={styles.formGroup}>
                            <label>Select Organization</label>
                            <div className={styles.selectWrapper}>
                                <select
                                    value={selectedOrgId}
                                    onChange={(e) => setSelectedOrgId(e.target.value)}
                                    disabled={loadingOrgs}
                                >
                                    <option value="">
                                        {loadingOrgs ? 'Loading organizations...' : '-- Select an organization --'}
                                    </option>
                                    {organizations.map((org) => (
                                        <option key={org._id || org.id} value={org._id || org.id}>
                                            {org.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className={styles.selectIcon} />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className={styles.formGroup}>
                            <label>Requested Role</label>
                            <select
                                value={requestedRole}
                                onChange={(e) => setRequestedRole(e.target.value)}
                            >
                                <option value="Employee">Employee</option>
                                <option value="HR Manager">HR Manager</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        {/* Offer Letter Upload */}
                        <div className={styles.formGroup}>
                            <label>Offer Letter Document *</label>
                            <div className={styles.uploadArea}>
                                <input
                                    type="file"
                                    id="offerLetter"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    hidden
                                />
                                <label htmlFor="offerLetter" className={styles.uploadLabel}>
                                    {file ? (
                                        <>
                                            <FileText size={24} />
                                            <span>{file.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={24} />
                                            <span>Click to upload offer letter</span>
                                            <small>PDF, DOC, DOCX, or Image (max 5MB)</small>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Message */}
                        <div className={styles.formGroup}>
                            <label>Message (Optional)</label>
                            <textarea
                                placeholder="Add a message for the HR team..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={submitting || !selectedOrgId || !file}
                        >
                            <Send size={18} />
                            {submitting ? 'Submitting...' : 'Submit Transfer Request'}
                        </button>
                    </form>
                </div>

                {/* My Requests */}
                <div className={styles.card}>
                    <h2>My Transfer Requests</h2>
                    <div className={styles.requestsList}>
                        {myRequests.length === 0 ? (
                            <p className={styles.emptyState}>No transfer requests yet</p>
                        ) : (
                            myRequests.map((request) => (
                                <div key={request._id} className={styles.requestItem}>
                                    <div className={styles.requestInfo}>
                                        <span className={styles.orgName}>
                                            To: {request.toOrganizationId?.name}
                                        </span>
                                        <span className={styles.role}>
                                            Role: {request.requestedRole}
                                        </span>
                                        {request.status === 'PENDING' && (
                                            <span className={styles.expiry}>
                                                {getDaysRemaining(request.expiresAt)}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.requestActions}>
                                        <span className={`${styles.statusBadge} ${getStatusBadge(request.status)}`}>
                                            {request.status}
                                        </span>
                                        {request.status === 'PENDING' && (
                                            <button
                                                className={styles.cancelBtn}
                                                onClick={() => handleCancel(request._id)}
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
            </div>
        </div>
    );
};

export default TransferRequest;
