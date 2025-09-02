/*
  Warnings:

  - Made the column `password` on table `Study` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Study" ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT true;
