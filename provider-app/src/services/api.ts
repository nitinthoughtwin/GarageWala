const BACKEND_URL = 'http://localhost:5000';

export class ApiService {
  /**
   * Proactively pre-register a default provider identity on local database.
   */
  static async registerProvider(providerDetails: {
    name: string;
    phone: string;
    aadharNumber: string;
    vehicleType: 'BIKE' | 'CAR' | 'TRUCK';
    skills: string[];
    currentLat: number;
    currentLng: number;
  }): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/providers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(providerDetails),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to pre-register provider.');
    }
    return response.json();
  }

  /**
   * Request OTP code dispatch.
   */
  static async sendOtp(phone: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to dispatch OTP SMS.');
    }
    return response.json();
  }

  /**
   * Verify provider OTP and login.
   */
  static async loginProvider(phone: string, otp: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/auth/provider/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Invalid or expired verification OTP code.');
    }
    return response.json();
  }

  /**
   * Fetch current earnings and ratings metrics.
   */
  static async fetchEarningsMetrics(token: string, providerId: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/providers/${providerId}/earnings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Could not load wallet metrics.');
    }
    return response.json();
  }

  /**
   * Set provider availability online/offline status.
   */
  static async toggleOnlineStatus(token: string, providerId: string, isOnline: boolean): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/providers/toggle-online`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ providerId, isOnline }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to sync availability status.');
    }
    return response.json();
  }

  /**
   * Accept an incoming offered order.
   */
  static async acceptOrder(token: string, orderId: string, providerId: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}/accept`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ providerId }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Order could not be accepted.');
    }
    return response.json();
  }

  /**
   * Update progress status of accepted order (e.g. PROVIDER_ON_WAY, ARRIVED, IN_PROGRESS).
   */
  static async updateOrderStatus(token: string, orderId: string, status: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update order progress status.');
    }
    return response.json();
  }

  /**
   * Verify customer arrival OTP code and atomically settle order wallet funds.
   */
  static async completeOrder(token: string, orderId: string, otp: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}/complete`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ otp }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Atomic completion verification failed. Incorrect OTP.');
    }
    return response.json();
  }

  /**
   * Load historical completed trips logs for this provider.
   */
  static async fetchProviderHistory(token: string, providerId: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/orders/provider/history?providerId=${providerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to retrieve wallet trip history logs.');
    }
    return response.json();
  }

  /**
   * Update provider's current GPS location coordinates in DB.
   */
  static async updateLocation(token: string, providerId: string, lat: number, lng: number): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/providers/location`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ providerId, lat, lng }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update GPS coordinates.');
    }
    return response.json();
  }
}
