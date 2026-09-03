/*
  Warnings:

  - The primary key for the `followers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `folowingId` on the `followers` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `followers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[followingId,streamerId]` on the table `followers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `followingId` to the `followers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "followers" DROP CONSTRAINT "followers_folowingId_fkey";

-- DropIndex
DROP INDEX "followers_folowingId_streamerId_key";

-- AlterTable
ALTER TABLE "followers" DROP CONSTRAINT "followers_pkey",
DROP COLUMN "folowingId",
DROP COLUMN "id",
ADD COLUMN     "followingId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "followers_followingId_streamerId_key" ON "followers"("followingId", "streamerId");

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
