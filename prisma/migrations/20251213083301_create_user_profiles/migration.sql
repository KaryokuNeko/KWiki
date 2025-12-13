-- CreateTable
CREATE TABLE "user_profiles" (
    "id" SERIAL NOT NULL,
    "keycloak_id" VARCHAR(255) NOT NULL,
    "nickname" VARCHAR(100),
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_keycloak_id_key" ON "user_profiles"("keycloak_id");

-- CreateIndex
CREATE INDEX "user_profiles_keycloak_id_idx" ON "user_profiles"("keycloak_id");
