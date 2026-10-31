import { describe, expect, it } from 'vitest';
import { LocalHeuristicProvider, generatedPlanSchema } from '@/lib/ai/provider';

describe('AI Provider Engine & Schema Compliance', () => {
  const provider = new LocalHeuristicProvider();

  it('generates a valid structured plan conforming strictly to generatedPlanSchema', async () => {
    const input = {
      eventType: 'wedding' as const,
      eventDate: '2027-02-14',
      location: 'Udaipur, Rajasthan',
      guestCount: 200,
      budgetMinor: 100000000,
      currency: 'INR',
      preferences: 'Royal palace decor and vegetarian banquet',
    };

    const plan = await provider.generatePlan(input);

    // Verify full schema compliance
    const parsed = generatedPlanSchema.safeParse(plan);
    expect(parsed.success).toBe(true);

    expect(plan.summary).toContain('wedding');
    expect(plan.summary).toContain('200');
    expect(plan.themeIdeas.length).toBeGreaterThan(0);
    expect(plan.budget.length).toBeGreaterThan(0);
    expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.risks.length).toBeGreaterThan(0);
  });

  it('preserves the budget invariant: sum of categories <= total budget', async () => {
    const totalBudget = 50000000;
    const plan = await provider.generatePlan({
      eventType: 'corporate' as const,
      eventDate: '2026-12-10',
      location: 'Bengaluru',
      guestCount: 100,
      budgetMinor: totalBudget,
      currency: 'INR',
      preferences: 'Tech keynote and cocktail reception',
    });

    const sumAllocated = plan.budget.reduce((acc, item) => acc + item.amountMinor, 0);
    expect(sumAllocated).toBeLessThanOrEqual(totalBudget);
  });

  it('gracefully incorporates image analysis context in summary', async () => {
    const plan = await provider.generatePlan({
      eventType: 'birthday' as const,
      eventDate: '2027-01-01',
      location: 'Goa',
      guestCount: 30,
      budgetMinor: 15000000,
      currency: 'INR',
      preferences: 'Beachside celebration',
      imageUrl: 'https://example.com/beach-decor.jpg',
    });

    expect(plan.summary).toContain('inspiration image');
  });
});
