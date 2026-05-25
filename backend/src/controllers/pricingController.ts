import { Request, Response } from 'express';
import { ServiceType, OrderVehicleType } from '@prisma/client';
import { GoogleMapsService } from '../services/googleMapsService';
import prisma from '../prismaClient';

export interface PriceCalculation {
  basePrice: number;
  distanceCharge: number;
  totalPrice: number;
  platformCommission: number;
  providerEarning: number;
  source?: string;
  durationMins?: number;
}

export const PRICING_CONFIG: Record<ServiceType, { base: number; perKmBike: number | null; perKmCar: number | null }> = {
  [ServiceType.PUNCTURE]: { base: 80, perKmBike: 10, perKmCar: 15 },
  [ServiceType.FUEL]: { base: 150, perKmBike: 10, perKmCar: 15 }, // ₹50 base + ₹100 flat fuel delivery cost included
  [ServiceType.SPARK_PLUG]: { base: 120, perKmBike: 10, perKmCar: null },
  [ServiceType.CHAIN]: { base: 150, perKmBike: 10, perKmCar: null },
  [ServiceType.BATTERY]: { base: 150, perKmBike: 10, perKmCar: 15 },
  [ServiceType.BRAKE_WIRE]: { base: 120, perKmBike: 10, perKmCar: null },
  [ServiceType.TOWING]: { base: 300, perKmBike: null, perKmCar: 50 },
  [ServiceType.COOLANT]: { base: 150, perKmBike: null, perKmCar: 0 },
  [ServiceType.OIL]: { base: 150, perKmBike: null, perKmCar: 0 },
  [ServiceType.BULB]: { base: 100, perKmBike: 10, perKmCar: 10 },
  [ServiceType.NOT_STARTING]: { base: 200, perKmBike: 10, perKmCar: 15 },
};

// Haversine formula to calculate straight-line distance in KM
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100; // Round to 2 decimal places
}

export function calculatePrice(serviceType: ServiceType, vehicleType: OrderVehicleType, distanceKm: number): PriceCalculation {
  const config = PRICING_CONFIG[serviceType];
  if (!config) {
    throw new Error('Invalid service type');
  }

  const perKmRate = vehicleType === OrderVehicleType.BIKE ? config.perKmBike : config.perKmCar;
  if (perKmRate === null) {
    throw new Error(`Service ${serviceType} is not available for vehicle type ${vehicleType}`);
  }

  const basePrice = config.base;
  const distanceCharge = Math.round(distanceKm * perKmRate * 100) / 100;
  const totalPrice = Math.round((basePrice + distanceCharge) * 100) / 100;
  const platformCommission = Math.round((totalPrice * 0.20) * 100) / 100; // 20% platform commission
  const providerEarning = Math.round((totalPrice - platformCommission) * 100) / 100; // 80% provider earnings

  return {
    basePrice,
    distanceCharge,
    totalPrice,
    platformCommission,
    providerEarning,
  };
}

export const getPriceEstimate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceType, vehicleType, distanceKm, userLat, userLng } = req.body;

    if (!serviceType || !vehicleType) {
      res.status(400).json({ error: 'Missing required parameters: serviceType, vehicleType' });
      return;
    }

    // Dynamic Driving-Route Distance pricing
    if (typeof userLat === 'number' && typeof userLng === 'number') {
      // Find nearest online providers
      const onlineProviders = await prisma.provider.findMany({
        where: {
          isOnline: true,
          isVerified: true,
          skills: {
            has: (serviceType as string).toUpperCase(),
          },
        },
      });

      if (onlineProviders.length === 0) {
        res.status(404).json({ error: 'No mechanics are online in your area matching this skill' });
        return;
      }

      // Filter nearest online mechanic using straight line first
      let closestProvider = onlineProviders[0];
      let minDistance = calculateHaversineDistance(
        userLat,
        userLng,
        Number(closestProvider.currentLat),
        Number(closestProvider.currentLng)
      );

      for (const p of onlineProviders) {
        const dist = calculateHaversineDistance(userLat, userLng, Number(p.currentLat), Number(p.currentLng));
        if (dist < minDistance) {
          minDistance = dist;
          closestProvider = p;
        }
      }

      if (minDistance > 10.0) {
        res.status(400).json({ error: 'Closest online mechanic is further than our maximum service radius of 10 km' });
        return;
      }

      // Query real Google Maps Distance Matrix driving route!
      const routing = await GoogleMapsService.getRouteDistance(
        userLat,
        userLng,
        Number(closestProvider.currentLat),
        Number(closestProvider.currentLng)
      );

      const pricing = calculatePrice(serviceType as ServiceType, vehicleType as OrderVehicleType, routing.distanceKm);

      res.json({
        ...pricing,
        distanceKm: routing.distanceKm,
        durationMins: routing.durationMins,
        source: routing.source,
        provider: {
          name: closestProvider.name,
          rating: closestProvider.rating,
        },
      });
      return;
    }

    // Static simple distance pricing
    if (typeof distanceKm !== 'number') {
      res.status(400).json({ error: 'Provide either distanceKm OR userLat & userLng coordinates' });
      return;
    }

    const pricing = calculatePrice(serviceType as ServiceType, vehicleType as OrderVehicleType, distanceKm);
    res.json({
      ...pricing,
      distanceKm,
      source: 'static',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: msg });
  }
};

export const validatePromoCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promoCode, totalPrice } = req.body;

    if (!promoCode || typeof totalPrice !== 'number') {
      res.status(400).json({ error: 'Promo code and totalPrice are required' });
      return;
    }

    const code = promoCode.toUpperCase().trim();
    let discount = 0;
    let message = '';

    if (code === 'FREE50') {
      discount = Math.min(Math.round(totalPrice * 0.5 * 100) / 100, 100);
      message = '50% discount (up to ₹100) applied successfully!';
    } else if (code === 'FIRSTOFF') {
      discount = Math.min(50, totalPrice);
      message = 'Flat ₹50 discount applied successfully!';
    } else if (code === 'ROADASSIST10') {
      discount = Math.round(totalPrice * 0.1 * 100) / 100;
      message = '10% discount applied successfully!';
    } else {
      res.status(400).json({ error: 'Invalid or expired promo code.' });
      return;
    }

    const newTotalPrice = Math.max(0, Math.round((totalPrice - discount) * 100) / 100);

    res.json({
      success: true,
      promoCode: code,
      discount,
      newTotalPrice,
      message,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
