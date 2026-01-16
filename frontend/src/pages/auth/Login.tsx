import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Users, BarChart3, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import styles from './Login.module.css';

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
                        <h1>Welcome Back to<br />Your HR Hub</h1>
                        <p>
                            Access your employee management dashboard. Track
                            performance, manage leave requests, and leverage AI-
                            powered insights.
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

            {/* Right Panel - Login Form */}
            <div className={styles.rightPanel}>
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <h2>Welcome back</h2>
                        <p>Enter your credentials to access your account</p>
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
                            <div className={styles.labelRow}>
                                <label>Password</label>
                                <a href="#" className={styles.forgotLink}>Forgot password?</a>
                            </div>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
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

                        <div className={styles.rememberRow}>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className={styles.checkmark}></span>
                                Remember me for 30 days
                            </label>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className={styles.signupLink}>
                        Don't have an account? <Link to="/register">Sign up for free</Link>
                    </p>
                </div>

                <div className={styles.footer}>
                    <div className={styles.securityBadge}>
                        <Lock size={14} />
                        <span>Secured with enterprise-grade encryption</span>
                    </div>
                    <p>© 2026 Performance Management System. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
