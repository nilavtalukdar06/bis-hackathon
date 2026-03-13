/*
  Warnings:

  - You are about to drop the column `expiryDate` on the `medicine_batch` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `medicine_batch` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `medicine_batch` table. All the data in the column will be lost.
  - You are about to drop the column `verificationSource` on the `medicine_batch` table. All the data in the column will be lost.
  - You are about to drop the column `aiResult` on the `scan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "medicine_batch" DROP COLUMN "expiryDate",
DROP COLUMN "isVerified",
DROP COLUMN "updatedAt",
DROP COLUMN "verificationSource",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "expiry" TIMESTAMP(3),
ADD COLUMN     "recallStatus" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "medicineName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "scan" DROP COLUMN "aiResult",
ADD COLUMN     "confidenceScore" DOUBLE PRECISION,
ADD COLUMN     "hologram" BOOLEAN,
ADD COLUMN     "spellingErrors" JSONB,
ADD COLUMN     "suspicious" BOOLEAN;
