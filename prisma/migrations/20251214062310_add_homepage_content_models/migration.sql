-- CreateTable
CREATE TABLE "homepage_videos" (
    "id" SERIAL NOT NULL,
    "video_url" TEXT NOT NULL,
    "title_en" VARCHAR(200) NOT NULL,
    "title_zh" VARCHAR(200) NOT NULL,
    "desc_en" TEXT,
    "desc_zh" TEXT,
    "thumbnail_url" TEXT,
    "autoplay" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" SERIAL NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_zh" VARCHAR(100) NOT NULL,
    "desc_en" TEXT NOT NULL,
    "desc_zh" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_skills" (
    "id" SERIAL NOT NULL,
    "character_id" INTEGER NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_zh" VARCHAR(100) NOT NULL,
    "desc_en" TEXT NOT NULL,
    "desc_zh" TEXT NOT NULL,
    "icon_url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "character_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_zh" VARCHAR(100) NOT NULL,
    "desc_en" TEXT NOT NULL,
    "desc_zh" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "rarity" VARCHAR(50),
    "order" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "homepage_videos_published_order_idx" ON "homepage_videos"("published", "order");

-- CreateIndex
CREATE INDEX "characters_published_featured_order_idx" ON "characters"("published", "featured", "order");

-- CreateIndex
CREATE INDEX "character_skills_character_id_order_idx" ON "character_skills"("character_id", "order");

-- CreateIndex
CREATE INDEX "items_published_featured_order_idx" ON "items"("published", "featured", "order");

-- AddForeignKey
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
