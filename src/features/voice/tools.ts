import {
  StoredEvent,
  getEventById,
  saveEvent,
} from '@/lib/storage';
import {
  reconcileBudget,
  formatIndianCurrencyWords,
} from '@/features/planning/budget';
import {
  groupTasksByMilestones,
} from '@/features/planning/timeline';
import {
  ActionProposal,
  EventOverviewReadResult,
  BudgetSummaryReadResult,
  TimelineReadResult,
  RiskAnalysisResult,
} from './types';

export class VoiceEventTools {
  private activeEvent: StoredEvent | null = null;

  constructor(event?: StoredEvent) {
    if (event) this.activeEvent = event;
  }

  setEvent(event: StoredEvent) {
    this.activeEvent = event;
  }

  private resolveEvent(eventId?: string): StoredEvent {
    if (eventId) {
      const found = getEventById(eventId);
      if (found) return found;
    }
    if (this.activeEvent) return this.activeEvent;
    throw new Error('No active event selected.');
  }

  // ==========================================
  // READ TOOLS
  // ==========================================

  getEventOverview(eventId?: string): EventOverviewReadResult {
    const ev = this.resolveEvent(eventId);
    const totalBudgetMinor = ev.budget_minor || 0;
    const totalSpentMinor = (ev.budget_items || []).reduce(
      (sum, b) => sum + (b.spentMinor || 0),
      0
    );
    const remainingMinor = Math.max(0, totalBudgetMinor - totalSpentMinor);
    const tasks = ev.tasks || [];
    const completedTasks = tasks.filter((t) => t.completed).length;
    const vendors = ev.vendors || [];
    const bookedVendors = vendors.filter((v) => v.booked).length;

    return {
      eventId: ev.id,
      name: ev.name,
      eventType: ev.event_type,
      date: ev.event_date,
      location: ev.location,
      guestCount: ev.guest_count,
      totalBudgetMinor,
      totalBudgetFormatted: formatIndianCurrencyWords(totalBudgetMinor),
      totalSpentMinor,
      totalSpentFormatted: formatIndianCurrencyWords(totalSpentMinor),
      remainingBudgetMinor: remainingMinor,
      remainingBudgetFormatted: formatIndianCurrencyWords(remainingMinor),
      tasksCompleted: completedTasks,
      tasksTotal: tasks.length,
      vendorsBooked: bookedVendors,
      vendorsTotal: vendors.length,
      styleTag: ev.style_tag,
    };
  }

  getBudgetSummary(eventId?: string): BudgetSummaryReadResult {
    const ev = this.resolveEvent(eventId);
    const totalBudgetMinor = ev.budget_minor || 0;
    const items = ev.budget_items || [];
    const totalSpentMinor = items.reduce((sum, b) => sum + (b.spentMinor || 0), 0);
    const remainingMinor = totalBudgetMinor - totalSpentMinor;
    const utilization =
      totalBudgetMinor > 0 ? Math.round((totalSpentMinor / totalBudgetMinor) * 100) : 0;

    const reserveItem = items.find(
      (i) =>
        i.category.toLowerCase().includes('reserve') ||
        i.category.toLowerCase().includes('emergency')
    );
    const reserveMinor = reserveItem ? reserveItem.amountMinor : 0;
    const targetReserve = Math.floor(totalBudgetMinor * 0.08);

    return {
      totalBudgetMinor,
      totalBudgetFormatted: formatIndianCurrencyWords(totalBudgetMinor),
      totalSpentMinor,
      totalSpentFormatted: formatIndianCurrencyWords(totalSpentMinor),
      remainingMinor: Math.max(0, remainingMinor),
      remainingFormatted: formatIndianCurrencyWords(Math.max(0, remainingMinor)),
      utilizationPercent: utilization,
      isOverBudget: totalSpentMinor > totalBudgetMinor,
      categories: items.map((i) => ({
        category: i.category,
        plannedFormatted: formatIndianCurrencyWords(i.amountMinor),
        spentFormatted: formatIndianCurrencyWords(i.spentMinor || 0),
        percentage: i.percentage,
        color: i.color,
      })),
      emergencyReserveFormatted: formatIndianCurrencyWords(reserveMinor),
      hasSufficientReserve: reserveMinor >= targetReserve,
    };
  }

