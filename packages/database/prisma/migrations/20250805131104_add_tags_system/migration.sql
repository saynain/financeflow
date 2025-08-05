/*
  Warnings:

  - You are about to drop the column `categoryId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_categoryId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "categoryId",
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_userId_key" ON "tags"("name", "userId");

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
