import mongoose from 'mongoose';
import {
    hashObject,
    hashAttendanceRecord,
    hashLeaveRecord,
    MerkleTree,
    sha256,
    type AttendanceHashData,
    type LeaveHashData
} from './utils/hash.util.js';
import {
    signRecord,
    verifySignedRecord,
    createVerificationToken,
    type SignedRecord
} from './utils/signature.util.js';
import {
    BlockchainTransaction,
    Attendance,
    LeaveRequest,
    Employee,
    Organization
} from '../../models/index.js';
import { ApiError } from '../../middleware/errorHandler.js';
import type { RecordType, TransactionFilter } from './blockchain.dto.js';

/**
 * Blockchain Service
 * Handles record anchoring, verification, and transaction management
 */

// Blockchain secret - in production this should come from HSM/KMS
const BLOCKCHAIN_SECRET = process.env.BLOCKCHAIN_SECRET || 'ems-blockchain-secret-key-change-in-production';

export interface AnchorResult {
    transactionHash: string;
    dataHash: string;
    blockNumber: number;
    timestamp: Date;
    signature: string;
}

export interface VerificationResult {
    isValid: boolean;
    recordId: string;
    recordType: string;
    dataHash: string;
    anchoredAt?: Date;
    currentHash?: string;
    message: string;
}