  getPendingTasks(eventId?: string) {
    const ev = this.resolveEvent(eventId);
    return (ev.tasks || []).filter((t) => !t.completed);
  }

  getOverdueTasks(eventId?: string) {
    const ev = this.resolveEvent(eventId);
    const now = new Date().getTime();
    return (ev.tasks || []).filter((t) => {
      if (t.completed) return false;
      const due = new Date(t.dueDate).getTime();
      return due < now;
    });
  }

  getTimeline(eventId?: string): TimelineReadResult {
    const ev = this.resolveEvent(eventId);
    const tasks = ev.tasks || [];
    const completedTasks = tasks.filter((t) => t.completed).length;
    const pendingTasks = tasks.filter((t) => !t.completed);
    const overdueTasks = this.getOverdueTasks(eventId);
    const timelineTasks = tasks.map((t) => ({ id: t.id, title: t.title, daysBeforeEvent: t.daysBeforeEvent || 30, priority: t.priority, status: (t.completed ? 'done' : 'todo') as 'done' | 'todo', dueDate: t.dueDate, completed: t.completed }));
    const milestoneGroups = groupTasksByMilestones(timelineTasks);

    return {
      eventDate: ev.event_date,
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      milestoneGroups,
    };
  }

  getVendorList(eventId?: string) {
    const ev = this.resolveEvent(eventId);
    return ev.vendors || [];
  }

  getEventRisks(eventId?: string): RiskAnalysisResult {
    const ev = this.resolveEvent(eventId);
    const risks: RiskAnalysisResult['risks'] = [];

    // Check emergency reserve
    const reserve = (ev.budget_items || []).find(
      (b) =>
        b.category.toLowerCase().includes('reserve') ||
        b.category.toLowerCase().includes('emergency')
    );
    const reserveMinor = reserve ? reserve.amountMinor : 0;
    const minSafeReserve = Math.floor((ev.budget_minor || 0) * 0.08);
    if (reserveMinor < minSafeReserve) {
      risks.push({
        severity: 'high',
        title: 'Low Emergency Reserve Buffer',
        description: `Emergency reserve is ${formatIndianCurrencyWords(reserveMinor)}, which is under the recommended 8% threshold (${formatIndianCurrencyWords(minSafeReserve)}).`,
        recommendation: 'Allocate at least 8% to buffer unexpected logistical charges.',
      });
    }

    // Check key vendor bookings
    const vendors = ev.vendors || [];
    const venueBooked = vendors.some(
      (v) => v.category.toLowerCase().includes('venue') && v.booked
    );
    if (!venueBooked && vendors.length > 0) {
      risks.push({
        severity: 'high',
        title: 'Core Venue Unconfirmed',
        description: 'No venue has been marked as confirmed/booked yet.',
        recommendation: 'Finalize and book your venue immediately to lock in date and caterer access.',
      });
    }

    // Check overdue tasks
    const overdue = this.getOverdueTasks(ev.id);
    if (overdue.length > 0) {
      risks.push({
        severity: 'medium',
        title: `${overdue.length} Overdue Task${overdue.length > 1 ? 's' : ''}`,
        description: `Tasks like "${overdue[0].title}" have missed their milestone target date.`,
        recommendation: 'Review overdue items in the timeline and mark completed or reschedule.',
      });
    }

    return { risks };
  }

