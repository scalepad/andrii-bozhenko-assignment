import { z } from 'zod';
import { ShoeColor, ShoeSize, ShoeStyle, StandardAttributeKey, UpperMaterial } from '@shoe/shared';

export const credentialsSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(100)
});
export const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(80),
  role: z.enum(['BUYER', 'SELLER'])
});
export const listingSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(3000),
  priceCents: z.number().int().positive().max(100_000_000),
  images: z.array(z.string().url()).min(1).max(8),
  attributes: z
    .array(
      z.union([
        z.object({
          kind: z.literal('STANDARD'),
          key: z.literal(StandardAttributeKey.SIZE),
          value: z.nativeEnum(ShoeSize)
        }),
        z.object({
          kind: z.literal('STANDARD'),
          key: z.literal(StandardAttributeKey.COLOR),
          value: z.nativeEnum(ShoeColor)
        }),
        z.object({
          kind: z.literal('STANDARD'),
          key: z.literal(StandardAttributeKey.STYLE),
          value: z.nativeEnum(ShoeStyle)
        }),
        z.object({
          kind: z.literal('STANDARD'),
          key: z.literal(StandardAttributeKey.UPPER_MATERIAL),
          value: z.nativeEnum(UpperMaterial)
        }),
        z.object({
          kind: z.literal('CUSTOM'),
          key: z.string().trim().min(1).max(40),
          value: z.string().trim().min(1).max(100)
        })
      ])
    )
    .max(20)
    .superRefine((attributes, context) => {
      const standardKeys = new Set<string>();
      attributes.forEach((attribute, index) => {
        if (attribute.kind === 'STANDARD' && standardKeys.has(attribute.key)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'key'],
            message: `Standard attribute ${attribute.key} may only appear once`
          });
        }
        if (attribute.kind === 'STANDARD') standardKeys.add(attribute.key);
      });
    })
});

export const listingFiltersSchema = z.object({
  size: z.nativeEnum(ShoeSize).optional(),
  color: z.nativeEnum(ShoeColor).optional(),
  style: z.nativeEnum(ShoeStyle).optional(),
  upperMaterial: z.nativeEnum(UpperMaterial).optional()
});
