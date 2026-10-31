import { NextResponse } from 'next/server';

export function validateSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');
  // Browsers send Origin for fetch POSTs. Reject missing Origin for these cookie-authenticated APIs.
  if (!origin) return NextResponse.json({ error: 'Request origin is required.' }, { status: 403 });
  const expected = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  try {
    if (new URL(origin).origin !== new URL(expected).origin) {
      return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  return null;
}

export async function readJsonWithLimit(request: Request, maxBytes = 8_192): Promise<unknown> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > maxBytes) throw new Error('REQUEST_TOO_LARGE');
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) throw new Error('REQUEST_TOO_LARGE');
  return JSON.parse(raw) as unknown;
}
