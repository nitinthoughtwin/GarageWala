import { calculatePrice } from '../controllers/pricingController';
import { ServiceType, OrderVehicleType } from '@prisma/client';

describe('Pricing Logic Tests', () => {
  test('Puncture pricing for bike calculates correctly', () => {
    const serviceType = ServiceType.PUNCTURE;
    const vehicleType = OrderVehicleType.BIKE;
    const distanceKm = 4.5;

    const pricing = calculatePrice(serviceType, vehicleType, distanceKm);

    // base = 80, perKmBike = 10
    // total = 80 + 4.5 * 10 = 125
    // platform = 125 * 0.20 = 25
    // provider = 125 - 25 = 100
    expect(pricing.basePrice).toBe(80);
    expect(pricing.distanceCharge).toBe(45);
    expect(pricing.totalPrice).toBe(125);
    expect(pricing.platformCommission).toBe(25);
    expect(pricing.providerEarning).toBe(100);
  });

  test('Puncture pricing for car calculates correctly', () => {
    const serviceType = ServiceType.PUNCTURE;
    const vehicleType = OrderVehicleType.CAR;
    const distanceKm = 6;

    const pricing = calculatePrice(serviceType, vehicleType, distanceKm);

    // base = 80, perKmCar = 15
    // total = 80 + 6 * 15 = 170
    // platform = 170 * 0.20 = 34
    // provider = 170 - 34 = 136
    expect(pricing.basePrice).toBe(80);
    expect(pricing.distanceCharge).toBe(90);
    expect(pricing.totalPrice).toBe(170);
    expect(pricing.platformCommission).toBe(34);
    expect(pricing.providerEarning).toBe(136);
  });

  test('Throws error for invalid service type combination', () => {
    // Towing is not available for bikes (perKmBike = null)
    expect(() => {
      calculatePrice(ServiceType.TOWING, OrderVehicleType.BIKE, 5);
    }).toThrow();
  });
});
