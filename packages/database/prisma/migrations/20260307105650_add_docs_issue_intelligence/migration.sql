-- AlterTable
ALTER TABLE "review_config" ADD COLUMN     "issueAnalysis" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "generated_doc" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_doc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_analysis" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "issueTitle" TEXT NOT NULL,
    "issueUrl" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "postedComment" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generated_doc_repositoryId_idx" ON "generated_doc"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "generated_doc_repositoryId_type_key" ON "generated_doc"("repositoryId", "type");

-- CreateIndex
CREATE INDEX "issue_analysis_repositoryId_idx" ON "issue_analysis"("repositoryId");

-- AddForeignKey
ALTER TABLE "generated_doc" ADD CONSTRAINT "generated_doc_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_analysis" ADD CONSTRAINT "issue_analysis_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
