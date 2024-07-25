-- AlterTable
ALTER TABLE "AuthUser" ADD COLUMN     "blockExpires" TIMESTAMP(3),
ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "isBlock" BOOLEAN DEFAULT false;
