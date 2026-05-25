import { Request, Response } from 'express';
import { VehicleType } from '@prisma/client';
import { calculateHaversineDistance } from './pricingController';
import prisma from '../prismaClient';

export const registerProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, aadharNumber, vehicleType, skills, currentLat, currentLng, profilePhotoUrl } = req.body;

    if (!name || !phone || !vehicleType || !skills || typeof currentLat !== 'number' || typeof currentLng !== 'number') {
      res.status(400).json({ error: 'Missing required registration parameters' });
      return;
    }

    const existingProvider = await prisma.provider.findUnique({
      where: { phone },
    });

    if (existingProvider) {
      res.status(400).json({ error: 'Provider with this phone number already exists' });
      return;
    }

    // Convert skills into uppercase enum compatible strings if needed, or save as-is
    const parsedSkills = Array.isArray(skills) ? skills.map((s: string) => s.toUpperCase()) : [];

    const provider = await prisma.provider.create({
      data: {
        name,
        phone,
        aadharNumber,
        profilePhotoUrl,
        vehicleType: vehicleType.toUpperCase() as VehicleType,
        skills: parsedSkills,
        isVerified: true, // Auto verify in development for smooth onboarding experience!
        isOnline: true,
        currentLat,
        currentLng,
        walletBalance: 0.0,
      },
    });

    res.status(201).json({
      message: 'Provider registered successfully',
      provider,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const toggleOnlineStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const providerId = req.body.providerId || (req as any).user?.id;

    if (!providerId) {
      res.status(400).json({ error: 'Provider ID is required' });
      return;
    }

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: { isOnline: !provider.isOnline },
    });

    res.json({
      message: `Provider is now ${updatedProvider.isOnline ? 'online' : 'offline'}`,
      isOnline: updatedProvider.isOnline,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const updateProviderLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const providerId = req.body.providerId || (req as any).user?.id;
    const { lat, lng } = req.body;

    if (!providerId || typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({ error: 'Provider ID, lat, and lng are required' });
      return;
    }

    const provider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        currentLat: lat,
        currentLng: lng,
      },
    });

    res.json({
      message: 'Location updated successfully',
      lat: provider.currentLat,
      lng: provider.currentLng,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getProviderEarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    const providerId = req.params.providerId || (req as any).user?.id;

    if (!providerId) {
      res.status(400).json({ error: 'Provider ID is required' });
      return;
    }

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        walletBalance: true,
        totalOrders: true,
        rating: true,
      },
    });

    if (!provider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    const earningsLogs = await prisma.providerEarning.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            serviceType: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({
      walletBalance: provider.walletBalance,
      totalOrders: provider.totalOrders,
      rating: provider.rating,
      earnings: earningsLogs,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

// Internal utility to fetch matching providers near coordinates
export async function findNearbyProviders(lat: number, lng: number, skillRequired: string): Promise<any[]> {
  // Query all active and online providers
  const onlineProviders = await prisma.provider.findMany({
    where: {
      isOnline: true,
      isVerified: true,
      skills: {
        has: skillRequired.toUpperCase(),
      },
    },
  });

  // Calculate distance for each and filter by 10km radius
  const eligibleProviders = onlineProviders
    .map((provider) => {
      const distance = calculateHaversineDistance(
        lat,
        lng,
        Number(provider.currentLat),
        Number(provider.currentLng)
      );
      return { ...provider, distance };
    })
    .filter((p) => p.distance <= 10.0)
    .sort((a, b) => a.distance - b.distance);

  return eligibleProviders;
}

export const getNearbyProvidersAPI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, serviceType } = req.query;

    if (!lat || !lng || !serviceType) {
      res.status(400).json({ error: 'Missing query parameters: lat, lng, serviceType' });
      return;
    }

    const providers = await findNearbyProviders(
      Number(lat),
      Number(lng),
      serviceType as string
    );

    res.json(providers);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getAllProviders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(providers);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

