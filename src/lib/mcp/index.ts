import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import listNotificationsTool from "./tools/list-notifications";
import listCropPlansTool from "./tools/list-crop-plans";
import logFieldEventTool from "./tools/log-field-event";

// Direct Supabase issuer (never the .lovable.cloud proxy). Baked at build time
// from VITE_SUPABASE_PROJECT_ID so the entry stays import-safe (no runtime env
// read at module top level).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "krishisarthi-mcp",
  title: "KrishiSarthi MCP",
  version: "0.1.0",
  instructions:
    "Tools for KrishiSarthi, the Indian farmer assistant. Read the signed-in user's profile, notifications, and crop plans, and log field events (irrigation, fertilizer, sowing, harvest, observations). All calls act as the authenticated user and respect existing row-level security.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, listNotificationsTool, listCropPlansTool, logFieldEventTool],
});
