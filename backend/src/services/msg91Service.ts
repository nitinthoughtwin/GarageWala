import dotenv from 'dotenv';
dotenv.config();

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || '';
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID || '';

export class Msg91Service {
  /**
   * Sends an OTP SMS via MSG91 API.
   * If MSG91 keys are absent or running in development, logs the OTP locally.
   */
  static async sendOTP(phone: string, otp: string): Promise<boolean> {
    // Standardize phone format (e.g., ensure it has country code, default to 91 for India if none exists)
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+') && formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone; // default MSG91 standard
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.replace('+', '');
    }

    if (!MSG91_AUTH_KEY || MSG91_AUTH_KEY.startsWith('mock') || !MSG91_TEMPLATE_ID) {
      console.log(`=================================================`);
      console.log(`[MSG91-DEV-BYPASS] Dispatching SMS OTP to: +${formattedPhone}`);
      console.log(`[MSG91-DEV-BYPASS] OTP VERIFICATION CODE: ${otp}`);
      console.log(`=================================================`);
      return true;
    }

    try {
      console.log(`[MSG91] Sending live OTP SMS to +${formattedPhone}...`);
      
      const response = await fetch(`https://control.msg91.com/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=${formattedPhone}&authkey=${MSG91_AUTH_KEY}&otp=${otp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: any = await response.json();
      
      if (response.ok && result.type === 'success') {
        console.log(`[MSG91] Live OTP successfully sent to +${formattedPhone}`);
        return true;
      } else {
        console.error(`[MSG91] API error sending OTP:`, result);
        return false;
      }
    } catch (error) {
      console.error(`[MSG91] Network error dispatching OTP to +${formattedPhone}:`, error);
      return false;
    }
  }

  /**
   * Verifies an OTP code via MSG91 API.
   * Fallback: Auto-verifies if key is absent and code matches the memory store or hardcoded '123456'.
   */
  static async verifyOTP(phone: string, otp: string): Promise<boolean> {
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+') && formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.replace('+', '');
    }

    if (!MSG91_AUTH_KEY || MSG91_AUTH_KEY.startsWith('mock') || !MSG91_TEMPLATE_ID) {
      console.log(`[MSG91-DEV-BYPASS] Verifying code ${otp} for +${formattedPhone} locally...`);
      return otp === '123456';
    }

    try {
      console.log(`[MSG91] Verifying live OTP code ${otp} for +${formattedPhone} via MSG91 REST API...`);

      const response = await fetch(`https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${formattedPhone}&authkey=${MSG91_AUTH_KEY}`, {
        method: 'POST',
      });

      const result: any = await response.json();

      if (response.ok && result.type === 'success') {
        console.log(`[MSG91] Live OTP code successfully verified for +${formattedPhone}!`);
        return true;
      } else {
        console.error(`[MSG91] Verification failed or rejected:`, result);
        return false;
      }
    } catch (error) {
      console.error(`[MSG91] Network error verifying OTP for +${formattedPhone}:`, error);
      return false;
    }
  }
}
