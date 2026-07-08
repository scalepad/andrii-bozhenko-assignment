import { Router } from 'express';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { requireRole } from '../auth.js';
import { prisma } from '../db.js';
import { HttpError } from '../http.js';

export const cartRouter = Router();
cartRouter.use(requireRole(Role.BUYER));
const listingInclude = {
  images: { orderBy: { position: 'asc' as const } },
  attributes: true,
  seller: { select: { id: true, name: true } }
};

async function getCart(buyerId: string) {
  const items = await prisma.cartItem.findMany({
    where: { buyerId },
    include: { listing: { include: listingInclude } },
    orderBy: { id: 'asc' }
  });
  return {
    items,
    totalCents: items.reduce((sum, item) => sum + item.quantity * item.listing.priceCents, 0)
  };
}

cartRouter.get('/', async (req, res) => res.json({ cart: await getCart(req.user!.id) }));
cartRouter.post('/items', async (req, res) => {
  const input = z
    .object({ listingId: z.string().min(1), quantity: z.number().int().min(1).max(20).default(1) })
    .parse(req.body);
  if (!(await prisma.listing.findUnique({ where: { id: input.listingId } })))
    throw new HttpError(404, 'NOT_FOUND', 'Listing not found');
  await prisma.cartItem.upsert({
    where: { buyerId_listingId: { buyerId: req.user!.id, listingId: input.listingId } },
    create: { buyerId: req.user!.id, ...input },
    update: { quantity: { increment: input.quantity } }
  });
  res.status(201).json({ cart: await getCart(req.user!.id) });
});
cartRouter.patch('/items/:id', async (req, res) => {
  const { quantity } = z.object({ quantity: z.number().int().min(1).max(20) }).parse(req.body);
  const result = await prisma.cartItem.updateMany({
    where: { id: String(req.params.id), buyerId: req.user!.id },
    data: { quantity }
  });
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Cart item not found');
  res.json({ cart: await getCart(req.user!.id) });
});
cartRouter.delete('/items/:id', async (req, res) => {
  const result = await prisma.cartItem.deleteMany({
    where: { id: String(req.params.id), buyerId: req.user!.id }
  });
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Cart item not found');
  res.json({ cart: await getCart(req.user!.id) });
});
