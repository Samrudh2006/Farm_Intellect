# DB Audit Fields Plan
- Add `created_by` and `updated_by` to all mutable business tables via migrations.
- Populate from authenticated user context in write paths.
