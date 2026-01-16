import { z } from 'zod';

// MongoDB ObjectId validation (24 char hex string)
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const checkInSchema = z.object({
    shiftId: objectIdSchema.optional(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional(),
    notes: z.string().optional(),
}).catchall(z.unknown()); // Allow any additional properties to pass through

export const checkOutSchema = z.object({
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional(),
    notes: z.string().optional(),
}).catchall(z.unknown());

export const createAttendanceSchema = z.object({
    employeeId: objectIdSchema,
    date: z.string(),
    shiftId: objectIdSchema.optional(),
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY']).default('PRESENT'),
    notes: z.string().optional(),
});

export const updateAttendanceSchema = z.object({
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY']).optional(),
    notes: z.string().optional(),
});

export const attendanceFilterSchema = z.object({
    employeeId: objectIdSchema.optional(),
    departmentId: objectIdSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(50),
});

export const staffMonitoringFilterSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    role: z.enum(['Admin', 'HR Manager', 'Employee', 'all']).optional().default('all'),
    search: z.string().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(50),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
export type AttendanceFilterInput = z.infer<typeof attendanceFilterSchema>;
export type StaffMonitoringFilterInput = z.infer<typeof staffMonitoringFilterSchema>;

