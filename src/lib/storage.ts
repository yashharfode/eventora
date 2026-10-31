export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type BudgetItem = {
  category: string;
  amountMinor: number;
  spentMinor: number;
  percentage: number;
  rationale: string;
  color: string;
};

export type TaskItem = {
  id: string;
  title: string;
  milestone: string;
  dueDate: string;
  daysBeforeEvent: number;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
};

export type VendorItem = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  priceMinor: number;
  location: string;
  image: string;
  booked?: boolean;
  quoteRequested?: boolean;
};

export type ActivityItem = {
  id: string;
  text: string;
  timeAgo: string;
  type: 'venue' | 'catering' | 'vendor' | 'task';
};

export type StoredEvent = {
  id: string;
  name: string;
  event_type: 'wedding' | 'birthday' | 'community' | 'corporate' | 'other';
  event_date: string;
  location: string;
  guest_count: number;
  budget_minor: number;
  currency: string;
  preferences?: string;
  cover_image: string;
  status: 'planning' | 'ideation' | 'confirmed';
  created_at: string;
  style_tag?: string;
  summary?: string;
  budget_items: BudgetItem[];
  tasks: TaskItem[];
  vendors: VendorItem[];
  activities: ActivityItem[];
  ai_insights: string[];
  theme_ideas: { title: string; description: string }[];
};

const USER_STORAGE_KEY = 'eventora_current_user';
const EVENTS_STORAGE_KEY = 'eventora_events';

export const INITIAL_USER: User = {
  id: 'usr_yash',
  name: 'Yash',
  email: 'yash@eventora.app',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
};

