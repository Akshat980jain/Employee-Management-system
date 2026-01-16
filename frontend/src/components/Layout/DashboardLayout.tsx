import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
    return (
        <div className={styles.layout}>
            <Header />
            <Sidebar />
            <main className={styles.main}>
                <div className={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
