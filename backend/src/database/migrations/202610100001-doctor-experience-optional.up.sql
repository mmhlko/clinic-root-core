BEGIN;

ALTER TABLE "doctors"
  ALTER COLUMN "experienceStartYear" DROP NOT NULL;

COMMIT;
