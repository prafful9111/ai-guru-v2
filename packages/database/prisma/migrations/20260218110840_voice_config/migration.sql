-- AlterTable
ALTER TABLE "scenarios" ADD COLUMN     "examinerConfig" JSONB,
ADD COLUMN     "introConfig" JSONB,
ADD COLUMN     "roleplayConfig" JSONB;
