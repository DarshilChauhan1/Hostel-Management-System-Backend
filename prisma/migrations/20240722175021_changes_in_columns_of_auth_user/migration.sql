-- AlterTable
ALTER TABLE "AuthUser" ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "loginAttempt" DROP NOT NULL,
ALTER COLUMN "isVerified" DROP NOT NULL;
