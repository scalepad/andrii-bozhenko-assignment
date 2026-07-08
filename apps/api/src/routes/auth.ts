import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { createSession, destroySession, publicUser } from '../auth.js';
import { HttpError } from '../http.js';
import { credentialsSchema, registerSchema } from '../validation.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const input = registerSchema.parse(req.body);
  if (await prisma.user.findUnique({ where: { email: input.email } }))
    throw new HttpError(409, 'EMAIL_TAKEN', 'An account already uses this email');
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash: await bcrypt.hash(input.password, 12)
    }
  });
  await createSession(user.id, res);
  res.status(201).json({ user: publicUser(user) });
});

authRouter.post('/login', async (req, res) => {
  const input = credentialsSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash)))
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  await createSession(user.id, res);
  res.json({ user: publicUser(user) });
});

authRouter.post('/logout', async (req, res) => {
  await destroySession(req, res);
  res.status(204).end();
});
authRouter.get('/me', (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});
