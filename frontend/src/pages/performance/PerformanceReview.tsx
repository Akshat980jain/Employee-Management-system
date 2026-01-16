import { useState } from 'react';
import { Search, ChevronRight, ChevronLeft, Plus, Star, MoreVertical } from 'lucide-react';
import styles from './PerformanceReview.module.css';

// Mock employee data
const employees = [
    { id: 'AFT00345', name: 'Vikas Agarwal', avatar: null },
    { id: 'AFT00319', name: 'Niketan Malvis', avatar: null },
    { id: 'AFT00122', name: 'Preeti Sharma', avatar: null },
    { id: 'AFT00389', name: 'Nimmo Ved', avatar: null },
    { id: 'AFT00310', name: 'Nasir Shah', avatar: null },
];

// Mock competencies data
const competencies = [
    { id: 1, name: 'Priortization of work', selfComments: 'No Data', reviewerComments: 'No Data', rating: 0 },
    { id: 2, name: 'English communication', selfComments: 'No Data', reviewerComments: 'No Data', rating: 0 },
    { id: 3, name: 'Problem solving skills', selfComments: 'No Data', reviewerComments: 'No Data', rating: 0 },
    { id: 4, name: 'Proactiveness', selfComments: 'No Data', reviewerComments: 'No Data', rating: 0 },
    { id: 5, name: 'Customer focus', selfComments: 'No Data', reviewerComments: 'No Data', rating: 0 },
];

const StarRating = ({ rating, onChange }: { rating: number; onChange?: (val: number) => void }) => {
    return (
        <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={16}
                    className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
                    onClick={() => onChange?.(star)}
                />
            ))}
        </div>
    );
};

const PerformanceReview = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(employees[1]);
    const [activeTab, setActiveTab] = useState('competencies');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCycle, setSelectedCycle] = useState('October Cycle');
    const [ratings, setRatings] = useState<Record<number, number>>({});

    const tabs = [
        { id: 'goals', label: 'Goals' },
        { id: 'competencies', label: 'Common Competencies' },
        { id: 'philosophy', label: 'Business Philosophy' },
    ];

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRatingChange = (competencyId: number, rating: number) => {
        setRatings(prev => ({ ...prev, [competencyId]: rating }));
    };

    const averageRating = Object.values(ratings).length > 0
        ? Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length
        : 0;

    return (
        <div className={styles.container}>
            {/* Left Sidebar - Employee List */}
            <div className={styles.sidebar}>
                <div className={styles.filterSection}>
                    <label className={styles.filterLabel}>Sort By</label>
                    <select
                        className={styles.cycleSelect}
                        value={selectedCycle}
                        onChange={(e) => setSelectedCycle(e.target.value)}
                    >
                        <option>October Cycle</option>
                        <option>September Cycle</option>
                        <option>August Cycle</option>
                    </select>
                </div>

                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Enter Search Keywords"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <button className={styles.swapButton}>
                    Swap Review Cycle
                </button>

                <div className={styles.employeeList}>
                    {filteredEmployees.map((employee) => (
                        <div
                            key={employee.id}
                            className={`${styles.employeeCard} ${selectedEmployee.id === employee.id ? styles.selected : ''}`}
                            onClick={() => setSelectedEmployee(employee)}
                        >
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={selectedEmployee.id === employee.id}
                                onChange={() => setSelectedEmployee(employee)}
                            />
                            <div className={styles.employeeAvatar}>
                                {employee.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className={styles.employeeInfo}>
                                <span className={styles.employeeId}>{employee.id}</span>
                                <span className={styles.employeeName}>{employee.name}</span>
                            </div>
                            <ChevronRight size={18} className={styles.chevron} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content - Performance Review Form */}
            <div className={styles.mainContent}>
                <h1 className={styles.pageTitle}>Performance Review Form</h1>

                {/* Selected Employee Header */}
                <div className={styles.reviewHeader}>
                    <div className={styles.selectedEmployee}>
                        <div className={styles.selectedAvatar}>
                            {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={styles.selectedInfo}>
                            <span className={styles.selectedId}>{selectedEmployee.id}</span>
                            <span className={styles.selectedName}>{selectedEmployee.name}</span>
                        </div>
                        <div className={styles.dojSection}>
                            <span className={styles.dojLabel}>DOJ</span>
                            <span className={styles.dojValue}>14th Jul 2016</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabsContainer}>
                    <button className={styles.tabNav}>
                        <ChevronLeft size={18} />
                    </button>
                    <div className={styles.tabs}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Competencies Section */}
                <div className={styles.competenciesSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Common Competencies</h2>
                        <div className={styles.sectionActions}>
                            <button className={styles.addNewBtn}>
                                <Plus size={16} />
                                Add New
                            </button>
                            <button className={styles.saveTagBtn}>Save as Tag</button>
                        </div>
                    </div>

                    <table className={styles.competencyTable}>
                        <thead>
                            <tr>
                                <th>Sr. No</th>
                                <th>Training / Certification Name</th>
                                <th>Self Comments</th>
                                <th>Reviewer Comments</th>
                                <th>Ratings</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {competencies.map((comp, index) => (
                                <tr key={comp.id}>
                                    <td>{String(index + 1).padStart(2, '0')}</td>
                                    <td>{comp.name}</td>
                                    <td className={styles.noData}>{comp.selfComments}</td>
                                    <td className={styles.noData}>{comp.reviewerComments}</td>
                                    <td>
                                        <StarRating
                                            rating={ratings[comp.id] || 0}
                                            onChange={(val) => handleRatingChange(comp.id, val)}
                                        />
                                    </td>
                                    <td>
                                        <button className={styles.moreBtn}>
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className={styles.totalRating}>
                        <span>Total Average Rating</span>
                        <StarRating rating={Math.round(averageRating)} />
                    </div>
                </div>

                {/* Final Rating & Actions */}
                <div className={styles.footer}>
                    <div className={styles.finalRating}>
                        <span className={styles.finalLabel}>Final Rating</span>
                        <StarRating rating={Math.round(averageRating)} />
                        <p className={styles.ratingNote}>Average of specific role, goals and common competency</p>
                    </div>
                    <div className={styles.footerActions}>
                        <button className={styles.saveLaterBtn}>Save For Later</button>
                        <button className={styles.sendBtn}>SEND</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceReview;
