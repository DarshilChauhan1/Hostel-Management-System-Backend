/*
  Warnings:

  - You are about to drop the column `blockExpires` on the `AuthUser` table. All the data in the column will be lost.
  - You are about to drop the column `isBlock` on the `AuthUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuthUser" DROP COLUMN "blockExpires",
DROP COLUMN "isBlock",
ADD COLUMN     "blockedUntil" TIMESTAMP(3),
ADD COLUMN     "isBlocked" BOOLEAN DEFAULT false;
