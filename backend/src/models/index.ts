import mongoose, { Schema, Document } from 'mongoose';

// Organization Schema
export interface IOrganization extends Document {
    name: string;
    slug: string;
    industry?: string;
    size?: string;
    timezone: string;
    workingDays: string[];
    annualLeaveQuota: number;
    sickLeaveQuota: number;
    carryForwardLimit: number;
    settings?: object;
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    industry: String,
    size: { type: String, enum: ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'] },
    timezone: { type: String, default: 'UTC' },
    workingDays: { type: [String], default: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] },
    annualLeaveQuota: { type: Number, default: 20 },
    sickLeaveQuota: { type: Number, default: 10 },
    carryForwardLimit: { type: Number, default: 5 },
    settings: { type: Object, default: {} },
}, { timestamps: true });

// User Schema
export interface IUser extends Document {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isActive: boolean;
    isEmailVerified: boolean;
    isVerified: boolean;  // Whether employee is verified to access portal
    failedLoginAttempts: number;
    lockedUntil?: Date;
    passwordChangedAt: Date;
    mustChangePassword: boolean;
    organizationId: mongoose.Types.ObjectId;
    pendingOrganizationId?: mongoose.Types.ObjectId;  // For unverified employees
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    lastLoginIp?: string;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    avatar: String,
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },  // Employees pending approval will have false
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    passwordChangedAt: { type: Date, default: Date.now },
    mustChangePassword: { type: Boolean, default: false },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    pendingOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    lastLoginAt: Date,
    lastLoginIp: String,
}, { timestamps: true });

// Role Schema
export interface IRole extends Document {
    name: string;
    description?: string;
    isSystem: boolean;
    organizationId: mongoose.Types.ObjectId;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
    name: { type: String, required: true },
    description: String,
    isSystem: { type: Boolean, default: false },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    permissions: { type: [String], default: [] },
}, { timestamps: true });

RoleSchema.index({ name: 1, organizationId: 1 }, { unique: true });

// UserRole Schema
export interface IUserRole extends Document {
    userId: mongoose.Types.ObjectId;
    roleId: mongoose.Types.ObjectId;
}

const UserRoleSchema = new Schema<IUserRole>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
});

UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

// Session Schema
export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    isValid: boolean;
    expiresAt: Date;
    lastActiveAt: Date;
    createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true, unique: true },
    deviceInfo: String,
    ipAddress: String,
    userAgent: String,
    isValid: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
    lastActiveAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Department Schema
export interface IDepartment extends Document {
    name: string;
    description?: string;
    organizationId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>({
    name: { type: String, required: true },
    description: String,
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Department' },
}, { timestamps: true });

// Employee Schema
export interface IEmployee extends Document {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    address?: object;
    emergencyContact?: object;
    status: string;
    employmentType: string;
    workLocation: string;
    joinDate: Date;
    probationEndDate?: Date;
    confirmationDate?: Date;
    resignationDate?: Date;
    lastWorkingDate?: Date;
    organizationId: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
    managerId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    designation?: string;
    salaryBand?: string;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
    employeeId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    phone: String,
    dateOfBirth: Date,
    gender: String,
    address: Object,
    emergencyContact: Object,
    status: { type: String, enum: ['HIRED', 'ACTIVE', 'ON_PROBATION', 'ON_LEAVE', 'RESIGNED', 'TERMINATED'], default: 'HIRED' },
    employmentType: { type: String, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'CONSULTANT'], default: 'FULL_TIME' },
    workLocation: { type: String, enum: ['ONSITE', 'REMOTE', 'HYBRID'], default: 'ONSITE' },
    joinDate: { type: Date, required: true },
    probationEndDate: Date,
    confirmationDate: Date,
    resignationDate: Date,
    lastWorkingDate: Date,
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    designation: String,
    salaryBand: String,
    currency: { type: String, default: 'USD' },
}, { timestamps: true });

EmployeeSchema.index({ employeeId: 1, organizationId: 1 }, { unique: true });

