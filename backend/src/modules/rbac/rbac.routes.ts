import { Router } from 'express';
import { rbacController } from './rbac.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Roles
router.get('/roles', authorize('roles:read'), rbacController.getRoles.bind(rbacController));
router.get('/roles/:id', authorize('roles:read'), rbacController.getRole.bind(rbacController));
router.post('/roles', authorize('roles:create'), rbacController.createRole.bind(rbacController));
router.put('/roles/:id', authorize('roles:update'), rbacController.updateRole.bind(rbacController));
router.delete('/roles/:id', authorize('roles:delete'), rbacController.deleteRole.bind(rbacController));

// Permissions
router.get('/permissions', authorize('roles:read'), rbacController.getPermissions.bind(rbacController));
router.get('/permissions/by-module', authorize('roles:read'), rbacController.getPermissionsByModule.bind(rbacController));

// User role assignment
router.get('/users/:userId/roles', authorize('roles:read'), rbacController.getUserRoles.bind(rbacController));
router.post('/users/:userId/roles', authorize('roles:update'), rbacController.assignRoleToUser.bind(rbacController));
router.delete('/users/:userId/roles/:roleId', authorize('roles:update'), rbacController.removeRoleFromUser.bind(rbacController));

// Permission matrix
router.get('/matrix', authorize('roles:read'), rbacController.getPermissionMatrix.bind(rbacController));

export default router;
