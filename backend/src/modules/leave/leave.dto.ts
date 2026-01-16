import { z } from 'zod';

// MongoDB ObjectId validation - 24 character hex string
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

export const createLeaveRequestSchema = z.object({
    leaveTypeId: objectIdSchema,
    startDate: z.string(),
    endDate: z.string(),
    reason: z.string().optional(),
    attachments: z.array(z.string()).optional(),
});

export const updateLeaveRequestSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    reason: z.string().optional(),
});

export const approveLeaveSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().optional(),
    reason: z.string().optional(),
});

export const leaveFilterSchema = z.object({
    employeeId: objectIdSchema.optional(),
    leaveTypeId: objectIdSchema.optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'AUTO_APPROVED']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
});

export const createLeaveTypeSchema = z.object({
    name: z.string().min(1).max(100),
    code: z.string().min(1).max(10),
    description: z.string().optional(),
    isPaid: z.boolean().default(true),
    color: z.string().optional(),
});

export const createLeavePolicySchema = z.object({
    leaveTypeId: objectIdSchema,
    annualQuota: z.number().min(0).default(0),
    accrualFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).default('YEARLY'),
    allowCarryForward: z.boolean().default(false),
    maxCarryForward: z.number().min(0).default(0),
    carryForwardExpiry: z.number().int().min(0).optional(),
    maxConsecutiveDays: z.number().int().min(1).optional(),
    minNoticeDays: z.number().int().min(0).default(0),
    includeSandwich: z.boolean().default(false),
    enableAutoApproval: z.boolean().default(false),
    autoApprovalMaxDays: z.number().int().min(1).optional(),
});

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type UpdateLeaveRequestInput = z.infer<typeof updateLeaveRequestSchema>;
export type ApproveLeaveInput = z.infer<typeof approveLeaveSchema>;
export type LeaveFilterInput = z.infer<typeof leaveFilterSchema>;
export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>;
export type CreateLeavePolicyInput = z.infer<typeof createLeavePolicySchema>;
