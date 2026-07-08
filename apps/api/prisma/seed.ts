import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

process.env.DATABASE_URL ??= 'file:./dev.db';

const prisma = new PrismaClient();
const passwordHash = await bcrypt.hash('password123', 12);
const seller = await prisma.user.upsert({
  where: { email: 'seller@example.com' },
  update: {},
  create: {
    email: 'seller@example.com',
    name: 'North Shore Studio',
    passwordHash,
    role: Role.SELLER
  }
});
await prisma.user.upsert({
  where: { email: 'buyer@example.com' },
  update: {},
  create: { email: 'buyer@example.com', name: 'Demo Buyer', passwordHash, role: Role.BUYER }
});
if (!(await prisma.listing.count({ where: { sellerId: seller.id } }))) {
  await prisma.listing.create({
    data: {
      sellerId: seller.id,
      title: 'Pacific Sunset High Tops',
      description: 'Hand-painted canvas high tops inspired by the Pacific coast at golden hour.',
      priceCents: 18900,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200', position: 0 }
        ]
      },
      attributes: {
        create: [
          { kind: 'STANDARD', key: 'SIZE', value: '10' },
          { kind: 'STANDARD', key: 'COLOR', value: 'Orange' },
          { kind: 'STANDARD', key: 'STYLE', value: 'High Top' },
          { kind: 'STANDARD', key: 'UPPER_MATERIAL', value: 'Canvas' },
          { kind: 'CUSTOM', key: 'Technique', value: 'Hand painted' }
        ]
      }
    }
  });
  await prisma.listing.create({
    data: {
      sellerId: seller.id,
      title: 'Midnight Leather Runner',
      description: 'A minimal black leather runner finished by hand with reflective detailing.',
      priceCents: 24500,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200', position: 0 }
        ]
      },
      attributes: {
        create: [
          { kind: 'STANDARD', key: 'SIZE', value: '9' },
          { kind: 'STANDARD', key: 'COLOR', value: 'Black' },
          { kind: 'STANDARD', key: 'STYLE', value: 'Runner' },
          { kind: 'STANDARD', key: 'UPPER_MATERIAL', value: 'Leather' },
          { kind: 'CUSTOM', key: 'Detail', value: 'Reflective' }
        ]
      }
    }
  });
}
console.log('Seeded buyer@example.com and seller@example.com (password: password123)');
await prisma.$disconnect();
