import express from 'express';
import { changePassword, resendOTP, resetPassword, sendEmailOTP, signIn, signUp, verifyOTP } from '../controllers/authController.js';
import { auth } from '../middlewares/authMiddleware.js';
import { getAllUsers, getUserProfile, updateUserProfile } from '../controllers/userContoller.js';

const router = express.Router();
//  auth routes
router.post('/sign-up', signUp)
router.post('/verify-otp', verifyOTP)
router.post('/resend-otp', resendOTP);
router.post('/sign-in', signIn);
router.post('/send-otp', sendEmailOTP);
router.post('/reset-password', resetPassword);
router.post('/change-password', auth, changePassword);

// users routes
router.get('/all-users', auth, getAllUsers);
router.get('/user-profile', auth, getUserProfile);
router.put('/edit-profile', auth, updateUserProfile);


export default router;