// LeaveType Schema
export interface ILeaveType extends Document {
    name: string;
    code: string;
    description?: string;
    organizationId: mongoose.Types.ObjectId;
    isPaid: boolean;
    color?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveTypeSchema = new Schema<ILeaveType>({
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: String,
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    isPaid: { type: Boolean, default: true },
    color: String,
}, { timestamps: true });

LeaveTypeSchema.index({ code: 1, organizationId: 1 }, { unique: true });

// Shift Schema
export interface IShift extends Document {
    name: string;
    organizationId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    graceMinutes: number;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ShiftSchema = new Schema<IShift>({
    name: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    graceMinutes: { type: Number, default: 15 },
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });

// Attendance Schema
export interface IAttendanceSession {
    checkIn: Date;
    checkOut?: Date;
    isLate: boolean;
    checkInIp?: string;
    checkOutIp?: string;
    checkInLocation?: object;
    checkOutLocation?: object;
    workMinutes?: number;
}

export interface IAttendance extends Document {
    employeeId: mongoose.Types.ObjectId;
    shiftId?: mongoose.Types.ObjectId;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    workMinutes?: number;
    overtimeMinutes?: number;
    status: string;
    isLate: boolean;
    isEarlyLeave: boolean;
    checkInLocation?: object;
    checkOutLocation?: object;
    checkInIp?: string;
    checkOutIp?: string;
    notes?: string;
    sessions: IAttendanceSession[];
    // Blockchain fields
    blockchainHash?: string;
    blockchainTimestamp?: Date;
    blockchainVerified?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSessionSchema = new Schema({
    checkIn: { type: Date, required: true },
    checkOut: Date,
    isLate: { type: Boolean, default: false },
    checkInIp: String,
    checkOutIp: String,
    checkInLocation: Object,
    checkOutLocation: Object,
    workMinutes: Number,
}, { _id: false });

const AttendanceSchema = new Schema<IAttendance>({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
    date: { type: Date, required: true },
    checkIn: Date,
    checkOut: Date,
    workMinutes: Number,
    overtimeMinutes: Number,
    status: { type: String, default: 'PRESENT' },
    isLate: { type: Boolean, default: false },
    isEarlyLeave: { type: Boolean, default: false },
    checkInLocation: Object,
    checkOutLocation: Object,
    checkInIp: String,
    checkOutIp: String,
    notes: String,
    sessions: { type: [AttendanceSessionSchema], default: [] },
    // Blockchain fields
    blockchainHash: String,
    blockchainTimestamp: Date,
    blockchainVerified: { type: Boolean, default: false },
}, { timestamps: true });

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// LeaveRequest Schema
export interface ILeaveRequest extends Document {
    employeeId: mongoose.Types.ObjectId;
    leaveTypeId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    days: number;
    reason?: string;
    status: string;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    attachments?: object;
    // Blockchain fields
    blockchainHash?: string;
    blockchainTimestamp?: Date;
    blockchainVerified?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: String,
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'AUTO_APPROVED'], default: 'PENDING' },
    approvedBy: String,
    approvedAt: Date,
    rejectionReason: String,
    attachments: Object,
    // Blockchain fields
    blockchainHash: String,
    blockchainTimestamp: Date,
    blockchainVerified: { type: Boolean, default: false },
}, { timestamps: true });

// AttendanceCorrection Schema (for correction requests)
export interface IAttendanceCorrection extends Document {
    employeeId: mongoose.Types.ObjectId;
    attendanceId?: mongoose.Types.ObjectId;
    date: Date;
    requestType: string;
    reason: string;
    proposedCheckIn?: Date;
    proposedCheckOut?: Date;
    status: string;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    reviewNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceCorrectionSchema = new Schema<IAttendanceCorrection>({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    attendanceId: { type: Schema.Types.ObjectId, ref: 'Attendance' },
    date: { type: Date, required: true },
    requestType: { type: String, enum: ['ADD_MISSING', 'MODIFY_TIME', 'ADD_SESSION'], required: true },
    reason: { type: String, required: true },
    proposedCheckIn: Date,
    proposedCheckOut: Date,
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    reviewNotes: String,
}, { timestamps: true });

// BlockchainTransaction Schema
export interface IBlockchainTransaction extends Document {
    transactionHash: string;
    blockNumber: number;
    recordType: 'ATTENDANCE' | 'LEAVE' | 'EMPLOYEE' | 'GENERAL';
    recordId?: mongoose.Types.ObjectId;
    dataHash: string;
    organizationId: mongoose.Types.ObjectId;
    submittedBy?: mongoose.Types.ObjectId;
    status: 'PENDING' | 'CONFIRMED' | 'FAILED';
    signature?: string;
    metadata?: object;
    gasUsed?: number;
    createdAt: Date;
    confirmedAt?: Date;
}

const BlockchainTransactionSchema = new Schema<IBlockchainTransaction>({
    transactionHash: { type: String, required: true, unique: true },
    blockNumber: { type: Number, required: true },
    recordType: { type: String, enum: ['ATTENDANCE', 'LEAVE', 'EMPLOYEE', 'GENERAL'], required: true },
    recordId: { type: Schema.Types.ObjectId },
    dataHash: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'FAILED'], default: 'PENDING' },
    signature: String,
    metadata: Object,
    gasUsed: Number,
    confirmedAt: Date,
}, { timestamps: true });

