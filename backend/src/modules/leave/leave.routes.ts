import { Router } from 'express';
import { leaveController } from './leave.controller.js';
import { authenticate, authorize, authorizeAny } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Leave Types (Admin)
router.get('/types', leaveController.getLeaveTypes.bind(leaveController));
router.post('/types', authorize('leave:create'), leaveController.createLeaveType.bind(leaveController));

// Leave Policies (Admin)
router.get('/policies', leaveController.getLeavePolicies.bind(leaveController));
router.post('/policies', authorize('leave:create'), leaveController.createLeavePolicy.bind(leaveController));
router.put('/policies/:id', authorize('leave:create'), leaveController.updateLeavePolicy.bind(leaveController));

// Self-service routes
router.post('/requests', leaveController.createLeaveRequest.bind(leaveController));
router.get('/my/requests', leaveController.getMyLeaveRequests.bind(leaveController));
router.get('/my/balances', leaveController.getMyBalances.bind(leaveController));
router.delete('/requests/:id', leaveController.cancelLeaveRequest.bind(leaveController));

// Admin routes
router.get('/requests', authorizeAny('leave:read'), leaveController.getLeaveRequests.bind(leaveController));
router.get('/pending', authorize('leave:approve'), leaveController.getPendingApprovals.bind(leaveController));
router.get('/requests/:id', authorizeAny('leave:read'), leaveController.getLeaveRequest.bind(leaveController));
router.put('/requests/:id/approve', authorize('leave:approve'), leaveController.approveLeaveRequest.bind(leaveController));
router.get('/balances/:employeeId', authorizeAny('leave:read'), leaveController.getEmployeeBalances.bind(leaveController));

export default router;
