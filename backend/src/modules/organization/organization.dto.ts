import { z } from 'zod';

export const createOrganizationSchema = z.object({
    name: z.string().min(2).max(100),
    industry: z.string().optional(),
    size: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
    timezone: z.string().default('UTC'),
    workingDays: z.array(z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])).optional(),
});

export const updateOrganizationSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    industry: z.string().optional(),
    size: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
    timezone: z.string().optional(),
    workingDays: z.array(z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])).optional(),
    annualLeaveQuota: z.number().int().min(0).optional(),
    sickLeaveQuota: z.number().int().min(0).optional(),
    carryForwardLimit: z.number().int().min(0).optional(),
    settings: z.record(z.any()).optional(),
});

export const createDepartmentSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    parentId: z.string().uuid().optional(),
});

export const updateDepartmentSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    parentId: z.string().uuid().nullable().optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
