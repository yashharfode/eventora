import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceCoPlannerOrchestrator } from '@/features/voice/orchestrator';
import { StoredEvent, INITIAL_EVENTS } from '@/lib/storage';

describe('VoiceCoPlannerOrchestrator Suite', () => {
  let mockEvent: StoredEvent;
  let orchestrator: VoiceCoPlannerOrchestrator;

  beforeEach(() => {
    mockEvent = JSON.parse(JSON.stringify(INITIAL_EVENTS[0]));
    orchestrator = new VoiceCoPlannerOrchestrator(mockEvent);
  });

  it('answers "Explain my event" with structured master plan overview', async () => {
    const res = await orchestrator.processUserInput('Explain my complete event plan', 'en-IN');
    expect(res.message.text).toContain('Master Plan Overview: Riya & Karan Wedding');
    expect(res.message.text).toContain('₹15 Lakh');
    expect(res.message.spokenSummary).toContain('Riya & Karan Wedding');
  });

  it('understands spending queries in English and Hindi', async () => {
    const resEng = await orchestrator.processUserInput('How much have I spent so far?', 'en-IN');
    expect(resEng.message.text).toContain('Budget & Spending Summary');

    const resHindi = await orchestrator.processUserInput('Kitna kharcha hua hai?', 'hi-IN');
    expect(resHindi.message.text).toContain('Budget & Spending Summary');
    expect(resHindi.message.spokenSummary).toContain('Total budget');
  });

  it('prepares budget revision proposal for "Reduce budget to 12 lakh"', async () => {
    const res = await orchestrator.processUserInput('Reduce my budget to 12 lakh', 'en-IN');
    expect(res.message.proposal).toBeDefined();
    expect(res.message.proposal?.type).toBe('budget_revision');
    expect(res.message.proposal?.proposedValue).toBe(120000000);
    expect(res.message.spokenSummary).toContain('12 Lakh');
    expect(orchestrator.getPendingProposal()).toBeDefined();
  });

  it('executes proposed change upon user confirmation', async () => {
    // 1. Propose change
    await orchestrator.processUserInput('Reduce my budget to 12 lakh', 'en-IN');
    expect(orchestrator.getPendingProposal()).toBeDefined();

    // 2. User confirms
    const confirmRes = await orchestrator.processUserInput('Confirm', 'en-IN');
    expect(confirmRes.message.text).toContain('Action Confirmed and Executed');
    expect(confirmRes.updatedEvent?.budget_minor).toBe(120000000);
    expect(orchestrator.getPendingProposal()).toBeNull();
  });

  it('discards proposal cleanly upon user cancellation', async () => {
    await orchestrator.processUserInput('Reduce my budget to 12 lakh', 'en-IN');
    expect(orchestrator.getPendingProposal()).toBeDefined();

    const cancelRes = await orchestrator.processUserInput('Cancel', 'en-IN');
    expect(cancelRes.message.text).toContain('Action proposal was discarded');
    expect(orchestrator.getPendingProposal()).toBeNull();
  });
});
