/*
  Warnings:

  - You are about to drop the column `createdBy` on the `AuthUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuthUser" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" UUID;

-- AddForeignKey
ALTER TABLE "AuthUser" ADD CONSTRAINT "AuthUser_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
