/*
  Warnings:

  - Made the column `twoFactorEnabled` on table `AuthUser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AuthUser" ALTER COLUMN "twoFactorEnabled" SET NOT NULL;
