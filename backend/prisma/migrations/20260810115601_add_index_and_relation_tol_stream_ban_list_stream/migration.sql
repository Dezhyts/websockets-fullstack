/*
  Warnings:

  - A unique constraint covering the columns `[streamId,userId]` on the table `stream_ban_list` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stream_ban_list_streamId_userId_key" ON "stream_ban_list"("streamId", "userId");

-- AddForeignKey
ALTER TABLE "stream_ban_list" ADD CONSTRAINT "stream_ban_list_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
