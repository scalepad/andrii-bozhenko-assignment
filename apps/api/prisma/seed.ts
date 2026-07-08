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
const secondSeller = await prisma.user.upsert({
  where: { email: 'atelier@example.com' },
  update: {},
  create: {
    email: 'atelier@example.com',
    name: 'Eastside Atelier',
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
if (!(await prisma.listing.count({ where: { sellerId: secondSeller.id } }))) {
  await prisma.listing.create({
    data: {
      sellerId: secondSeller.id,
      title: 'Forest Suede Low Tops',
      description: 'Deep green suede low tops with hand-stitched cream accents.',
      priceCents: 21500,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200',
            position: 0
          }
        ]
      },
      attributes: {
        create: [
          { kind: 'STANDARD', key: 'SIZE', value: '8.5' },
          { kind: 'STANDARD', key: 'COLOR', value: 'Green' },
          { kind: 'STANDARD', key: 'STYLE', value: 'Low Top' },
          { kind: 'STANDARD', key: 'UPPER_MATERIAL', value: 'Suede' },
          { kind: 'CUSTOM', key: 'Detail', value: 'Hand stitched' }
        ]
      }
    }
  });
  await prisma.listing.create({
    data: {
      sellerId: secondSeller.id,
      title: 'Cloud Knit Runner',
      description: 'A lightweight white knit runner with a hand-dyed blue gradient sole.',
      priceCents: 19800,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200',
            position: 0
          }
        ]
      },
      attributes: {
        create: [
          { kind: 'STANDARD', key: 'SIZE', value: '11' },
          { kind: 'STANDARD', key: 'COLOR', value: 'White' },
          { kind: 'STANDARD', key: 'STYLE', value: 'Runner' },
          { kind: 'STANDARD', key: 'UPPER_MATERIAL', value: 'Knit' },
          { kind: 'CUSTOM', key: 'Sole', value: 'Hand dyed gradient' }
        ]
      }
    }
  });
}
console.log(
  'Seeded buyer@example.com, seller@example.com, and atelier@example.com (password: password123)'
);
await prisma.$disconnect();