BlockchainTransactionSchema.index({ organizationId: 1, recordType: 1 });
BlockchainTransactionSchema.index({ recordId: 1, recordType: 1 });
BlockchainTransactionSchema.index({ dataHash: 1 });

// JoinRequest Schema - for employee organization join requests
export interface IJoinRequest extends Document {
    userId: mongoose.Types.ObjectId;
    organizationId: mongoose.Types.ObjectId;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedRole: string;
    message?: string;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const JoinRequestSchema = new Schema<IJoinRequest>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    requestedRole: { type: String, default: 'Employee' },
    message: String,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    rejectionReason: String,
}, { timestamps: true });

JoinRequestSchema.index({ organizationId: 1, status: 1 });
JoinRequestSchema.index({ userId: 1 });

// OrganizationTransferRequest Schema - for employee organization transfers
export interface IOrganizationTransferRequest extends Document {
    userId: mongoose.Types.ObjectId;
    fromOrganizationId: mongoose.Types.ObjectId;
    toOrganizationId: mongoose.Types.ObjectId;
    offerLetterUrl: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
    requestedRole: string;
    message?: string;
    expiresAt: Date;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationTransferRequestSchema = new Schema<IOrganizationTransferRequest>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fromOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    toOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    offerLetterUrl: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED'], default: 'PENDING' },
    requestedRole: { type: String, default: 'Employee' },
    message: String,
    expiresAt: { type: Date, required: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    rejectionReason: String,
}, { timestamps: true });

OrganizationTransferRequestSchema.index({ toOrganizationId: 1, status: 1 });
OrganizationTransferRequestSchema.index({ userId: 1 });
OrganizationTransferRequestSchema.index({ expiresAt: 1 });

// Warning Schema - for employee warnings issued by Admin/HR
export interface IWarning extends Document {
    employeeId: mongoose.Types.ObjectId;
    organizationId: mongoose.Types.ObjectId;
    issuedBy: mongoose.Types.ObjectId;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    isRead: boolean;
    isActive: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const WarningSchema = new Schema<IWarning>({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    isRead: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    readAt: Date,
}, { timestamps: true });

WarningSchema.index({ employeeId: 1, isActive: 1 });
WarningSchema.index({ organizationId: 1, createdAt: -1 });

// Export Models
export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
export const User = mongoose.model<IUser>('User', UserSchema);
export const Role = mongoose.model<IRole>('Role', RoleSchema);
export const UserRole = mongoose.model<IUserRole>('UserRole', UserRoleSchema);
export const Session = mongoose.model<ISession>('Session', SessionSchema);
export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
export const LeaveType = mongoose.model<ILeaveType>('LeaveType', LeaveTypeSchema);
export const Shift = mongoose.model<IShift>('Shift', ShiftSchema);
export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
export const AttendanceCorrection = mongoose.model<IAttendanceCorrection>('AttendanceCorrection', AttendanceCorrectionSchema);
export const BlockchainTransaction = mongoose.model<IBlockchainTransaction>('BlockchainTransaction', BlockchainTransactionSchema);
export const JoinRequest = mongoose.model<IJoinRequest>('JoinRequest', JoinRequestSchema);
export const OrganizationTransferRequest = mongoose.model<IOrganizationTransferRequest>('OrganizationTransferRequest', OrganizationTransferRequestSchema);
export const Warning = mongoose.model<IWarning>('Warning', WarningSchema);

