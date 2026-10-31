import { StoredEvent } from '@/lib/storage';
import {
  parseIndianCurrencyInput,
  formatIndianCurrencyWords,
} from '@/features/planning/budget';
import { VoiceEventTools } from './tools';
import {
  VoiceMessage,
  ActionProposal,
  SupportedLanguage,
} from './types';

export class VoiceCoPlannerOrchestrator {
  private tools: VoiceEventTools;
  private pendingProposal: ActionProposal | null = null;
  private event: StoredEvent | null = null;

  constructor(event?: StoredEvent) {
    this.tools = new VoiceEventTools(event);
    if (event) this.event = event;
  }

  setEvent(event: StoredEvent) {
    this.event = event;
    this.tools.setEvent(event);
  }

  getPendingProposal(): ActionProposal | null {
    return this.pendingProposal;
  }

  clearProposal() {
    this.pendingProposal = null;
  }

  async processUserInput(
    rawText: string,
    lang: SupportedLanguage = 'en-IN'
  ): Promise<{
    message: VoiceMessage;
    updatedEvent?: StoredEvent;
  }> {
    const text = rawText.trim().toLowerCase();
    const now = Date.now();

    // Check for confirmation of pending proposal
    if (this.pendingProposal && this.pendingProposal.status === 'pending') {
      const isConfirm =
        text.includes('confirm') ||
        text.includes('yes') ||
        text.includes('apply') ||
        text.includes('do it') ||
        text.includes('ha') ||
        text.includes('haan') ||
        text.includes('theek hai') ||
        text.includes('kar do') ||
        text.includes('save');

      const isCancel =
        text.includes('cancel') ||
        text.includes('no') ||
        text.includes('stop') ||
        text.includes('discard') ||
        text.includes('mat karo') ||
        text.includes('ruk jao');

      if (isConfirm) {
        try {
          const updated = this.tools.executeApprovedAction(this.pendingProposal);
          const executedProposal = { ...this.pendingProposal, status: 'executed' as const };
          this.pendingProposal = null;

          const spokenText =
            lang === 'hi-IN' || lang === 'hinglish'
              ? 'Badhai ho! Aapke event ke changes successfully save ho gaye hain.'
              : 'Confirmed! The changes have been successfully applied and saved to your event plan.';

          return {
            message: {
              id: 'msg_' + now,
              role: 'assistant',
              text: `✅ **Action Confirmed and Executed**\n\n${executedProposal.title}\n${executedProposal.description}\n\nAll event dashboards, category allocations, and timelines have been updated.`,
              spokenSummary: spokenText,
              timestamp: now,
              proposal: executedProposal,
              isActionReport: true,
            },
            updatedEvent: updated,
          };
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Execution failed';
          this.pendingProposal = null;
          return {
            message: {
              id: 'msg_' + now,
              role: 'assistant',
              text: `❌ Could not execute proposed action: ${errMsg}`,
              spokenSummary: 'Sorry, the proposed change could not be completed.',
              timestamp: now,
            },
          };
        }
      }

      if (isCancel) {
        this.pendingProposal.status = 'cancelled';
        this.pendingProposal = null;
        return {
          message: {
            id: 'msg_' + now,
            role: 'assistant',
            text: 'Action proposal was discarded. No changes were made to your event.',
            spokenSummary: 'Action cancelled. Your event remains unchanged.',
            timestamp: now,
          },
        };
      }
    }

    // ==========================================
    // 1. INTENT: EXPLAIN COMPLETE EVENT PLAN
    // ==========================================
    if (
      text.includes('explain') ||
      text.includes('overview') ||
      text.includes('summary') ||
      text.includes('batao') ||
      text.includes('sab kuch')
    ) {
      const overview = this.tools.getEventOverview();
      const budget = this.tools.getBudgetSummary();
      const timeline = this.tools.getTimeline();
      const risks = this.tools.getEventRisks();

      const spokenSummary =
        lang === 'hi-IN' || lang === 'hinglish'
          ? `Aapka event ${overview.name} ${overview.date} ko ${overview.location} me scheduled hai. Total budget ${overview.totalBudgetFormatted} hai, jisme se ${overview.totalSpentFormatted} spend ho chuka hai. ${overview.tasksCompleted} tasks complete hain aur ${risks.risks.length} main risks identified hain.`
          : `Here is your complete event plan for ${overview.name}. Scheduled on ${overview.date} in ${overview.location} with ${overview.guestCount} guests. Total budget is ${overview.totalBudgetFormatted}, with ${overview.totalSpentFormatted} spent so far and ${overview.remainingBudgetFormatted} remaining. You have completed ${overview.tasksCompleted} of ${overview.tasksTotal} tasks, and ${overview.vendorsBooked} vendors are confirmed.`;

      const markdownText = `### 📋 Master Plan Overview: ${overview.name}

- **Date & Location**: ${overview.date} • ${overview.location}
- **Guest Count**: ${overview.guestCount} guests
- **Financial Status**:
  - Total Budget: **${overview.totalBudgetFormatted}**
  - Spent to Date: **${overview.totalSpentFormatted}** (${budget.utilizationPercent}%)
  - Remaining: **${overview.remainingBudgetFormatted}**
  - Emergency Reserve: **${budget.emergencyReserveFormatted}** (${budget.hasSufficientReserve ? '✅ Healthy' : '⚠️ Low'})

- **Milestones & Tasks**:
  - Completed: **${overview.tasksCompleted} / ${overview.tasksTotal}**
  - Overdue: **${timeline.overdueTasks.length}**

- **Vendors Booked**: **${overview.vendorsBooked} / ${overview.vendorsTotal}**

${risks.risks.length > 0 ? `\n> ⚠️ **Key Risk Alert**: ${risks.risks[0].title} — ${risks.risks[0].recommendation}` : ''}`;

      return {
        message: {
          id: 'msg_' + now,
          role: 'assistant',
          text: markdownText,
          spokenSummary,
          timestamp: now,
        },
      };
    }

    // ==========================================
    // 2. INTENT: BUDGET & SPENDING QUERIES
    // ==========================================
    if (
      text.includes('spent') ||
      text.includes('remaining') ||
      text.includes('kharcha') ||
      text.includes('kitna bacha') ||
      (text.includes('budget') && !text.includes('reduce') && !text.includes('increase') && !text.includes('change') && !text.includes('kam') && !text.includes('badha'))
    ) {
      const budget = this.tools.getBudgetSummary();
      const spokenText =
        lang === 'hi-IN' || lang === 'hinglish'
          ? `Total budget ${budget.totalBudgetFormatted} hai. Aapne ab tak ${budget.totalSpentFormatted} kharch kiya hai, aur ${budget.remainingFormatted} bacha hua hai.`
          : `You have spent ${budget.totalSpentFormatted} out of your ${budget.totalBudgetFormatted} budget, leaving ${budget.remainingFormatted} available. Emergency reserve is set at ${budget.emergencyReserveFormatted}.`;

      const breakdown = budget.categories
        .map((c) => `- **${c.category}**: ${c.plannedFormatted} (${c.percentage}%) • Spent: ${c.spentFormatted}`)
        .join('\n');

      return {
        message: {
          id: 'msg_' + now,
          role: 'assistant',
          text: `### 💰 Budget & Spending Summary\n\n- **Total Budget**: ${budget.totalBudgetFormatted}\n- **Total Spent**: ${budget.totalSpentFormatted} (${budget.utilizationPercent}%)\n- **Remaining Balance**: ${budget.remainingFormatted}\n- **Emergency Reserve**: ${budget.emergencyReserveFormatted} (${budget.hasSufficientReserve ? 'Safe' : 'Review needed'})\n\n**Category Allocations:**\n${breakdown}`,
          spokenSummary: spokenText,
          timestamp: now,
        },
      };
    }

    // ==========================================
    // 3. INTENT: TASKS & TIMELINE QUERIES
    // ==========================================
    if (
      text.includes('task') ||
      text.includes('overdue') ||
      text.includes('timeline') ||
      text.includes('week') ||
      text.includes('kaam') ||
      text.includes('karna hai')
    ) {
      const timeline = this.tools.getTimeline();
      const overdue = timeline.overdueTasks;
      const pending = timeline.pendingTasks.slice(0, 5);

      const spokenText =
        lang === 'hi-IN' || lang === 'hinglish'
          ? `Aapke paas ${timeline.pendingTasks.length} pending tasks hain, jisme se ${overdue.length} overdue hain. Next priority tasks review kar lijiye.`
          : `You have ${timeline.pendingTasks.length} pending tasks, with ${overdue.length} currently overdue. Here are the top priority items.`;

      const overdueSection =
        overdue.length > 0
          ? `\n\n🚨 **Overdue Tasks:**\n` +
            overdue.map((t) => `- ❌ **${t.title}** (Due: ${t.dueDate} • ${t.milestone})`).join('\n')
          : '\n\n✅ No overdue tasks right now!';

      const pendingSection =
        `\n\n⏳ **Upcoming Priority Tasks:**\n` +
        pending.map((t) => `- 📌 **${t.title}** (Due: ${t.dueDate} • Priority: ${t.priority.toUpperCase()})`).join('\n');

      return {
        message: {
          id: 'msg_' + now,
          role: 'assistant',
          text: `### 📅 Timeline & Task Status\n- **Total Completed**: ${timeline.completedTasks} / ${timeline.totalTasks}${overdueSection}${pendingSection}`,
          spokenSummary: spokenText,
          timestamp: now,
        },
      };
    }

    // ==========================================
    // 4. INTENT: VENDOR STATUS
    // ==========================================
    if (text.includes('vendor') || text.includes('photographer') || text.includes('cater') || text.includes('venue')) {
      const vendors = this.tools.getVendorList();
      const booked = vendors.filter((v) => v.booked);
      const pending = vendors.filter((v) => !v.booked);

      const spokenText =
        lang === 'hi-IN' || lang === 'hinglish'
          ? `${booked.length} vendors confirm ho chuke hain aur ${pending.length} abhi pending hain.`
          : `You have ${booked.length} confirmed vendor bookings out of ${vendors.length} total.`;

      const list = vendors
        .map(
          (v) =>
            `- **${v.name}** (${v.category}) — ${formatIndianCurrencyWords(v.priceMinor)} • Status: ${v.booked ? '✅ Booked' : '⏳ Quote Requested'}`
        )
        .join('\n');

      return {
        message: {
          id: 'msg_' + now,
          role: 'assistant',
          text: `### 🤝 Vendor Directory Status\n\n${list}`,
          spokenSummary: spokenText,
          timestamp: now,
        },
      };
    }

    // ==========================================
    // 5. INTENT: CONTROL EVENT - BUDGET REVISION
    // ==========================================
    if (
      text.includes('reduce') ||
      text.includes('increase') ||
      text.includes('change budget') ||
      text.includes('budget kam') ||
      text.includes('budget badha') ||
      text.includes('set budget')
    ) {
      // Extract amount
      let targetMinor = parseIndianCurrencyInput(text);

      // Handle percentage reduction (e.g. "reduce by 20%")
      const percentMatch = text.match(/([0-9]+)%(?:\s*(?:reduction|less|kam))?/);
      if (percentMatch && !targetMinor && this.event) {
        const pct = parseInt(percentMatch[1], 10);
        const currentMinor = this.event.budget_minor || 0;
        targetMinor = Math.round(currentMinor * (1 - pct / 100));
      }

      if (!targetMinor && this.event) {
        // Fallback prompt for amount
        return {
          message: {
            id: 'msg_' + now,
            role: 'assistant',
            text: 'What should be your new total budget? You can say for example "12 lakh", "₹10,00,000", or "reduce by 15%".',
            spokenSummary: 'What would you like your new total budget to be?',
            timestamp: now,
          },
        };
      }

      if (targetMinor !== null) {
        const proposal = this.tools.prepareBudgetRevision(undefined, targetMinor, true);
        this.pendingProposal = proposal;

        const spokenPrompt =
          lang === 'hi-IN' || lang === 'hinglish'
            ? `Maine naya budget ${proposal.title} ka proposal prepare kar diya hai. Catering allocation safe hai. Kya aap isko confirm karte hain?`
            : `I have prepared a revised budget of ${formatIndianCurrencyWords(targetMinor)}. Catering allocation is preserved. Would you like me to apply these changes? Say Confirm or click the button.`;

        return {
          message: {
            id: 'msg_' + now,
            role: 'assistant',
            text: `### ⚠️ Change Proposal: Budget Revision\n\n**${proposal.title}**\n${proposal.description}\n\n- **Impact**: ${proposal.financialImpactSummary}\n- **Assumptions**: Catering quality preserved, emergency reserve protected.\n\nPlease review and say **"Confirm"** to apply or **"Cancel"** to discard.`,
            spokenSummary: spokenPrompt,
            timestamp: now,
            proposal,
          },
        };
      }
    }

    // ==========================================
    // 6. INTENT: CONTROL EVENT - COMPLETE / ADD TASK
    // ==========================================
    if (text.includes('mark') || text.includes('complete') || text.includes('done') || text.includes('pura hua')) {
      const proposal = this.tools.prepareTaskAction(undefined, 'complete', rawText);
      this.pendingProposal = proposal;

      return {
        message: {
          id: 'msg_' + now,
          role: 'assistant',
          text: `### ⚠️ Change Proposal: Complete Task\n\n**${proposal.title}**\n\nSay **"Confirm"** to update your milestone progress or **"Cancel"** to discard.`,
          spokenSummary: `Shall I mark this task as completed? Say confirm to proceed.`,
          timestamp: now,
          proposal,
        },
      };
    }

    // ==========================================
    // 7. DEFAULT HELPFUL CO-PLANNER RESPONSE
    // ==========================================
    const defaultSpoken =
      lang === 'hi-IN' || lang === 'hinglish'
        ? 'Main aapka Eventora AI voice co-planner hoon. Aap mujhse budget, tasks, vendors, ya plan explain karne ke liye pooch sakte hain.'
        : 'I am your EVENTORA AI Co-Planner. You can ask me to explain your plan, check budget spending, review overdue tasks, or say "Reduce budget to 12 lakh".';

    return {
      message: {
        id: 'msg_' + now,
        role: 'assistant',
        text: `I am your **EVENTORA Intelligent Voice Co-Planner**.\n\nHere are some things you can ask or tell me:\n- 🎙️ *"Explain my complete event plan"* \n- 💰 *"How much have I spent so far?"*\n- 📉 *"Reduce my budget to 12 lakh"* \n- 📌 *"What tasks are overdue?"*\n- 🤝 *"Show vendor booking status"*`,
        spokenSummary: defaultSpoken,
        timestamp: now,
      },
    };
  }
}
