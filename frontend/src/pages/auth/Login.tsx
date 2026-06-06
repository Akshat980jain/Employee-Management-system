import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Users, BarChart3, ShieldAlert, Lock, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import logo from '../../logo.png';
import styles from './Login.module.css';

// Reusable custom node-link logo matching the images
const StaffSphereLogo = ({ size = 32 }: { size?: number }) => (
    <img src={logo} alt="StaffSphere Logo" style={{ width: size, height: size, objectFit: 'contain', borderRadius: '8px' }} />
);

const Login = () => {
    const navigate = useNavigate();
    const { login, googleLogin, isLoading, rememberMe, setRememberMe } = useAuthStore();

    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);
    const [isSubmittingReset, setIsSubmittingReset] = useState(false);
    const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
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
            toast.error(getErrorMessage(error, 'Login failed'));
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingForgot(true);
        try {
            const response = await api.post('/auth/forgot-password', { email: forgotEmail });
            toast.success(response.data.message || 'Verification code sent!');
            if (response.data.data?.token) {
                setResetToken(response.data.data.token);
                toast.success(`Dev Mode: Code autofilled ${response.data.data.token}`, { duration: 6000 });
            }
            setMode('reset');
        } catch (error: any) {
            toast.error(getErrorMessage(error, 'Failed to request reset'));
        } finally {
            setIsSubmittingForgot(false);
        }
    };

    const handleOtpDigitChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const newDigits = [...otpDigits];
        newDigits[index] = digit;
        setOtpDigits(newDigits);
        const combined = newDigits.join('');
        setResetToken(combined);
        if (digit && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length > 0) {
            const newDigits = [...otpDigits];
            for (let i = 0; i < 6; i++) {
                newDigits[i] = pasted[i] || '';
            }
            setOtpDigits(newDigits);
            setResetToken(pasted);
            const nextEmpty = Math.min(pasted.length, 5);
            otpRefs.current[nextEmpty]?.focus();
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingReset(true);
        try {
            await api.post('/auth/reset-password', {
                email: forgotEmail,
                token: resetToken,
                password: newPassword
            });
            toast.success('Password reset successfully! Please sign in.');
            setMode('login');
            setNewPassword('');
            setResetToken('');
            setOtpDigits(['', '', '', '', '', '']);
        } catch (error: any) {
            toast.error(getErrorMessage(error, 'Failed to reset password'));
        } finally {
            setIsSubmittingReset(false);
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

    // OTP Reset screen — full standalone card matching email design
    if (mode === 'reset') {
        return (
            <div className={styles.otpPageBg}>
                <div className={styles.otpCard}>
                    {/* Card top accent bar */}
                    <div className={styles.otpAccentBar} />

                    {/* Header */}
                    <div className={styles.otpCardHeader}>
                        <Lock size={26} className={styles.otpLockIcon} />
                        <span className={styles.otpCardTitle}>StaffSphere Security</span>
                    </div>

                    <div className={styles.otpCardDivider} />

                    {/* Body */}
                    <div className={styles.otpCardBody}>
                        <p className={styles.otpCodeLabel}>Verification Code</p>

                        {/* 6-digit OTP pill */}
                        <div className={styles.otpPill}>
                            {otpDigits.map((digit, i) => (
                                <input
                                    key={i}
                                    id={`otp-digit-${i}`}
                                    ref={(el) => { otpRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    onPaste={handleOtpPaste}
                                    className={styles.otpDigitInput}
                                    autoFocus={i === 0}
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>

                        <p className={styles.otpDescription}>
                            Please enter this 6-digit code to complete your password reset
                            for <strong>{forgotEmail}</strong>. The code expires in 10 minutes.
                        </p>

                        {/* Warning banner */}
                        <div className={styles.otpWarningBanner}>
                            <AlertTriangle size={16} className={styles.otpWarningIcon} />
                            <p>If you did not request this code, please ignore this email or contact support.</p>
                        </div>

                        {/* New password field */}
                        <div className={styles.otpNewPassSection}>
                            <label htmlFor="newPasswordOtp" className={styles.otpNewPassLabel}>New Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    id="newPasswordOtp"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className={styles.otpNewPassInput}
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

                        <button
                            type="button"
                            className={styles.otpSubmitBtn}
                            disabled={isSubmittingReset || otpDigits.join('').length < 6 || !newPassword}
                            onClick={(e: any) => handleResetSubmit(e)}
                        >
                            {isSubmittingReset ? 'Resetting Password…' : 'Reset Password'}
                        </button>

                        <div className={styles.otpBackLink}>
                            <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); setOtpDigits(['','','','','','']); setResetToken(''); }}>
                                ← Back to Sign In
                            </a>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.otpCardFooter}>
                        <p className={styles.otpFooterBrand}>StaffSphere Security</p>
                        <p className={styles.otpFooterCopy}>All rights reserved © 2024 StaffSphere Inc.</p>
                        <p className={styles.otpFooterLinks}>
                            <a href="#">Support</a> | <a href="#">Terms</a> | <a href="#">Privacy</a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <div className={styles.formCard}>
                    <div className={styles.topSection}>
                        {/* Top Branding (Left Aligned in mockup) */}
                        <div className={styles.logo}>
                            <StaffSphereLogo size={32} />
                            <span className={styles.logoText}>StaffSphere</span>
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
                            {mode === 'login' && (
                                <>
                                    <h2>Sign in to your account</h2>
                                    <p>Enter your workspace credentials to continue.</p>
                                </>
                            )}
                            {mode === 'forgot' && (
                                <>
                                    <h2>Forgot your password?</h2>
                                    <p>Enter your work email to receive a reset code.</p>
                                </>
                            )}

                        </div>

                        {mode === 'login' && (
                            <>
                                <div className={styles.googleBtnWrapper}>
                                    <GoogleLogin
                                        onSuccess={async (credentialResponse) => {
                                            if (credentialResponse.credential) {
                                                try {
                                                    await googleLogin(credentialResponse.credential);
                                                    toast.success('Welcome back!');
                                                    navigate('/dashboard');
                                                } catch (error: any) {
                                                    toast.error(getErrorMessage(error, 'Google login failed'));
                                                }
                                            }
                                        }}
                                        onError={() => {
                                            toast.error('Google Sign-In failed');
                                        }}
                                        width="380"
                                        shape="rectangular"
                                        theme="outline"
                                        size="large"
                                        text="continue_with"
                                        logo_alignment="left"
                                    />
                                </div>


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
                                            <a href="#" onClick={(e) => { e.preventDefault(); setMode('forgot'); }} className={styles.forgotLink}>Forgot?</a>
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
                            </>
                        )}

                        {mode === 'forgot' && (
                            <form onSubmit={handleForgotSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="forgotEmail">Work Email</label>
                                    <input
                                        id="forgotEmail"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className={styles.submitBtn} disabled={isSubmittingForgot}>
                                    {isSubmittingForgot ? 'Sending Code...' : 'Send Verification Code'}
                                </button>

                                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                    <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }} className={styles.forgotLink}>
                                        Back to Sign In
                                    </a>
                                </div>
                            </form>
                        )}

                        {/* reset mode is handled as early return above */}

                        <p className={styles.signupLink}>
                            New to StaffSphere? <Link to="/register">Create an account</Link>
                        </p>
                        
                        <div className={styles.cardFooter}>
                            <div className={styles.securityBadge}>
                                <Lock size={12} />
                                <span>Enterprise SSO & Encryption Enabled</span>
                            </div>
                            <p>© 2024 StaffSphere. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
