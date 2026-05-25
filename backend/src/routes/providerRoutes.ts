import { Router } from 'express';
import { registerProvider, toggleOnlineStatus, updateProviderLocation, getProviderEarnings, getNearbyProvidersAPI, getAllProviders } from '../controllers/providerController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerProvider);
router.post('/toggle-online', authenticateJWT, toggleOnlineStatus);
router.patch('/location', authenticateJWT, updateProviderLocation);
router.get('/nearby', getNearbyProvidersAPI);
router.get('/', getAllProviders);
router.get('/:providerId/earnings', authenticateJWT, getProviderEarnings);

export default router;
