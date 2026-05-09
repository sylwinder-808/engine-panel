/*
  Warnings:

  - Added the required column `accountName` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountNumber` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `afterBalance` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankName` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beforeBalance` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "accountName" TEXT NOT NULL,
ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "afterBalance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bankName" TEXT NOT NULL,
ADD COLUMN     "beforeBalance" DOUBLE PRECISION NOT NULL;
