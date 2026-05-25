import { Msg91Service } from '../services/msg91Service';
import { GoogleMapsService } from '../services/googleMapsService';
import { calculateHaversineDistance, calculatePrice } from '../controllers/pricingController';
import { ServiceType, OrderVehicleType } from '@prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'roadassist_jwt_secret_key_change_me_in_prod';

describe('Production Services & Security Tests', () => {
  
  describe('MSG91 Client Service', () => {
    test('sendOTP logs and bypasses cleanly when MSG91 auth key is mock/empty', async () => {
      const sent = await Msg91Service.sendOTP('9876543210', '938201');
      expect(sent).toBe(true);
    });

    test('verifyOTP bypass validates code 123456 as true when unconfigured', async () => {
      const verified = await Msg91Service.verifyOTP('9876543210', '123456');
      expect(verified).toBe(true);
    });
  });

  describe('Google Maps Distance Matrix Routing', () => {
    test('Falls back seamlessly to Haversine straight-line when Google API key is empty', async () => {
      // Coords in Mumbai
      const lat1 = 19.0760;
      const lng1 = 72.8777;
      const lat2 = 19.0820;
      const lng2 = 72.8820;

      const routing = await GoogleMapsService.getRouteDistance(lat1, lng1, lat2, lng2);
      const expectedHaversine = calculateHaversineDistance(lat1, lng1, lat2, lng2);

      expect(routing.distanceKm).toBe(expectedHaversine);
      expect(routing.source).toBe('haversine');
      expect(routing.durationMins).toBeGreaterThan(0);
    });

    test('calculatePrice computes 20% platform cut correctly for Spark Plug bike service', () => {
      const pricing = calculatePrice(ServiceType.SPARK_PLUG, OrderVehicleType.BIKE, 5.0);
      
      // base = 120, perKm = 10
      // distance charge = 5.0 * 10 = 50
      // total price = 120 + 50 = 170
      // platform commission = 170 * 0.20 = 34
      // provider earning = 170 - 34 = 136
      expect(pricing.basePrice).toBe(120);
      expect(pricing.distanceCharge).toBe(50);
      expect(pricing.totalPrice).toBe(170);
      expect(pricing.platformCommission).toBe(34);
      expect(pricing.providerEarning).toBe(136);
    });
  });

  describe('JWT Socket Handshake Middleware Gate', () => {
    test('Token signs and decodes matching identities successfully', () => {
      const payload = { id: 'test-user-id', role: 'user', phone: '9876543210' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      const decoded: any = jwt.verify(token, JWT_SECRET);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.role).toBe(payload.role);
    });

    test('Throws error for invalid or expired token handshakes', () => {
      expect(() => {
        jwt.verify('invalid-token-string', JWT_SECRET);
      }).toThrow();
    });
  });
});
