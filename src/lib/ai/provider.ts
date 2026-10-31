import { z } from 'zod';
import { aiPlanRequestSchema } from '@/lib/validation/event';

export const generatedPlanSchema = z.object({
  summary: z.string().min(1).max(2_000),
  themeIdeas: z.array(z.object({ title: z.string().min(1).max(120), description: z.string().min(1).max(800) })).min(1).max(6),
  budget: z.array(z.object({ category: z.string().min(1).max(100), amountMinor: z.number().int().nonnegative(), rationale: z.string().max(400) })).min(1).max(25),
  tasks: z.array(z.object({ title: z.string().min(1).max(200), daysBeforeEvent: z.number().int().min(0).max(730), priority: z.enum(['low', 'medium', 'high']) })).max(60),
  risks: z.array(z.object({ risk: z.string().min(1).max(200), mitigation: z.string().min(1).max(400) })).max(20),
});
export type GeneratedPlan = z.infer<typeof generatedPlanSchema>;
export type PlanInput = z.infer<typeof aiPlanRequestSchema>;

export interface AIProvider {
  generatePlan(input: PlanInput): Promise<GeneratedPlan>;
}

/** Local heuristic AI generator for offline fallback */
export class LocalHeuristicProvider implements AIProvider {
  async generatePlan(input: PlanInput): Promise<GeneratedPlan> {
    const total = input.budgetMinor;
    const typeLabel = input.eventType.charAt(0).toUpperCase() + input.eventType.slice(1);
    
    const venueAmount = Math.floor(total * 0.35);
    const cateringAmount = Math.floor(total * 0.30);
    const decorAmount = Math.floor(total * 0.15);
    const photoAmount = Math.floor(total * 0.10);
    const contingencyAmount = total - (venueAmount + cateringAmount + decorAmount + photoAmount);

    return {
      summary: `A customized ${typeLabel.toLowerCase()} planned for ${input.guestCount} guests in ${input.location}. Tailored around ${input.preferences ? `"${input.preferences}"` : 'a seamless guest experience'}${input.imageUrl ? ' with themes drawn from your uploaded inspiration image' : ''}.`,
      themeIdeas: [
        {
          title: input.eventType === 'wedding' ? 'Royal Heritage & Contemporary Elegance' : 'Modern Celebration',
          description: `Features ambient lighting, signature local floral installations in ${input.location}, and comfortable curated seating.`
        },
        {
          title: 'Eco-Chic & Minimalist Warmth',
          description: 'Focuses on sustainable reusable materials, earthy textures, lush greenery, and soft acoustic musical ambiance.'
        }
      ],
      budget: [
        { category: 'Venue & Staging', amountMinor: venueAmount, rationale: `Primary venue rental, climate control, and basic sound setup in ${input.location}.` },
        { category: 'Catering & Dining', amountMinor: cateringAmount, rationale: `Curated multi-course dining experience for approximately ${input.guestCount} attendees.` },
        { category: 'Decor & Florals', amountMinor: decorAmount, rationale: 'Stage backdrop, atmospheric lighting, table centrepieces, and installations.' },
        { category: 'Photography & Media', amountMinor: photoAmount, rationale: 'Professional photography and video coverage of key moments.' },
        { category: 'Emergency Reserve', amountMinor: contingencyAmount, rationale: 'Buffer fund for last-minute adjustments and local municipal guidelines.' }
      ],
      tasks: [
        { title: 'Finalize venue contract and reserve date', daysBeforeEvent: 45, priority: 'high' },
        { title: 'Sample catering menu and confirm dietary requirements', daysBeforeEvent: 30, priority: 'high' },
        { title: 'Send digital/printed invitations and track RSVPs', daysBeforeEvent: 25, priority: 'medium' },
        { title: 'Confirm photographer and media schedule', daysBeforeEvent: 14, priority: 'medium' },
        { title: 'Conduct sound and lighting walkthrough', daysBeforeEvent: 7, priority: 'low' },
        { title: 'Final vendor check-in & contact sheet distribution', daysBeforeEvent: 2, priority: 'high' }
      ],
      risks: [
        { risk: 'Unpredictable weather or temperature shift', mitigation: 'Ensure venue provides indoor backup or canopy coverings.' },
        { risk: 'Guest count RSVP variance', mitigation: 'Confirm a ±10% catering adjustment buffer with the vendor 48h prior.' },
        { risk: 'Audiovisual glitch during main speeches/announcements', mitigation: 'Schedule backup microphones and an on-site technician.' }
      ]
    };
  }
}

