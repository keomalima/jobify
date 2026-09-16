-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'APPRENTICESHIP', 'CONTRACT');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFER', 'ACCEPTED', 'REJECTED', 'GHOSTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "size" INTEGER,
    "website" TEXT,
    "linkedin" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "OfferType" NOT NULL,
    "status" "OfferStatus" NOT NULL,
    "skills" TEXT NOT NULL,
    "salary" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
