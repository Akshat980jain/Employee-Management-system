import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Users, BarChart3, ShieldAlert, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import styles from './Login.module.css';

// Reusable custom node-link logo matching the images
const ProEmpowerLogo = ({ size = 32 }: { size?: number }) => (
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

const Login = () => {
    const navigate = useNavigate();
    const { login, isLoading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await login(formData.email, formData.password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Login failed');
        }
    };

    const features = [
        { 
            icon: Users, 
            title: 'Integrated Management', 
            desc: 'Seamless employee lifecycles' 
        },
        { 
            icon: BarChart3, 
            title: 'Dynamic Reviews', 
            desc: 'Data-backed performance tracking' 
        },
        { 
            icon: ShieldAlert, 
            title: 'AI Insights', 
            desc: 'Predictive talent analytics' 
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <div className={styles.formCard}>
                    <div className={styles.topSection}>
                        {/* Top Branding (Left Aligned in mockup) */}
                        <div className={styles.logo}>
                            <ProEmpowerLogo size={32} />
                            <span className={styles.logoText}>ProEmpower</span>
                        </div>

                        {/* Hero Section (Left Aligned) */}
                        <div className={styles.heroSection}>
                            <h1>Empowering the modern workforce.</h1>
                            <p>
                                A unified platform for performance, engagement, and AI-driven growth
                                insights.
                            </p>
                        </div>

                        {/* Features List (Left Aligned) */}
                        <div className={styles.features}>
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className={styles.featureItem}>
                                        <div className={styles.featureIcon}>
                                            <Icon size={18} className={styles.iconTint} />
                                        </div>
                                        <div className={styles.featureText}>
                                            <h3>{feature.title}</h3>
                                            <p>{feature.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stats Row (Left Aligned) */}
                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>500+</span>
                                <span className={styles.statLabel}>ENTERPRISES</span>
                            </div>
                            <div className={styles.dividerLine}></div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>99.9%</span>
                                <span className={styles.statLabel}>RELIABILITY</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.bottomSection}>
                        {/* Sign-in Form section (Centered Headers) */}
                        <div className={styles.formHeader}>
                            <h2>Sign in to your account</h2>
                            <p>Enter your workspace credentials to continue.</p>
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
                            <span>WORK EMAIL</span>
                        </div>

                        <form onSubmit={handleSubmit}>
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

                            <div className={styles.formGroup}>
                                <div className={styles.labelRow}>
                                    <label htmlFor="password">Password</label>
                                    <a href="#" className={styles.forgotLink}>Forgot?</a>
                                </div>
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

                            <div className={styles.rememberRow}>
                                <label className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className={styles.checkmark}></span>
                                    Keep me signed in
                                </label>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>

                        <p className={styles.signupLink}>
                            New to ProEmpower? <Link to="/register">Create an account</Link>
                        </p>
                        
                        <div className={styles.cardFooter}>
                            <div className={styles.securityBadge}>
                                <Lock size={12} />
                                <span>Enterprise SSO & Encryption Enabled</span>
                            </div>
                            <p>© 2024 ProEmpower. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
