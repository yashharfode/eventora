import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatIndianCurrencyWords,
  parseIndianCurrencyInput,
  sumBudget,
} from '@/features/planning/budget';

describe('INR Currency & Unconstrained Budget Engine', () => {
  it('formats amounts in Indian Rupees (INR) with standard comma formatting', () => {
    // 15 Lakh in paise
    expect(formatCurrency(150000000)).toBe('₹15,00,000');
    // 50 Thousand in paise
    expect(formatCurrency(5000000)).toBe('₹50,000');
    // 1 Rupee
    expect(formatCurrency(100)).toBe('₹1');
    // 0 Rupees
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('expresses amounts in natural Indian words (Lakh / Crore)', () => {
    // 15 Lakh in paise
    expect(formatIndianCurrencyWords(150000000)).toBe('₹15 Lakh');
    // 1.5 Crore in paise
    expect(formatIndianCurrencyWords(1500000000)).toBe('₹1.5 Crore');
    // 50 Thousand in paise
    expect(formatIndianCurrencyWords(5000000)).toBe('₹50,000');
  });

  it('parses conversational currency inputs without arbitrary minimum or maximum limits', () => {
    // Lakh formats
    expect(parseIndianCurrencyInput('12 lakh')).toBe(120000000);
    expect(parseIndianCurrencyInput('12L')).toBe(120000000);
    expect(parseIndianCurrencyInput('12 lac')).toBe(120000000);

    // Crore formats
    expect(parseIndianCurrencyInput('1.5 crore')).toBe(1500000000);
    expect(parseIndianCurrencyInput('2 cr')).toBe(2000000000);

    // K formats
    expect(parseIndianCurrencyInput('50k')).toBe(5000000);
    expect(parseIndianCurrencyInput('100 thousand')).toBe(10000000);

    // Direct plain numbers (both small and huge)
    expect(parseIndianCurrencyInput('500')).toBe(50000);
    expect(parseIndianCurrencyInput('0')).toBe(0);
    expect(parseIndianCurrencyInput('1500000')).toBe(150000000);
    expect(parseIndianCurrencyInput('₹25,00,000')).toBe(250000000);
  });

  it('supports unconstrained budget totals up to safe integers', () => {
    const categories = [
      { name: 'Catering', amountMinor: 50000000, rationale: 'Food' },
      { name: 'Venue', amountMinor: 30000000, rationale: 'Hall' },
      { name: 'Misc', amountMinor: 20000000, rationale: 'Logistics' },
    ];
    expect(sumBudget(categories)).toBe(100000000); // 10 Lakh exactly
  });
});
