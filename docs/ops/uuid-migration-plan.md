# UUID Public ID Migration Plan
- Introduce UUID `public_id` columns.
- Backfill values and add unique indexes.
- Switch external APIs from internal IDs to `public_id`.
