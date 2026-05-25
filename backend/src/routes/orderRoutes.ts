import { Router } from 'express';
import { createOrder, getOrderDetails, acceptOrder, updateOrderStatus, completeOrder, cancelOrder, getUserHistory, getProviderHistory } from '../controllers/orderController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.post('/create', authenticateJWT, createOrder);
router.get('/user/history', authenticateJWT, getUserHistory);
router.get('/provider/history', authenticateJWT, getProviderHistory);
router.get('/:id', getOrderDetails);
router.patch('/:id/accept', authenticateJWT, acceptOrder);
router.patch('/:id/status', authenticateJWT, updateOrderStatus);
router.patch('/:id/complete', authenticateJWT, completeOrder);
router.patch('/:id/cancel', authenticateJWT, cancelOrder);

export default router;
