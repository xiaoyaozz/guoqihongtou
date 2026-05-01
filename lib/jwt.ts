import jwt from 'jsonwebtoken';
import { User } from '@/types';

export function signToken(user: User, secret: string): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin,
    },
    secret,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string, secret: string): { id: number; email: string; is_admin: boolean } | null {
  try {
    return jwt.verify(token, secret) as { id: number; email: string; is_admin: boolean };
  } catch {
    return null;
  }
}
