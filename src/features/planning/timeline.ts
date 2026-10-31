export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TimelineTask = {
  id: string;
  title: string;
  daysBeforeEvent: number;
  priority: TaskPriority;
  status: TaskStatus;
  dependsOnTaskId?: string;
  dueDate?: string;
  completed?: boolean;
};

export type MilestoneBucket = {
  label: string;
  minDaysBefore: number;
  maxDaysBefore: number;
  tasks: TimelineTask[];
};

export type SchedulingConflict = {
  date: string;
  conflictingTaskIds: string[];
  reason: string;
};

/** Validates that an event date is formatted as YYYY-MM-DD and is in the future. */
export function validateEventDate(dateString: string, referenceDate = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const eventDate = new Date(`${dateString}T00:00:00Z`);
  if (isNaN(eventDate.getTime())) return false;

  const today = new Date(Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()));
  return eventDate.getTime() >= today.getTime();
}

/** Calculates target due date for a task based on event date and daysBeforeEvent. */
export function calculateDueDate(eventDateString: string, daysBeforeEvent: number): string {
  if (!Number.isInteger(daysBeforeEvent) || daysBeforeEvent < 0) {
    throw new Error('daysBeforeEvent must be a non-negative integer.');
  }
  const eventDate = new Date(`${eventDateString}T00:00:00Z`);
  if (isNaN(eventDate.getTime())) throw new Error('Invalid event date.');

  const dueDate = new Date(eventDate.getTime() - daysBeforeEvent * 24 * 60 * 60 * 1000);
  return dueDate.toISOString().split('T')[0];
}

/** Recalculates all task due dates when the master event date shifts. */
export function rescheduleTimeline(
  newEventDate: string,
  tasks: readonly TimelineTask[]
): TimelineTask[] {
  return tasks.map((task) => ({
    ...task,
    dueDate: calculateDueDate(newEventDate, task.daysBeforeEvent),
  }));
}

/** Detects dependency violations (e.g. task scheduled before its prerequisite). */
export function validateTaskDependencies(tasks: readonly TimelineTask[]): { valid: boolean; violations: string[] } {
  const taskMap = new Map<string, TimelineTask>();
  tasks.forEach((t) => taskMap.set(t.id, t));
  const violations: string[] = [];

  for (const task of tasks) {
    if (task.dependsOnTaskId) {
      const prerequisite = taskMap.get(task.dependsOnTaskId);
      if (!prerequisite) {
        violations.push(`Task "${task.title}" depends on non-existent task id "${task.dependsOnTaskId}".`);
        continue;
      }
      // Prerequisite must happen before the dependent task (i.e. more days before the event)
      if (prerequisite.daysBeforeEvent < task.daysBeforeEvent) {
        violations.push(
          `Dependency conflict: "${prerequisite.title}" (${prerequisite.daysBeforeEvent}d before) is scheduled AFTER "${task.title}" (${task.daysBeforeEvent}d before).`
        );
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/** Detects date conflicts when 3 or more high priority tasks collide on the exact same date. */
export function detectSchedulingConflicts(tasks: readonly TimelineTask[]): SchedulingConflict[] {
  const dateMap = new Map<string, TimelineTask[]>();
  for (const task of tasks) {
    if (task.dueDate && task.priority === 'high' && !task.completed && task.status !== 'done') {
      const existing = dateMap.get(task.dueDate) || [];
      existing.push(task);
      dateMap.set(task.dueDate, existing);
    }
  }

  const conflicts: SchedulingConflict[] = [];
  for (const [date, taskList] of dateMap.entries()) {
    if (taskList.length >= 3) {
      conflicts.push({
        date,
        conflictingTaskIds: taskList.map((t) => t.id),
        reason: `${taskList.length} high-priority milestones are due on ${date}, creating a deadline bottleneck.`,
      });
    }
  }

  return conflicts;
}

/** Organizes tasks into standardized chronological milestone buckets. */
export function groupTasksByMilestones(tasks: readonly TimelineTask[]): MilestoneBucket[] {
  const buckets: MilestoneBucket[] = [
    { label: '6+ Months Before', minDaysBefore: 180, maxDaysBefore: 730, tasks: [] },
    { label: '4-5 Months Before', minDaysBefore: 120, maxDaysBefore: 179, tasks: [] },
    { label: '2-3 Months Before', minDaysBefore: 60, maxDaysBefore: 119, tasks: [] },
    { label: '1 Month Before', minDaysBefore: 30, maxDaysBefore: 59, tasks: [] },
    { label: 'Final 2 Weeks', minDaysBefore: 0, maxDaysBefore: 29, tasks: [] },
  ];

  for (const task of tasks) {
    const bucket = buckets.find(
      (b) => task.daysBeforeEvent >= b.minDaysBefore && task.daysBeforeEvent <= b.maxDaysBefore
    );
    if (bucket) {
      bucket.tasks.push(task);
    } else {
      buckets[buckets.length - 1].tasks.push(task);
    }
  }

  return buckets.filter((b) => b.tasks.length > 0);
}
