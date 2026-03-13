-- CreateTable
CREATE TABLE "medicine_batch" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "manufacturer" TEXT,
    "expiryDate" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicine_batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan" (
    "id" TEXT NOT NULL,
    "medicineBatchId" TEXT,
    "imageUrl" TEXT,
    "aiResult" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedById" TEXT,

    CONSTRAINT "scan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medicine_batch_batchNumber_key" ON "medicine_batch"("batchNumber");

-- AddForeignKey
ALTER TABLE "scan" ADD CONSTRAINT "scan_medicineBatchId_fkey" FOREIGN KEY ("medicineBatchId") REFERENCES "medicine_batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan" ADD CONSTRAINT "scan_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
