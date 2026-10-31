import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/require-user';
import { aiPlanRequestSchema } from '@/lib/validation/event';
import { getAIProvider } from '@/lib/ai/provider';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { readJsonWithLimit, validateSameOrigin } from '@/lib/security/request';
import { sumBudget } from '@/features/planning/budget';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const originError = validateSameOrigin(request);
  if (originError) return originError;
  const auth = await requireUser();
  if (!auth) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!checkRateLimit(`ai-plan:${auth.user.id}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many planning requests. Please try again shortly.' }, { status: 429 });
  }

  let body: unknown;
  try {
    // Allow up to 10MB for multimodal inspiration image inputs
    body = await readJsonWithLimit(request, 10_000_000);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error && error.message === 'REQUEST_TOO_LARGE' ? 'Request is too large.' : 'Invalid JSON body.' },
      { status: error instanceof Error && error.message === 'REQUEST_TOO_LARGE' ? 413 : 400 }
    );
  }
  const parsed = aiPlanRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid event details.', issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const plan = await getAIProvider().generatePlan(parsed.data);
    const total = sumBudget(plan.budget.map((item) => ({ name: item.category, amountMinor: item.amountMinor, rationale: item.rationale })));
    return NextResponse.json({ plan, budgetTotalMinor: total });
  } catch (err) {
    console.error('[API /api/ai/plan Error]:', err);
    return NextResponse.json({ error: 'Planning is temporarily unavailable. Please try again.' }, { status: 503 });
  }
}
