-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'PRO', 'CAREER_PLUS');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "userPlan" "UserPlan" NOT NULL DEFAULT 'FREE';
