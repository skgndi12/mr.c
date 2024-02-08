BEGIN;

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_id_fkey";

-- DropForeignKey
ALTER TABLE "replies" DROP CONSTRAINT "replies_user_id_fkey";

COMMIT;
