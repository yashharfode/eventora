export async function requireUser() {
  // Local storage mode: return a local mock user session
  return {
    user: {
      id: 'local-user-id',
      email: 'local@eventora.app',
      user_metadata: { name: 'Local User' },
    },
    supabase: null as any,
  };
}
