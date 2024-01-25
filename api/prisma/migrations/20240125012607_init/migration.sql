BEGIN;

-- CreateEnum
CREATE TYPE "Idp" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('USER', 'DEVELOPER', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nickname" VARCHAR NOT NULL,
    "tag" CHAR(5) NOT NULL,
    "idp" "Idp" NOT NULL,
    "email" VARCHAR NOT NULL,
    "access_level" "AccessLevel" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "title" VARCHAR NOT NULL,
    "movie_name" VARCHAR NOT NULL,
    "content" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "replies" (
    "id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "content" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "movie_name" VARCHAR NOT NULL,
    "content" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_tag_key" ON "users"("nickname", "tag");

COMMIT;
