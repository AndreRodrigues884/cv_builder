/*
  Warnings:

  - You are about to drop the column `userPlan` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "userPlan";

-- DropEnum
DROP TYPE "UserPlan";
