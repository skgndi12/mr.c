BEGIN;

-- CreateIndex
CREATE INDEX "replies_review_id_idx" ON "replies"("review_id");

COMMIT;
