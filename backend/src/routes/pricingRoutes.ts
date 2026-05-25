import { Router } from 'express';
import { getPriceEstimate, validatePromoCode } from '../controllers/pricingController';

const router = Router();

router.post('/calculate', getPriceEstimate);
router.post('/promo/validate', validatePromoCode);

export default router;
