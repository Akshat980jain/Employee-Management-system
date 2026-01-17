import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import styles from './Header.module.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Get breadcrumb from path
    const getBreadcrumb = () => {
        const path = location.pathname;
        const segments = path.split('/').filter(Boolean);
        return segments.map((segment, index) => {
            const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
            return { label, path: '/' + segments.slice(0, index + 1).join('/') };
        });
    };

    const breadcrumbs = getBreadcrumb();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <div className={styles.logo}>
                    <span className={styles.logoDot}>• • •</span>
                    <span className={styles.logoText}>Performance Management System</span>
                </div>
                <nav className={styles.breadcrumbs}>
                    {breadcrumbs.map((crumb, index) => (
                        <span key={crumb.path}>
                            {index > 0 && <span className={styles.separator}>&gt;</span>}
                            <Link to={crumb.path} className={styles.crumb}>
                                {crumb.label}
                            </Link>
                        </span>
                    ))}
                </nav>
            </div>

            <div className={styles.right}>
                <div className={styles.searchBox}>
                    <Search size={16} />
                    <input type="text" placeholder="Search..." />
                </div>

                <button className={styles.iconBtn}>
                    <Bell size={20} />
                    <span className={styles.badge}>3</span>
                </button>

                <div className={styles.profile}>
                    <button
                        className={styles.profileBtn}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className={styles.avatar}>
                            {(user as any)?.avatar ? (
                                <img src={(user as any).avatar} alt="" className={styles.avatarImg} />
                            ) : (
                                <>{user?.firstName?.[0]}{user?.lastName?.[0]}</>
                            )}
                        </div>
                        <span className={styles.userName}>{user?.firstName}</span>
                        <ChevronDown size={16} />
                    </button>

                    {showProfileMenu && (
                        <div className={styles.profileMenu}>
                            <Link to="/profile" className={styles.menuItem}>
                                <User size={16} />
                                <span>Profile</span>
                            </Link>
                            <Link to="/settings" className={styles.menuItem}>
                                <Settings size={16} />
                                <span>Settings</span>
                            </Link>
                            <button onClick={handleLogout} className={styles.menuItem}>
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
