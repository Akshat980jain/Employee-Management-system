import { z } from 'zod';

// MongoDB ObjectId validation (24 char hex string)
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const createWarningSchema = z.object({
    employeeIds: z.array(objectIdSchema).min(1, 'At least one employee is required'),
    message: z.string().min(5, 'Message must be at least 5 characters'),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

export const updateWarningSchema = z.object({
    message: z.string().min(5).optional(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    isActive: z.boolean().optional(),
});

export const warningFilterSchema = z.object({
    employeeId: objectIdSchema.optional(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    isActive: z.string().optional().transform(val => val === 'true'),
    isRead: z.string().optional().transform(val => val === 'true'),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
});

export type CreateWarningInput = z.infer<typeof createWarningSchema>;
export type UpdateWarningInput = z.infer<typeof updateWarningSchema>;
export type WarningFilterInput = z.infer<typeof warningFilterSchema>;
