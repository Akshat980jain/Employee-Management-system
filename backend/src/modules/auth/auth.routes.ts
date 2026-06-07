import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/google-login', authController.googleLogin.bind(authController));
router.post('/google-register', authController.googleRegister.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

import { uploadAvatar } from '../../middleware/upload.js';

// ... existing imports

// Protected routes
router.get('/me', authenticate, authController.me.bind(authController));
router.post('/avatar', authenticate, uploadAvatar.single('avatar'), authController.uploadAvatar.bind(authController));
router.post('/logout-all', authenticate, authController.logoutAll.bind(authController));
router.get('/sessions', authenticate, authController.getSessions.bind(authController));
router.delete('/sessions/:sessionId', authenticate, authController.terminateSession.bind(authController));

export default router;
