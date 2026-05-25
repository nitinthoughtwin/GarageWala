const BACKEND_URL = 'http://localhost:5000';

export class ApiService {
  /**
   * Request OTP code dispatch
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
   * Verify OTP and retrieve JWT token
   */
  static async verifyOtp(phone: string, otp: string, name?: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Invalid or expired verification code.');
    }
    return response.json();
  }

  /**
   * Fetchdynamic pricing estimates based on coordinates
   */
  static async getPriceEstimate(
    serviceType: string,
    vehicleType: string,
    latitude: number,
    longitude: number
  ): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType,
        vehicleType,
        userLat: latitude,
        userLng: longitude,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Pricing calculation failed.');
    }
    return response.json();
  }

  /**
   * Create emergency assistance request
   */
  static async createOrder(token: string, orderDetails: any): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderDetails),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to dispatch roadside assistance request.');
    }
    return response.json();
  }

  /**
   * Query active order status
   */
  static async getOrderDetails(orderId: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Could not fetch order progress details.');
    }
    return response.json();
  }

  /**
   * Cancel booking
   */
  static async cancelOrder(token: string, orderId: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to cancel order.');
    }
    return response.json();
  }

  /**
   * Submit mechanic trip review
   */
  static async submitRating(token: string, ratingDetails: any): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/ratings/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(ratingDetails),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Could not submit rating.');
    }
    return response.json();
  }

  /**
   * Fetch historical orders list
   */
  static async fetchUserHistory(token: string, userId: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/orders/user/history?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to retrieve trip logs.');
    }
    return response.json();
  }
}
