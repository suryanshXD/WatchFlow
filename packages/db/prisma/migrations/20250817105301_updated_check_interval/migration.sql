-- AlterTable
ALTER TABLE "public"."Website" ALTER COLUMN "checkInterval" SET DEFAULT '3min',
ALTER COLUMN "checkInterval" SET DATA TYPE TEXT;
