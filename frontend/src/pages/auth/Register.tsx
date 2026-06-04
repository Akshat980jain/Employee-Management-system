import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldAlert, Briefcase, BadgeInfo, Check, ChevronDown, Plus, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PublicOrganization } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Register.module.css';

// Reusable custom node-link logo matching the images
const ProEmpowerLogo = ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#2E31E6" />
        <circle cx="16" cy="16" r="3.5" stroke="white" strokeWidth="2.5" />
        <circle cx="10" cy="10" r="2.5" stroke="white" strokeWidth="2" />
        <circle cx="22" cy="10" r="2.5" stroke="white" strokeWidth="2" />
        <circle cx="16" cy="23" r="2.5" stroke="white" strokeWidth="2" />
        <line x1="11.5" y1="11.5" x2="13.5" y2="13.5" stroke="white" strokeWidth="2" />
        <line x1="20.5" y1="11.5" x2="18.5" y2="13.5" stroke="white" strokeWidth="2" />
        <line x1="16" y1="20.5" x2="16" y2="18.5" stroke="white" strokeWidth="2" />
    </svg>
);

const Register = () => {
    const navigate = useNavigate();
    const { register, isLoading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [organizations, setOrganizations] = useState<PublicOrganization[]>([]);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
    
    // Organization mode: 'join' = join existing, 'create' = create new
    const [organizationMode, setOrganizationMode] = useState<'join' | 'create'>('join');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Employee',
        organizationId: '',
        organizationName: '',
    });

    // Fetch organizations on mount
    useEffect(() => {
        const fetchOrganizations = async () => {
            setIsLoadingOrgs(true);
            try {
                const response = await api.get('/organizations/public');
                setOrganizations(response.data.data || []);
            } catch (error) {
                console.error('Failed to fetch organizations:', error);
            } finally {
                setIsLoadingOrgs(false);
            }
        };

        fetchOrganizations();
    }, []);

    // Reset organization fields when mode changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            organizationId: '',
            organizationName: '',
        }));
    }, [organizationMode]);

    // Employees can only join, not create - force join mode when Employee is selected
    useEffect(() => {
        if (formData.role === 'Employee') {
            setOrganizationMode('join');
        }
    }, [formData.role]);

    const roles = [
        { value: 'Admin', label: 'Admin', description: 'Full organizational control', icon: ShieldAlert },
        { value: 'HR Manager', label: 'HR Manager', description: 'Manage people & roles', icon: Briefcase },
        { value: 'Employee', label: 'Employee', description: 'Join existing team', icon: BadgeInfo },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        // Validate based on organization mode
        if (organizationMode === 'join' && !formData.organizationId) {
            toast.error('Please select an organization to join');
            return;
        }

        if (organizationMode === 'create' && !formData.organizationName.trim()) {
            toast.error('Please enter your organization name');
            return;
        }

        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        try {
            const result = await register({
                email: formData.email,
                password: formData.password,
                firstName,
                lastName,
                organizationName: organizationMode === 'create' ? formData.organizationName : undefined,
                organizationId: organizationMode === 'join' ? formData.organizationId : undefined,
                role: formData.role,
            });

            if (result.pendingVerification) {
                toast.success('Account created! Waiting for organization approval.');
                navigate('/pending-verification');
            } else {
                toast.success('Account created successfully!');
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Registration failed');
        }
    };

    return (
        <div className={styles.container}>
            {/* Top Navigation Header bar */}
            <header className={styles.headerBar}>
                <div className={styles.headerContent}>
                    <ProEmpowerLogo size={26} />
                    <span className={styles.logoTextMain}>ProEmpower<span className={styles.logoTextSub}>EMS</span></span>
                </div>
            </header>

            {/* Centered Registration Panel */}
            <div className={styles.mainContent}>
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <h2>Create your workspace</h2>
                        <p>Join 500+ modern organizations boosting their HR efficiency.</p>
                    </div>

                    <button type="button" className={styles.googleBtn}>
                        <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '8px' }}>
                            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
                            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z" />
                            <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A8 8 0 0 0 1.83 5.4l2.67 2.07a4.8 4.8 0 0 1 4.48-3.9z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className={styles.divider}>
                        <span>OR REGISTER WITH EMAIL</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Work Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        {/* Redesigned Vertical Stack Role Options */}
                        <div className={styles.formGroup}>
                            <label>Select Your Role</label>
                            <div className={styles.roleSelectorVertical}>
                                {roles.map((role) => {
                                    const RoleIcon = role.icon;
                                    const isSelected = formData.role === role.value;
                                    return (
                                        <button
                                            key={role.value}
                                            type="button"
                                            className={`${styles.roleCard} ${isSelected ? styles.roleCardSelected : ''}`}
                                            onClick={() => setFormData({ ...formData, role: role.value })}
                                        >
                                            <div className={styles.roleCardLeft}>
                                                <div className={`${styles.roleIconWrapper} ${isSelected ? styles.roleIconSelected : ''}`}>
                                                    <RoleIcon size={18} />
                                                </div>
                                                <div className={styles.roleCardText}>
                                                    <h4>{role.label}</h4>
                                                    <p>{role.description}</p>
                                                </div>
                                            </div>
                                            <div className={`${styles.roleCheck} ${isSelected ? styles.roleCheckActive : ''}`}>
                                                {isSelected && <Check size={14} strokeWidth={3} className={styles.checkIcon} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Organization Mode Selector - Only for Admin/HR Manager */}
                        {formData.role !== 'Employee' && (
                            <div className={styles.formGroup}>
                                <label>Organization Management</label>
                                <div className={styles.modeSelector}>
                                    <button
                                        type="button"
                                        className={`${styles.modeOption} ${organizationMode === 'join' ? styles.modeSelected : ''}`}
                                        onClick={() => setOrganizationMode('join')}
                                    >
                                        <UserPlus size={16} />
                                        <span>Join Existing</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.modeOption} ${organizationMode === 'create' ? styles.modeSelected : ''}`}
                                        onClick={() => setOrganizationMode('create')}
                                    >
                                        <Plus size={16} />
                                        <span>Create New</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Organization Selection - Join Existing */}
                        {organizationMode === 'join' && (
                            <div className={styles.formGroup}>
                                <label htmlFor="organizationId">Join Organization</label>
                                <div className={styles.selectWrapper}>
                                    <select
                                        id="organizationId"
                                        value={formData.organizationId}
                                        onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                                        required
                                        disabled={isLoadingOrgs}
                                    >
                                        <option value="">
                                            {isLoadingOrgs ? 'Loading organizations...' : 'Choose an organization'}
                                        </option>
                                        {organizations.map((org) => (
                                            <option key={org.id} value={org.id}>
                                                {org.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className={styles.selectIcon} />
                                </div>
                                {organizations.length === 0 && !isLoadingOrgs && (
                                    <p className={styles.helpText}>
                                        No organizations found. Please select "Create New" or contact your admin.
                                    </p>
                                )}
                                <p className={styles.infoText}>
                                    Organization admins must approve your membership request.
                                </p>
                            </div>
                        )}

                        {/* Organization Name - Create New */}
                        {organizationMode === 'create' && (
                            <div className={styles.formGroup}>
                                <label htmlFor="organizationName">New Organization Name</label>
                                <input
                                    id="organizationName"
                                    type="text"
                                    placeholder="Enter your organization name"
                                    value={formData.organizationName}
                                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className={styles.termsText}>
                        By signing up, you agree to our <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>
                    </p>

                    <p className={styles.loginLink}>
                        Already have a professional account? <Link to="/login">Log In</Link>
                    </p>
                </div>
            </div>

            {/* Bottom Footer bar */}
            <footer className={styles.footerBar}>
                <div className={styles.footerBranding}>
                    <ProEmpowerLogo size={20} />
                    <span>ProEmpower EMS</span>
                </div>
                <div className={styles.footerLinks}>
                    <a href="#">Security</a>
                    <a href="#">Legal</a>
                    <a href="#">System Status</a>
                </div>
                <p className={styles.copyrightText}>© 2024 ProEmpower. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Register;
