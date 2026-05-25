import { Router } from 'express';
import { submitRating } from '../controllers/ratingController';

const router = Router();

router.post('/submit', submitRating);

export default router;
