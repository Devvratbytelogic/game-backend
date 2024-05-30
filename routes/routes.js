import express from 'express';
import { changePassword, resendOTP, resetPassword, sendEmailOTP, signIn, signUp, verifyOTP } from '../controllers/authController.js';
import { auth } from '../middlewares/authMiddleware.js';
import { getAllUsers } from '../controllers/userContoller.js';

const router = express.Router();
//  auth routes
router.post('/sign-up', signUp)
router.post('/verify-otp', verifyOTP)
router.post('/resend-otp', resendOTP);
router.post('/sign-in', signIn);
router.post('/send-otp', sendEmailOTP);
router.post('/reset-password', resetPassword);
router.post('/change-password', auth, changePassword);



// uer routes
router.get('/all-users', auth, getAllUsers);


export default router;