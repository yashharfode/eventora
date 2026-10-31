export type BudgetCategory = {
  name: string;
  amountMinor: number;
  rationale: string;
};

/** Uses integer minor currency units to avoid floating-point money errors. */
export function sumBudget(categories: readonly BudgetCategory[]): number {
  return categories.reduce((total, category) => {
    if (!Number.isSafeInteger(category.amountMinor) || category.amountMinor < 0) {
      throw new Error('Budget amounts must be non-negative safe integers.');
    }
    const next = total + category.amountMinor;
    if (!Number.isSafeInteger(next)) throw new Error('Budget total exceeds safe integer range.');
    return next;
  }, 0);
}

export function getBudgetStatus(plannedMinor: number, spentMinor: number) {
  if (![plannedMinor, spentMinor].every(Number.isSafeInteger) || plannedMinor < 0 || spentMinor < 0) {
    throw new Error('Budget values must be non-negative safe integers.');
  }
  return {
    remainingMinor: plannedMinor - spentMinor,
    isOverBudget: spentMinor > plannedMinor,
    utilizationPercent: plannedMinor === 0 ? (spentMinor > 0 ? 100 : 0) : Math.round((spentMinor / plannedMinor) * 100),
  };
}