  simulateBudgetChange(eventId: string | undefined, newBudgetMinor: number) {
    const ev = this.resolveEvent(eventId);
    const oldBudgetMinor = ev.budget_minor || 0;
    const diff = newBudgetMinor - oldBudgetMinor;

    const currentCategories = (ev.budget_items || []).map((b) => ({
      name: b.category,
      amountMinor: b.amountMinor,
      rationale: b.rationale,
    }));

    const reconciled = reconcileBudget(newBudgetMinor, currentCategories);
    return {
      oldBudgetMinor,
      oldBudgetFormatted: formatIndianCurrencyWords(oldBudgetMinor),
      newBudgetMinor,
      newBudgetFormatted: formatIndianCurrencyWords(newBudgetMinor),
      differenceMinor: diff,
      differenceFormatted: formatIndianCurrencyWords(Math.abs(diff)),
      isReduction: diff < 0,
      reconciledCategories: reconciled,
    };
  }

  // ==========================================
  // WRITE TOOLS (TWO-PHASE PROPOSAL & EXECUTION)
  // ==========================================

  prepareBudgetRevision(
    eventId: string | undefined,
    newBudgetMinor: number,
    preserveCatering = true
  ): ActionProposal {
    const ev = this.resolveEvent(eventId);
    const oldBudgetMinor = ev.budget_minor || 0;
    const diffMinor = newBudgetMinor - oldBudgetMinor;

    const currentCategories = (ev.budget_items || []).map((b) => ({
      name: b.category,
      amountMinor: b.amountMinor,
      rationale: b.rationale,
    }));

    // If reduction and preserve catering, keep catering weight protected
    let revisedCategories;
    if (diffMinor < 0 && preserveCatering) {
      const cateringIndex = currentCategories.findIndex((c) =>
        c.name.toLowerCase().includes('catering')
      );
      if (cateringIndex >= 0 && currentCategories[cateringIndex].amountMinor < newBudgetMinor) {
        const cateringAmount = currentCategories[cateringIndex].amountMinor;
        const remainingBudget = newBudgetMinor - cateringAmount;
        const otherCats = currentCategories.filter((_, idx) => idx !== cateringIndex);
        const scaledOthers = reconcileBudget(remainingBudget, otherCats);
        revisedCategories = [
          ...scaledOthers.slice(0, cateringIndex),
          currentCategories[cateringIndex],
          ...scaledOthers.slice(cateringIndex),
        ];
      } else {
        revisedCategories = reconcileBudget(newBudgetMinor, currentCategories);
      }
    } else {
      revisedCategories = reconcileBudget(newBudgetMinor, currentCategories);
    }

    const proposalId = 'prop_bg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = Date.now();

    return {
      id: proposalId,
      eventId: ev.id,
      type: 'budget_revision',
      title: `Revise Total Budget to ${formatIndianCurrencyWords(newBudgetMinor)}`,
      description: `Adjustment from ${formatIndianCurrencyWords(oldBudgetMinor)} to ${formatIndianCurrencyWords(newBudgetMinor)} (${diffMinor >= 0 ? '+' : '-'}${formatIndianCurrencyWords(Math.abs(diffMinor))}).`,
      previousValue: oldBudgetMinor,
      proposedValue: newBudgetMinor,
      financialImpactMinor: diffMinor,
      financialImpactSummary: `${diffMinor >= 0 ? '+' : '-'}${formatIndianCurrencyWords(Math.abs(diffMinor))}`,
      affectedModules: ['Budget Planning', 'Vendor Allocations', 'Emergency Reserve'],
      assumptions: [
        preserveCatering ? 'Catering quality and allocation preserved' : 'Proportional scale across all categories',
        'Emergency reserve maintained at safe margin',
      ],
      payload: {
        newBudgetMinor,
        revisedCategories,
      },
      createdAt: now,
      expiresAt: now + 5 * 60 * 1000, // 5 min TTL
      status: 'pending',
    };
  }

