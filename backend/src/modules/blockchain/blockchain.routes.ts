import { Router } from 'express';
import { blockchainController } from './blockchain.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/blockchain/anchor
 * @desc    Anchor a record to the blockchain
 * @access  Private (requires 'blockchain:write' permission)
 */
router.post('/anchor', authorize('blockchain:write'), (req, res, next) => {
    blockchainController.anchorRecord(req, res, next);
});

/**
 * @route   POST /api/blockchain/batch-anchor
 * @desc    Batch anchor multiple records
 * @access  Private (requires 'blockchain:write' permission)
 */
router.post('/batch-anchor', authorize('blockchain:write'), (req, res, next) => {
    blockchainController.batchAnchor(req, res, next);
});

/**
 * @route   GET /api/blockchain/verify/:type/:id
 * @desc    Verify a record against blockchain
 * @access  Private (requires 'blockchain:read' permission)
 */
router.get('/verify/:type/:id', authorize('blockchain:read'), (req, res, next) => {
    blockchainController.verifyRecord(req, res, next);
});

/**
 * @route   GET /api/blockchain/transactions
 * @desc    Get list of blockchain transactions
 * @access  Private (requires 'blockchain:read' permission)
 */
router.get('/transactions', authorize('blockchain:read'), (req, res, next) => {
    blockchainController.getTransactions(req, res, next);
});

/**
 * @route   GET /api/blockchain/transactions/:id
 * @desc    Get a single transaction
 * @access  Private (requires 'blockchain:read' permission)
 */
router.get('/transactions/:id', authorize('blockchain:read'), (req, res, next) => {
    blockchainController.getTransaction(req, res, next);
});

/**
 * @route   POST /api/blockchain/certificate
 * @desc    Generate verification certificate
 * @access  Private (requires 'blockchain:write' permission)
 */
router.post('/certificate', authorize('blockchain:write'), (req, res, next) => {
    blockchainController.generateCertificate(req, res, next);
});

/**
 * @route   GET /api/blockchain/stats
 * @desc    Get blockchain statistics
 * @access  Private (requires 'blockchain:read' permission)
 */
router.get('/stats', authorize('blockchain:read'), (req, res, next) => {
    blockchainController.getStats(req, res, next);
});

export default router;
