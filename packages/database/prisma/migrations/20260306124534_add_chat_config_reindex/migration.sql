-- AlterTable
ALTER TABLE "repository" ADD COLUMN     "indexedAt" TIMESTAMP(3),
ADD COLUMN     "lastIndexedCommit" TEXT;

-- CreateTable
CREATE TABLE "review_config" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "language" TEXT,
    "focusAreas" TEXT[] DEFAULT ARRAY['bugs', 'security', 'performance', 'style', 'best-practices']::TEXT[],
    "severityThreshold" TEXT NOT NULL DEFAULT 'low',
    "ignorePaths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customRules" TEXT,
    "autoFix" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_session" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "chatSessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_config_repositoryId_key" ON "review_config"("repositoryId");

-- CreateIndex
CREATE INDEX "chat_session_userId_idx" ON "chat_session"("userId");

-- CreateIndex
CREATE INDEX "chat_session_repositoryId_idx" ON "chat_session"("repositoryId");

-- CreateIndex
CREATE INDEX "chat_message_chatSessionId_idx" ON "chat_message"("chatSessionId");

-- AddForeignKey
ALTER TABLE "review_config" ADD CONSTRAINT "review_config_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_session" ADD CONSTRAINT "chat_session_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "chat_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
