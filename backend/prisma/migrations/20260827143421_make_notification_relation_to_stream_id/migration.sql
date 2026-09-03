/*
  Warnings:

  - You are about to drop the column `key` on the `notifications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId,streamId]` on the table `notifications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `streamId` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "notifications_accountId_key_key";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "key",
ADD COLUMN     "streamId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "notifications_accountId_streamId_key" ON "notifications"("accountId", "streamId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
