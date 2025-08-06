/*
  Warnings:

  - Made the column `userId` on table `Website` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Website" DROP CONSTRAINT "Website_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Website" ALTER COLUMN "userId" SET NOT NULL;
