import { Router } from 'express';
import { authenticate, authorizeAny } from '../../middleware/auth.js';
import { AttendanceCorrection, Employee, Attendance } from '../../models/index.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { Response, NextFunction } from 'express';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create correction request (Employee)
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { date, requestType, reason, proposedCheckIn, proposedCheckOut } = req.body;

        const employee = await Employee.findOne({ userId: req.user!.userId });
        if (!employee) {
            throw ApiError.badRequest('No employee profile found');
        }

        // Check if attendance exists for the date
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: attendanceDate, $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000) }
        });

        const correction = await AttendanceCorrection.create({
            employeeId: employee._id,
            attendanceId: attendance?._id,
            date: attendanceDate,
            requestType,
            reason,
            proposedCheckIn: proposedCheckIn ? new Date(proposedCheckIn) : undefined,
            proposedCheckOut: proposedCheckOut ? new Date(proposedCheckOut) : undefined,
        });

        res.status(201).json({
            success: true,
            message: 'Correction request submitted successfully',
            data: correction,
        });
    } catch (error) {
        next(error);
    }
});

// Get my correction requests (Employee)
router.get('/my', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const employee = await Employee.findOne({ userId: req.user!.userId });
        if (!employee) {
            throw ApiError.badRequest('No employee profile found');
        }

        const corrections = await AttendanceCorrection.find({ employeeId: employee._id })
            .sort({ createdAt: -1 })
            .populate('reviewedBy', 'firstName lastName');

        res.json({
            success: true,
            data: corrections,
        });
    } catch (error) {
        next(error);
    }
});

// Get pending corrections (HR/Admin)
router.get('/pending', authorizeAny('attendance:update'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const employees = await Employee.find({ organizationId: req.user!.organizationId }).select('_id');
        const employeeIds = employees.map(e => e._id);

        const corrections = await AttendanceCorrection.find({
            employeeId: { $in: employeeIds },
            status: 'PENDING',
        })
            .sort({ createdAt: -1 })
            .populate('employeeId', 'firstName lastName employeeId')
            .populate('attendanceId', 'date checkIn checkOut sessions');

        res.json({
            success: true,
            data: corrections,
        });
    } catch (error) {
        next(error);
    }
});

// Approve correction (HR/Admin)
router.put('/:id/approve', authorizeAny('attendance:update'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { reviewNotes } = req.body;

        const correction = await AttendanceCorrection.findById(req.params.id);
        if (!correction) {
            throw ApiError.notFound('Correction request not found');
        }

        if (correction.status !== 'PENDING') {
            throw ApiError.badRequest('This request has already been processed');
        }

        // Apply the correction to attendance record
        if (correction.requestType === 'ADD_SESSION' && correction.proposedCheckIn) {
            const date = new Date(correction.date);
            date.setHours(0, 0, 0, 0);

            let attendance = await Attendance.findOne({
                employeeId: correction.employeeId,
                date: { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) }
            });

            if (!attendance) {
                attendance = await Attendance.create({
                    employeeId: correction.employeeId,
                    date,
                    status: 'PRESENT',
                    sessions: [],
                });
            }

            const sessions = attendance.sessions || [];
            const checkIn = correction.proposedCheckIn;
            const checkOut = correction.proposedCheckOut;
            const workMinutes = checkOut ? Math.floor((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000) : 0;

            sessions.push({
                checkIn,
                checkOut,
                isLate: false,
                workMinutes,
            });

            attendance.sessions = sessions;
            if (!attendance.checkIn) attendance.checkIn = checkIn;
            if (checkOut) attendance.checkOut = checkOut;

            // Recalculate total work minutes
            const totalWorkMinutes = sessions.reduce((sum: number, s: any) => sum + (s.workMinutes || 0), 0);
            attendance.workMinutes = totalWorkMinutes;
            attendance.overtimeMinutes = Math.max(0, totalWorkMinutes - 480);

            await attendance.save();
        }

        // Update correction status
        correction.status = 'APPROVED';
        correction.reviewedBy = req.user!.userId as any;
        correction.reviewedAt = new Date();
        correction.reviewNotes = reviewNotes;
        await correction.save();

        res.json({
            success: true,
            message: 'Correction request approved',
            data: correction,
        });
    } catch (error) {
        next(error);
    }
});

// Reject correction (HR/Admin)
router.put('/:id/reject', authorizeAny('attendance:update'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { reviewNotes } = req.body;

        const correction = await AttendanceCorrection.findById(req.params.id);
        if (!correction) {
            throw ApiError.notFound('Correction request not found');
        }

        if (correction.status !== 'PENDING') {
            throw ApiError.badRequest('This request has already been processed');
        }

        correction.status = 'REJECTED';
        correction.reviewedBy = req.user!.userId as any;
        correction.reviewedAt = new Date();
        correction.reviewNotes = reviewNotes;
        await correction.save();

        res.json({
            success: true,
            message: 'Correction request rejected',
            data: correction,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
