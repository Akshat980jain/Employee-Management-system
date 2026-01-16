import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Users, BarChart3, Lock, UserCircle, Building, ChevronDown, Plus, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PublicOrganization } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Register.module.css';

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
        { value: 'Admin', label: 'Admin', description: 'Full system access' },
        { value: 'HR Manager', label: 'HR Manager', description: 'Employee & leave management' },
        { value: 'Employee', label: 'Employee', description: 'Join existing organization' },
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

    const features = [
        { icon: Users, text: 'Complete Employee Management' },
        { icon: BarChart3, text: 'Performance Tracking & Reviews' },
        { icon: Shield, text: 'AI-Powered HR Analytics' },
        { icon: Lock, text: 'Secure Role-Based Access' },
    ];

    return (
        <div className={styles.container}>
            {/* Left Panel - Gradient */}
            <div className={styles.leftPanel}>
                <div className={styles.leftContent}>
                    <div className={styles.logo}>
                        <span className={styles.dots}>●●●</span>
                        <span className={styles.logoText}>EMS</span>
                    </div>

                    <div className={styles.heroSection}>
                        <h1>Transform Your<br />HR Operations</h1>
                        <p>
                            AI-powered employee management system for modern
                            organizations. Streamline HR, boost performance,
                            predict attrition.
                        </p>
                    </div>

                    <div className={styles.features}>
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className={styles.featureItem}>
                                    <div className={styles.featureIcon}>
                                        <Icon size={20} />
                                    </div>
                                    <span>{feature.text}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>500+</span>
                            <span className={styles.statLabel}>Companies</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>50K+</span>
                            <span className={styles.statLabel}>Employees</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>99.9%</span>
                            <span className={styles.statLabel}>Uptime</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className={styles.rightPanel}>
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <h2>Create your account</h2>
                        <p>Get started with your free account today</p>
                    </div>

                    <button className={styles.googleBtn}>
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
                            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z" />
                            <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A8 8 0 0 0 1.83 5.4l2.67 2.07a4.8 4.8 0 0 1 4.48-3.9z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className={styles.divider}>
                        <span>OR CONTINUE WITH EMAIL</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Work Email</label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                <UserCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                Select Your Role
                            </label>
                            <div className={styles.roleSelector}>
                                {roles.map((role) => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        className={`${styles.roleOption} ${formData.role === role.value ? styles.roleSelected : ''}`}
                                        onClick={() => setFormData({ ...formData, role: role.value })}
                                    >
                                        <span className={styles.roleLabel}>{role.label}</span>
                                        <span className={styles.roleDesc}>{role.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Organization Mode Selector - Only for Admin/HR Manager */}
                        {formData.role !== 'Employee' && (
                            <div className={styles.formGroup}>
                                <label>
                                    <Building size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    Organization
                                </label>
                                <div className={styles.modeSelector}>
                                    <button
                                        type="button"
                                        className={`${styles.modeOption} ${organizationMode === 'join' ? styles.modeSelected : ''}`}
                                        onClick={() => setOrganizationMode('join')}
                                    >
                                        <UserPlus size={18} />
                                        <span>Join Existing</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.modeOption} ${organizationMode === 'create' ? styles.modeSelected : ''}`}
                                        onClick={() => setOrganizationMode('create')}
                                    >
                                        <Plus size={18} />
                                        <span>Create New</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Organization Selection - Join Existing */}
                        {organizationMode === 'join' && (
                            <div className={styles.formGroup}>
                                <label>
                                    {formData.role === 'Employee' && (
                                        <Building size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    )}
                                    Select Organization to Join
                                </label>
                                <div className={styles.selectWrapper}>
                                    <select
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
                                        {formData.role === 'Employee'
                                            ? 'No organizations found. Please contact an Admin to create one first.'
                                            : 'No organizations found. Select "Create New" to register a new organization.'}
                                    </p>
                                )}
                                <p className={styles.infoText}>
                                    Your request will be sent to the organization's Admin or HR for approval.
                                </p>
                            </div>
                        )}

                        {/* Organization Name - Create New */}
                        {organizationMode === 'create' && (
                            <div className={styles.formGroup}>
                                <label>New Organization Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your organization name"
                                    value={formData.organizationName}
                                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label>Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Confirm Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className={styles.termsText}>
                        By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                    </p>

                    <p className={styles.loginLink}>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>

                <div className={styles.footer}>
                    <p>© 2026 Performance Management System. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Register;
