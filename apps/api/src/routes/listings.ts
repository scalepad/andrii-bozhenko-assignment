import { Router } from 'express';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '../db.js';
import { requireRole } from '../auth.js';
import { HttpError } from '../http.js';
import { listingFiltersSchema, listingSchema } from '../validation.js';
import { StandardAttributeKey } from '@shoe/shared';

export const listingsRouter = Router();
const include = {
  images: { orderBy: { position: 'asc' as const } },
  attributes: true,
  seller: { select: { id: true, name: true } }
};
const nested = (input: ReturnType<typeof listingSchema.parse>) => ({
  title: input.title,
  description: input.description,
  priceCents: input.priceCents,
  images: { create: input.images.map((url, position) => ({ url, position })) },
  attributes: { create: input.attributes }
});

listingsRouter.get('/', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const min = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const max = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const attributeFilters = Object.entries(req.query).filter(
    ([key, value]) => key.startsWith('attr.') && typeof value === 'string'
  );
  const filters = listingFiltersSchema.parse({
    size: typeof req.query.size === 'string' ? req.query.size : undefined,
    color: typeof req.query.color === 'string' ? req.query.color : undefined,
    style: typeof req.query.style === 'string' ? req.query.style : undefined,
    upperMaterial: typeof req.query.upperMaterial === 'string' ? req.query.upperMaterial : undefined
  });
  const standardFilters: Array<{ key: StandardAttributeKey; value?: string }> = [
    { key: StandardAttributeKey.SIZE, value: filters.size },
    { key: StandardAttributeKey.COLOR, value: filters.color },
    { key: StandardAttributeKey.STYLE, value: filters.style },
    { key: StandardAttributeKey.UPPER_MATERIAL, value: filters.upperMaterial }
  ];
  const where: Prisma.ListingWhereInput = {
    ...(search
      ? { OR: [{ title: { contains: search } }, { description: { contains: search } }] }
      : {}),
    ...(Number.isFinite(min) || Number.isFinite(max)
      ? {
          priceCents: {
            ...(Number.isFinite(min) ? { gte: min } : {}),
            ...(Number.isFinite(max) ? { lte: max } : {})
          }
        }
      : {}),
    AND: [
      ...attributeFilters.map(([key, value]) => ({
        attributes: {
          some: { kind: 'CUSTOM' as const, key: key.slice(5), value: { contains: value as string } }
        }
      })),
      ...standardFilters
        .filter(({ value }) => Boolean(value))
        .map(({ key, value }) => ({
          attributes: { some: { kind: 'STANDARD' as const, key, value: value! } }
        }))
    ]
  };
  const listings = await prisma.listing.findMany({
    where,
    include,
    orderBy: { createdAt: 'desc' }
  });
  res.json({ listings });
});

listingsRouter.get('/mine', requireRole(Role.SELLER), async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { sellerId: req.user!.id },
    include,
    orderBy: { createdAt: 'desc' }
  });
  res.json({ listings });
});

listingsRouter.get('/:id', async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: String(req.params.id) },
    include
  });
  if (!listing) throw new HttpError(404, 'NOT_FOUND', 'Listing not found');
  res.json({ listing });
});

listingsRouter.post('/', requireRole(Role.SELLER), async (req, res) => {
  const input = listingSchema.parse(req.body);
  const listing = await prisma.listing.create({
    data: { sellerId: req.user!.id, ...nested(input) },
    include
  });
  res.status(201).json({ listing });
});

listingsRouter.put('/:id', requireRole(Role.SELLER), async (req, res) => {
  const existing = await prisma.listing.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Listing not found');
  if (existing.sellerId !== req.user!.id)
    throw new HttpError(403, 'FORBIDDEN', 'You do not own this listing');
  const input = listingSchema.parse(req.body);
  const listing = await prisma.$transaction(async (tx) => {
    await tx.listingImage.deleteMany({ where: { listingId: existing.id } });
    await tx.listingAttribute.deleteMany({ where: { listingId: existing.id } });
    return tx.listing.update({ where: { id: existing.id }, data: nested(input), include });
  });
  res.json({ listing });
});

listingsRouter.delete('/:id', requireRole(Role.SELLER), async (req, res) => {
  const result = await prisma.listing.deleteMany({
    where: { id: String(req.params.id), sellerId: req.user!.id }
  });
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Listing not found');
  res.status(204).end();
});
