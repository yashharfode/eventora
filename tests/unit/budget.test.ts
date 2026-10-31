import { describe, expect, it } from 'vitest';
import {
  getBudgetStatus,
  sumBudget,
  reconcileBudget,
  calculateCategoryVariance,
  evaluateBudgetHealth,
  formatCurrency,
} from '@/features/planning/budget';

describe('Budget Engine Domain Logic', () => {
  it('sums integer minor currency units exactly without floating point drift', () => {
    expect(
      sumBudget([
        { name: 'Venue', amountMinor: 12550, rationale: '' },
        { name: 'Food', amountMinor: 999, rationale: '' },
        { name: 'Decor', amountMinor: 50000, rationale: '' },
      ])
    ).toBe(63549);
  });

  it('rejects negative and fractional currency amounts', () => {
    expect(() => sumBudget([{ name: 'Bad', amountMinor: -1, rationale: '' }])).toThrow();
    expect(() => sumBudget([{ name: 'Bad', amountMinor: 1.5, rationale: '' }])).toThrow();
  });

  it('detects overspending correctly', () => {
    const status = getBudgetStatus(10000, 12000);
    expect(status).toMatchObject({
      remainingMinor: -2000,
      isOverBudget: true,
      utilizationPercent: 120,
    });
  });

  it('handles zero planned budget without division by zero errors', () => {
    expect(getBudgetStatus(0, 0).utilizationPercent).toBe(0);
    expect(getBudgetStatus(0, 1).utilizationPercent).toBe(100);
    expect(getBudgetStatus(0, 0).isOverBudget).toBe(false);
  });

  it('reconciles allocations to never exceed total event budget', () => {
    const categories = [
      { name: 'Venue', amountMinor: 60000, rationale: '' },
      { name: 'Catering', amountMinor: 60000, rationale: '' },
    ];
    // Total is 120,000, but limit is 100,000
    const reconciled = reconcileBudget(100000, categories);
    const newTotal = sumBudget(reconciled);
    expect(newTotal).toBeLessThanOrEqual(100000);
    expect(reconciled.length).toBe(2);
  });

  it('calculates planned vs actual category variance accurately', () => {
    const variance = calculateCategoryVariance('Catering', 500000, 550000);
    expect(variance.isOverBudget).toBe(true);
    expect(variance.varianceMinor).toBe(-50000);
    expect(variance.variancePercent).toBe(10);
  });

  it('evaluates overall budget health and checks emergency reserve sufficiency', () => {
    const report = evaluateBudgetHealth(10000000, [
      { name: 'Venue', plannedMinor: 3000000, actualMinor: 3000000 },
      { name: 'Catering', plannedMinor: 4000000, actualMinor: 3800000 },
      { name: 'Emergency Reserve', plannedMinor: 800000, actualMinor: 0 },
    ], 8);

    expect(report.isOverBudget).toBe(false);
    expect(report.emergencyReserveMinor).toBe(800000);
    expect(report.hasSufficientReserve).toBe(true);
  });

  it('formats minor currency units to localized INR currency string', () => {
    const formatted = formatCurrency(150000000, 'INR', 'en-IN');
    expect(formatted).toContain('15,00,000');
  });
});