export const INITIAL_EVENTS: StoredEvent[] = [
  {
    id: 'riya-karan-wedding',
    name: 'Riya & Karan Wedding',
    event_type: 'wedding',
    event_date: 'Dec 15, 2024',
    location: 'Bhopal, Madhya Pradesh',
    guest_count: 300,
    budget_minor: 150000000, // ₹15,00,000
    currency: 'INR',
    preferences: 'Traditional Indian wedding with modern touch, outdoor venue, vegetarian menu, want good photography and music.',
    cover_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    status: 'planning',
    style_tag: 'Traditional with Modern Touch',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    summary: 'A beautiful blend of traditional Indian wedding elements with modern aesthetics, featuring an outdoor venue, elegant florals, and curated vegetarian banquet for your guests.',
    budget_items: [
      { category: 'Venue', amountMinor: 30000000, spentMinor: 30000000, percentage: 20, rationale: 'Palace lawn and banquet hall booking', color: '#3b82f6' },
      { category: 'Catering', amountMinor: 45000000, spentMinor: 25000000, percentage: 30, rationale: 'Multi-course vegetarian royal spread for 300 guests', color: '#06b6d4' },
      { category: 'Decoration', amountMinor: 20000000, spentMinor: 20000000, percentage: 13, rationale: 'Mandap, floral entryway, and stage production', color: '#10b981' },
      { category: 'Photography', amountMinor: 12000000, spentMinor: 6000000, percentage: 8, rationale: 'Candid photographer, drone, and cinema team', color: '#f59e0b' },
      { category: 'Entertainment', amountMinor: 8000000, spentMinor: 4000000, percentage: 5, rationale: 'DJ, sound system, and dhol artists', color: '#ec4899' },
      { category: 'Clothing & Makeup', amountMinor: 10000000, spentMinor: 0, percentage: 7, rationale: 'Bridal stylist & family attire allowances', color: '#8b5cf6' },
      { category: 'Logistics', amountMinor: 7000000, spentMinor: 0, percentage: 5, rationale: 'Guest shuttles and airport transfers', color: '#6366f1' },
      { category: 'Miscellaneous', amountMinor: 6000000, spentMinor: 0, percentage: 4, rationale: 'Invites, favors, and welcome hampers', color: '#64748b' },
      { category: 'Emergency Reserve', amountMinor: 12000000, spentMinor: 0, percentage: 8, rationale: 'Buffer fund for last-minute adjustments', color: '#f43f5e' },
    ],
    tasks: [
      // 6 Months Before
      { id: 't-1', title: 'Finalize venue and date', milestone: '6 Months Before (Jun 2024)', dueDate: 'Jun 15', daysBeforeEvent: 180, priority: 'high', completed: true },
      { id: 't-2', title: 'Create guest list', milestone: '6 Months Before (Jun 2024)', dueDate: 'Jun 20', daysBeforeEvent: 175, priority: 'high', completed: true },
      { id: 't-3', title: 'Book photographer', milestone: '6 Months Before (Jun 2024)', dueDate: 'Jun 25', daysBeforeEvent: 170, priority: 'high', completed: true },
      { id: 't-4', title: 'Plan budget and finalize vendors', milestone: '6 Months Before (Jun 2024)', dueDate: 'Jun 30', daysBeforeEvent: 165, priority: 'medium', completed: true },
      // 4 Months Before
      { id: 't-5', title: 'Send save the dates', milestone: '4 Months Before (Aug 2024)', dueDate: 'Aug 10', daysBeforeEvent: 120, priority: 'high', completed: true },
      { id: 't-6', title: 'Finalize decoration theme', milestone: '4 Months Before (Aug 2024)', dueDate: 'Aug 15', daysBeforeEvent: 115, priority: 'medium', completed: true },
      { id: 't-7', title: 'Book caterer', milestone: '4 Months Before (Aug 2024)', dueDate: 'Aug 20', daysBeforeEvent: 110, priority: 'high', completed: true },
      { id: 't-8', title: 'Plan music and entertainment', milestone: '4 Months Before (Aug 2024)', dueDate: 'Aug 30', daysBeforeEvent: 100, priority: 'medium', completed: true },
      // 2 Months Before
      { id: 't-9', title: 'Finalize guest count', milestone: '2 Months Before (Oct 2024)', dueDate: 'Oct 10', daysBeforeEvent: 60, priority: 'high', completed: false },
      { id: 't-10', title: 'Confirm all vendors', milestone: '2 Months Before (Oct 2024)', dueDate: 'Oct 15', daysBeforeEvent: 55, priority: 'high', completed: false },
      { id: 't-11', title: 'Plan seating arrangement', milestone: '2 Months Before (Oct 2024)', dueDate: 'Oct 20', daysBeforeEvent: 50, priority: 'medium', completed: false },
      { id: 't-12', title: 'Wedding card distribution', milestone: '2 Months Before (Oct 2024)', dueDate: 'Oct 30', daysBeforeEvent: 45, priority: 'high', completed: false },
      // 1 Month Before
      { id: 't-13', title: 'Final rehearsals', milestone: '1 Month Before (Nov 2024)', dueDate: 'Nov 10', daysBeforeEvent: 30, priority: 'medium', completed: false },
      { id: 't-14', title: 'Finalize menu', milestone: '1 Month Before (Nov 2024)', dueDate: 'Nov 20', daysBeforeEvent: 25, priority: 'high', completed: false },
      { id: 't-15', title: 'Confirm logistics and transport', milestone: '1 Month Before (Nov 2024)', dueDate: 'Nov 25', daysBeforeEvent: 20, priority: 'medium', completed: false },
    ],
    vendors: [
      {
        id: 'v-1',
        name: 'Royal Orchid Banquet',
        category: 'Venue',
        rating: 4.8,
        reviewCount: 120,
        priceMinor: 30000000,
        location: 'Bhopal',
        image: 'https://images.unsplash.com/photo-1545232979-fbf68fe9b10d?auto=format&fit=crop&w=600&q=80',
        booked: true,
      },
      {
        id: 'v-2',
        name: 'Spice & More Catering',
        category: 'Catering',
        rating: 4.6,
        reviewCount: 95,
        priceMinor: 45000000,
        location: 'Bhopal',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80',
        booked: true,
      },
      {
        id: 'v-3',
        name: 'Moments Photography',
        category: 'Photography',
        rating: 4.9,
        reviewCount: 180,
        priceMinor: 12000000,
        location: 'Bhopal',
        image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
        booked: true,
      },
      {
        id: 'v-4',
        name: 'Dream Decorators',
        category: 'Decoration',
        rating: 4.7,
        reviewCount: 110,
        priceMinor: 20000000,
        location: 'Bhopal',
        image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
        booked: true,
      },
      {
        id: 'v-5',
        name: 'DJ Beats & Live Orchestra',
        category: 'Entertainment',
        rating: 4.8,
        reviewCount: 78,
        priceMinor: 8000000,
        location: 'Bhopal',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
        booked: true,
      },
      {
        id: 'v-6',
        name: 'Shahi Safa & Bridal Couture',
        category: 'Clothing & Makeup',
        rating: 4.9,
        reviewCount: 65,
        priceMinor: 10000000,
        location: 'Bhopal',
        image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=600&q=80',
        booked: true,
      },
      {
        id: 'v-7',
        name: 'Star Line Transport & Shuttles',
        category: 'Logistics',
        rating: 4.5,
        reviewCount: 42,
        priceMinor: 7000000,
        location: 'Bhopal',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
        booked: false,
      },
      {
        id: 'v-8',
        name: 'Kite Invites & Favors',
        category: 'Miscellaneous',
        rating: 4.7,
        reviewCount: 38,
        priceMinor: 6000000,
        location: 'Bhopal',
        image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
        booked: false,
      },
    ],
    activities: [
      { id: 'act-1', text: 'Venue booking confirmed', timeAgo: '2 hours ago', type: 'venue' },
      { id: 'act-2', text: 'Catering quote received', timeAgo: '5 hours ago', type: 'catering' },
      { id: 'act-3', text: 'New vendor added: Dream Decorators', timeAgo: '1 day ago', type: 'vendor' },
      { id: 'act-4', text: 'Task completed: Send save the dates', timeAgo: '3 days ago', type: 'task' },
    ],
    ai_insights: [
      'Catering is 30% of your budget, which is optimal for a 300-guest wedding.',
      'Consider booking venue early to get better rates.',
      'Keep 8% as emergency reserve for unexpected expenses.',
      'You can save ~₹50,000 by choosing an off-season date.',
    ],
    theme_ideas: [
      {
        title: 'Traditional with Modern Touch',
        description: 'Blends classic royal marigold florals, brass lamps, and rich silk drapery with ambient LED mood-lighting and modern seating.',
      },
      {
        title: 'Sunset Garden Fairytale',
        description: 'Outdoor lawn setup with fairy light canopy, pastel roses, acoustic live music, and rustic wooden dining tables.',
      },
    ],
  },
  {
    id: 'aaravs-birthday',
    name: "Aarav's Birthday",
    event_type: 'birthday',
    event_date: 'Jan 10, 2025',
    location: 'Indore, MP',
    guest_count: 50,
    budget_minor: 15000000, // ₹1,50,000
    currency: 'INR',
    preferences: 'Superhero themed 5th birthday, chocolate fountain, magic show, kid-friendly finger foods.',
    cover_image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    status: 'ideation',
    style_tag: 'Superhero Adventure Party',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    summary: 'A vibrant, action-packed 5th birthday celebration for 50 little guests and parents, featuring interactive magic games and custom themed treats.',
    budget_items: [
      { category: 'Venue', amountMinor: 4000000, spentMinor: 2000000, percentage: 27, rationale: 'Kids play arena & cafe rental', color: '#3b82f6' },
      { category: 'Catering', amountMinor: 5000000, spentMinor: 0, percentage: 33, rationale: 'Snack buffet, mini burgers & custom cake', color: '#06b6d4' },
      { category: 'Decoration', amountMinor: 3000000, spentMinor: 0, percentage: 20, rationale: 'Balloon arch, superhero cutouts & photo booth', color: '#10b981' },
      { category: 'Entertainment', amountMinor: 2000000, spentMinor: 0, percentage: 13, rationale: 'Magician, face painter & mascot appearance', color: '#ec4899' },
      { category: 'Miscellaneous', amountMinor: 1000000, spentMinor: 0, percentage: 7, rationale: 'Return gifts and superhero masks', color: '#64748b' },
    ],
    tasks: [
      { id: 'ab-1', title: 'Book play zone & party hall', milestone: '1 Month Before', dueDate: 'Dec 10', daysBeforeEvent: 30, priority: 'high', completed: true },
      { id: 'ab-2', title: 'Order custom 3-tier superhero cake', milestone: '2 Weeks Before', dueDate: 'Dec 25', daysBeforeEvent: 15, priority: 'high', completed: false },
      { id: 'ab-3', title: 'Book magician & balloon artist', milestone: '2 Weeks Before', dueDate: 'Dec 28', daysBeforeEvent: 12, priority: 'medium', completed: false },
      { id: 'ab-4', title: 'Prepare custom return gift boxes', milestone: '1 Week Before', dueDate: 'Jan 03', daysBeforeEvent: 7, priority: 'low', completed: false },
    ],
    vendors: [
      {
        id: 'vb-1',
        name: 'FunCity Play Cafe',
        category: 'Venue',
        rating: 4.7,
        reviewCount: 88,
        priceMinor: 4000000,
        location: 'Indore',
        image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80',
        booked: true,
      },
    ],
    activities: [
      { id: 'act-b1', text: 'Venue reserved at FunCity', timeAgo: '1 day ago', type: 'venue' },
    ],
    ai_insights: [
      'Include a 30-minute buffer before cake cutting for late arrivals.',
      'Finger foods and bite-sized snacks reduce food wastage with younger children.',
    ],
    theme_ideas: [
      { title: 'Avengers Assemble', description: 'Red, blue and gold palette with superhero photo stations and interactive training games.' },
    ],
  },
];

