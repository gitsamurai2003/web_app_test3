/*
  Warnings:

  - You are about to drop the column `userId` on the `entries` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `entries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "entries" DROP CONSTRAINT "entries_userId_fkey";

-- AlterTable
ALTER TABLE "entries" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
