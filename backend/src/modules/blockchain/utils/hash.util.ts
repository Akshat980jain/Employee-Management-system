import * as crypto from 'crypto';

/**
 * Blockchain Hashing Utilities
 * Provides SHA-256 hashing and Merkle tree functionality for record anchoring
 */

/**
 * Create SHA-256 hash of any data
 */
export function sha256(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Create deterministic hash of an object
 * Sorts keys to ensure consistent hashing regardless of property order
 */
export function hashObject(obj: object): string {
    const sortedJson = JSON.stringify(sortObjectKeys(obj));
    return sha256(sortedJson);
}

/**
 * Sort object keys recursively for deterministic serialization
 */
function sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }

    const sorted: Record<string, any> = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sorted[key] = sortObjectKeys(obj[key]);
        });

    return sorted;
}

/**
 * Create a record hash for blockchain anchoring
 */
export interface RecordHashInput {
    recordId: string;
    recordType: string;
    organizationId: string;
    data: object;
    timestamp: Date;
}

export function createRecordHash(input: RecordHashInput): string {
    const hashData = {
        recordId: input.recordId,
        recordType: input.recordType,
        organizationId: input.organizationId,
        dataHash: hashObject(input.data),
        timestamp: input.timestamp.toISOString(),
    };

    return hashObject(hashData);
}

/**
 * Merkle Tree implementation for batch anchoring
 */
export class MerkleTree {
    private leaves: string[];
    private layers: string[][];

    constructor(data: string[]) {
        this.leaves = data.map((d) => sha256(d));
        this.layers = this.buildLayers();
    }

    private buildLayers(): string[][] {
        const layers: string[][] = [this.leaves];

        while (layers[layers.length - 1].length > 1) {
            const currentLayer = layers[layers.length - 1];
            const nextLayer: string[] = [];

            for (let i = 0; i < currentLayer.length; i += 2) {
                const left = currentLayer[i];
                const right = currentLayer[i + 1] || left; // Duplicate last if odd
                nextLayer.push(sha256(left + right));
            }

            layers.push(nextLayer);
        }

        return layers;
    }

    /**
     * Get the Merkle root
     */
    getRoot(): string {
        return this.layers[this.layers.length - 1][0] || '';
    }

    /**
     * Get proof for a specific leaf
     */
    getProof(index: number): string[] {
        const proof: string[] = [];
        let currentIndex = index;

        for (let i = 0; i < this.layers.length - 1; i++) {
            const layer = this.layers[i];
            const isRight = currentIndex % 2 === 1;
            const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;

            if (siblingIndex < layer.length) {
                proof.push(layer[siblingIndex]);
            }

            currentIndex = Math.floor(currentIndex / 2);
        }

        return proof;
    }

    /**
     * Verify a proof
     */
    static verify(leaf: string, proof: string[], root: string): boolean {
        let hash = sha256(leaf);

        for (const sibling of proof) {
            // For simplicity, we concatenate in sorted order
            const pair = [hash, sibling].sort();
            hash = sha256(pair[0] + pair[1]);
        }

        return hash === root;
    }
}

/**
 * Create hash for attendance record
 */
export interface AttendanceHashData {
    employeeId: string;
    date: string;
    checkIn?: Date;
    checkOut?: Date;
    checkInLocation?: object;
    checkOutLocation?: object;
    checkInIp?: string;
    checkOutIp?: string;
    status: string;
    workMinutes?: number;
}

export function hashAttendanceRecord(data: AttendanceHashData): string {
    return hashObject({
        employeeId: data.employeeId,
        date: data.date,
        checkIn: data.checkIn?.toISOString(),
        checkOut: data.checkOut?.toISOString(),
        checkInLocationHash: data.checkInLocation ? hashObject(data.checkInLocation) : null,
        checkOutLocationHash: data.checkOutLocation ? hashObject(data.checkOutLocation) : null,
        checkInIpHash: data.checkInIp ? sha256(data.checkInIp) : null,
        checkOutIpHash: data.checkOutIp ? sha256(data.checkOutIp) : null,
        status: data.status,
        workMinutes: data.workMinutes,
    });
}

/**
 * Create hash for leave request
 */
export interface LeaveHashData {
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    days: number;
    status: string;
    reason?: string;
}

export function hashLeaveRecord(data: LeaveHashData): string {
    return hashObject({
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        days: data.days,
        status: data.status,
        reasonHash: data.reason ? sha256(data.reason) : null,
    });
}