/** OpenRouter Multimodal Provider with Automatic Backup Models */
export class OpenRouterMultimodalProvider implements AIProvider {
  private models: string[];
  private baseUrl: string;
  private apiKey: string;

  constructor(config: { baseUrl: string; apiKey: string; primaryModel: string; backupModels?: string[] }) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.models = [config.primaryModel, ...(config.backupModels || [])].filter(Boolean);
  }

  async generatePlan(input: PlanInput): Promise<GeneratedPlan> {
    let lastError: Error | null = null;

    for (const model of this.models) {
      try {
        console.log(`[AI Provider] Attempting plan generation with model: ${model}`);
        const plan = await this.tryModel(model, input);
        return plan;
      } catch (err) {
        console.warn(`[AI Provider] Model ${model} failed, switching to backup:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    // If all free models fail or rate limit, fall back gracefully to heuristic provider
    console.warn('[AI Provider] All OpenRouter models exhausted or rate-limited. Using local heuristic fallback.');
    return new LocalHeuristicProvider().generatePlan(input);
  }

  private async tryModel(model: string, input: PlanInput): Promise<GeneratedPlan> {
    const systemPrompt = `You are EVENTORA, a world-class AI event architect and planner.
Analyze the user's event brief and any uploaded inspiration image.
You MUST output ONLY a valid JSON object matching this structure:
{
  "summary": "concise overview of the event blueprint",
  "themeIdeas": [{"title": "theme title", "description": "detailed decor, lighting and atmosphere description"}],
  "budget": [{"category": "vendor/service category name", "amountMinor": integer_minor_units, "rationale": "reason for allocation"}],
  "tasks": [{"title": "task description", "daysBeforeEvent": integer_days, "priority": "low" | "medium" | "high"}],
  "risks": [{"risk": "potential challenge", "mitigation": "contingency plan"}]
}
Important:
- Budget values must be integers in minor currency units (e.g. ₹15,00,000 = 150000000 minor units).
- Sum of all budget amountMinor must be at or below the user's specified budgetMinor.
- If an inspiration image is attached, reference its aesthetic, color palette, and styling in the themeIdeas, decor, and summary.
- Output raw JSON only. Do not wrap in markdown or commentary.`;

    const userContent: any[] = [
      {
        type: 'text',
        text: `Event Brief:
- Type: ${input.eventType}
- Target Date: ${input.eventDate}
- City / Location: ${input.location}
- Expected Guest Count: ${input.guestCount}
- Budget: ${input.budgetMinor} minor units (${input.currency})
- User Preferences: ${input.preferences || 'Standard high quality celebration'}
${input.imageUrl ? 'An inspiration image has been attached. Analyze its color palette, floral arrangements, and aesthetic to incorporate into the plan.' : ''}`,
      },
    ];

    if (input.imageUrl) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: input.imageUrl,
        },
      });
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Eventora',
      },
      signal: AbortSignal.timeout(35_000),
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter returned status ${response.status}: ${response.statusText}`);
    }

    const payload: any = await response.json();
    const rawContent = payload.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('OpenRouter returned an empty message content.');
    }

    // Clean JSON content if wrapped in markdown
    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) || rawContent.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : rawContent.trim();

    const parsedJson = JSON.parse(jsonString);
    return generatedPlanSchema.parse(parsedJson);
  }
}

export function getAIProvider(): AIProvider {
  const { AI_BASE_URL, AI_API_KEY, AI_MODEL, AI_BACKUP_MODELS } = process.env;

  if (AI_BASE_URL && AI_API_KEY && AI_MODEL) {
    const backupModels = AI_BACKUP_MODELS ? AI_BACKUP_MODELS.split(',').map((s) => s.trim()) : [];
    return new OpenRouterMultimodalProvider({
      baseUrl: AI_BASE_URL,
      apiKey: AI_API_KEY,
      primaryModel: AI_MODEL,
      backupModels,
    });
  }

  return new LocalHeuristicProvider();
}
