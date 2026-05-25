import { Order, OrderStatus } from '@prisma/client';
import { findNearbyProviders } from '../controllers/providerController';
import prisma from '../prismaClient';

// Keep track of active matchmaking routines to prevent double assignments
// Map Key: orderId, Value: boolean (true = currently matching)
const activeMatchings = new Map<string, boolean>();

// Callback hooks initialized by Socket.io server
export let notifyProviderCallback: (providerId: string, order: Order) => void = () => {};
export let notifyOrderFailureCallback: (userId: string, orderId: string) => void = () => {};

export function setMatchingCallbacks(
  notifyProvider: typeof notifyProviderCallback,
  notifyFailure: typeof notifyOrderFailureCallback
) {
  notifyProviderCallback = notifyProvider;
  notifyOrderFailureCallback = notifyFailure;
}

export const cancelMatchmaking = (orderId: string) => {
  activeMatchings.delete(orderId);
};

export const startOrderMatching = async (orderId: string): Promise<void> => {
  if (activeMatchings.get(orderId)) {
    console.log(`[Matching] Matchmaking already running for order: ${orderId}`);
    return;
  }

  activeMatchings.set(orderId, true);
  console.log(`[Matching] Starting matchmaking loop for order: ${orderId}`);

  try {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      // Check if matchmaking was cancelled or order status changed (e.g. accepted by someone or cancelled)
      if (!activeMatchings.get(orderId)) {
        console.log(`[Matching] Loop aborted for order ${orderId} (cancelled or activeMatchings cleared)`);
        return;
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order || order.status !== OrderStatus.PENDING) {
        console.log(`[Matching] Loop terminated for order ${orderId}. Status: ${order?.status}`);
        activeMatchings.delete(orderId);
        return;
      }

      // Find eligible providers
      const nearby = await findNearbyProviders(
        Number(order.userLat),
        Number(order.userLng),
        order.serviceType
      );

      // Filter out providers that have already rejected this order or are not in this step
      // For simplicity in MVP, we grab the "attempt"-th nearest online provider
      if (nearby.length <= attempts) {
        console.log(`[Matching] No more matching providers found within 10km for order ${orderId} (Attempt: ${attempts + 1})`);
        break;
      }

      const targetProvider = nearby[attempts];
      console.log(`[Matching] Attempt ${attempts + 1}: Notifying provider ${targetProvider.name} (${targetProvider.id}) for order ${orderId}`);

      // Notify the provider via socket
      notifyProviderCallback(targetProvider.id, order);

      // Wait 60 seconds (or shorter for rapid simulator testing, let's use 15s in dev and 60s in production)
      const timeoutMs = process.env.NODE_ENV === 'test' ? 100 : (process.env.NODE_ENV === 'development' ? 15000 : 60000);
      await new Promise((resolve) => setTimeout(resolve, timeoutMs));

      attempts++;
    }

    // If we reach here and the order is still PENDING, no provider accepted it
    const finalOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (finalOrder && finalOrder.status === OrderStatus.PENDING) {
      console.log(`[Matching] Matchmaking failed for order ${orderId}. Marking order as CANCELLED.`);
      
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      // Notify user of matching failure
      notifyOrderFailureCallback(updatedOrder.userId, orderId);
    }

  } catch (error) {
    console.error(`[Matching] Error in matching loop for order ${orderId}:`, error);
  } finally {
    activeMatchings.delete(orderId);
  }
};
