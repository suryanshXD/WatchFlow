-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('GOOD', 'BAD');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Website" (
    "id" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebsiteTicks" (
    "id" TEXT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL,
    "status" "public"."Status" NOT NULL,
    "websiteId" TEXT NOT NULL,

    CONSTRAINT "WebsiteTicks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."WebsiteTicks" ADD CONSTRAINT "WebsiteTicks_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
