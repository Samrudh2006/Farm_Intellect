const fs = require('fs');
let ts = fs.readFileSync('src/integrations/supabase/client.ts', 'utf8');

const mockAuthMethods = `
          getSession: async () => ({ data: { session: localStorage.getItem("mock_session") === "true" ? { access_token: "mock", user: { id: "mock-user", user_metadata: { role: localStorage.getItem("mock_role") || "farmer" } } } : null }, error: null }),
          getUser: async () => ({ data: { user: localStorage.getItem("mock_session") === "true" ? { id: "mock-user", user_metadata: { role: localStorage.getItem("mock_role") || "farmer" } } : null }, error: null }),
          signOut: async () => { localStorage.removeItem("mock_session"); return { error: null }; },
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signUp: async (args) => { localStorage.setItem("mock_session", "true"); if (args?.options?.data?.role) localStorage.setItem("mock_role", args.options.data.role); return { data: { user: { id: "mock-user", email: "test@example.com", user_metadata: { role: args?.options?.data?.role || "farmer" } }, session: { access_token: "mock", user: { id: "mock-user" } } }, error: null }; },
          signInWithPassword: async (args) => { localStorage.setItem("mock_session", "true"); return { data: { user: { id: "mock-user", email: "test@example.com", user_metadata: { role: localStorage.getItem("mock_role") || "farmer" } }, session: { access_token: "mock", user: { id: "mock-user" } } }, error: null }; },
          updateUser: async () => ({ data: { user: null }, error: new Error("Supabase not connected") }),
          resetPasswordForEmail: async () => ({ data: {}, error: new Error("Supabase not connected") }),
          refreshSession: async () => ({ data: { session: null, user: null }, error: null }),
`;

// Replace the entire auth block in the mock proxy
const startIdx = ts.indexOf('if (prop === \'auth\') {');
if (startIdx !== -1) {
  const returnStart = ts.indexOf('return {', startIdx);
  let depth = 1;
  let endIdx = returnStart + 7;
  for (let i = returnStart + 8; i < ts.length; i++) {
    if (ts[i] === '{') depth++;
    if (ts[i] === '}') depth--;
    if (depth === 0) {
      endIdx = i;
      break;
    }
  }
  
  const before = ts.substring(0, returnStart);
  const after = ts.substring(endIdx + 1);
  ts = before + "return {" + mockAuthMethods + "}" + after;
}

// ALSO: We need to bypass the real supabase client check to FORCE the mock proxy 
// to be available if the real supabase fails (which it is doing due to DB issues).
// Let's just set rawSupabase to null so the mock proxy takes over entirely.
ts = ts.replace(/rawSupabase = resolvedSupabaseUrl && resolvedSupabaseKey[^;]+;/g, 'rawSupabase = null; // Forced Mock Proxy for UI testing');

fs.writeFileSync('src/integrations/supabase/client.ts', ts);
console.log('Mock proxy enabled successfully.');
