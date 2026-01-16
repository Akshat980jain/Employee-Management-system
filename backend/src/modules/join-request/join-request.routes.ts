import { Router } from 'express';
import { joinRequestController } from './join-request.controller.js';
import { authenticate, authorizeAny } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's own join requests (for pending verification page)
router.get('/my', joinRequestController.getMyRequests.bind(joinRequestController));

// Routes below require HR or Admin permissions
router.get(
    '/',
    authorizeAny('employees:read', 'employees:create'),
    joinRequestController.getRequests.bind(joinRequestController)
);

router.get(
    '/counts',
    authorizeAny('employees:read', 'employees:create'),
    joinRequestController.getRequestCounts.bind(joinRequestController)
);

router.post(
    '/:id/approve',
    authorizeAny('employees:create'),
    joinRequestController.approveRequest.bind(joinRequestController)
);

router.post(
    '/:id/reject',
    authorizeAny('employees:create'),
    joinRequestController.rejectRequest.bind(joinRequestController)
);

export default router;
