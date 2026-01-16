import { Router } from 'express';
import { employeeController } from './employee.controller.js';
import { authenticate, authorize, authorizeAny } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee CRUD
router.post('/', authorize('employees:create'), employeeController.createEmployee.bind(employeeController));
router.get('/', authorizeAny('employees:read'), employeeController.getEmployees.bind(employeeController));
router.get('/reporting-tree', authorizeAny('employees:read'), employeeController.getReportingTree.bind(employeeController));
router.get('/:id', authorizeAny('employees:read'), employeeController.getEmployee.bind(employeeController));
router.put('/:id', authorize('employees:update'), employeeController.updateEmployee.bind(employeeController));
router.delete('/:id', authorize('employees:delete'), employeeController.deleteEmployee.bind(employeeController));

// Employee lifecycle
router.put('/:id/status', authorize('employees:update'), employeeController.updateEmployeeStatus.bind(employeeController));
router.get('/:id/status-history', authorizeAny('employees:read'), employeeController.getEmployeeStatusHistory.bind(employeeController));

export default router;
