import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Msg91Service } from '../services/msg91Service';
import prisma from '../prismaClient';
const JWT_SECRET = process.env.JWT_SECRET || 'roadassist_jwt_secret_key_change_me_in_prod';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as any;

// Memory store for OTPs as a local development bypass
// Keys: phone number, Value: { otp: string, expires: number }
const otpStore = new Map<string, { otp: string; expires: number }>();

export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // Expires in 5 minutes

    // Always store locally as a dev bypass fallback
    otpStore.set(phone, { otp, expires });

    // Call production-ready MSG91 service
    const smsSent = await Msg91Service.sendOTP(phone, otp);

    if (!smsSent) {
      console.warn(`[Auth] MSG91 SMS dispatch returned false for ${phone}. Local dev bypass active.`);
    }

    res.json({
      message: 'OTP sent successfully',
      // Return OTP in payload only in local development bypass mode
      otp: (!process.env.MSG91_AUTH_KEY || process.env.MSG91_AUTH_KEY.startsWith('mock')) && process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ error: 'Phone and OTP are required' });
      return;
    }

    let isValid = false;
    const isMsg91Configured = process.env.MSG91_AUTH_KEY && !process.env.MSG91_AUTH_KEY.startsWith('mock') && process.env.MSG91_TEMPLATE_ID;

    if (isMsg91Configured) {
      isValid = await Msg91Service.verifyOTP(phone, otp);
    } else {
      // Local dev/bypass checks
      const storedData = otpStore.get(phone);
      const isStoredValid = storedData && storedData.otp === otp && storedData.expires >= Date.now();
      isValid = otp === '123456' || !!isStoredValid;
    }

    if (!isValid) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    // OTP validated successfully, clear memory store
    otpStore.delete(phone);

    // Upsert User
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: name || `User-${phone.slice(-4)}`,
        },
      });
    }

    // Generate production-grade JWT Token
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'OTP verified successfully',
      token,
      user,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const providerLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ error: 'Phone and OTP are required' });
      return;
    }

    let isValid = false;
    const isMsg91Configured = process.env.MSG91_AUTH_KEY && !process.env.MSG91_AUTH_KEY.startsWith('mock') && process.env.MSG91_TEMPLATE_ID;

    if (isMsg91Configured) {
      isValid = await Msg91Service.verifyOTP(phone, otp);
    } else {
      // Local dev/bypass checks — prefer in-memory OTP store, fall back to hardcoded bypass
      const storedData = otpStore.get(phone);
      const isStoredValid = storedData && storedData.otp === otp && storedData.expires >= Date.now();
      isValid = !!isStoredValid || otp === '123456';
    }

    if (!isValid) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    // OTP validated successfully, clear memory store
    otpStore.delete(phone);

    // Find Provider
    const provider = await prisma.provider.findUnique({
      where: { phone },
    });

    if (!provider) {
      res.status(404).json({ error: 'No provider registered with this phone number. Please register first.' });
      return;
    }

    // Generate JWT Token for Provider
    const token = jwt.sign(
      { id: provider.id, phone: provider.phone, role: 'provider' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Provider login successful',
      token,
      provider,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
