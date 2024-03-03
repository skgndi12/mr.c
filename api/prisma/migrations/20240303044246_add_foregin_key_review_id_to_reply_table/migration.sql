BEGIN;

-- AddForeignKey
ALTER TABLE "replies" ADD CONSTRAINT "replies_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE RESTRICT;


COMMIT;
