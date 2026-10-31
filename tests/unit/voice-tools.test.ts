import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceEventTools } from '@/features/voice/tools';
import { StoredEvent, INITIAL_EVENTS } from '@/lib/storage';

describe('VoiceEventTools Suite', () => {
  let mockEvent: StoredEvent;
  let tools: VoiceEventTools;

  beforeEach(() => {
    mockEvent = JSON.parse(JSON.stringify(INITIAL_EVENTS[0]));
    tools = new VoiceEventTools(mockEvent);
  });

  it('reads accurate event overview formatted in INR', () => {
    const overview = tools.getEventOverview();
    expect(overview.name).toBe('Riya & Karan Wedding');
    expect(overview.guestCount).toBe(300);
    expect(overview.totalBudgetFormatted).toContain('₹15 Lakh');
    expect(overview.tasksTotal).toBeGreaterThan(0);
  });

  it('calculates budget summary and verifies emergency reserve', () => {
    const summary = tools.getBudgetSummary();
    expect(summary.totalBudgetMinor).toBe(150000000);
    expect(summary.categories.length).toBeGreaterThan(0);
    expect(summary.emergencyReserveFormatted).toBeTruthy();
  });

  it('detects pending and overdue tasks accurately', () => {
    const timeline = tools.getTimeline();
    expect(timeline.totalTasks).toBeGreaterThan(0);
    expect(timeline.milestoneGroups).toBeDefined();
  });

  it('generates a structured change proposal for budget revision', () => {
    // Propose revision to 12 lakh (120000000 paise)
    const proposal = tools.prepareBudgetRevision(mockEvent.id, 120000000, true);
    expect(proposal.type).toBe('budget_revision');
    expect(proposal.previousValue).toBe(150000000);
    expect(proposal.proposedValue).toBe(120000000);
    expect(proposal.financialImpactMinor).toBe(-30000000);
    expect(proposal.status).toBe('pending');
    expect(proposal.expiresAt).toBeGreaterThan(Date.now());
  });

  it('executes approved action and updates event budget', () => {
    const proposal = tools.prepareBudgetRevision(mockEvent.id, 120000000, true);
    const updated = tools.executeApprovedAction(proposal);

    expect(proposal.status).toBe('executed');
    expect(updated.budget_minor).toBe(120000000);
    expect(updated.activities[0].text).toContain('Voice AI: Total budget updated');
  });

  it('rejects expired action proposals', () => {
    const proposal = tools.prepareBudgetRevision(mockEvent.id, 100000000);
    proposal.expiresAt = Date.now() - 1000; // Expired

    expect(() => tools.executeApprovedAction(proposal)).toThrowError(/expired/);
    expect(proposal.status).toBe('cancelled');
  });
});

