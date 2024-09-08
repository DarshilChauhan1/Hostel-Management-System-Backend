/*
  Warnings:

  - Made the column `roleId` on table `AuthUser` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AuthUser" DROP CONSTRAINT "AuthUser_roleId_fkey";

-- AlterTable
ALTER TABLE "AuthUser" ALTER COLUMN "roleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AuthUser" ADD CONSTRAINT "AuthUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
