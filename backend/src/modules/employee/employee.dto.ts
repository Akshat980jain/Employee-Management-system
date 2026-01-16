import { z } from 'zod';

export const createEmployeeSchema = z.object({
    employeeId: z.string().min(1).max(50),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    email: z.string().email(),
    phone: z.string().optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zipCode: z.string().optional(),
    }).optional(),
    emergencyContact: z.object({
        name: z.string(),
        relationship: z.string(),
        phone: z.string(),
    }).optional(),
    status: z.enum(['HIRED', 'ACTIVE', 'ON_PROBATION', 'ON_LEAVE', 'RESIGNED', 'TERMINATED']).default('HIRED'),
    employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'CONSULTANT']).default('FULL_TIME'),
    workLocation: z.enum(['ONSITE', 'REMOTE', 'HYBRID']).default('ONSITE'),
    joinDate: z.string().datetime(),
    probationEndDate: z.string().datetime().optional(),
    departmentId: z.string().uuid().optional(),
    managerId: z.string().uuid().optional(),
    designation: z.string().optional(),
    salaryBand: z.string().optional(),
    currency: z.string().default('USD'),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().omit({ employeeId: true });

export const updateEmployeeStatusSchema = z.object({
    status: z.enum(['HIRED', 'ACTIVE', 'ON_PROBATION', 'ON_LEAVE', 'RESIGNED', 'TERMINATED']),
    reason: z.string().optional(),
    effectiveDate: z.string().datetime().optional(),
    notes: z.string().optional(),
});

export const employeeFilterSchema = z.object({
    status: z.string().optional(),
    departmentId: z.string().uuid().optional(),
    managerId: z.string().uuid().optional(),
    employmentType: z.string().optional(),
    workLocation: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type UpdateEmployeeStatusInput = z.infer<typeof updateEmployeeStatusSchema>;
export type EmployeeFilterInput = z.infer<typeof employeeFilterSchema>;
