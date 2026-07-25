/*
  Warnings:

  - You are about to drop the column `userId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `streams` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId]` on the table `streams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `streams` table without a default value. This is not possible if the table is not empty.

*/
ALTER TABLE "messages" DROP CONSTRAINT "messages_userId_fkey";
ALTER TABLE "streams" DROP CONSTRAINT "streams_userId_fkey";

DROP INDEX "messages_streamId_userId_idx";
DROP INDEX "streams_userId_key";

ALTER TABLE "messages" RENAME COLUMN "userId" to "accountId",
ALTER TABLE "streams" RENAME COLUMN "userId" to "accountId",

-- CreateIndex
CREATE INDEX "messages_streamId_accountId_idx" ON "messages"("streamId", "accountId");
-- CreateIndex
CREATE UNIQUE INDEX "streams_accountId_key" ON "streams"("accountId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "streams" ADD CONSTRAINT "streams_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
