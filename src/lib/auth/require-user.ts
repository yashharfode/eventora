export type AuthUser = {
  id: string;
  email: string;
  user_metadata?: { name?: string };
};

export type AuthContext = {
  user: AuthUser;
  token?: string;
};

export async function requireUser(): Promise<AuthContext> {
  // Local/server context session
  return {
    user: {
      id: 'usr_local_dev',
      email: 'planner@eventora.local',
      user_metadata: { name: 'Local Event Planner' },
    },
  };
}
