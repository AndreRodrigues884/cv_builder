/*
  Warnings:

  - You are about to drop the column `achievements` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `experiences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "experiences" DROP COLUMN "achievements",
DROP COLUMN "skills";
