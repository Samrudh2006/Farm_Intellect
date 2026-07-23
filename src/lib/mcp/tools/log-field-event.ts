import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function userClient(ctx: ToolContext) {
  return createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "log_field_event",
  title: "Log a field event",
  description: "Record a field activity (irrigation, fertilizer, pesticide, sowing, harvest, observation) for the signed-in farmer.",
  inputSchema: {
    event_type: z.enum(["irrigation", "fertilizer", "pesticide", "sowing", "harvest", "observation", "other"]).describe("Kind of field activity."),
    notes: z.string().min(1).describe("Short description of what happened."),
    crop: z.string().optional().describe("Optional crop name this event relates to."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ event_type, notes, crop }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await userClient(ctx)
      .from("field_events")
      .insert({
        user_id: ctx.getUserId(),
        event_type,
        notes,
        crop: crop ?? null,
        event_date: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ${event_type} event.` }],
      structuredContent: { event: data },
    };
  },
});