export interface TransactionListResult {
    transactions: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class BlockchainService {
    /**
     * Generate a simulated block number (in production, this comes from the blockchain)
     */
    private generateBlockNumber(): number {
        // Simulated block number based on timestamp
        return Math.floor(Date.now() / 1000);
    }

    /**
     * Generate a transaction hash
     */
    private generateTransactionHash(dataHash: string, blockNumber: number): string {
        return sha256(`${dataHash}:${blockNumber}:${Date.now()}`);
    }

    /**
     * Anchor an attendance record to the blockchain
     */
    async anchorAttendance(
        attendanceId: string,
        organizationId: string
    ): Promise<AnchorResult> {
        const attendance = await Attendance.findById(attendanceId);

        if (!attendance) {
            throw ApiError.notFound('Attendance record not found');
        }

        // Create hash data
        const hashData: AttendanceHashData = {
            employeeId: attendance.employeeId.toString(),
            date: attendance.date.toISOString().split('T')[0],
            checkIn: attendance.checkIn,
            checkOut: attendance.checkOut,
            checkInLocation: attendance.checkInLocation,
            checkOutLocation: attendance.checkOutLocation,
            checkInIp: attendance.checkInIp,
            checkOutIp: attendance.checkOutIp,
            status: attendance.status,
            workMinutes: attendance.workMinutes,
        };

        const dataHash = hashAttendanceRecord(hashData);
        const blockNumber = this.generateBlockNumber();
        const transactionHash = this.generateTransactionHash(dataHash, blockNumber);

        // Sign the record
        const signedRecord = signRecord(dataHash, BLOCKCHAIN_SECRET, organizationId);

        // Create blockchain transaction record
        const transaction = await BlockchainTransaction.create({
            transactionHash,
            blockNumber,
            recordType: 'ATTENDANCE',
            recordId: attendance._id,
            dataHash,
            organizationId: new mongoose.Types.ObjectId(organizationId),
            submittedBy: attendance.employeeId,
            status: 'CONFIRMED',
            signature: signedRecord.signature,
            confirmedAt: new Date(),
        });

        // Update attendance record with blockchain info
        await Attendance.findByIdAndUpdate(attendanceId, {
            blockchainHash: transactionHash,
            blockchainTimestamp: new Date(),
            blockchainVerified: true,
        });

        return {
            transactionHash,
            dataHash,
            blockNumber,
            timestamp: transaction.confirmedAt!,
            signature: signedRecord.signature,
        };
    }

    /**
     * Anchor a leave request to the blockchain
     */
    async anchorLeave(
        leaveRequestId: string,
        organizationId: string
    ): Promise<AnchorResult> {
        const leaveRequest = await LeaveRequest.findById(leaveRequestId);

        if (!leaveRequest) {
            throw ApiError.notFound('Leave request not found');
        }

        // Create hash data
        const hashData: LeaveHashData = {
            employeeId: leaveRequest.employeeId.toString(),
            leaveTypeId: leaveRequest.leaveTypeId.toString(),
            startDate: leaveRequest.startDate.toISOString().split('T')[0],
            endDate: leaveRequest.endDate.toISOString().split('T')[0],
            days: leaveRequest.days,
            status: leaveRequest.status,
            reason: leaveRequest.reason,
        };

        const dataHash = hashLeaveRecord(hashData);
        const blockNumber = this.generateBlockNumber();
        const transactionHash = this.generateTransactionHash(dataHash, blockNumber);

        // Sign the record
        const signedRecord = signRecord(dataHash, BLOCKCHAIN_SECRET, organizationId);

        // Create blockchain transaction record
        const transaction = await BlockchainTransaction.create({
            transactionHash,
            blockNumber,
            recordType: 'LEAVE',
            recordId: leaveRequest._id,
            dataHash,
            organizationId: new mongoose.Types.ObjectId(organizationId),
            submittedBy: leaveRequest.employeeId,
            status: 'CONFIRMED',
            signature: signedRecord.signature,
            confirmedAt: new Date(),
        });

        // Update leave request with blockchain info
        await LeaveRequest.findByIdAndUpdate(leaveRequestId, {
            blockchainHash: transactionHash,
            blockchainTimestamp: new Date(),
            blockchainVerified: true,
        });

        return {
            transactionHash,
            dataHash,
            blockNumber,
            timestamp: transaction.confirmedAt!,
            signature: signedRecord.signature,
        };
    }

    /**
     * Anchor a generic record
     */
    async anchorRecord(
        recordType: RecordType,
        recordId: string,
        organizationId: string
    ): Promise<AnchorResult> {
        switch (recordType) {
            case 'ATTENDANCE':
                return this.anchorAttendance(recordId, organizationId);
            case 'LEAVE':
                return this.anchorLeave(recordId, organizationId);
            default:
                throw ApiError.badRequest(`Unsupported record type: ${recordType}`);
        }
    }

    /**
     * Batch anchor multiple records using Merkle tree
     */
    async batchAnchor(
        recordType: RecordType,
        recordIds: string[],
        organizationId: string
    ): Promise<{ merkleRoot: string; transactions: AnchorResult[] }> {
        const results: AnchorResult[] = [];

        for (const recordId of recordIds) {
            const result = await this.anchorRecord(recordType, recordId, organizationId);
            results.push(result);
        }

        // Create Merkle tree from all data hashes
        const merkleTree = new MerkleTree(results.map(r => r.dataHash));
        const merkleRoot = merkleTree.getRoot();

        // Store merkle root transaction
        await BlockchainTransaction.create({
            transactionHash: sha256(merkleRoot),
            blockNumber: this.generateBlockNumber(),
            recordType: 'GENERAL',
            recordId: undefined,
            dataHash: merkleRoot,
            organizationId: new mongoose.Types.ObjectId(organizationId),
            status: 'CONFIRMED',
            metadata: {
                type: 'BATCH_ANCHOR',
                recordCount: recordIds.length,
                recordType,
            },
            confirmedAt: new Date(),
        });

        return { merkleRoot, transactions: results };
    }

    /**
     * Verify an attendance record
     */
    async verifyAttendance(attendanceId: string): Promise<VerificationResult> {
        const attendance = await Attendance.findById(attendanceId);

        if (!attendance) {
            throw ApiError.notFound('Attendance record not found');
        }

        // Get the blockchain transaction
        const transaction = await BlockchainTransaction.findOne({
            recordType: 'ATTENDANCE',
            recordId: attendance._id,
            status: 'CONFIRMED',
        }).sort({ confirmedAt: -1 });

        if (!transaction) {
            return {
                isValid: false,
                recordId: attendanceId,
                recordType: 'ATTENDANCE',
                dataHash: '',
                message: 'No blockchain record found for this attendance',
            };
        }

        // Recalculate current hash
        const currentHashData: AttendanceHashData = {
            employeeId: attendance.employeeId.toString(),
            date: attendance.date.toISOString().split('T')[0],
            checkIn: attendance.checkIn,
            checkOut: attendance.checkOut,
            checkInLocation: attendance.checkInLocation,
            checkOutLocation: attendance.checkOutLocation,
            checkInIp: attendance.checkInIp,
            checkOutIp: attendance.checkOutIp,
            status: attendance.status,
            workMinutes: attendance.workMinutes,
        };

        const currentHash = hashAttendanceRecord(currentHashData);
        const isValid = currentHash === transaction.dataHash;

        return {
            isValid,
            recordId: attendanceId,
            recordType: 'ATTENDANCE',
            dataHash: transaction.dataHash,
            currentHash,
            anchoredAt: transaction.confirmedAt,
            message: isValid
                ? 'Record verified successfully - data integrity confirmed'
                : 'Record verification failed - data has been modified since anchoring',
        };
    }

    /**
     * Verify a leave request
     */
    async verifyLeave(leaveRequestId: string): Promise<VerificationResult> {
        const leaveRequest = await LeaveRequest.findById(leaveRequestId);

        if (!leaveRequest) {
            throw ApiError.notFound('Leave request not found');
        }

        // Get the blockchain transaction
        const transaction = await BlockchainTransaction.findOne({
            recordType: 'LEAVE',
            recordId: leaveRequest._id,
            status: 'CONFIRMED',
        }).sort({ confirmedAt: -1 });

        if (!transaction) {
            return {
                isValid: false,
                recordId: leaveRequestId,
                recordType: 'LEAVE',
                dataHash: '',
                message: 'No blockchain record found for this leave request',
            };
        }

        // Recalculate current hash
        const currentHashData: LeaveHashData = {
            employeeId: leaveRequest.employeeId.toString(),
            leaveTypeId: leaveRequest.leaveTypeId.toString(),
            startDate: leaveRequest.startDate.toISOString().split('T')[0],
            endDate: leaveRequest.endDate.toISOString().split('T')[0],
            days: leaveRequest.days,
            status: leaveRequest.status,
            reason: leaveRequest.reason,
        };

        const currentHash = hashLeaveRecord(currentHashData);
        const isValid = currentHash === transaction.dataHash;

        return {
            isValid,
            recordId: leaveRequestId,
            recordType: 'LEAVE',
            dataHash: transaction.dataHash,
            currentHash,
            anchoredAt: transaction.confirmedAt,
            message: isValid
                ? 'Record verified successfully - data integrity confirmed'
                : 'Record verification failed - data has been modified since anchoring',
        };
    }

    /**
     * Verify a record
     */
    async verifyRecord(recordType: RecordType, recordId: string): Promise<VerificationResult> {
        switch (recordType) {
            case 'ATTENDANCE':
                return this.verifyAttendance(recordId);
            case 'LEAVE':
                return this.verifyLeave(recordId);
            default:
                throw ApiError.badRequest(`Unsupported record type: ${recordType}`);
        }
    }

    /**
     * Get list of blockchain transactions
     */
    async getTransactions(
        organizationId: string,
        filters: TransactionFilter
    ): Promise<TransactionListResult> {
        const query: any = { organizationId: new mongoose.Types.ObjectId(organizationId) };

        if (filters.recordType) {
            query.recordType = filters.recordType;
        }

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) {
                query.createdAt.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.createdAt.$lte = new Date(filters.endDate);
            }
        }

