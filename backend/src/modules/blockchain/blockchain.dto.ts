import { z } from 'zod';

/**
 * Blockchain DTO Validation Schemas
 */

// Record types that can be anchored
export const RecordType = z.enum(['ATTENDANCE', 'LEAVE', 'EMPLOYEE', 'GENERAL']);
export type RecordType = z.infer<typeof RecordType>;

// Anchor a record to blockchain
export const anchorRecordSchema = z.object({
    recordType: RecordType,
    recordId: z.string().min(1, 'Record ID is required'),
    metadata: z.record(z.any()).optional(),
});

export type AnchorRecordInput = z.infer<typeof anchorRecordSchema>;

// Batch anchor multiple records
export const batchAnchorSchema = z.object({
    recordType: RecordType,
    recordIds: z.array(z.string()).min(1, 'At least one record ID is required').max(100, 'Maximum 100 records per batch'),
});

export type BatchAnchorInput = z.infer<typeof batchAnchorSchema>;

// Verify a record
export const verifyRecordSchema = z.object({
    recordType: RecordType,
    recordId: z.string().min(1, 'Record ID is required'),
});

export type VerifyRecordInput = z.infer<typeof verifyRecordSchema>;

// Transaction filter for listing
export const transactionFilterSchema = z.object({
    recordType: RecordType.optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'FAILED']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export type TransactionFilter = z.infer<typeof transactionFilterSchema>;

// Generate verification certificate
export const certificateSchema = z.object({
    transactionId: z.string().min(1, 'Transaction ID is required'),
    expiresInHours: z.coerce.number().int().positive().max(720).default(24), // Max 30 days
});

export type CertificateInput = z.infer<typeof certificateSchema>;
