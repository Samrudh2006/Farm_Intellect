ALTER TABLE "documents"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "chat_messages"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "crop_calendar"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "documents_userId_deletedAt_idx" ON "documents"("userId", "deletedAt");
CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_deletedAt_idx" ON "notifications"("userId", "isRead", "deletedAt");
CREATE INDEX IF NOT EXISTS "chat_messages_userId_createdAt_deletedAt_idx" ON "chat_messages"("userId", "createdAt", "deletedAt");
CREATE INDEX IF NOT EXISTS "crop_calendar_userId_deletedAt_idx" ON "crop_calendar"("userId", "deletedAt");
