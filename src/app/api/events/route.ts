import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/require-user';
import { createEventSchema } from '@/lib/validation/event';
import { readJsonWithLimit, validateSameOrigin } from '@/lib/security/request';

// In-memory fallback store for server API routes in local mode
let inMemoryEvents: any[] = [];

export async function POST(request: Request) {
  const originError = validateSameOrigin(request);
  if (originError) return originError;
  const auth = await requireUser();
  if (!auth) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  let body: unknown;
  try {
    body = await readJsonWithLimit(request);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error && error.message === 'REQUEST_TOO_LARGE' ? 'Request is too large.' : 'Invalid JSON body.' },
      { status: error instanceof Error && error.message === 'REQUEST_TOO_LARGE' ? 413 : 400 }
    );
  }

  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid event details.', issues: parsed.error.issues }, { status: 400 });
  }

  const newEvent = {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    name: parsed.data.name,
    event_type: parsed.data.eventType,
    event_date: parsed.data.eventDate,
    location: parsed.data.location,
    guest_count: parsed.data.guestCount,
    budget_minor: parsed.data.budgetMinor,
    currency: parsed.data.currency,
    preferences: parsed.data.preferences,
    created_at: new Date().toISOString(),
  };

  inMemoryEvents.unshift(newEvent);
  return NextResponse.json({ event: newEvent }, { status: 201 });
}

export async function GET() {
  const auth = await requireUser();
  if (!auth) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  return NextResponse.json({ events: inMemoryEvents });
}
