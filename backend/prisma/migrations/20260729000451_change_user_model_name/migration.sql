/*
  Warnings:

  - You are about to drop the column `userId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `streams` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId]` on the table `streams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `streams` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'STREAMER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_userId_fkey";

-- DropForeignKey
ALTER TABLE "streams" DROP CONSTRAINT "streams_userId_fkey";

-- DropIndex
DROP INDEX "messages_streamId_userId_idx";

-- DropIndex
DROP INDEX "streams_userId_key";

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "userId",
ADD COLUMN     "accountId" TEXT;

-- AlterTable
ALTER TABLE "streams" DROP COLUMN "userId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "messages_streamId_accountId_idx" ON "messages"("streamId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "streams_accountId_key" ON "streams"("accountId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streams" ADD CONSTRAINT "streams_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
