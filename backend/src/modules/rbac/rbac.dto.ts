import { z } from 'zod';

export const createRoleSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    permissionIds: z.array(z.string().uuid()).optional(),
});

export const updateRoleSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    permissionIds: z.array(z.string().uuid()).optional(),
});

export const assignRoleSchema = z.object({
    roleId: z.string().uuid(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
