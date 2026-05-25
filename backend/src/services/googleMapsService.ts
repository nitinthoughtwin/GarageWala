import dotenv from 'dotenv';
import { calculateHaversineDistance } from '../controllers/pricingController';
dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

export interface DistanceMatrixResult {
  distanceKm: number;
  durationMins: number;
  source: 'google' | 'haversine';
}

export class GoogleMapsService {
  /**
   * Fetches real driving distance and duration from Google Maps Distance Matrix API.
   * Gracefully falls back to the mathematical Haversine distance formula if API is offline or key is unconfigured.
   */
  static async getRouteDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): Promise<DistanceMatrixResult> {
    
    // If API key is empty or mocked, immediately trigger Haversine fallback
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.startsWith('mock') || GOOGLE_MAPS_API_KEY === '') {
      const distance = calculateHaversineDistance(lat1, lng1, lat2, lng2);
      // Assume typical 40km/h driving speed to mock duration in minutes: (dist / 40) * 60 mins
      const duration = Math.round((distance / 40) * 60 * 10) / 10;
      
      console.log(`[GoogleMaps-Bypass] No Google Maps API key found. Falling back to mathematical Haversine.`);
      console.log(`[GoogleMaps-Bypass] Calculated Haversine: ${distance} km, Est. Duration: ${duration} mins`);
      
      return {
        distanceKm: distance,
        durationMins: duration || 5, // floor to 5 mins
        source: 'haversine',
      };
    }

    try {
      console.log(`[GoogleMaps] Fetching driving routing from Distance Matrix API...`);
      
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat1},${lng1}&destinations=${lat2},${lng2}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const result: any = await response.json();

      if (response.ok && result.status === 'OK' && result.rows?.[0]?.elements?.[0]?.status === 'OK') {
        const element = result.rows[0].elements[0];
        const distanceMeters = element.distance.value; // in meters
        const durationSeconds = element.duration.value; // in seconds

        const distanceKm = Math.round((distanceMeters / 1000) * 100) / 100;
        const durationMins = Math.round((durationSeconds / 60) * 10) / 10;

        console.log(`[GoogleMaps] Matrix API Success: ${distanceKm} km, Driving Duration: ${durationMins} mins`);

        return {
          distanceKm,
          durationMins,
          source: 'google',
        };
      } else {
        console.warn(`[GoogleMaps] API returned error status: ${result.status || 'UNKNOWN'}. Triggering Haversine fallback.`);
        const fallbackDist = calculateHaversineDistance(lat1, lng1, lat2, lng2);
        return {
          distanceKm: fallbackDist,
          durationMins: Math.round((fallbackDist / 40) * 60 * 10) / 10 || 5,
          source: 'haversine',
        };
      }
    } catch (error) {
      console.error(`[GoogleMaps] Network error executing Matrix request:`, error);
      const fallbackDist = calculateHaversineDistance(lat1, lng1, lat2, lng2);
      return {
        distanceKm: fallbackDist,
        durationMins: Math.round((fallbackDist / 40) * 60 * 10) / 10 || 5,
        source: 'haversine',
      };
    }
  }
}
