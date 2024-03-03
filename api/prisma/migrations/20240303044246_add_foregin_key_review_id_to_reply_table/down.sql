BEGIN;

-- DropForeignKey
ALTER TABLE "replies" DROP CONSTRAINT "replies_review_id_fkey";

COMMIT;
