export function createBrowser() {
  return { auth: { signOut: async () => ({ error: null }), signInWithPassword: async () => ({ error: null }), signUp: async () => ({ data: { session: {} }, error: null }) } };
}
