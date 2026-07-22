import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function userClient(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_my_profile",
  title: "Get my profile",
  description: "Return the signed-in KrishiSarthi user's profile (name, phone, location, role).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = userClient(ctx);
    const uid = ctx.getUserId();
    const [{ data: profile, error: pErr }, { data: roles }] = await Promise.all([
      sb.from("profiles").select("display_name, email, phone, location").eq("user_id", uid).maybeSingle(),
      sb.from("user_roles").select("role").eq("user_id", uid),
    ]);
    if (pErr) return { content: [{ type: "text", text: pErr.message }], isError: true };
    const result = { ...profile, roles: (roles || []).map((r: any) => r.role) };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