  prepareTaskAction(
    eventId: string | undefined,
    action: 'create' | 'complete',
    taskTitle: string,
    milestone = 'Planning Phase'
  ): ActionProposal {
    const ev = this.resolveEvent(eventId);
    const proposalId = 'prop_tk_' + Date.now();
    const now = Date.now();

    return {
      id: proposalId,
      eventId: ev.id,
      type: action === 'create' ? 'task_create' : 'task_complete',
      title: action === 'create' ? `Add Task: "${taskTitle}"` : `Mark Completed: "${taskTitle}"`,
      description: action === 'create'
        ? `Schedule new planning task under milestone "${milestone}".`
        : `Mark "${taskTitle}" as completed and log timeline progress.`,
      previousValue: action === 'create' ? 'None' : 'Incomplete',
      proposedValue: action === 'create' ? taskTitle : 'Completed',
      affectedModules: ['Timeline & Tasks', 'Progress Metrics'],
      assumptions: ['Task assigned to event planner with standard milestone timeline'],
      payload: {
        taskTitle,
        milestone,
        action,
      },
      createdAt: now,
      expiresAt: now + 5 * 60 * 1000,
      status: 'pending',
    };
  }

  executeApprovedAction(proposal: ActionProposal): StoredEvent {
    if (proposal.status !== 'pending') {
      throw new Error(`Proposal cannot be executed; current status is "${proposal.status}".`);
    }
    if (Date.now() > proposal.expiresAt) {
      proposal.status = 'cancelled';
      throw new Error('Action proposal has expired. Please initiate the request again.');
    }

    const ev = this.resolveEvent(proposal.eventId);

    if (proposal.type === 'budget_revision') {
      const newBudgetMinor = proposal.payload.newBudgetMinor as number;
      const revisedCategories = proposal.payload.revisedCategories as Array<{
        name: string;
        amountMinor: number;
        rationale: string;
      }>;

      ev.budget_minor = newBudgetMinor;
      ev.budget_items = revisedCategories.map((c, idx) => {
        const existing = (ev.budget_items || [])[idx];
        const pct = newBudgetMinor > 0 ? Math.round((c.amountMinor / newBudgetMinor) * 100) : 0;
        return {
          category: c.name,
          amountMinor: c.amountMinor,
          spentMinor: existing ? Math.min(existing.spentMinor, c.amountMinor) : 0,
          percentage: pct,
          rationale: c.rationale,
          color: existing ? existing.color : '#8b5cf6',
        };
      });

      ev.activities.unshift({
        id: 'act_' + Date.now(),
        text: `Voice AI: Total budget updated to ${formatIndianCurrencyWords(newBudgetMinor)}`,
        timeAgo: 'Just now',
        type: 'venue',
      });
    } else if (proposal.type === 'task_create') {
      const taskTitle = proposal.payload.taskTitle as string;
      const milestone = proposal.payload.milestone as string;
      const newTask = {
        id: 'tsk_' + Date.now(),
        title: taskTitle,
        milestone,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        daysBeforeEvent: 30,
        priority: 'high' as const,
        completed: false,
      };
      ev.tasks = [newTask, ...(ev.tasks || [])];
      ev.activities.unshift({
        id: 'act_' + Date.now(),
        text: `Voice AI: Created task "${taskTitle}"`,
        timeAgo: 'Just now',
        type: 'task',
      });
    } else if (proposal.type === 'task_complete') {
      const taskTitle = (proposal.payload.taskTitle as string).toLowerCase();
      const task = (ev.tasks || []).find((t) =>
        t.title.toLowerCase().includes(taskTitle) || taskTitle.includes(t.title.toLowerCase())
      );
      if (task) {
        task.completed = true;
        ev.activities.unshift({
          id: 'act_' + Date.now(),
          text: `Voice AI: Completed task "${task.title}"`,
          timeAgo: 'Just now',
          type: 'task',
        });
      }
    }

    proposal.status = 'executed';
    saveEvent(ev);
    this.activeEvent = ev;
    return ev;
  }
}
