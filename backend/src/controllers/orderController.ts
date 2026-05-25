import { Request, Response } from 'express';
import { OrderStatus, PaymentStatus, EarningType, EarningStatus, ServiceType, OrderVehicleType, PaymentMethod } from '@prisma/client';
import { calculatePrice } from './pricingController';
import { startOrderMatching, cancelMatchmaking } from '../services/matchingService';
import prisma from '../prismaClient';

// In-memory socket mapping hook initialized in socketHandler.ts
export let emitToUser: (userId: string, eventName: string, data: any) => void = () => {};
export let emitToProvider: (providerId: string, eventName: string, data: any) => void = () => {};

export function setSocketEmitters(
  userEmit: typeof emitToUser,
  providerEmit: typeof emitToProvider
) {
  emitToUser = userEmit;
  emitToProvider = providerEmit;
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || req.body.userId;
    const { vehicleType, serviceType, userLat, userLng, userAddress, distanceKm, paymentMethod, promoCode } = req.body;

    if (!userId || !vehicleType || !serviceType || typeof userLat !== 'number' || typeof userLng !== 'number' || !userAddress || typeof distanceKm !== 'number') {
      res.status(400).json({ error: 'Missing required order creation parameters' });
      return;
    }

    if (distanceKm > 10.0) {
      res.status(400).json({ error: 'Selected location is beyond our maximum service radius of 10 km' });
      return;
    }

    // Calculate Prices
    const pricing = calculatePrice(
      serviceType as ServiceType,
      vehicleType as OrderVehicleType,
      distanceKm
    );

    let totalPrice = pricing.totalPrice;
    let platformCommission = pricing.platformCommission;
    const providerEarning = pricing.providerEarning; // Protected original earnings!

    if (promoCode) {
      const code = promoCode.toUpperCase().trim();
      let discount = 0;
      if (code === 'FREE50') {
        discount = Math.min(Math.round(totalPrice * 0.5 * 100) / 100, 100);
      } else if (code === 'FIRSTOFF') {
        discount = Math.min(50, totalPrice);
      } else if (code === 'ROADASSIST10') {
        discount = Math.round(totalPrice * 0.1 * 100) / 100;
      }
      totalPrice = Math.max(0, Math.round((totalPrice - discount) * 100) / 100);
      // Platform commission absorbs the promo discount
      platformCommission = Math.max(0, Math.round((platformCommission - discount) * 100) / 100);
    }

    // Generate random 4-digit OTP for completed verification
    const orderOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const order = await prisma.order.create({
      data: {
        userId,
        vehicleType: vehicleType.toUpperCase() as OrderVehicleType,
        serviceType: serviceType.toUpperCase() as ServiceType,
        status: OrderStatus.PENDING,
        userLat,
        userLng,
        userAddress,
        distanceKm,
        basePrice: pricing.basePrice,
        distanceCharge: pricing.distanceCharge,
        totalPrice,
        platformCommission,
        providerEarning,
        paymentMethod: (paymentMethod || 'CASH').toUpperCase() as PaymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        otp: orderOtp,
      },
    });

    res.status(201).json({
      message: 'Order created successfully. Finding nearest providers...',
      order,
    });

    // Fire & forget matchmaking thread
    startOrderMatching(order.id);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getOrderDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, phone: true, profilePhoto: true },
        },
        provider: {
          select: { id: true, name: true, phone: true, vehicleType: true, rating: true, profilePhotoUrl: true, currentLat: true, currentLng: true },
        },
        ratings: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const acceptOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const providerId = req.body.providerId || (req as any).user?.id;

    if (!providerId) {
      res.status(400).json({ error: 'Provider ID is required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status !== OrderStatus.PENDING) {
      res.status(400).json({ error: 'Order is no longer available (cancelled or accepted by another mechanic)' });
      return;
    }

    // Cancel matching loops
    cancelMatchmaking(id);

    // Update order status to ACCEPTED
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.ACCEPTED,
        providerId,
        acceptedAt: new Date(),
      },
      include: {
        provider: true,
        user: true,
      },
    });

    // Notify User in Real-time
    emitToUser(updatedOrder.userId, 'order:accepted', {
      orderId: id,
      provider: updatedOrder.provider,
    });

    res.json({
      message: 'Order accepted successfully',
      order: updatedOrder,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ error: 'Valid status is required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // State machine: validate status transitions
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['ACCEPTED', 'CANCELLED'],
      'ACCEPTED': ['PROVIDER_ON_WAY', 'CANCELLED'],
      'PROVIDER_ON_WAY': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': []
    };

    const currentStatus = order.status;
    if (!validTransitions[currentStatus]?.includes(status)) {
      res.status(400).json({ error: `Invalid status transition from ${currentStatus} to ${status}` });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });

    // Broadcast status change to both user and provider
    emitToUser(updatedOrder.userId, 'order:status_update', { orderId: id, status });
    if (updatedOrder.providerId) {
      emitToProvider(updatedOrder.providerId, 'order:status_update', { orderId: id, status });
    }

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const completeOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) {
      res.status(400).json({ error: 'Order completion OTP is required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status === OrderStatus.COMPLETED) {
      res.status(400).json({ error: 'Order has already been completed' });
      return;
    }

    // Verify OTP (Check with DB otp)
    if (order.otp !== otp) {
      res.status(400).json({ error: 'Incorrect completion OTP' });
      return;
    }

    if (!order.providerId) {
      res.status(400).json({ error: 'No provider assigned to this order' });
      return;
    }

    const providerId = order.providerId;

    // Use Prisma transaction to atomically:
    // 1. Complete order
    // 2. Log provider earning
    // 3. Increment provider statistics & wallet balance
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
          paymentStatus: PaymentStatus.PAID, // Set to paid upon successful complete
        },
      }),
      prisma.providerEarning.create({
        data: {
          providerId,
          orderId: id,
          amount: order.providerEarning,
          type: EarningType.EARNING,
          status: EarningStatus.SETTLED,
        },
      }),
      prisma.provider.update({
        where: { id: providerId },
        data: {
          walletBalance: { increment: order.providerEarning },
          totalOrders: { increment: 1 },
        },
      }),
    ]);

    // Broadcast completion
    emitToUser(updatedOrder.userId, 'order:completed', { orderId: id });
    emitToProvider(providerId, 'order:completed', { orderId: id });

    res.json({
      message: 'Order completed successfully',
      order: updatedOrder,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      res.status(400).json({ error: `Cannot cancel order with status ${order.status}` });
      return;
    }

    // Cancel matchmaking loop if still PENDING
    if (order.status === OrderStatus.PENDING) {
      cancelMatchmaking(id);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    // Broadcast cancellation
    emitToUser(updatedOrder.userId, 'order:cancelled', { orderId: id });
    if (updatedOrder.providerId) {
      emitToProvider(updatedOrder.providerId, 'order:cancelled', { orderId: id });
    }

    res.json({
      message: 'Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getUserHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || req.query.userId;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        provider: {
          select: { name: true, profilePhotoUrl: true, vehicleType: true },
        },
      },
    });

    res.json(orders);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getProviderHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const providerId = (req as any).user?.id || req.query.providerId;

    if (!providerId) {
      res.status(400).json({ error: 'Provider ID is required' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, profilePhoto: true, phone: true },
        },
      },
    });

    res.json(orders);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
