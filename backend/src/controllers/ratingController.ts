import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const submitRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, rating, review } = req.body;
    const userId = (req as any).user?.id || req.body.userId;

    if (!orderId || typeof rating !== 'number' || rating < 1 || rating > 5 || !userId) {
      res.status(400).json({ error: 'Missing required parameters: orderId, rating (1-5), and userId' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (!order.providerId) {
      res.status(400).json({ error: 'Cannot rate an order with no provider assigned' });
      return;
    }

    const providerId = order.providerId;

    // Check if rating already exists
    const existingRating = await prisma.rating.findFirst({
      where: { orderId, userId },
    });

    if (existingRating) {
      res.status(400).json({ error: 'You have already rated this order' });
      return;
    }

    // Submit rating
    const ratingObj = await prisma.rating.create({
      data: {
        orderId,
        userId,
        providerId,
        rating,
        review,
      },
    });

    // Re-calculate average rating for the provider
    const ratingsAggregate = await prisma.rating.aggregate({
      where: { providerId },
      _avg: {
        rating: true,
      },
    });

    const averageRating = ratingsAggregate._avg.rating || 5.0;

    await prisma.provider.update({
      where: { id: providerId },
      data: {
        rating: averageRating,
      },
    });

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: ratingObj,
      providerNewRating: averageRating,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
