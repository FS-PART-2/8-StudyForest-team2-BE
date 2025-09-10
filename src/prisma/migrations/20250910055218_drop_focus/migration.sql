/*
  Warnings:

  - You are about to drop the `Focus` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `password` on table `Study` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Focus" DROP CONSTRAINT "Focus_studyId_fkey";

-- AlterTable
ALTER TABLE "public"."Study" ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT true;

-- DropTable
DROP TABLE "public"."Focus";
