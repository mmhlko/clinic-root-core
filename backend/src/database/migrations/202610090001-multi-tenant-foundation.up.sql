BEGIN;

DO $$ BEGIN
  CREATE TYPE "enum_clinic_status" AS ENUM ('demo', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "clinic"
  ADD COLUMN IF NOT EXISTS "slug" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "status" "enum_clinic_status",
  ADD COLUMN IF NOT EXISTS "isSystemDemo" BOOLEAN;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "clinic_locations" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "clinic_features" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "clinic_social_links" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "clinic_statistics" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "service_directions" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "doctor_directions" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "doctor_educations" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "doctor_skills" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "promotions" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "faq" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "appointment_requests" ADD COLUMN IF NOT EXISTS "clinicId" UUID;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "clinicId" UUID;

DO $$
DECLARE
  demo_clinic_id UUID;
  clinic_count INTEGER;
  table_name TEXT;
BEGIN
  SELECT COUNT(*) INTO clinic_count FROM "clinic";
  IF clinic_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one existing clinic before tenant migration, found %', clinic_count;
  END IF;
  SELECT "id" INTO demo_clinic_id FROM "clinic" LIMIT 1;

  UPDATE "clinic"
  SET "slug" = 'demo',
      "status" = 'demo',
      "isSystemDemo" = TRUE
  WHERE "id" = demo_clinic_id;

  FOREACH table_name IN ARRAY ARRAY[
    'clinic_locations', 'clinic_features', 'clinic_social_links', 'clinic_statistics',
    'doctors', 'service_directions', 'services', 'skills', 'doctor_directions',
    'doctor_educations', 'doctor_skills', 'reviews', 'promotions', 'works', 'faq',
    'documents', 'appointment_requests', 'media'
  ] LOOP
    EXECUTE format('UPDATE %I SET "clinicId" = $1 WHERE "clinicId" IS NULL', table_name)
      USING demo_clinic_id;
  END LOOP;

  UPDATE "users"
  SET "clinicId" = CASE WHEN "role"::TEXT = 'root' THEN NULL ELSE demo_clinic_id END;
END $$;

ALTER TABLE "clinic" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "clinic" ALTER COLUMN "status" SET DEFAULT 'demo';
ALTER TABLE "clinic" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "clinic" ALTER COLUMN "isSystemDemo" SET DEFAULT FALSE;
ALTER TABLE "clinic" ALTER COLUMN "isSystemDemo" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "clinic_slug_unique" ON "clinic" ("slug");

DO $$
DECLARE
  relation_name TEXT;
  column_name TEXT;
  constraint_record RECORD;
  index_record RECORD;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY['service_directions', 'skills', 'clinic_social_links'] LOOP
    column_name := CASE relation_name
      WHEN 'clinic_social_links' THEN 'platform'
      ELSE 'name'
    END;
    FOR constraint_record IN
      SELECT con.conname
      FROM pg_constraint con
      WHERE con.conrelid = to_regclass(relation_name)
        AND con.contype = 'u'
        AND ARRAY(
          SELECT att.attname::TEXT
          FROM unnest(con.conkey) WITH ORDINALITY AS key(attnum, ord)
          JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = key.attnum
          ORDER BY key.ord
        ) = ARRAY[column_name]::TEXT[]
    LOOP
      EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', relation_name, constraint_record.conname);
    END LOOP;

    FOR index_record IN
      SELECT ns.nspname, idx.relname
      FROM pg_index i
      JOIN pg_class tbl ON tbl.oid = i.indrelid
      JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
      JOIN pg_class idx ON idx.oid = i.indexrelid
      WHERE tbl.oid = to_regclass(relation_name)
        AND i.indisunique
        AND NOT i.indisprimary
        AND i.indpred IS NULL
        AND ARRAY(
          SELECT att.attname::TEXT
          FROM unnest(i.indkey) WITH ORDINALITY AS key(attnum, ord)
          JOIN pg_attribute att ON att.attrelid = i.indrelid AND att.attnum = key.attnum
          WHERE key.ord <= i.indnkeyatts
          ORDER BY key.ord
        ) = ARRAY[column_name]::TEXT[]
        AND NOT EXISTS (
          SELECT 1 FROM pg_constraint con WHERE con.conindid = i.indexrelid
        )
    LOOP
      EXECUTE format('DROP INDEX %I.%I', index_record.nspname, index_record.relname);
    END LOOP;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "service_directions_clinicId_name_unique"
  ON "service_directions" ("clinicId", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "skills_clinicId_name_unique"
  ON "skills" ("clinicId", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "clinic_social_links_clinicId_platform_unique"
  ON "clinic_social_links" ("clinicId", "platform");

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'users', 'clinic_locations', 'clinic_features', 'clinic_social_links', 'clinic_statistics',
    'doctors', 'service_directions', 'services', 'skills', 'doctor_directions',
    'doctor_educations', 'doctor_skills', 'reviews', 'promotions', 'works', 'faq',
    'documents', 'appointment_requests', 'media'
  ] LOOP
    EXECUTE format(
      'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY ("clinicId") REFERENCES "clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID',
      table_name, 'fk_' || table_name || '_clinic'
    );
    EXECUTE format('ALTER TABLE %I VALIDATE CONSTRAINT %I', table_name, 'fk_' || table_name || '_clinic');
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I ("clinicId")', 'idx_' || table_name || '_clinicId', table_name);
  END LOOP;
END $$;

COMMIT;
