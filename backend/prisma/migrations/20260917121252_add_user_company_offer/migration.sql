/*
  Warnings:

  - You are about to drop the column `userId` on the `Offer` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_userId_fkey";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "userId",
ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
