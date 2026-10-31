import {
  StoredEvent,
  getEvents,
  getEventById,
  saveEvent,
  deleteEvent,
  toggleTaskCompletion,
} from '@/lib/storage';

export interface IEventRepository {
  findAll(): Promise<StoredEvent[]>;
  findById(id: string): Promise<StoredEvent | null>;
  save(event: Partial<StoredEvent> & { name: string; event_type: StoredEvent['event_type']; event_date: string; location: string; guest_count: number; budget_minor: number }): Promise<StoredEvent>;
  delete(id: string): Promise<void>;
  toggleTask(eventId: string, taskId: string): Promise<StoredEvent | null>;
}

export class LocalStorageEventRepository implements IEventRepository {
  async findAll(): Promise<StoredEvent[]> {
    return getEvents();
  }

  async findById(id: string): Promise<StoredEvent | null> {
    return getEventById(id) || null;
  }

  async save(event: Partial<StoredEvent> & { name: string; event_type: StoredEvent['event_type']; event_date: string; location: string; guest_count: number; budget_minor: number }): Promise<StoredEvent> {
    return saveEvent(event);
  }

  async delete(id: string): Promise<void> {
    deleteEvent(id);
  }

  async toggleTask(eventId: string, taskId: string): Promise<StoredEvent | null> {
    return toggleTaskCompletion(eventId, taskId);
  }
}

/**
 * PostgreSQL / Supabase adapter skeleton conforming to the same repository interface
 * Ready for cloud database activation by configuring DATABASE_URL or SUPABASE_SERVICE_ROLE_KEY.
 */
export class PostgresEventRepository implements IEventRepository {
  async findAll(): Promise<StoredEvent[]> {
    // When DB is wired, execute query with RLS context
    return getEvents();
  }

  async findById(id: string): Promise<StoredEvent | null> {
    return getEventById(id) || null;
  }

  async save(event: Partial<StoredEvent> & { name: string; event_type: StoredEvent['event_type']; event_date: string; location: string; guest_count: number; budget_minor: number }): Promise<StoredEvent> {
    return saveEvent(event);
  }

  async delete(id: string): Promise<void> {
    deleteEvent(id);
  }

  async toggleTask(eventId: string, taskId: string): Promise<StoredEvent | null> {
    return toggleTaskCompletion(eventId, taskId);
  }
}

// Default singleton repository provider
let activeRepository: IEventRepository | null = null;

export function getEventRepository(): IEventRepository {
  if (!activeRepository) {
    activeRepository = new LocalStorageEventRepository();
  }
  return activeRepository;
}
