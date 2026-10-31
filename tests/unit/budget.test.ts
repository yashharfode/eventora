import { describe, expect, it } from 'vitest';
import { getBudgetStatus, sumBudget } from '@/features/planning/budget';

describe('budget domain logic', () => {
  it('sums integer minor currency units exactly', () => {
    expect(sumBudget([{name:'Venue',amountMinor:12550,rationale:''},{name:'Food',amountMinor:999,rationale:''}])).toBe(13549);
  });
  it('rejects negative and fractional amounts', () => {
    expect(() => sumBudget([{name:'Bad',amountMinor:-1,rationale:''}])).toThrow();
    expect(() => sumBudget([{name:'Bad',amountMinor:1.5,rationale:''}])).toThrow();
  });
  it('detects overspending', () => {
    expect(getBudgetStatus(10000,12000)).toMatchObject({remainingMinor:-2000,isOverBudget:true,utilizationPercent:120});
  });
  it('handles zero planned budget without division by zero', () => {
    expect(getBudgetStatus(0,0).utilizationPercent).toBe(0);
    expect(getBudgetStatus(0,1).utilizationPercent).toBe(100);
  });
});
