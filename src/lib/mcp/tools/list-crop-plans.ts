import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function userClient(ctx: ToolContext) {
  return createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_my_crop_plans",
  title: "List my crop plans",
  description: "List the signed-in farmer's crop plans (crop, season, sowing date, expected harvest, area).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await userClient(ctx)
      .from("crop_plans")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { crop_plans: data ?? [] },
    };
  },
});
