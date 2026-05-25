-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_provider_id_idx" ON "orders"("provider_id");

-- CreateIndex
CREATE INDEX "provider_earnings_provider_id_idx" ON "provider_earnings"("provider_id");

-- CreateIndex
CREATE INDEX "providers_is_online_is_verified_idx" ON "providers"("is_online", "is_verified");

-- CreateIndex
CREATE INDEX "ratings_provider_id_idx" ON "ratings"("provider_id");
