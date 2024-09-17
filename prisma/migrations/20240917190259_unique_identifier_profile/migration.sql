/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Profile_ownerId_key" ON "Profile"("ownerId");
