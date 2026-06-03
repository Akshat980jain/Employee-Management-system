import mongoose from 'mongoose';
import { Attendance, Employee, Shift, UserRole, Role } from '../../models/index.js';
import { CheckInInput, CheckOutInput, CreateAttendanceInput, UpdateAttendanceInput, AttendanceFilterInput, StaffMonitoringFilterInput } from './attendance.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { blockchainService } from '../blockchain/blockchain.service.js';

export class AttendanceService {
    async checkIn(employeeId: string, organizationId: string, input: CheckInInput, ipAddress?: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        // Check if there is an open session in the employee's most recent attendance record
        const lastAttendance = await Attendance.findOne({ employeeId }).sort({ date: -1 });
        if (lastAttendance) {
            const sessions = lastAttendance.sessions || [];
            const hasOpenSession = sessions.some((s: any) => s.checkIn && !s.checkOut);
            if (hasOpenSession) {
                throw ApiError.badRequest('You have an open session. Please clock out first.');
            }
        }

        // Check for existing attendance record today
        let attendance = await Attendance.findOne({
            employeeId,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });

        // Get default shift
        const shift = await Shift.findOne({ organizationId, isDefault: true });

        const now = new Date();

        if (attendance) {
            // Check if there's an open session (checked in but not checked out)
            const sessions = attendance.sessions || [];
            const hasOpenSession = sessions.some((s: any) => s.checkIn && !s.checkOut);

            if (hasOpenSession) {
                throw ApiError.badRequest('You have an open session. Please clock out first.');
            }

            // Add new session
            sessions.push({
                checkIn: now,
                isLate: false,
                checkInIp: ipAddress,
                checkInLocation: input.location,
            });

            attendance.sessions = sessions;
            attendance.checkIn = attendance.checkIn || now; // Keep first check-in
            attendance.status = 'PRESENT';
            await attendance.save();
        } else {
            // Create new attendance with first session
            attendance = await Attendance.create({
                employeeId,
                date: today,
                checkIn: now,
                shiftId: shift?._id,
                checkInIp: ipAddress,
                checkInLocation: input.location,
                status: 'PRESENT',
                sessions: [{
                    checkIn: now,
                    isLate: false,
                    checkInIp: ipAddress,
                    checkInLocation: input.location,
                }],
            });
        }
        // Auto-anchor to blockchain (async, non-blocking)
        this.anchorToBlockchain(attendance._id.toString(), employee.organizationId.toString());

        return attendance;
    }

    /**
     * Anchor attendance record to blockchain asynchronously
     */
    private async anchorToBlockchain(attendanceId: string, organizationId: string): Promise<void> {
        try {
            await blockchainService.anchorAttendance(attendanceId, organizationId);
            console.log(`[Blockchain] Attendance ${attendanceId} anchored successfully`);
        } catch (error) {
            // Log but don't fail the main operation
            console.error(`[Blockchain] Failed to anchor attendance ${attendanceId}:`, error);
        }
    }

    async checkOut(employeeId: string, organizationId: string, input: CheckOutInput, ipAddress?: string) {
        // Find the most recent attendance record to check out of
        const attendance = await Attendance.findOne({ employeeId })
            .sort({ date: -1 });

        if (!attendance || !attendance.checkIn) {
            throw ApiError.badRequest('No check-in record found');
        }

        const now = new Date();
        let sessions: any[] = attendance.sessions || [];

        // Handle legacy records without sessions array  
        if (sessions.length === 0 && attendance.checkIn && !attendance.checkOut) {
            sessions.push({
                checkIn: attendance.checkIn,
                checkInIp: attendance.checkInIp,
                checkInLocation: attendance.checkInLocation,
            });
        }

        // Find open session
        const openSessionIndex = sessions.findIndex((s: any) => s.checkIn && !s.checkOut);

        if (openSessionIndex === -1) {
            throw ApiError.badRequest('No open session found. Please clock in first.');
        }

        const openSession = sessions[openSessionIndex];
        const checkInTime = new Date(openSession.checkIn);
        const sessionMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / 60000);

        // Update the open session - convert to plain object first if it's a Mongoose subdocument
        const sessionData = typeof openSession.toObject === 'function' ? openSession.toObject() : openSession;
        sessions[openSessionIndex] = {
            checkIn: sessionData.checkIn,
            checkInIp: sessionData.checkInIp,
            checkInLocation: sessionData.checkInLocation,
            checkOut: now,
            checkOutIp: ipAddress,
            checkOutLocation: input.location,
            workMinutes: sessionMinutes,
        };

        // Calculate total work minutes from all sessions
        const totalWorkMinutes = sessions.reduce((sum: number, s: any) => sum + (s.workMinutes || 0), 0);
        const overtimeMinutes = Math.max(0, totalWorkMinutes - 480); // 8 hours = 480 minutes

