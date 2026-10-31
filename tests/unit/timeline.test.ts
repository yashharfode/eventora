import { describe, expect, it } from 'vitest';
import {
  validateEventDate,
  calculateDueDate,
  rescheduleTimeline,
  validateTaskDependencies,
  detectSchedulingConflicts,
  groupTasksByMilestones,
  type TimelineTask,
} from '@/features/planning/timeline';

describe('Timeline Engine Domain Logic', () => {
  it('validates future event dates and rejects past dates', () => {
    const reference = new Date('2026-06-01T00:00:00Z');
    expect(validateEventDate('2026-12-15', reference)).toBe(true);
    expect(validateEventDate('2026-05-31', reference)).toBe(false);
    expect(validateEventDate('invalid-date', reference)).toBe(false);
  });

  it('calculates target due dates based on days before event', () => {
    // 30 days before 2026-10-31 is 2026-10-01
    const due = calculateDueDate('2026-10-31', 30);
    expect(due).toBe('2026-10-01');
  });

  it('reschedules all task due dates when master event date changes', () => {
    const tasks: TimelineTask[] = [
      { id: '1', title: 'Task A', daysBeforeEvent: 60, priority: 'high', status: 'todo' },
      { id: '2', title: 'Task B', daysBeforeEvent: 15, priority: 'medium', status: 'todo' },
    ];
    const rescheduled = rescheduleTimeline('2026-12-31', tasks);
    expect(rescheduled[0].dueDate).toBe('2026-11-01');
    expect(rescheduled[1].dueDate).toBe('2026-12-16');
  });

  it('validates task dependencies and flags inverted sequences', () => {
    const validTasks: TimelineTask[] = [
      { id: 't1', title: 'Book Venue', daysBeforeEvent: 90, priority: 'high', status: 'done' },
      { id: 't2', title: 'Send Invites with Venue', daysBeforeEvent: 60, priority: 'high', status: 'todo', dependsOnTaskId: 't1' },
    ];
    expect(validateTaskDependencies(validTasks).valid).toBe(true);

    const conflictingTasks: TimelineTask[] = [
      { id: 't1', title: 'Book Venue', daysBeforeEvent: 30, priority: 'high', status: 'todo' },
      { id: 't2', title: 'Send Invites', daysBeforeEvent: 60, priority: 'high', status: 'todo', dependsOnTaskId: 't1' },
    ];
    const result = validateTaskDependencies(conflictingTasks);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain('Dependency conflict');
  });

  it('detects scheduling conflicts when 3+ high-priority tasks collide on the exact same date', () => {
    const tasks: TimelineTask[] = [
      { id: '1', title: 'Venue Walkthrough', dueDate: '2026-11-15', daysBeforeEvent: 30, priority: 'high', status: 'todo' },
      { id: '2', title: 'Catering Taste Test', dueDate: '2026-11-15', daysBeforeEvent: 30, priority: 'high', status: 'todo' },
      { id: '3', title: 'Photographer Rehearsal', dueDate: '2026-11-15', daysBeforeEvent: 30, priority: 'high', status: 'todo' },
    ];
    const conflicts = detectSchedulingConflicts(tasks);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].date).toBe('2026-11-15');
    expect(conflicts[0].conflictingTaskIds.length).toBe(3);
  });

  it('groups tasks into chronological milestone buckets', () => {
    const tasks: TimelineTask[] = [
      { id: '1', title: 'Early Stage', daysBeforeEvent: 200, priority: 'medium', status: 'todo' },
      { id: '2', title: 'Mid Stage', daysBeforeEvent: 45, priority: 'high', status: 'todo' },
      { id: '3', title: 'Final Days', daysBeforeEvent: 5, priority: 'high', status: 'todo' },
    ];
    const buckets = groupTasksByMilestones(tasks);
    expect(buckets.some((b) => b.label === '6+ Months Before')).toBe(true);
    expect(buckets.some((b) => b.label === '1 Month Before')).toBe(true);
    expect(buckets.some((b) => b.label === 'Final 2 Weeks')).toBe(true);
  });
});
