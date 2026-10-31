import { describe, expect, it } from 'vitest';
import { generateEventMarkdownReport, generateBudgetCSV } from '@/features/planning/export';
import { INITIAL_EVENTS } from '@/lib/storage';

describe('Event Export & Report Generator', () => {
  const sampleEvent = INITIAL_EVENTS[0];

  it('generates a complete Markdown master report with executive summary, budget and tasks', () => {
    const md = generateEventMarkdownReport(sampleEvent);

    expect(md).toContain('# EVENTORA Event Master Blueprint');
    expect(md).toContain(`**Event Name:** ${sampleEvent.name}`);
    expect(md).toContain('## 1. Executive Summary');
    expect(md).toContain('## 2. Budget & Financial Overview');
    expect(md).toContain('## 3. Preparation Timeline & Key Milestones');
    expect(md).toContain('## 4. Vendor Directory & Procurement');
    expect(md).toContain('## 5. Strategic AI Planning Insights');

    // Check budget table entries
    expect(md).toContain('| Venue |');
    expect(md).toContain('| Catering |');

    // Check vendor entries
    expect(md).toContain('Royal Orchid Banquet');
  });

  it('generates valid CSV data with escaped fields', () => {
    const csv = generateBudgetCSV(sampleEvent);

    expect(csv).toContain('Category,Planned Amount (Minor),Share (%),Spent Amount (Minor),Rationale');
    expect(csv).toContain('"Venue",30000000,20');
    expect(csv).toContain('"Catering",45000000,30');
  });
});
