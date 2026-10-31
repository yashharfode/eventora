import { describe, expect, it } from 'vitest';
import {
  canViewEvent,
  canEditEvent,
  canManageBudgetAndVendors,
  canManageCollaborators,
  canDeleteEvent,
  validateCollaboratorInvite,
} from '@/features/planning/collaboration';

describe('Collaboration & RBAC Logic', () => {
  it('enforces view permissions across all roles', () => {
    expect(canViewEvent('owner')).toBe(true);
    expect(canViewEvent('admin')).toBe(true);
    expect(canViewEvent('editor')).toBe(true);
    expect(canViewEvent('viewer')).toBe(true);
    expect(canViewEvent(null)).toBe(false);
  });

  it('restricts edit permissions to editors, admins, and owners', () => {
    expect(canEditEvent('owner')).toBe(true);
    expect(canEditEvent('admin')).toBe(true);
    expect(canEditEvent('editor')).toBe(true);
    expect(canEditEvent('viewer')).toBe(false);
    expect(canManageBudgetAndVendors('editor')).toBe(true);
    expect(canManageBudgetAndVendors('viewer')).toBe(false);
    expect(canEditEvent(null)).toBe(false);
  });

  it('allows only admins and owners to manage collaborators', () => {
    expect(canManageCollaborators('owner')).toBe(true);
    expect(canManageCollaborators('admin')).toBe(true);
    expect(canManageCollaborators('editor')).toBe(false);
    expect(canManageCollaborators('viewer')).toBe(false);
  });

  it('restricts event deletion to owners only', () => {
    expect(canDeleteEvent('owner')).toBe(true);
    expect(canDeleteEvent('admin')).toBe(false);
    expect(canDeleteEvent('editor')).toBe(false);
    expect(canDeleteEvent('viewer')).toBe(false);
  });

  it('prevents privilege escalation during collaborator invitations', () => {
    // Owner can invite admin, editor, or viewer
    expect(validateCollaboratorInvite('owner', 'admin').allowed).toBe(true);
    expect(validateCollaboratorInvite('owner', 'editor').allowed).toBe(true);

    // Cannot invite someone as 'owner'
    expect(validateCollaboratorInvite('owner', 'owner').allowed).toBe(false);

    // Admin cannot invite a role higher than admin
    expect(validateCollaboratorInvite('admin', 'owner').allowed).toBe(false);
    expect(validateCollaboratorInvite('admin', 'admin').allowed).toBe(true);

    // Editor cannot invite anyone
    expect(validateCollaboratorInvite('editor', 'viewer').allowed).toBe(false);

    // Viewer cannot invite anyone
    expect(validateCollaboratorInvite('viewer', 'viewer').allowed).toBe(false);
  });
});
