import { Router } from 'express';
import { organizationController } from './organization.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// Public route - no authentication required (for registration dropdown)
router.get('/public', organizationController.getPublicOrganizations.bind(organizationController));

// Search route - requires authentication
router.get('/search', authenticate, organizationController.searchOrganizations.bind(organizationController));

// All routes below require authentication
router.use(authenticate);

// Organization routes
router.get('/', organizationController.getOrganization.bind(organizationController));
router.put('/', authorize('organization:update'), organizationController.updateOrganization.bind(organizationController));
router.get('/settings', organizationController.getSettings.bind(organizationController));
router.get('/stats', organizationController.getStats.bind(organizationController));

// Department routes
router.get('/departments', organizationController.getDepartments.bind(organizationController));
router.get('/departments/tree', organizationController.getDepartmentTree.bind(organizationController));
router.post('/departments', authorize('organization:update'), organizationController.createDepartment.bind(organizationController));
router.put('/departments/:id', authorize('organization:update'), organizationController.updateDepartment.bind(organizationController));
router.delete('/departments/:id', authorize('organization:update'), organizationController.deleteDepartment.bind(organizationController));

export default router;
