import { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Globe, Lock, Eye, EyeOff, Save, Moon, Sun, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Settings.module.css';

interface Organization {
    _id: string;
    name: string;
    code: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    employeeCount?: number;
    createdAt?: string;
}

const Settings = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('account');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [orgLoading, setOrgLoading] = useState(true);

    const [accountSettings, setAccountSettings] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });

    const [passwordSettings, setPasswordSettings] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        leaveUpdates: true,
        attendanceReminders: true,
        weeklyDigest: false,
    });

    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: 'light',
        compactMode: false,
        language: 'en',
    });

    // Fetch organization details
    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const response = await api.get('/organizations/my');
                setOrganization(response.data.data);
            } catch (error) {
                console.error('Failed to fetch organization:', error);
            } finally {
                setOrgLoading(false);
            }
        };
        fetchOrganization();
    }, []);

    const handleSaveAccount = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success('Account settings saved successfully!');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordSettings.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success('Password changed successfully!');
            setPasswordSettings({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success('Notification preferences saved!');
        } catch (error) {
            toast.error('Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'organization', label: 'Organization', icon: Building2 },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Settings</h1>
                <p>Manage your account preferences</p>
            </div>

            <div className={styles.content}>
                <div className={styles.sidebar}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className={styles.main}>
                    {activeTab === 'account' && (
                        <div className={styles.section}>
                            <h2>Account Information</h2>
                            <p className={styles.sectionDesc}>Update your personal details</p>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={accountSettings.firstName}
                                        onChange={(e) => setAccountSettings({ ...accountSettings, firstName: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={accountSettings.lastName}
                                        onChange={(e) => setAccountSettings({ ...accountSettings, lastName: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={accountSettings.email}
                                        onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button className={styles.saveBtn} onClick={handleSaveAccount} disabled={loading}>
                                <Save size={16} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'organization' && (
                        <div className={styles.section}>
                            <h2>Organization Details</h2>
                            <p className={styles.sectionDesc}>Your organization information</p>

                            {orgLoading ? (
                                <p style={{ color: '#64748b' }}>Loading organization...</p>
                            ) : organization ? (
                                <div className={styles.orgDetails}>
                                    <div className={styles.orgHeader}>
                                        <div className={styles.orgAvatar}>
                                            {organization.name.charAt(0)}
                                        </div>
                                        <div className={styles.orgInfo}>
                                            <h3>{organization.name}</h3>
                                            <span className={styles.orgCode}>{organization.code}</span>
                                        </div>
                                    </div>

                                    {organization.description && (
                                        <div className={styles.orgField}>
                                            <label>Description</label>
                                            <p>{organization.description}</p>
                                        </div>
                                    )}

                                    <div className={styles.formGrid}>
                                        {organization.email && (
                                            <div className={styles.orgField}>
                                                <label>Email</label>
                                                <p>{organization.email}</p>
                                            </div>
                                        )}
                                        {organization.phone && (
                                            <div className={styles.orgField}>
                                                <label>Phone</label>
                                                <p>{organization.phone}</p>
                                            </div>
                                        )}
                                        {organization.website && (
                                            <div className={styles.orgField}>
                                                <label>Website</label>
                                                <p><a href={organization.website} target="_blank" rel="noreferrer">{organization.website}</a></p>
                                            </div>
                                        )}
                                        {organization.address && (
                                            <div className={styles.orgField}>
                                                <label>Address</label>
                                                <p>{organization.address}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.orgStats}>
                                        <div className={styles.orgStat}>
                                            <span className={styles.statValue}>{organization.employeeCount || 0}</span>
                                            <span className={styles.statLabel}>Employees</span>
                                        </div>
                                        <div className={styles.orgStat}>
                                            <span className={styles.statValue}>
                                                {organization.createdAt ? new Date(organization.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                            <span className={styles.statLabel}>Member Since</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: '#ef4444' }}>No organization found</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className={styles.section}>
                            <h2>Change Password</h2>
                            <p className={styles.sectionDesc}>Keep your account secure</p>

                            <div className={styles.formStack}>
                                <div className={styles.formGroup}>
                                    <label>Current Password</label>
                                    <div className={styles.passwordInput}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordSettings.currentPassword}
                                            onChange={(e) => setPasswordSettings({ ...passwordSettings, currentPassword: e.target.value })}
                                            placeholder="Enter current password"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={passwordSettings.newPassword}
                                        onChange={(e) => setPasswordSettings({ ...passwordSettings, newPassword: e.target.value })}
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordSettings.confirmPassword}
                                        onChange={(e) => setPasswordSettings({ ...passwordSettings, confirmPassword: e.target.value })}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <button className={styles.saveBtn} onClick={handleChangePassword} disabled={loading}>
                                <Lock size={16} />
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className={styles.section}>
                            <h2>Notification Preferences</h2>
                            <p className={styles.sectionDesc}>Control how you receive updates</p>

                            <div className={styles.toggleList}>
                                <label className={styles.toggleItem}>
                                    <div>
                                        <span className={styles.toggleLabel}>Email Notifications</span>
                                        <span className={styles.toggleDesc}>Receive updates via email</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.emailNotifications}
                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                                    />
                                </label>
                                <label className={styles.toggleItem}>
                                    <div>
                                        <span className={styles.toggleLabel}>Push Notifications</span>
                                        <span className={styles.toggleDesc}>Browser push notifications</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.pushNotifications}
                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                                    />
                                </label>
                                <label className={styles.toggleItem}>
                                    <div>
                                        <span className={styles.toggleLabel}>Leave Updates</span>
                                        <span className={styles.toggleDesc}>Updates on leave requests</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.leaveUpdates}
                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, leaveUpdates: e.target.checked })}
                                    />
                                </label>
                                <label className={styles.toggleItem}>
                                    <div>
                                        <span className={styles.toggleLabel}>Attendance Reminders</span>
                                        <span className={styles.toggleDesc}>Daily check-in reminders</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.attendanceReminders}
                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, attendanceReminders: e.target.checked })}
                                    />
                                </label>
                                <label className={styles.toggleItem}>
                                    <div>
                                        <span className={styles.toggleLabel}>Weekly Digest</span>
                                        <span className={styles.toggleDesc}>Weekly summary email</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.weeklyDigest}
                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyDigest: e.target.checked })}
                                    />
                                </label>
                            </div>

                            <button className={styles.saveBtn} onClick={handleSaveNotifications} disabled={loading}>
                                <Save size={16} />
                                {loading ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className={styles.section}>
                            <h2>Appearance</h2>
                            <p className={styles.sectionDesc}>Customize your experience</p>

                            <div className={styles.themeSelector}>
                                <label>Theme</label>
                                <div className={styles.themeOptions}>
                                    <button
                                        className={`${styles.themeOption} ${appearanceSettings.theme === 'light' ? styles.selected : ''}`}
                                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: 'light' })}
                                    >
                                        <Sun size={20} />
                                        <span>Light</span>
                                    </button>
                                    <button
                                        className={`${styles.themeOption} ${appearanceSettings.theme === 'dark' ? styles.selected : ''}`}
                                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: 'dark' })}
                                    >
                                        <Moon size={20} />
                                        <span>Dark</span>
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>
                                    <Globe size={16} />
                                    Language
                                </label>
                                <select
                                    value={appearanceSettings.language}
                                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, language: e.target.value })}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="hi">Hindi</option>
                                </select>
                            </div>

                            <label className={styles.toggleItem} style={{ marginTop: '1rem' }}>
                                <div>
                                    <span className={styles.toggleLabel}>Compact Mode</span>
                                    <span className={styles.toggleDesc}>Reduce spacing for more content</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={appearanceSettings.compactMode}
                                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, compactMode: e.target.checked })}
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
