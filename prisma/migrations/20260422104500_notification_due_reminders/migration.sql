-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('mention', 'due_today', 'due_tomorrow');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "kind" "NotificationKind" NOT NULL DEFAULT 'mention';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "dedupeKey" TEXT;

-- Backfill dedupeKey for existing mention notifications
UPDATE "Notification" SET "dedupeKey" = 'm:' || "userId" || ':' || "commentId";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "dedupeKey" SET NOT NULL;

-- DropIndex
DROP INDEX "Notification_userId_commentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Notification_dedupeKey_key" ON "Notification"("dedupeKey");

-- AlterTable (mentions keep commentId; due reminders leave null)
ALTER TABLE "Notification" ALTER COLUMN "commentId" DROP NOT NULL;
