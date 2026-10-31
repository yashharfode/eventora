export type BudgetCategory = {
  name: string;
  amountMinor: number;
  rationale: string;
};

export type CategoryVariance = {
  category: string;
  plannedMinor: number;
  actualMinor: number;
  varianceMinor: number;
  isOverBudget: boolean;
  variancePercent: number;
};

export type BudgetHealthReport = {
  totalPlannedMinor: number;
  totalSpentMinor: number;
  remainingMinor: number;
  isOverBudget: boolean;
  utilizationPercent: number;
  emergencyReserveMinor: number;
  hasSufficientReserve: boolean;
  categoryVariances: CategoryVariance[];
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

/** Reconciles budget allocations to ensure the sum does not exceed overall event budget. */
export function reconcileBudget(totalBudgetMinor: number, categories: BudgetCategory[]): BudgetCategory[] {
  if (!Number.isSafeInteger(totalBudgetMinor) || totalBudgetMinor < 0) {
    throw new Error('Total budget must be a non-negative safe integer.');
  }
  const currentSum = sumBudget(categories);
  if (currentSum <= totalBudgetMinor) {
    return [...categories];
  }

  // Scale down categories proportionally
  const ratio = totalBudgetMinor / currentSum;
  let runningTotal = 0;
  return categories.map((cat, idx) => {
    if (idx === categories.length - 1) {
      // Absorb rounding difference in final category
      const finalAmount = Math.max(0, totalBudgetMinor - runningTotal);
      return { ...cat, amountMinor: finalAmount };
    }
    const scaled = Math.floor(cat.amountMinor * ratio);
    runningTotal += scaled;
    return { ...cat, amountMinor: scaled };
  });
}

/** Calculates planned vs actual variance for a category. */
export function calculateCategoryVariance(
  category: string,
  plannedMinor: number,
  actualMinor: number
): CategoryVariance {
  if (![plannedMinor, actualMinor].every(Number.isSafeInteger) || plannedMinor < 0 || actualMinor < 0) {
    throw new Error('Category amounts must be non-negative safe integers.');
  }
  const varianceMinor = plannedMinor - actualMinor;
  const isOverBudget = actualMinor > plannedMinor;
  const variancePercent = plannedMinor === 0 ? (actualMinor > 0 ? 100 : 0) : Math.round(((actualMinor - plannedMinor) / plannedMinor) * 100);

  return {
    category,
    plannedMinor,
    actualMinor,
    varianceMinor,
    isOverBudget,
    variancePercent,
  };
}

/** Evaluates overall budget health and verifies reserve sufficiency. */
export function evaluateBudgetHealth(
  totalBudgetMinor: number,
  categories: Array<{ name: string; plannedMinor: number; actualMinor: number }>,
  targetReservePercentage = 8
): BudgetHealthReport {
  const totalPlannedMinor = categories.reduce((sum, c) => sum + c.plannedMinor, 0);
  const totalSpentMinor = categories.reduce((sum, c) => sum + c.actualMinor, 0);
  const status = getBudgetStatus(totalBudgetMinor, totalSpentMinor);

  const reserveCategory = categories.find((c) => c.name.toLowerCase().includes('reserve') || c.name.toLowerCase().includes('emergency'));
  const emergencyReserveMinor = reserveCategory ? reserveCategory.plannedMinor : 0;
  const targetReserveMinor = Math.floor((totalBudgetMinor * targetReservePercentage) / 100);
  const hasSufficientReserve = emergencyReserveMinor >= targetReserveMinor;

  const categoryVariances = categories.map((c) =>
    calculateCategoryVariance(c.name, c.plannedMinor, c.actualMinor)
  );

  return {
    totalPlannedMinor,
    totalSpentMinor,
    remainingMinor: status.remainingMinor,
    isOverBudget: status.isOverBudget,
    utilizationPercent: status.utilizationPercent,
    emergencyReserveMinor,
    hasSufficientReserve,
    categoryVariances,
  };
}

/** Formats minor currency units into localized currency display. */
export function formatCurrency(amountMinor: number, currency = 'INR', locale = 'en-IN'): string {
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) {
    throw new Error('Currency amount must be a non-negative safe integer.');
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}
