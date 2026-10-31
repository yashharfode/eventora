import { z } from 'zod';

export const eventTypeSchema = z.enum(['wedding', 'birthday', 'community', 'corporate', 'other']);

export const createEventSchema = z.object({
  name: z.string().trim().min(3).max(120),
  eventType: eventTypeSchema,
  eventDate: z.iso.date(),
  location: z.string().trim().min(2).max(160),
  guestCount: z.number().int().min(1).max(100_000),
  budgetMinor: z.number().int().min(0).max(10_000_000_000),
  currency: z.string().regex(/^[A-Z]{3}$/).default('INR'),
  preferences: z.string().trim().max(2_000).default(''),
  imageUrl: z.string().trim().max(5_000_000).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const aiPlanRequestSchema = z.object({
  eventType: eventTypeSchema,
  eventDate: z.iso.date(),
  location: z.string().trim().min(2).max(160),
  guestCount: z.number().int().min(1).max(100_000),
  budgetMinor: z.number().int().min(0).max(10_000_000_000),
  currency: z.string().regex(/^[A-Z]{3}$/).default('INR'),
  preferences: z.string().trim().max(2_000).default(''),
  imageUrl: z.string().trim().max(5_000_000).optional(),
});
