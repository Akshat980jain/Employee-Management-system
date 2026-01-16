import * as crypto from 'crypto';

/**
 * Digital Signature Utilities
 * Provides HMAC-based signing for blockchain records
 */

const SIGNATURE_ALGORITHM = 'sha256';

/**
 * Create HMAC signature for data
 */
export function createSignature(data: string, secret: string): string {
    return crypto
        .createHmac(SIGNATURE_ALGORITHM, secret)
        .update(data)
        .digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifySignature(data: string, signature: string, secret: string): boolean {
    const expectedSignature = createSignature(data, secret);
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
    );
}

/**
 * Create a signed blockchain record
 */
export interface SignedRecord {
    data: string;
    signature: string;
    timestamp: string;
    signedBy: string;
}

export function signRecord(
    dataHash: string,
    secret: string,
    signerId: string
): SignedRecord {
    const timestamp = new Date().toISOString();
    const payload = `${dataHash}:${timestamp}:${signerId}`;
    const signature = createSignature(payload, secret);

    return {
        data: dataHash,
        signature,
        timestamp,
        signedBy: signerId,
    };
}

/**
 * Verify a signed record
 */
export function verifySignedRecord(
    record: SignedRecord,
    secret: string
): boolean {
    const payload = `${record.data}:${record.timestamp}:${record.signedBy}`;
    return verifySignature(payload, record.signature, secret);
}

/**
 * Generate a random secret key for an organization
 */
export function generateSecretKey(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a verification token for external verification
 */
export function createVerificationToken(
    recordId: string,
    recordType: string,
    dataHash: string,
    expiresAt: Date,
    secret: string
): string {
    const payload = JSON.stringify({
        recordId,
        recordType,
        dataHash,
        expiresAt: expiresAt.toISOString(),
    });

    const signature = createSignature(payload, secret);
    const token = Buffer.from(payload).toString('base64') + '.' + signature;

    return token;
}

/**
 * Verify and decode a verification token
 */
export function verifyVerificationToken(
    token: string,
    secret: string
): { valid: boolean; payload?: any; error?: string } {
    try {
        const [payloadBase64, signature] = token.split('.');

        if (!payloadBase64 || !signature) {
            return { valid: false, error: 'Invalid token format' };
        }

        const payload = Buffer.from(payloadBase64, 'base64').toString('utf8');

        if (!verifySignature(payload, signature, secret)) {
            return { valid: false, error: 'Invalid signature' };
        }

        const data = JSON.parse(payload);

        if (new Date(data.expiresAt) < new Date()) {
            return { valid: false, error: 'Token expired' };
        }

        return { valid: true, payload: data };
    } catch {
        return { valid: false, error: 'Token parsing failed' };
    }
}
