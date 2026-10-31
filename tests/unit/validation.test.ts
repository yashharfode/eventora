import { describe, expect, it } from 'vitest';
import { createEventSchema } from '@/lib/validation/event';

describe('event input validation', () => {
  const valid = {name:'Community Day',eventType:'community',eventDate:'2027-02-10',location:'Bhopal',guestCount:200,budgetMinor:25000000,currency:'INR',preferences:''};
  it('accepts valid event details', () => expect(createEventSchema.safeParse(valid).success).toBe(true));
  it('rejects zero guests', () => expect(createEventSchema.safeParse({...valid,guestCount:0}).success).toBe(false));
  it('rejects malformed date', () => expect(createEventSchema.safeParse({...valid,eventDate:'next Friday'}).success).toBe(false));
  it('rejects oversized preferences', () => expect(createEventSchema.safeParse({...valid,preferences:'x'.repeat(2001)}).success).toBe(false));
});
