-- CreateTable
CREATE TABLE "tag_budgets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_budget_items" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "tagBudgetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_budget_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tag_budgets" ADD CONSTRAINT "tag_budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_budget_items" ADD CONSTRAINT "tag_budget_items_tagBudgetId_fkey" FOREIGN KEY ("tagBudgetId") REFERENCES "tag_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
