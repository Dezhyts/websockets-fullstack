/*
  Warnings:

  - The values [STREAMER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;

UPDATE "accounts"
SET "role" = 'USER'
WHERE "role"::text = 'STREAMER';

CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "public"."accounts" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "accounts" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "accounts" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;