        const total = await BlockchainTransaction.countDocuments(query);
        const skip = (filters.page - 1) * filters.limit;

        const transactions = await BlockchainTransaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(filters.limit)
            .lean();

        return {
            transactions,
            pagination: {
                page: filters.page,
                limit: filters.limit,
                total,
                totalPages: Math.ceil(total / filters.limit),
            },
        };
    }

    /**
     * Get a single transaction by ID
     */
    async getTransaction(transactionId: string, organizationId: string) {
        const transaction = await BlockchainTransaction.findOne({
            _id: new mongoose.Types.ObjectId(transactionId),
            organizationId: new mongoose.Types.ObjectId(organizationId),
        });

        if (!transaction) {
            throw ApiError.notFound('Transaction not found');
        }

        return transaction;
    }

    /**
     * Generate a verification certificate
     */
    async generateCertificate(
        transactionId: string,
        organizationId: string,
        expiresInHours: number
    ): Promise<{
        certificateId: string;
        token: string;
        expiresAt: Date;
        transactionDetails: any;
    }> {
        const transaction = await this.getTransaction(transactionId, organizationId);

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresInHours);

        const certificateId = sha256(`${transactionId}:${Date.now()}`).substring(0, 16).toUpperCase();

        const token = createVerificationToken(
            transaction.recordId?.toString() || '',
            transaction.recordType,
            transaction.dataHash,
            expiresAt,
            BLOCKCHAIN_SECRET
        );

        return {
            certificateId,
            token,
            expiresAt,
            transactionDetails: {
                transactionHash: transaction.transactionHash,
                blockNumber: transaction.blockNumber,
                recordType: transaction.recordType,
                dataHash: transaction.dataHash,
                confirmedAt: transaction.confirmedAt,
            },
        };
    }

    /**
     * Get blockchain statistics for an organization
     */
    async getStats(organizationId: string): Promise<{
        totalTransactions: number;
        byRecordType: Record<string, number>;
        byStatus: Record<string, number>;
        last24Hours: number;
        last7Days: number;
    }> {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        const [totalTransactions, byRecordType, byStatus, last24Hours, last7Days] = await Promise.all([
            BlockchainTransaction.countDocuments({ organizationId: orgId }),
            BlockchainTransaction.aggregate([
                { $match: { organizationId: orgId } },
                { $group: { _id: '$recordType', count: { $sum: 1 } } },
            ]),
            BlockchainTransaction.aggregate([
                { $match: { organizationId: orgId } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            BlockchainTransaction.countDocuments({
                organizationId: orgId,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            }),
            BlockchainTransaction.countDocuments({
                organizationId: orgId,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            }),
        ]);

        const recordTypeMap: Record<string, number> = {};
        byRecordType.forEach((item: any) => {
            recordTypeMap[item._id] = item.count;
        });

        const statusMap: Record<string, number> = {};
        byStatus.forEach((item: any) => {
            statusMap[item._id] = item.count;
        });

        return {
            totalTransactions,
            byRecordType: recordTypeMap,
            byStatus: statusMap,
            last24Hours,
            last7Days,
        };
    }
}

export const blockchainService = new BlockchainService();
