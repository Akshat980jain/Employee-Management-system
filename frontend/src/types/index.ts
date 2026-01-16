export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isActive: boolean;
    isVerified?: boolean;
    role?: string;
    organization: Organization;
    roles: Role[];
    permissions: string[];
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    timezone?: string;
    industry?: string;
    size?: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    isSystem: boolean;
    permissions?: Permission[];
}

export interface Permission {
    id: string;
    name: string;
    module: string;
    action: string;
    description?: string;
}

export interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: EmployeeStatus;
    employmentType: EmploymentType;
    workLocation: WorkLocation;
    joinDate: string;
    designation?: string;
    department?: Department;
    manager?: { id: string; firstName: string; lastName: string };
}

export type EmployeeStatus = 'HIRED' | 'ACTIVE' | 'ON_PROBATION' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'CONSULTANT';
export type WorkLocation = 'ONSITE' | 'REMOTE' | 'HYBRID';

export interface Department {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    children?: Department[];
}

export interface Attendance {
    id: string;
    employeeId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: AttendanceStatus;
    isLate: boolean;
    isEarlyLeave: boolean;
    workMinutes?: number;
    overtimeMinutes?: number;
    employee?: Partial<Employee>;
    shift?: Shift;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY';

export interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    graceMinutes: number;
    isDefault: boolean;
}

export interface LeaveType {
    id: string;
    name: string;
    code: string;
    description?: string;
    isPaid: boolean;
    color?: string;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    days: number;
    reason?: string;
    status: LeaveStatus;
    employee?: Partial<Employee>;
    leaveType?: LeaveType;
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'AUTO_APPROVED';

export interface LeaveBalance {
    id: string;
    leaveTypeId: string;
    year: number;
    opening: number;
    accrued: number;
    used: number;
    adjustment: number;
    carryForward: number;
    leaveType?: LeaveType;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    pagination?: Pagination;
    error?: {
        message: string;
        code: string;
        details?: any;
    };
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface JoinRequest {
    id: string;
    userId: string;
    organizationId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedRole: string;
    message?: string;
    rejectionReason?: string;
    reviewedBy?: { firstName: string; lastName: string };
    reviewedAt?: string;
    user?: Pick<User, 'firstName' | 'lastName' | 'email'>;
    organization?: Pick<Organization, 'id' | 'name'>;
    createdAt: string;
}

export interface PublicOrganization {
    id: string;
    name: string;
}
