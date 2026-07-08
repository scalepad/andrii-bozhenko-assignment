import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireRole } from '../auth.js';
import { prisma } from '../db.js';
import { HttpError } from '../http.js';

export const ordersRouter = Router();
ordersRouter.use(requireRole(Role.BUYER));
ordersRouter.post('/checkout', async (req, res) => {
  const order = await prisma.$transaction(async (tx) => {
    const cart = await tx.cartItem.findMany({
      where: { buyerId: req.user!.id },
      include: { listing: { include: { images: { orderBy: { position: 'asc' } } } } }
    });
    if (!cart.length) throw new HttpError(400, 'EMPTY_CART', 'Your cart is empty');
    const totalCents = cart.reduce((sum, item) => sum + item.quantity * item.listing.priceCents, 0);
    const created = await tx.order.create({
      data: {
        buyerId: req.user!.id,
        totalCents,
        items: {
          create: cart.map(({ listing, quantity }) => ({
            listingId: listing.id,
            title: listing.title,
            priceCents: listing.priceCents,
            quantity,
            imageUrl: listing.images[0]?.url
          }))
        }
      },
      include: { items: true }
    });
    await tx.cartItem.deleteMany({ where: { buyerId: req.user!.id } });
    return created;
  });
  res.status(201).json({ order });
});
ordersRouter.get('/', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.user!.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ orders });
});
