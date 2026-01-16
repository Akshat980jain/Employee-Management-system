import { Router } from 'express';
import { transferRequestController } from './transfer-request.controller.js';
import { authenticate, authorizeAny } from '../../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for offer letter uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'offer-letters');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `offer-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, DOCX, and image files are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post(
    '/',
    upload.single('offerLetter'),
    transferRequestController.createRequest.bind(transferRequestController)
);

router.get(
    '/my',
    transferRequestController.getMyRequests.bind(transferRequestController)
);

router.delete(
    '/:id',
    transferRequestController.cancelRequest.bind(transferRequestController)
);

// HR/Admin routes
router.get(
    '/incoming',
    authorizeAny('employees:read'),
    transferRequestController.getIncomingRequests.bind(transferRequestController)
);

router.get(
    '/:id',
    transferRequestController.getRequest.bind(transferRequestController)
);

router.get(
    '/:id/document',
    transferRequestController.getDocument.bind(transferRequestController)
);

router.put(
    '/:id/approve',
    authorizeAny('employees:create'),
    transferRequestController.approveRequest.bind(transferRequestController)
);

router.put(
    '/:id/reject',
    authorizeAny('employees:create'),
    transferRequestController.rejectRequest.bind(transferRequestController)
);

export default router;
