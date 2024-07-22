-- AlterTable
ALTER TABLE "AuthUser" ADD COLUMN     "forgotPasswordToken" TEXT,
ADD COLUMN     "forgotPasswordTokenExpires" TIMESTAMP(3);
