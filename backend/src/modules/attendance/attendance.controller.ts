import { Response, NextFunction } from 'express';
import { attendanceService } from './attendance.service.js';
import { checkInSchema, checkOutSchema, createAttendanceSchema, updateAttendanceSchema, attendanceFilterSchema, staffMonitoringFilterSchema } from './attendance.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { Employee } from '../../models/index.js';

export class AttendanceController {
    async checkIn(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = checkInSchema.parse(req.body);

            // Get employee ID for current user
            const employee = await Employee.findOne({ userId: req.user!.userId });

            if (!employee) {
                throw ApiError.badRequest('No employee profile linked to your account');
            }

            const attendance = await attendanceService.checkIn(
                employee._id.toString(),
                req.user!.organizationId,
                input,
                req.ip
            );

            const latestSession = attendance.sessions && attendance.sessions.length > 0
                ? attendance.sessions[attendance.sessions.length - 1]
                : null;

            res.json({
                success: true,
                message: 'Checked in successfully',
                session: latestSession,
                data: attendance,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async checkOut(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = checkOutSchema.parse(req.body);

            const employee = await Employee.findOne({ userId: req.user!.userId });

            if (!employee) {
                throw ApiError.badRequest('No employee profile linked to your account');
            }

            const attendance = await attendanceService.checkOut(
                employee._id.toString(),
                req.user!.organizationId,
                input,
                req.ip
            );

            const latestSession = attendance.sessions && attendance.sessions.length > 0
                ? attendance.sessions[attendance.sessions.length - 1]
                : null;

            res.json({
                success: true,
                message: 'Checked out successfully',
                session: latestSession,
                data: attendance,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getAttendance(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const filters = attendanceFilterSchema.parse(req.query);
            const result = await attendanceService.getAttendance(req.user!.organizationId, filters);

            res.json({
                success: true,
                data: result.records,
                pagination: result.pagination,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getTodayAttendance(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await attendanceService.getTodayAttendance(req.user!.organizationId);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async createManualAttendance(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = createAttendanceSchema.parse(req.body);
            const attendance = await attendanceService.createManualAttendance(
                req.user!.organizationId,
                input
            );

            res.status(201).json({
                success: true,
                message: 'Attendance record created successfully',
                data: attendance,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async updateAttendance(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = updateAttendanceSchema.parse(req.body);
            const attendance = await attendanceService.updateAttendance(
                req.user!.organizationId,
                req.params.id,
                input
            );

            res.json({
                success: true,
                message: 'Attendance record updated successfully',
                data: attendance,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getMyAttendance(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employee = await Employee.findOne({ userId: req.user!.userId });

            if (!employee) {
                throw ApiError.badRequest('No employee profile linked to your account');
            }

            const filters = attendanceFilterSchema.parse({
                ...req.query,
                employeeId: employee._id.toString(),
            });

            const result = await attendanceService.getAttendance(req.user!.organizationId, filters);

            res.json({
                success: true,
                data: result.records,
                pagination: result.pagination,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;

            const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(1));
            const end = endDate ? new Date(endDate as string) : new Date();

            const stats = await attendanceService.getAttendanceStats(
                req.user!.organizationId,
                start,
                end
            );

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    async getStaffMonitoring(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const filters = staffMonitoringFilterSchema.parse(req.query);
            const result = await attendanceService.getStaffMonitoring(
                req.user!.organizationId,
                filters
            );

            res.json({
                success: true,
                data: result.staff,
                pagination: result.pagination,
                dateRange: result.dateRange,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getAttendanceStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employee = await Employee.findOne({ userId: req.user!.userId });

            if (!employee) {
                throw ApiError.badRequest('No employee profile linked to your account');
            }

            const result = await attendanceService.getAttendanceStatus(
                employee._id.toString(),
                req.user!.organizationId
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const attendanceController = new AttendanceController();
