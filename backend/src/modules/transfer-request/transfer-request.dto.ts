import { z } from 'zod';

export const createTransferRequestSchema = z.object({
    toOrganizationId: z.string().min(1, 'Target organization is required'),
    requestedRole: z.string().default('Employee'),
    message: z.string().optional(),
});

export const reviewTransferRequestSchema = z.object({
    rejectionReason: z.string().optional(),
});

export type CreateTransferRequestInput = z.infer<typeof createTransferRequestSchema>;
export type ReviewTransferRequestInput = z.infer<typeof reviewTransferRequestSchema>;
