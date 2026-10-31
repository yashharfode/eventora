import { TaskItem } from '@/lib/storage';
import { MilestoneBucket } from '@/features/planning/timeline';

export type SpeechStatus =
  | 'idle'
  | 'listening'
  | 'transcribing'
  | 'thinking'
  | 'preparing_changes'
  | 'awaiting_confirmation'
  | 'executing'
  | 'completed'
  | 'failed';

export type SupportedLanguage = 'en-IN' | 'en-US' | 'hi-IN' | 'hinglish';

export interface ISpeechToTextService {
  isSupported(): boolean;
  start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    lang?: SupportedLanguage
  ): void;
  stop(): void;
}

export interface ITextToSpeechService {
  isSupported(): boolean;
  speak(text: string, lang?: SupportedLanguage, onEnd?: () => void): void;
  stop(): void;
  pause(): void;
  resume(): void;
  isSpeaking(): boolean;
}

export type ActionProposalType =
  | 'budget_revision'
  | 'task_create'
  | 'task_complete'
  | 'guest_count_revision'
  | 'date_revision';

export interface ActionProposal {
  id: string;
  eventId: string;
  type: ActionProposalType;
  title: string;
  description: string;
  previousValue: string | number;
  proposedValue: string | number;
  financialImpactMinor?: number;
  financialImpactSummary?: string;
  affectedModules: string[];
  assumptions: string[];
  payload: Record<string, unknown>;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'executed';
}

export interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  spokenSummary?: string;
  timestamp: number;
  proposal?: ActionProposal;
  highlightCategory?: string;
  isActionReport?: boolean;
}

export interface EventOverviewReadResult {
  eventId: string;
  name: string;
  eventType: string;
  date: string;
  location: string;
  guestCount: number;
  totalBudgetMinor: number;
  totalBudgetFormatted: string;
  totalSpentMinor: number;
  totalSpentFormatted: string;
  remainingBudgetMinor: number;
  remainingBudgetFormatted: string;
  tasksCompleted: number;
  tasksTotal: number;
  vendorsBooked: number;
  vendorsTotal: number;
  styleTag?: string;
}

export interface BudgetSummaryReadResult {
  totalBudgetMinor: number;
  totalBudgetFormatted: string;
  totalSpentMinor: number;
  totalSpentFormatted: string;
  remainingMinor: number;
  remainingFormatted: string;
  utilizationPercent: number;
  isOverBudget: boolean;
  categories: {
    category: string;
    plannedFormatted: string;
    spentFormatted: string;
    percentage: number;
    color: string;
  }[];
  emergencyReserveFormatted: string;
  hasSufficientReserve: boolean;
}

export interface TimelineReadResult {
  eventDate: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: TaskItem[];
  overdueTasks: TaskItem[];
  milestoneGroups: MilestoneBucket[];
}

export interface RiskAnalysisResult {
  risks: {
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    recommendation: string;
  }[];
}
