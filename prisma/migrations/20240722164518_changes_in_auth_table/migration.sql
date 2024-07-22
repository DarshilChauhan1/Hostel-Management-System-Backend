/*
  Warnings:

  - Added the required column `city` to the `AuthUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `AuthUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `AuthUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `AuthUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `AuthUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuthUser" ADD COLUMN     "city" VARCHAR(255) NOT NULL,
ADD COLUMN     "country" VARCHAR(255) NOT NULL,
ADD COLUMN     "firstName" VARCHAR(255) NOT NULL,
ADD COLUMN     "lastName" VARCHAR(255) NOT NULL,
ADD COLUMN     "state" VARCHAR(255) NOT NULL;
