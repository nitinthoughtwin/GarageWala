import { Router } from 'express';
import { sendOTP, verifyOTP, providerLogin } from '../controllers/authController';

const router = Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/provider/login', providerLogin);

export default router;
