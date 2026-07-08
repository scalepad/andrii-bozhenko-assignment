import request from 'supertest';
import { beforeEach, afterAll, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';

async function reset() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.listingAttribute.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}
beforeEach(reset);
afterAll(async () => {
  await reset();
  await prisma.$disconnect();
});
describe('marketplace API', () => {
  it('registers, persists a session, and logs out', async () => {
    const agent = request.agent(app);
    const created = await agent.post('/api/auth/register').send({
      name: 'Test Buyer',
      email: 'buyer@test.com',
      password: 'password123',
      role: 'BUYER'
    });
    expect(created.status).toBe(201);
    expect(created.body.user).toMatchObject({ email: 'buyer@test.com', role: 'BUYER' });
    expect((await agent.get('/api/auth/me')).body.user.email).toBe('buyer@test.com');
    expect((await agent.post('/api/auth/logout')).status).toBe(204);
    expect((await agent.get('/api/auth/me')).body.user).toBeNull();
  });

  it('enforces roles and listing ownership', async () => {
    const seller = request.agent(app);
    await seller
      .post('/api/auth/register')
      .send({ name: 'Seller One', email: 's1@test.com', password: 'password123', role: 'SELLER' });
    const listing = await seller.post('/api/listings').send({
      title: 'Custom Runner',
      description: 'A sufficiently detailed custom shoe.',
      priceCents: 15000,
      images: ['https://example.com/shoe.jpg'],
      attributes: [
        { kind: 'STANDARD', key: 'STYLE', value: 'Runner' },
        { kind: 'CUSTOM', key: 'Technique', value: 'Painted' }
      ]
    });
    expect(listing.status).toBe(201);
    const buyer = request.agent(app);
    await buyer
      .post('/api/auth/register')
      .send({ name: 'Buyer One', email: 'b1@test.com', password: 'password123', role: 'BUYER' });
    expect((await buyer.post('/api/listings').send({})).status).toBe(403);
    const otherSeller = request.agent(app);
    await otherSeller
      .post('/api/auth/register')
      .send({ name: 'Seller Two', email: 's2@test.com', password: 'password123', role: 'SELLER' });
    expect(
      (
        await otherSeller.put(`/api/listings/${listing.body.listing.id}`).send({
          title: 'Stolen',
          description: 'A sufficiently detailed custom shoe.',
          priceCents: 1,
          images: ['https://example.com/x.jpg'],
          attributes: []
        })
      ).status
    ).toBe(403);
  });

  it('searches attributes and completes checkout with server totals', async () => {
    const seller = request.agent(app);
    await seller
      .post('/api/auth/register')
      .send({ name: 'Seller', email: 'seller@test.com', password: 'password123', role: 'SELLER' });
    const created = await seller.post('/api/listings').send({
      title: 'Blue High Top',
      description: 'Hand painted blue canvas high tops.',
      priceCents: 12500,
      images: ['https://example.com/blue.jpg'],
      attributes: [
        { kind: 'STANDARD', key: 'SIZE', value: '10' },
        { kind: 'STANDARD', key: 'COLOR', value: 'Blue' },
        { kind: 'STANDARD', key: 'STYLE', value: 'High Top' },
        { kind: 'STANDARD', key: 'UPPER_MATERIAL', value: 'Canvas' },
        { kind: 'CUSTOM', key: 'Technique', value: 'Hand painted' },
        { kind: 'CUSTOM', key: 'Origin', value: 'Canada' }
      ]
    });
    const search = await request(app).get('/api/listings').query({
      style: 'High Top',
      color: 'Blue',
      size: '10',
      upperMaterial: 'Canvas',
      'attr.Technique': 'Hand',
      'attr.Origin': 'Canada'
    });
    expect(search.body.listings).toHaveLength(1);
    const buyer = request.agent(app);
    await buyer
      .post('/api/auth/register')
      .send({ name: 'Buyer', email: 'buyer@test.com', password: 'password123', role: 'BUYER' });
    const cart = await buyer
      .post('/api/cart/items')
      .send({ listingId: created.body.listing.id, quantity: 2 });
    expect(cart.body.cart.totalCents).toBe(25000);
    const checkout = await buyer.post('/api/orders/checkout');
    expect(checkout.status).toBe(201);
    expect(checkout.body.order).toMatchObject({ totalCents: 25000, status: 'COMPLETED' });
    expect(checkout.body.order.items[0]).toMatchObject({
      title: 'Blue High Top',
      priceCents: 12500,
      quantity: 2
    });
    expect((await buyer.get('/api/cart')).body.cart.items).toHaveLength(0);
  });
});
