/*
  Warnings:

  - Added the required column `checkInterval` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."WebsiteTick" ADD COLUMN     "checkInterval" TEXT NOT NULL;
