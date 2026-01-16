import { Router } from 'express';
import { attendanceController } from './attendance.controller.js';
import { authenticate, authorize, authorizeAny } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Self-service routes
router.post('/check-in', attendanceController.checkIn.bind(attendanceController));
router.post('/check-out', attendanceController.checkOut.bind(attendanceController));
router.get('/my', attendanceController.getMyAttendance.bind(attendanceController));

// Admin routes
router.get('/', authorizeAny('attendance:read'), attendanceController.getAttendance.bind(attendanceController));
router.get('/today', authorizeAny('attendance:read'), attendanceController.getTodayAttendance.bind(attendanceController));
router.get('/stats', authorizeAny('attendance:read'), attendanceController.getStats.bind(attendanceController));
router.get('/staff-monitoring', authorizeAny('attendance:read'), attendanceController.getStaffMonitoring.bind(attendanceController));
router.post('/', authorize('attendance:create'), attendanceController.createManualAttendance.bind(attendanceController));
router.put('/:id', authorize('attendance:update'), attendanceController.updateAttendance.bind(attendanceController));

export default router;
