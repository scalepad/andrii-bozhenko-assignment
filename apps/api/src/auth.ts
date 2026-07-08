import { randomBytes } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { Role, User } from '@prisma/client';
import { prisma } from './db.js';
import { HttpError } from './http.js';

const COOKIE = 'shoe_session';
const sessionDays = Number(process.env.SESSION_DAYS ?? 7);

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function createSession(userId: string, res: Response) {
  const id = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + sessionDays * 86_400_000);
  await prisma.session.create({ data: { id, userId, expiresAt } });
  res.cookie(COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/'
  });
}

export async function destroySession(req: Request, res: Response) {
  const id = req.cookies?.[COOKIE] as string | undefined;
  if (id) await prisma.session.deleteMany({ where: { id } });
  res.clearCookie(COOKIE, { path: '/' });
}

export async function loadUser(req: Request, _res: Response, next: NextFunction) {
  const id = req.cookies?.[COOKIE] as string | undefined;
  if (!id) return next();
  const session = await prisma.session.findUnique({ where: { id }, include: { user: true } });
  if (session && session.expiresAt > new Date()) req.user = session.user;
  else if (session) await prisma.session.delete({ where: { id } });
  next();
}

export function requireUser(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'Please log in');
  next();
}

export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'Please log in');
    if (req.user.role !== role)
      throw new HttpError(403, 'FORBIDDEN', `${role.toLowerCase()} access required`);
    next();
  };
}

export const publicUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role
});