        // Use set to update
        attendance.set('sessions', sessions);
        attendance.set('checkOut', now);
        attendance.set('workMinutes', totalWorkMinutes);
        attendance.set('overtimeMinutes', overtimeMinutes);
        attendance.set('checkOutIp', ipAddress);
        attendance.set('checkOutLocation', input.location);
        attendance.set('notes', input.notes);

        await attendance.save();

        // Auto-anchor to blockchain on checkout (async, non-blocking)
        this.anchorToBlockchain(attendance._id.toString(), organizationId);

        return attendance;
    }

    async getAttendance(organizationId: string, filters?: AttendanceFilterInput) {
        const query: any = {};

        if (filters?.employeeId) {
            query.employeeId = filters.employeeId;
        } else {
            // Get all employees from organization
            const employees = await Employee.find({ organizationId }).select('_id');
            query.employeeId = { $in: employees.map(e => e._id) };
        }

        if (filters?.startDate && filters?.endDate) {
            query.date = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate),
            };
        }

        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const [records, total] = await Promise.all([
            Attendance.find(query)
                .populate('employeeId', 'firstName lastName employeeId')
                .populate('shiftId', 'name startTime endTime')
                .skip(skip)
                .limit(limit)
                .sort({ date: -1 })
                .select('-__v'),
            Attendance.countDocuments(query),
        ]);

        return {
            records,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getTodayAttendance(organizationId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const employees = await Employee.find({ organizationId }).select('_id');
        const employeeIds = employees.map(e => e._id);

        return Attendance.find({
            employeeId: { $in: employeeIds },
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        }).populate('employeeId', 'firstName lastName employeeId');
    }

    async getTodayStats(organizationId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        // Get all active/probation/on-leave employees in the organization
        const activeEmployees = await Employee.find({ 
            organizationId, 
            status: { $in: ['ACTIVE', 'ON_PROBATION', 'ON_LEAVE', 'HIRED'] } 
        }).select('_id status');
        
        const total = activeEmployees.length;
        const employeeIds = activeEmployees.map(e => e._id);

        // Get today's attendance records
        const todayAttendance = await Attendance.find({
            employeeId: { $in: employeeIds },
            date: { $gte: today, $lt: tomorrow }
        });

        // Get today's on-leave count
        const onLeaveCount = activeEmployees.filter(e => e.status === 'ON_LEAVE').length;

        const presentCount = todayAttendance.filter(r => r.checkIn && r.status !== 'ABSENT').length;
        const lateCount = todayAttendance.filter(r => r.isLate).length;
        
        // Absent are those active employees who are not on leave and have not checked in
        const checkedInEmployeeIds = new Set(todayAttendance.filter(r => r.checkIn).map(r => r.employeeId.toString()));
        const absentCount = activeEmployees.filter(e => e.status !== 'ON_LEAVE' && !checkedInEmployeeIds.has(e._id.toString())).length;

        return {
            present: presentCount,
            absent: Math.max(0, absentCount),
            onLeave: onLeaveCount,
            late: lateCount,
            total: total
        };
    }

    async createManualAttendance(organizationId: string, input: CreateAttendanceInput) {
        return Attendance.create(input);
    }

    async updateAttendance(organizationId: string, attendanceId: string, input: UpdateAttendanceInput) {
        return Attendance.findByIdAndUpdate(attendanceId, input, { new: true }).select('-__v');
    }

    async getAttendanceStats(organizationId: string, startDate: Date, endDate: Date) {
        const employees = await Employee.find({ organizationId }).select('_id');
        const employeeIds = employees.map(e => e._id);

        const records = await Attendance.find({
            employeeId: { $in: employeeIds },
            date: { $gte: startDate, $lte: endDate },
        });

        const presentDays = records.filter(r => r.checkIn).length;
        const totalWorkMinutes = records.reduce((sum, r) => sum + (r.workMinutes || 0), 0);
        const totalOvertimeMinutes = records.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0);

        return {
            totalEmployees: employees.length,
            presentDays,
            avgWorkHours: records.length ? (totalWorkMinutes / records.length / 60).toFixed(2) : 0,
            totalOvertimeHours: (totalOvertimeMinutes / 60).toFixed(2),
        };
    }

    /**
     * Get all staff members with their roles and attendance statistics
     * For Admin/HR to monitor attendance of everyone including each other
     */
    async getStaffMonitoring(organizationId: string, filters?: StaffMonitoringFilterInput) {
        // Build employee query
        const employeeQuery: any = { organizationId };

        if (filters?.search) {
            employeeQuery.$or = [
                { firstName: { $regex: filters.search, $options: 'i' } },
                { lastName: { $regex: filters.search, $options: 'i' } },
                { employeeId: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
            ];
        }

        // Get all employees with their user info
        const employees = await Employee.find(employeeQuery)
            .populate('userId', 'avatar email')
            .populate('departmentId', 'name')
            .select('-__v')
            .sort({ firstName: 1 });

        // Get roles for all users - filter out null/undefined userIds
        const userIds = employees.map(e => e.userId).filter(id => id != null) as any[];
        const userRoles = await UserRole.find({ userId: { $in: userIds } })
            .populate('roleId', 'name');

        // Create a map of userId to role name
        const roleMap: Record<string, string> = {};
        for (const ur of userRoles) {
            const role = ur.roleId as any;
            if (ur.userId && role?.name) {
                roleMap[ur.userId.toString()] = role.name;
            }
        }

        // Filter by role if specified
        let filteredEmployees = employees;
        if (filters?.role && filters.role !== 'all') {
            filteredEmployees = employees.filter(emp => {
                const userId = emp.userId;
                if (!userId) return filters.role === 'Employee';
                return roleMap[userId.toString()] === filters.role;
            });
        }

        // Calculate date range for attendance stats
        const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();
        const startDate = filters?.startDate
            ? new Date(filters.startDate)
            : new Date(new Date().setDate(endDate.getDate() - 30)); // Default: last 30 days

        // Get today's date for current status
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        // Pagination
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const skip = (page - 1) * limit;
        const paginatedEmployees = filteredEmployees.slice(skip, skip + limit);

        // Get attendance records for all filtered employees in date range
        const employeeIds = paginatedEmployees.map(e => e._id);
        const attendanceRecords = await Attendance.find({
            employeeId: { $in: employeeIds },
            date: { $gte: startDate, $lte: endDate }
        }).select('employeeId date checkIn checkOut workMinutes isLate status');

        // Get today's attendance for current status
        const todayAttendance = await Attendance.find({
            employeeId: { $in: employeeIds },
            date: { $gte: today, $lt: tomorrow }
        }).select('employeeId checkIn checkOut status');

        // Build attendance map
        const attendanceMap: Record<string, any[]> = {};
        const todayStatusMap: Record<string, any> = {};

        for (const record of attendanceRecords) {
            const empId = record.employeeId.toString();
            if (!attendanceMap[empId]) {
                attendanceMap[empId] = [];
            }
            attendanceMap[empId].push(record);
        }

        for (const record of todayAttendance) {
            todayStatusMap[record.employeeId.toString()] = record;
        }

        // Build staff monitoring data
        const staffData = paginatedEmployees.map(emp => {
            const empId = emp._id.toString();
            const userId = emp.userId;
            const role = userId ? (roleMap[userId.toString()] || 'Employee') : 'Employee';
            const records = attendanceMap[empId] || [];
            const todayRecord = todayStatusMap[empId];

            // Calculate stats
            const totalDays = records.length;
            const presentDays = records.filter(r => r.checkIn).length;
            const lateDays = records.filter(r => r.isLate).length;
            const totalWorkMinutes = records.reduce((sum, r) => sum + (r.workMinutes || 0), 0);
            const avgWorkHours = totalDays > 0 ? totalWorkMinutes / totalDays / 60 : 0;
            const onTimeRate = presentDays > 0 ? ((presentDays - lateDays) / presentDays * 100) : 0;

            // Determine today's status
            let todayStatus = 'Not Checked In';
            if (todayRecord) {
                if (todayRecord.checkOut) {
                    todayStatus = 'Checked Out';
                } else if (todayRecord.checkIn) {
                    todayStatus = 'Checked In';
                } else if (todayRecord.status === 'ON_LEAVE') {
                    todayStatus = 'On Leave';
                }
            }

            return {
                _id: emp._id,
                employeeId: emp.employeeId,
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                designation: emp.designation,
                department: (emp.departmentId as any)?.name || null,
                avatar: (emp.userId as any)?.avatar || null,
                role,
                todayStatus,
                stats: {
                    totalDays,
                    presentDays,
                    lateDays,
                    totalWorkHours: (totalWorkMinutes / 60).toFixed(1),
                    avgWorkHours: avgWorkHours.toFixed(1),
                    onTimeRate: onTimeRate.toFixed(0),
                }
            };
        });

        return {
            staff: staffData,
            pagination: {
                page,
                limit,
                total: filteredEmployees.length,
                totalPages: Math.ceil(filteredEmployees.length / limit),
            },
            dateRange: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            }
        };
    }

    async getAttendanceStatus(employeeId: string, organizationId: string) {
        // Find the most recent attendance record
        const attendance = await Attendance.findOne({ employeeId })
            .sort({ date: -1 });

        const sessions = attendance?.sessions || [];
        const openSession = sessions.find((s: any) => s.checkIn && !s.checkOut);
        const isClockedIn = !!openSession;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isRecordFromToday = attendance && new Date(attendance.date).getTime() >= today.getTime();

        return {
            success: true,
            isClockedIn,
            currentSession: openSession || null,
            todaySessions: isRecordFromToday ? sessions : (openSession ? [openSession] : [])
        };
    }
}

export const attendanceService = new AttendanceService();
