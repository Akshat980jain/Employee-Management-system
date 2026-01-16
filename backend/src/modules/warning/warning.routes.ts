import { Router, Request, Response, NextFunction } from 'express';
import { warningController } from './warning.controller.js';
import { authenticate, authorizeAny } from '../../middleware/auth.js';

const router = Router();

// Wrapper to ensure authenticate works as middleware
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    authenticate(req, res, next);
};

// All routes require authentication
router.use(authMiddleware);

// Employee routes - accessible by all authenticated users
router.get('/my', warningController.getMyWarnings.bind(warningController));
router.get('/counts', warningController.getWarningCounts.bind(warningController));
router.patch('/:id/read', warningController.markAsRead.bind(warningController));

// Admin/HR routes - require employee management permissions
router.post(
    '/',
    authorizeAny('employees:create', 'employees:update'),
    warningController.createWarning.bind(warningController)
);
router.get(
    '/',
    authorizeAny('employees:read'),
    warningController.getWarnings.bind(warningController)
);
router.patch(
    '/:id',
    authorizeAny('employees:update'),
    warningController.updateWarning.bind(warningController)
);
router.delete(
    '/:id',
    authorizeAny('employees:update'),
    warningController.dismissWarning.bind(warningController)
);

export default router;
