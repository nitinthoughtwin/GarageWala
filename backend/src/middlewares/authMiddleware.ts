import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'roadassist_jwt_secret_key_change_me_in_prod';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: 'user' | 'provider';
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
      }

      req.user = payload as AuthenticatedRequest['user'];
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header is missing' });
  }
};
