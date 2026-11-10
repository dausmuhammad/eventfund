-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IncomeSourceKind" AS ENUM ('GENERAL', 'CONTRIBUTION');


-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(250),
    "start_date" DATE,
    "end_date" DATE,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" CHAR(3) NOT NULL DEFAULT 'IDR',
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'Asia/Jakarta',
    "current_revision_no" INTEGER,
    "budget_version" INTEGER NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 1,
    "completed_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_contribution_settings" (
    "event_id" UUID NOT NULL,
    "default_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "default_due_date" DATE,
    "updated_by" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_contribution_settings_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "income_sources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "kind" "IncomeSourceKind" NOT NULL DEFAULT 'GENERAL',
    "archived_at" TIMESTAMPTZ(6),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "income_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(80) NOT NULL,
    "entity_id" UUID NOT NULL,
    "before_json" JSONB,
    "after_json" JSONB,
    "reason" TEXT,
    "request_id" VARCHAR(100) NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "operation" VARCHAR(100) NOT NULL,
    "request_hash" CHAR(64) NOT NULL,
    "http_status" SMALLINT NOT NULL,
    "response_json" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);


-- CreateIndex

-- CreateIndex
CREATE INDEX "events_owner_id_archived_at_status_created_at_id_idx" ON "events"("owner_id", "archived_at", "status", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "income_sources_event_id_id_key" ON "income_sources"("event_id", "id");

-- CreateIndex
CREATE INDEX "audit_logs_event_id_occurred_at_id_idx" ON "audit_logs"("event_id", "occurred_at", "id");

-- CreateIndex
CREATE INDEX "audit_logs_event_id_entity_type_entity_id_occurred_at_idx" ON "audit_logs"("event_id", "entity_type", "entity_id", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_event_id_id_key" ON "audit_logs"("event_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_event_id_actor_id_key_key" ON "idempotency_records"("event_id", "actor_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_event_id_id_key" ON "idempotency_records"("event_id", "id");

-- CreateIndex

-- CreateIndex

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_contribution_settings" ADD CONSTRAINT "event_contribution_settings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income_sources" ADD CONSTRAINT "income_sources_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_records" ADD CONSTRAINT "idempotency_records_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE events ADD CONSTRAINT event_valid CHECK (
 length(trim(name)) > 0 AND length(description) <= 4000 AND currency='IDR'
 AND version > 0 AND budget_version > 0
 AND (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
 AND ((status='DRAFT' AND current_revision_no IS NULL) OR (status IN ('PLANNED','ACTIVE','COMPLETED') AND current_revision_no >= 1 AND current_revision_no IS NOT NULL) OR (status='CANCELLED' AND (current_revision_no IS NULL OR current_revision_no >= 1)))
 AND (completed_at IS NOT NULL) = (status='COMPLETED')
 AND (cancelled_at IS NOT NULL) = (status='CANCELLED')
 AND (archived_at IS NULL OR status IN ('COMPLETED','CANCELLED'))
);
ALTER TABLE event_contribution_settings ADD CHECK(default_amount >= 0 AND version > 0), ADD FOREIGN KEY(updated_by) REFERENCES users(id);
ALTER TABLE income_sources ADD CHECK(length(trim(name)) > 0 AND version > 0);
CREATE UNIQUE INDEX income_sources_name_unique ON income_sources(event_id,lower(name));
CREATE UNIQUE INDEX income_sources_one_contribution ON income_sources(event_id) WHERE kind='CONTRIBUTION';
ALTER TABLE audit_logs ADD FOREIGN KEY(actor_id) REFERENCES users(id);
ALTER TABLE idempotency_records ADD FOREIGN KEY(actor_id) REFERENCES users(id), ADD CHECK(key ~ '^[A-Za-z0-9_-]{8,100}$' AND request_hash ~ '^[a-f0-9]{64}$' AND http_status BETWEEN 200 AND 299);

CREATE FUNCTION event_foundation_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target uuid;
BEGIN
 IF TG_TABLE_NAME='events' THEN target := COALESCE(NEW.id,OLD.id); ELSE target := COALESCE(NEW.event_id,OLD.event_id); END IF;
 IF EXISTS(SELECT 1 FROM events WHERE id=target) AND (
   (SELECT count(*) FROM event_contribution_settings WHERE event_id=target) <> 1 OR
   (SELECT count(*) FROM income_sources WHERE event_id=target AND kind='CONTRIBUTION' AND archived_at IS NULL) <> 1
 ) THEN RAISE EXCEPTION 'Event requires settings and one contribution source'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER event_integrity AFTER INSERT OR UPDATE OR DELETE ON events DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION event_foundation_integrity();
CREATE CONSTRAINT TRIGGER settings_integrity AFTER INSERT OR UPDATE OR DELETE ON event_contribution_settings DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION event_foundation_integrity();
CREATE CONSTRAINT TRIGGER sources_integrity AFTER INSERT OR UPDATE OR DELETE ON income_sources DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION event_foundation_integrity();
CREATE FUNCTION reject_history_change() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'History is append-only'; END $$;
CREATE TRIGGER audit_immutable BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION reject_history_change();
CREATE TRIGGER idempotency_immutable BEFORE UPDATE OR DELETE ON idempotency_records FOR EACH ROW EXECUTE FUNCTION reject_history_change();
CREATE FUNCTION protect_event_identity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Events cannot be deleted'; END IF;
 IF NEW.owner_id <> OLD.owner_id OR NEW.id <> OLD.id OR NEW.currency <> OLD.currency THEN RAISE EXCEPTION 'Event identity is immutable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER event_identity BEFORE UPDATE OR DELETE ON events FOR EACH ROW EXECUTE FUNCTION protect_event_identity();
CREATE FUNCTION protect_contribution_source() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.kind='CONTRIBUTION' OR (TG_OP='UPDATE' AND NEW.kind='CONTRIBUTION') THEN RAISE EXCEPTION 'System source is immutable'; END IF;
 RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END $$;
CREATE TRIGGER contribution_source_immutable BEFORE UPDATE OR DELETE ON income_sources FOR EACH ROW EXECUTE FUNCTION protect_contribution_source();

