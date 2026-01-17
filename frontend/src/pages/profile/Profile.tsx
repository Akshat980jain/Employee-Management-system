import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Building2, Shield, Calendar, Edit2, Camera, Save, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, fetchUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: (user as any).phone || '',
            });
        }
    }, [user]);

    const getInitials = () => {
        if (!user) return 'U';
        return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    };

    // Get full avatar URL (handles Base64 data URLs, relative and absolute URLs)
    const getAvatarUrl = () => {
        if (!user?.avatar) return null;
        // If Base64 data URL or absolute URL, return as-is
        if (user.avatar.startsWith('data:') || user.avatar.startsWith('http')) {
            return user.avatar;
        }
        // Prepend backend URL for relative paths (legacy support)
        const backendUrl = import.meta.env.PROD
            ? 'https://ems-backend-q0vm.onrender.com'
            : '';
        return `${backendUrl}${user.avatar}`;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            await api.post('/auth/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Profile photo updated');
            fetchUser();
        } catch (error) {
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // In a real app, this would call an API to update the user
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            fetchUser();
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: (user as any).phone || '',
            });
        }
    };

    const roles = (user as any)?.roles || [];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Profile</h1>
                <p>Manage your personal information</p>
            </div>

            <div className={styles.content}>
                <div className={styles.profileCard}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            {getAvatarUrl() ? (
                                <img src={getAvatarUrl()!} alt="Profile" className={styles.avatarImage} />
                            ) : (
                                getInitials()
                            )}
                            <button
                                className={styles.cameraBtn}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                <Camera size={16} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                hidden
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <h2>{user?.firstName} {user?.lastName}</h2>
                        <p>{user?.email}</p>
                        {roles.length > 0 && (
                            <div className={styles.roleBadges}>
                                {roles.map((role: any, index: number) => (
                                    <span key={index} className={styles.roleBadge}>
                                        {role.name || role}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.statsRow}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>12</span>
                            <span className={styles.statLabel}>Projects</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>89%</span>
                            <span className={styles.statLabel}>Tasks Done</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>4.8</span>
                            <span className={styles.statLabel}>Rating</span>
                        </div>
                    </div>
                </div>

                <div className={styles.detailsCard}>
                    <div className={styles.cardHeader}>
                        <h3>Personal Information</h3>
                        {!isEditing ? (
                            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                <Edit2 size={16} />
                                Edit
                            </button>
                        ) : (
                            <div className={styles.editActions}>
                                <button className={styles.cancelBtn} onClick={handleCancel}>
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
                                    <Save size={16} />
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>
                                <User size={16} />
                                First Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            ) : (
                                <span>{user?.firstName || '-'}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                <User size={16} />
                                Last Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            ) : (
                                <span>{user?.lastName || '-'}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                <Mail size={16} />
                                Email Address
                            </label>
                            <span>{user?.email || '-'}</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                <Phone size={16} />
                                Phone Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            ) : (
                                <span>{(user as any)?.phone || 'Not provided'}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                <Building2 size={16} />
                                Organization
                            </label>
                            <span>{(user as any)?.organization?.name || 'Demo Company'}</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                <Calendar size={16} />
                                Member Since
                            </label>
                            <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.permissionsCard}>
                    <div className={styles.cardHeader}>
                        <h3>
                            <Shield size={18} />
                            Your Role
                        </h3>
                    </div>
                    <div className={styles.roleInfo}>
                        {roles.length > 0 ? (
                            roles.map((role: any, index: number) => {
                                const roleName = role.name || role;
                                const roleDescriptions: Record<string, { description: string; access: string[] }> = {
                                    'Admin': {
                                        description: 'Full system access with administrative privileges',
                                        access: ['Manage Employees', 'Manage Departments', 'View Reports', 'System Settings']
                                    },
                                    'HR Manager': {
                                        description: 'Human Resources management capabilities',
                                        access: ['Manage Employees', 'Approve Leave', 'View Attendance', 'Manage Payroll']
                                    },
                                    'Employee': {
                                        description: 'Standard employee access',
                                        access: ['View Dashboard', 'Track Attendance', 'Request Leave', 'View Goals']
                                    }
                                };
                                const roleInfo = roleDescriptions[roleName] || roleDescriptions['Employee'];

                                return (
                                    <div key={index} className={styles.roleCard}>
                                        <div className={styles.roleHeader}>
                                            <span className={styles.roleName}>{roleName}</span>
                                        </div>
                                        <p className={styles.roleDescription}>{roleInfo.description}</p>
                                        <div className={styles.accessList}>
                                            <span className={styles.accessLabel}>You can access:</span>
                                            <div className={styles.accessTags}>
                                                {roleInfo.access.map((item, i) => (
                                                    <span key={i} className={styles.accessTag}>{item}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className={styles.noPermissions}>No role assigned</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
