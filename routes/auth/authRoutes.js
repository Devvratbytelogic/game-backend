import express from 'express';
import { changePassword, getAllUsers, resendOTP, resetPassword, sendEmailOTP, signIn, signUp, verifyOTP } from '../../controllers/auth/authController.js';
import { auth } from '../../middlewares/authMiddleware.js';
const router = express.Router();

router.get('/all-users', auth, getAllUsers);
router.post('/sign-up', signUp)
router.post('/verify-otp', verifyOTP)
router.post('/resend-otp', resendOTP);
router.post('/sign-in', signIn);
router.post('/send-otp', sendEmailOTP);
router.post('/reset-password', resetPassword);
router.post('/change-password', auth, changePassword);


export default router;