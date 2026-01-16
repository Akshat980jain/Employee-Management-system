import { Organization, Department } from '../../models/index.js';
import { CreateOrganizationInput, UpdateOrganizationInput, CreateDepartmentInput, UpdateDepartmentInput } from './organization.dto.js';

export class OrganizationService {
    async getOrganization(organizationId: string) {
        return Organization.findById(organizationId).select('-__v');
    }

    async updateOrganization(organizationId: string, input: UpdateOrganizationInput) {
        return Organization.findByIdAndUpdate(organizationId, input, { new: true }).select('-__v');
    }

    async getSettings(organizationId: string) {
        const org = await Organization.findById(organizationId).select('settings workingDays annualLeaveQuota sickLeaveQuota carryForwardLimit timezone');
        return org;
    }

    async updateSettings(organizationId: string, settings: any) {
        return Organization.findByIdAndUpdate(
            organizationId,
            { settings, ...settings },
            { new: true }
        ).select('-__v');
    }

    async getStats(organizationId: string) {
        const [departments, employees] = await Promise.all([
            Department.countDocuments({ organizationId }),
            (await import('../../models/index.js')).Employee.countDocuments({ organizationId }),
        ]);

        const activeEmployees = await (await import('../../models/index.js')).Employee.countDocuments({
            organizationId,
            status: 'ACTIVE'
        });

        const onLeave = await (await import('../../models/index.js')).Employee.countDocuments({
            organizationId,
            status: 'ON_LEAVE'
        });

        return {
            totalEmployees: employees,
            activeEmployees,
            onLeave,
            departmentCount: departments,
        };
    }

    // Department methods
    async getDepartments(organizationId: string) {
        return Department.find({ organizationId })
            .populate('parentId', 'name')
            .select('-__v')
            .sort({ name: 1 });
    }

    async getDepartmentTree(organizationId: string) {
        const departments = await Department.find({ organizationId }).select('-__v').lean();

        const buildTree = (parentId: string | null): any[] => {
            return departments
                .filter(d => String(d.parentId) === String(parentId) || (!d.parentId && !parentId))
                .map(d => ({
                    ...d,
                    children: buildTree(String(d._id)),
                }));
        };

        return buildTree(null);
    }

    async createDepartment(organizationId: string, input: CreateDepartmentInput) {
        return Department.create({
            ...input,
            organizationId,
        });
    }

    async updateDepartment(departmentId: string, organizationId: string, input: UpdateDepartmentInput) {
        return Department.findOneAndUpdate(
            { _id: departmentId, organizationId },
            input,
            { new: true }
        ).select('-__v');
    }

    async deleteDepartment(departmentId: string, organizationId: string) {
        // Check if department has children
        const hasChildren = await Department.countDocuments({ parentId: departmentId });
        if (hasChildren > 0) {
            throw new Error('Cannot delete department with sub-departments');
        }

        // Check if department has employees
        const hasEmployees = await (await import('../../models/index.js')).Employee.countDocuments({ departmentId });
        if (hasEmployees > 0) {
            throw new Error('Cannot delete department with employees');
        }

        await Department.findOneAndDelete({ _id: departmentId, organizationId });
    }
}

export const organizationService = new OrganizationService();
