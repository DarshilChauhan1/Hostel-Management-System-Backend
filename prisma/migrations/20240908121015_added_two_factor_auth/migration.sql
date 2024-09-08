/*
  Warnings:

  - The values [COMMUNITY,OTHERS] on the enum `HostelType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HostelType_new" AS ENUM ('STUDENT', 'PAYING_GUEST', 'CORPORATE', 'CASTE', 'GENERAL');
ALTER TABLE "Hostel" ALTER COLUMN "hostelType" TYPE "HostelType_new" USING ("hostelType"::text::"HostelType_new");
ALTER TYPE "HostelType" RENAME TO "HostelType_old";
ALTER TYPE "HostelType_new" RENAME TO "HostelType";
DROP TYPE "HostelType_old";
COMMIT;

-- AlterTable
ALTER TABLE "AuthUser" ADD COLUMN     "twoFactorEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;
