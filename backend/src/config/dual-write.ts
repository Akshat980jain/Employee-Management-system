/**
 * Dual-Write Manager
 * 
 * Manages a secondary MongoDB connection for dual-write operations.
 * Primary database: MongoDB Atlas
 * Secondary database: Local MongoDB (Compass)
 */

import mongoose, { Connection } from 'mongoose';

class DualWriteManager {
    private secondaryConnection: Connection | null = null;
    private isEnabled: boolean = false;
    private connectionPromise: Promise<Connection> | null = null;

    /**
     * Initialize the secondary database connection
     */
    async initialize(): Promise<void> {
        const secondaryUri = process.env.MONGODB_SECONDARY_URI;
        const dualWriteEnabled = process.env.DUAL_WRITE_ENABLED === 'true';

        if (!dualWriteEnabled) {
            console.log('📝 Dual-write is disabled');
            return;
        }

        if (!secondaryUri) {
            console.log('⚠️  MONGODB_SECONDARY_URI not configured, dual-write disabled');
            return;
        }

        try {
            // Create a separate connection for the secondary database
            this.connectionPromise = mongoose.createConnection(secondaryUri).asPromise();
            this.secondaryConnection = await this.connectionPromise;
            this.isEnabled = true;

            const sanitizedUri = secondaryUri.replace(/:([^@]+)@/, ':****@');
            console.log('✅ Dual-write enabled, secondary DB:', sanitizedUri);

            // Handle secondary connection events
            this.secondaryConnection.on('error', (err) => {
                console.error('❌ Secondary MongoDB error:', err.message);
            });

            this.secondaryConnection.on('disconnected', () => {
                console.log('⚠️  Secondary MongoDB disconnected');
                this.isEnabled = false;
            });

            this.secondaryConnection.on('reconnected', () => {
                console.log('✅ Secondary MongoDB reconnected');
                this.isEnabled = true;
            });
        } catch (error: any) {
            console.error('❌ Failed to connect to secondary MongoDB:', error.message);
            this.isEnabled = false;
        }
    }

    /**
     * Check if dual-write is enabled and connected
     */
    isActive(): boolean {
        return this.isEnabled && this.secondaryConnection !== null;
    }

    /**
     * Get the secondary connection
     */
    getConnection(): Connection | null {
        return this.secondaryConnection;
    }

    /**
     * Replicate a document save operation to secondary database
     */
    async replicateSave(collectionName: string, doc: any): Promise<void> {
        if (!this.isActive()) return;

        try {
            const collection = this.secondaryConnection!.collection(collectionName);
            await collection.updateOne(
                { _id: doc._id },
                { $set: doc.toObject ? doc.toObject() : doc },
                { upsert: true }
            );
        } catch (error: any) {
            console.error(`[DualWrite] Failed to replicate save to ${collectionName}:`, error.message);
        }
    }

    /**
     * Replicate an insertMany operation to secondary database
     */
    async replicateInsertMany(collectionName: string, docs: any[]): Promise<void> {
        if (!this.isActive() || docs.length === 0) return;

        try {
            const collection = this.secondaryConnection!.collection(collectionName);
            const operations = docs.map(doc => ({
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set: doc.toObject ? doc.toObject() : doc },
                    upsert: true
                }
            }));
            await collection.bulkWrite(operations, { ordered: false });
        } catch (error: any) {
            console.error(`[DualWrite] Failed to replicate insertMany to ${collectionName}:`, error.message);
        }
    }

    /**
     * Replicate an update operation to secondary database
     */
    async replicateUpdate(
        collectionName: string,
        filter: any,
        update: any,
        options: { many?: boolean } = {}
    ): Promise<void> {
        if (!this.isActive()) return;

        try {
            const collection = this.secondaryConnection!.collection(collectionName);
            if (options.many) {
                await collection.updateMany(filter, update);
            } else {
                await collection.updateOne(filter, update);
            }
        } catch (error: any) {
            console.error(`[DualWrite] Failed to replicate update to ${collectionName}:`, error.message);
        }
    }

    /**
     * Replicate a delete operation to secondary database
     */
    async replicateDelete(
        collectionName: string,
        filter: any,
        options: { many?: boolean } = {}
    ): Promise<void> {
        if (!this.isActive()) return;

        try {
            const collection = this.secondaryConnection!.collection(collectionName);
            if (options.many) {
                await collection.deleteMany(filter);
            } else {
                await collection.deleteOne(filter);
            }
        } catch (error: any) {
            console.error(`[DualWrite] Failed to replicate delete to ${collectionName}:`, error.message);
        }
    }

    /**
     * Replicate a findOneAndUpdate operation to secondary database
     */
    async replicateFindOneAndUpdate(
        collectionName: string,
        filter: any,
        update: any
    ): Promise<void> {
        if (!this.isActive()) return;

        try {
            const collection = this.secondaryConnection!.collection(collectionName);
            await collection.findOneAndUpdate(filter, update, { upsert: true });
        } catch (error: any) {
            console.error(`[DualWrite] Failed to replicate findOneAndUpdate to ${collectionName}:`, error.message);
        }
    }

    /**
     * Replicate a findOneAndDelete operation to secondary database
     */
    async replicateFindOneAndDelete(
        collectionName: string,
        filter: any
    ): Promise<void> {
        if (!this.isActive()) return;

        try {
            const collection = this.secondaryConnection!.collection(collectionName);
            await collection.findOneAndDelete(filter);
        } catch (error: any) {
            console.error(`[DualWrite] Failed to replicate findOneAndDelete to ${collectionName}:`, error.message);
        }
    }

    /**
     * Close the secondary connection
     */
    async close(): Promise<void> {
        if (this.secondaryConnection) {
            await this.secondaryConnection.close();
            this.secondaryConnection = null;
            this.isEnabled = false;
        }
    }
}

// Singleton instance
export const dualWriteManager = new DualWriteManager();
