-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "message" TEXT,
    "platforms" TEXT,
    "features" TEXT,
    "budget" TEXT,
    "deadline" TEXT,
    "aiNeeds" TEXT,
    "variant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
