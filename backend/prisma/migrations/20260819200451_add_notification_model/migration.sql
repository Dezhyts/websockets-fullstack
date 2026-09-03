-- CreateEnum
CREATE TYPE "StreamStatus" AS ENUM ('LIVE', 'OFFLINE', 'PAUSED');

-- AlterTable
ALTER TABLE "streams" ADD COLUMN     "status" "StreamStatus" NOT NULL DEFAULT 'OFFLINE';

-- CreateTable
CREATE TABLE "followers" (
    "id" TEXT NOT NULL,
    "folowingId" TEXT NOT NULL,
    "streamerId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_notified" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "key" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "followers_folowingId_streamerId_key" ON "followers"("folowingId", "streamerId");

-- CreateIndex
CREATE INDEX "notifications_accountId_is_read_idx" ON "notifications"("accountId", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_accountId_key_key" ON "notifications"("accountId", "key");

-- CreateIndex
CREATE INDEX "streams_accountId_status_idx" ON "streams"("accountId", "status");

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_folowingId_fkey" FOREIGN KEY ("folowingId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_streamerId_fkey" FOREIGN KEY ("streamerId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