export function getUser(): User | null {
  if (typeof window === 'undefined') return INITIAL_USER;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USER;
  }
}

export function setUser(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save user in localStorage', err);
  }
}

export function removeUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to remove user from localStorage', err);
  }
}

export function getEvents(): StoredEvent[] {
  if (typeof window === 'undefined') return INITIAL_EVENTS;
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    return parsed;
  } catch {
    return INITIAL_EVENTS;
  }
}

export function getEventById(id: string): StoredEvent | null {
  const events = getEvents();
  return events.find((e) => e.id === id) || null;
}

export function saveEvent(eventInput: Partial<StoredEvent> & { name: string; event_type: StoredEvent['event_type']; event_date: string; location: string; guest_count: number; budget_minor: number }): StoredEvent {
  const events = getEvents();
  const id = eventInput.id || 'evt_' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  const existingIndex = events.findIndex((e) => e.id === id);
  const existing = existingIndex >= 0 ? events[existingIndex] : null;

  // Generate default mock budget items if not provided
  const total = eventInput.budget_minor;
  const defaultBudgetItems: BudgetItem[] = [
    { category: 'Venue', amountMinor: Math.floor(total * 0.25), spentMinor: 0, percentage: 25, rationale: 'Venue rental and amenities', color: '#3b82f6' },
    { category: 'Catering', amountMinor: Math.floor(total * 0.30), spentMinor: 0, percentage: 30, rationale: 'Food and drink services for all attendees', color: '#06b6d4' },
    { category: 'Decoration', amountMinor: Math.floor(total * 0.15), spentMinor: 0, percentage: 15, rationale: 'Florals, lighting and staging', color: '#10b981' },
    { category: 'Photography', amountMinor: Math.floor(total * 0.10), spentMinor: 0, percentage: 10, rationale: 'Photography and videography crew', color: '#f59e0b' },
    { category: 'Entertainment', amountMinor: Math.floor(total * 0.08), spentMinor: 0, percentage: 8, rationale: 'Music, audio setup and anchors', color: '#ec4899' },
    { category: 'Emergency Reserve', amountMinor: total - (Math.floor(total * 0.25) + Math.floor(total * 0.30) + Math.floor(total * 0.15) + Math.floor(total * 0.10) + Math.floor(total * 0.08)), spentMinor: 0, percentage: 12, rationale: 'Contingency fund', color: '#f43f5e' },
  ];

  const defaultTasks: TaskItem[] = [
    { id: 'tsk-1', title: 'Finalize venue and sign agreement', milestone: '6 Months Before', dueDate: 'Due in 2 weeks', daysBeforeEvent: 180, priority: 'high', completed: false },
    { id: 'tsk-2', title: 'Prepare preliminary guest list', milestone: '6 Months Before', dueDate: 'Due in 3 weeks', daysBeforeEvent: 170, priority: 'high', completed: false },
    { id: 'tsk-3', title: 'Shortlist photographers & videographers', milestone: '4 Months Before', dueDate: 'Due in 1 month', daysBeforeEvent: 120, priority: 'medium', completed: false },
    { id: 'tsk-4', title: 'Taste menu with caterer', milestone: '4 Months Before', dueDate: 'Due in 6 weeks', daysBeforeEvent: 110, priority: 'high', completed: false },
    { id: 'tsk-5', title: 'Design and dispatch invitation cards', milestone: '2 Months Before', dueDate: 'Due in 2 months', daysBeforeEvent: 60, priority: 'medium', completed: false },
    { id: 'tsk-6', title: 'Final RSVP check and seating plan', milestone: '1 Month Before', dueDate: 'Due in 3 months', daysBeforeEvent: 30, priority: 'high', completed: false },
  ];

  const defaultCover =
    eventInput.event_type === 'wedding'
      ? 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
      : eventInput.event_type === 'birthday'
      ? 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80'
      : eventInput.event_type === 'corporate'
      ? 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

  const savedItem: StoredEvent = {
    id,
    name: eventInput.name,
    event_type: eventInput.event_type,
    event_date: eventInput.event_date,
    location: eventInput.location,
    guest_count: eventInput.guest_count,
    budget_minor: eventInput.budget_minor,
    currency: eventInput.currency || 'INR',
    preferences: eventInput.preferences || '',
    cover_image: eventInput.cover_image || existing?.cover_image || defaultCover,
    status: eventInput.status || existing?.status || 'planning',
    created_at: existing ? existing.created_at : now,
    style_tag: eventInput.style_tag || existing?.style_tag || 'Personalized Celebration',
    summary: eventInput.summary || existing?.summary || `A memorable ${eventInput.event_type} in ${eventInput.location} designed for ${eventInput.guest_count} guests.`,
    budget_items: eventInput.budget_items || existing?.budget_items || defaultBudgetItems,
    tasks: eventInput.tasks || existing?.tasks || defaultTasks,
    vendors: eventInput.vendors || existing?.vendors || (INITIAL_EVENTS[0].vendors.slice(0, 4)),
    activities: eventInput.activities || existing?.activities || [
      { id: 'act-init', text: `Event "${eventInput.name}" created`, timeAgo: 'Just now', type: 'task' },
    ],
    ai_insights: eventInput.ai_insights || existing?.ai_insights || [
      `Optimal catering allocation for ${eventInput.guest_count} guests is between 25-35%.`,
      'Early venue booking in this location guarantees better weekend pricing.',
      'Always reserve 10% for unplanned logistics and guest additions.',
    ],
    theme_ideas: eventInput.theme_ideas || existing?.theme_ideas || [
      { title: 'Modern Chic Elegance', description: 'Contemporary layout, warm ambient lighting, and personalized accents.' },
      { title: 'Festive Vibrant Spark', description: 'Rich colors, lively musical setup, and handcrafted decorative centerpieces.' },
    ],
  };

  if (existingIndex >= 0) {
    events[existingIndex] = savedItem;
  } else {
    events.unshift(savedItem);
  }

  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save event to localStorage', err);
  }

  return savedItem;
}

export function deleteEvent(id: string): void {
  const events = getEvents().filter((e) => e.id !== id);
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to delete event from localStorage', err);
  }
}

export function toggleTaskCompletion(eventId: string, taskId: string): StoredEvent | null {
  const events = getEvents();
  const event = events.find((e) => e.id === eventId);
  if (!event) return null;

  const task = event.tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    event.activities.unshift({
      id: 'act-' + Date.now(),
      text: `Task ${task.completed ? 'completed' : 're-opened'}: ${task.title}`,
      timeAgo: 'Just now',
      type: 'task',
    });
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  }
  return event;
}
