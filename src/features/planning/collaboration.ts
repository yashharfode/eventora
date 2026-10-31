export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type EventMember = {
  userId: string;
  email: string;
  name: string;
  role: MemberRole;
  joinedAt: string;
};

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  owner: 40,
  admin: 30,
  editor: 20,
  viewer: 10,
};

/** Evaluates whether user has read access to an event. */
export function canViewEvent(role: MemberRole | null): boolean {
  return role !== null && ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.viewer;
}

/** Evaluates whether user can edit event details, tasks, and notes. */
export function canEditEvent(role: MemberRole | null): boolean {
  return role !== null && ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.editor;
}

/** Evaluates whether user can modify budget allocations, add expenses, or book vendors. */
export function canManageBudgetAndVendors(role: MemberRole | null): boolean {
  return role !== null && ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.editor;
}

/** Evaluates whether user can invite or manage collaborators. */
export function canManageCollaborators(role: MemberRole | null): boolean {
  return role !== null && ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin;
}

/** Only owners can delete or transfer ownership of an event. */
export function canDeleteEvent(role: MemberRole | null): boolean {
  return role === 'owner';
}

/** Validates invite operation to prevent privilege escalation. */
export function validateCollaboratorInvite(
  actorRole: MemberRole,
  targetRole: MemberRole
): { allowed: boolean; reason?: string } {
  if (!canManageCollaborators(actorRole)) {
    return { allowed: false, reason: 'You do not have permission to invite collaborators.' };
  }

  // Admins cannot grant roles higher than or equal to owner
  if (targetRole === 'owner') {
    return { allowed: false, reason: 'Ownership cannot be granted via collaborator invite.' };
  }

  // Actor cannot assign a role higher than their own
  if (ROLE_HIERARCHY[targetRole] > ROLE_HIERARCHY[actorRole]) {
    return { allowed: false, reason: 'You cannot invite members with a higher role than your own.' };
  }

  return { allowed: true };
}
