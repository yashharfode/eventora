import { describe, expect, it } from 'vitest';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { createEventSchema, aiPlanRequestSchema } from '@/lib/validation/event';

describe('Security & Input Validation Gates', () => {
  it('enforces strict rate limits and blocks requests exceeding threshold', () => {
    const key = `test-ip-${Date.now()}`;
    const limit = 3;
    const windowMs = 5000;

    expect(checkRateLimit(key, limit, windowMs)).toBe(true);
    expect(checkRateLimit(key, limit, windowMs)).toBe(true);
    expect(checkRateLimit(key, limit, windowMs)).toBe(true);

    // 4th request exceeds limit
    expect(checkRateLimit(key, limit, windowMs)).toBe(false);
  });

  it('rejects malicious or invalid event inputs at Zod validation gate', () => {
    const valid = {
      name: 'Grand Celebration',
      eventType: 'wedding',
      eventDate: '2027-05-20',
      location: 'Udaipur, Rajasthan',
      guestCount: 250,
      budgetMinor: 50000000,
      currency: 'INR',
      preferences: 'Outdoor sunset setting',
    };

    // Valid
    expect(createEventSchema.safeParse(valid).success).toBe(true);

    // XSS injection in event name exceeding max length
    expect(createEventSchema.safeParse({ ...valid, name: '<script>' + 'A'.repeat(150) }).success).toBe(false);

    // Zero or negative guests
    expect(createEventSchema.safeParse({ ...valid, guestCount: 0 }).success).toBe(false);
    expect(createEventSchema.safeParse({ ...valid, guestCount: -10 }).success).toBe(false);

    // Negative budget
    expect(createEventSchema.safeParse({ ...valid, budgetMinor: -500 }).success).toBe(false);

    // Invalid currency code (must be 3 uppercase letters)
    expect(createEventSchema.safeParse({ ...valid, currency: 'inr' }).success).toBe(false);
    expect(createEventSchema.safeParse({ ...valid, currency: 'TOOLONG' }).success).toBe(false);

    // Invalid ISO date
    expect(createEventSchema.safeParse({ ...valid, eventDate: '2027/05/20' }).success).toBe(false);
    expect(createEventSchema.safeParse({ ...valid, eventDate: 'yesterday' }).success).toBe(false);

    // Preferences exceeding 2000 chars (DOS / memory abuse prevention)
    expect(createEventSchema.safeParse({ ...valid, preferences: 'X'.repeat(2001) }).success).toBe(false);
  });

  it('validates AI plan request schema including optional multimodal vision image URL', () => {
    const validReq = {
      eventType: 'birthday',
      eventDate: '2026-11-20',
      location: 'Bhopal',
      guestCount: 50,
      budgetMinor: 2000000,
      currency: 'INR',
      preferences: 'Superhero theme',
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
    };

    expect(aiPlanRequestSchema.safeParse(validReq).success).toBe(true);

    // Reject invalid event type
    expect(aiPlanRequestSchema.safeParse({ ...validReq, eventType: 'unsupported-type' }).success).toBe(false);
  });
});
