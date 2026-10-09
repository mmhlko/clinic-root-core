# Database migrations

The project currently has no migration runner. Apply SQL migrations explicitly
with PostgreSQL tools; do not enable `DATABASE_SYNCHRONIZE` in production.

## 202610090001: multi-tenant foundation

Before applying, take a database backup. This migration expects exactly one
existing clinic row. It assigns that clinic slug `demo`, marks it as the
platform demo clinic, and assigns existing clinic content to it. It stops
without changing the database if the clinic row count is not exactly one.

Run from the repository root, substituting the configured connection values:

```powershell
psql -v ON_ERROR_STOP=1 -h $env:POSTGRES_HOST -p $env:POSTGRES_PORT -U $env:POSTGRES_USER -d $env:POSTGRES_DB -f backend/src/database/migrations/202610090001-multi-tenant-foundation.up.sql
```

The new `clinicId` columns are nullable during this foundation stage so the
existing application can continue to run before tenant-aware API work is
complete. The migration backfills all current content to the demo clinic;
later work will make the tenant context mandatory for clinic-owned writes.
