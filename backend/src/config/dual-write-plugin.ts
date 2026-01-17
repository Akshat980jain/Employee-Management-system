/**
 * Dual-Write Mongoose Plugin
 * 
 * This plugin intercepts all write operations on Mongoose models
 * and replicates them to the secondary database asynchronously.
 */

import { Schema, Document, Model } from 'mongoose';
import { dualWriteManager } from './dual-write.js';

/**
 * Apply dual-write functionality to a Mongoose schema
 */
export function dualWritePlugin(schema: Schema): void {
    // Hook: post-save (for new documents and updates via .save())
    schema.post('save', function (doc: Document) {
        const collectionName = (doc as any).constructor?.collection?.name;
        if (collectionName) {
            // Fire and forget - don't await
            dualWriteManager.replicateSave(collectionName, doc).catch(() => { });
        }
    });

    // Hook: post-insertMany - use Model context
    schema.post('insertMany', function (this: Model<any>, docs: any) {
        if (docs && Array.isArray(docs) && docs.length > 0) {
            const collectionName = this.collection?.name;
            if (collectionName) {
                dualWriteManager.replicateInsertMany(collectionName, docs).catch(() => { });
            }
        }
    });

    // Hook: post-updateOne (query middleware)
    schema.post('updateOne', function () {
        const query = this as any;
        const collectionName = query.model?.collection?.name;
        if (collectionName) {
            const filter = query.getFilter();
            const update = query.getUpdate();
            dualWriteManager.replicateUpdate(collectionName, filter, update, { many: false }).catch(() => { });
        }
    });

    // Hook: post-updateMany (query middleware)
    schema.post('updateMany', function () {
        const query = this as any;
        const collectionName = query.model?.collection?.name;
        if (collectionName) {
            const filter = query.getFilter();
            const update = query.getUpdate();
            dualWriteManager.replicateUpdate(collectionName, filter, update, { many: true }).catch(() => { });
        }
    });

    // Hook: post-deleteOne (query middleware)
    schema.post('deleteOne', function () {
        const query = this as any;
        const collectionName = query.model?.collection?.name;
        if (collectionName) {
            const filter = query.getFilter();
            dualWriteManager.replicateDelete(collectionName, filter, { many: false }).catch(() => { });
        }
    });

    // Hook: post-deleteMany (query middleware)
    schema.post('deleteMany', function () {
        const query = this as any;
        const collectionName = query.model?.collection?.name;
        if (collectionName) {
            const filter = query.getFilter();
            dualWriteManager.replicateDelete(collectionName, filter, { many: true }).catch(() => { });
        }
    });

    // Hook: post-findOneAndUpdate
    schema.post('findOneAndUpdate', function (doc: Document | null) {
        if (doc) {
            const collectionName = (doc as any).constructor?.collection?.name;
            if (collectionName) {
                dualWriteManager.replicateSave(collectionName, doc).catch(() => { });
            }
        }
    });

    // Hook: post-findOneAndDelete
    schema.post('findOneAndDelete', function (doc: Document | null) {
        if (doc) {
            const query = this as any;
            const collectionName = query.model?.collection?.name;
            if (collectionName) {
                dualWriteManager.replicateFindOneAndDelete(collectionName, { _id: doc._id }).catch(() => { });
            }
        }
    });

    // Hook: post-findOneAndReplace
    schema.post('findOneAndReplace', function (doc: Document | null) {
        if (doc) {
            const collectionName = (doc as any).constructor?.collection?.name;
            if (collectionName) {
                dualWriteManager.replicateSave(collectionName, doc).catch(() => { });
            }
        }
    });
}

export default dualWritePlugin;
