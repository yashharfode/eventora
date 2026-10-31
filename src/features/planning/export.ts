import type { StoredEvent } from '@/lib/storage';
import { formatCurrency } from './budget';

/** Generates a comprehensive, professional Markdown report suitable for export, printing, or PDF generation. */
export function generateEventMarkdownReport(event: StoredEvent): string {
  const tasks = event.tasks || [];
  const vendors = event.vendors || [];
  const budgetItems = event.budget_items || [];
  const completedTasks = tasks.filter((t) => t.completed).length;
  const bookedVendors = vendors.filter((v) => v.booked).length;

  const totalBudget = formatCurrency(event.budget_minor, event.currency);
  const totalSpentMinor = budgetItems.reduce((sum, item) => sum + (item.spentMinor || 0), 0);
  const totalSpent = formatCurrency(totalSpentMinor, event.currency);

  let md = `# EVENTORA Event Master Blueprint\n\n`;
  md += `**Event Name:** ${event.name}  \n`;
  md += `**Event Type:** ${event.event_type.toUpperCase()}  \n`;
  md += `**Target Date:** ${event.event_date}  \n`;
  md += `**Location:** ${event.location}  \n`;
  md += `**Guest Count:** ${event.guest_count} Attendees  \n`;
  md += `**Status:** ${event.status.toUpperCase()}  \n`;
  md += `**Report Generated:** ${new Date().toISOString().split('T')[0]}  \n\n`;

  md += `---\n\n`;
  md += `## 1. Executive Summary\n\n`;
  md += `${event.summary || 'Custom event plan orchestrated by EVENTORA.'}\n\n`;

  if (event.style_tag) {
    md += `**Aesthetic & Style Theme:** ${event.style_tag}\n\n`;
  }

  md += `## 2. Budget & Financial Overview\n\n`;
  md += `- **Total Allocated Budget:** ${totalBudget}\n`;
  md += `- **Committed / Spent Amount:** ${totalSpent}\n`;
  md += `- **Net Remaining Variance:** ${formatCurrency(Math.max(0, event.budget_minor - totalSpentMinor), event.currency)}\n\n`;

  md += `### Category Allocation Breakdown\n\n`;
  md += `| Category | Planned Amount | Share (%) | Purpose / Rationale |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  for (const item of budgetItems) {
    md += `| ${item.category} | ${formatCurrency(item.amountMinor, event.currency)} | ${item.percentage}% | ${item.rationale || 'Operational allocation'} |\n`;
  }
  md += `\n`;

  md += `## 3. Preparation Timeline & Key Milestones\n\n`;
  md += `**Progress:** ${completedTasks} of ${tasks.length} tasks completed (${Math.round((completedTasks / Math.max(1, tasks.length)) * 100)}%)\n\n`;
  md += `| Status | Milestone / Task | Due Date | Priority |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  for (const task of tasks) {
    const statusMark = task.completed ? '✅ Done' : '⏳ Pending';
    md += `| ${statusMark} | ${task.title} | ${task.dueDate || `${task.daysBeforeEvent}d before`} | ${task.priority.toUpperCase()} |\n`;
  }
  md += `\n`;

  md += `## 4. Vendor Directory & Procurement\n\n`;
  md += `**Booked Vendors:** ${bookedVendors} of ${vendors.length}\n\n`;
  md += `| Category | Vendor Name | Rating | Estimated Cost | Booking Status |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const vendor of vendors) {
    const bookingStatus = vendor.booked ? 'Confirmed / Booked' : vendor.quoteRequested ? 'Quote In Review' : 'Shortlisted';
    md += `| ${vendor.category} | ${vendor.name} | ★ ${vendor.rating} (${vendor.reviewCount}) | ${formatCurrency(vendor.priceMinor, event.currency)} | ${bookingStatus} |\n`;
  }
  md += `\n`;

  if (event.ai_insights && event.ai_insights.length > 0) {
    md += `## 5. Strategic AI Planning Insights\n\n`;
    for (const insight of event.ai_insights) {
      md += `- 💡 ${insight}\n`;
    }
    md += `\n`;
  }

  md += `---\n`;
  md += `*Generated automatically by EVENTORA Intelligent Event Operating System.*\n`;

  return md;
}

/** Generates clean CSV content for budget allocations. */
export function generateBudgetCSV(event: StoredEvent): string {
  const budgetItems = event.budget_items || [];
  let csv = 'Category,Planned Amount (Minor),Share (%),Spent Amount (Minor),Rationale\n';
  for (const item of budgetItems) {
    const escapedRationale = `"${(item.rationale || '').replace(/"/g, '""')}"`;
    csv += `"${item.category}",${item.amountMinor},${item.percentage},${item.spentMinor || 0},${escapedRationale}\n`;
  }
  return csv;
}
