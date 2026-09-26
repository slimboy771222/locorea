# Content operations

1. Research content and record the organization, primary source URL, and verification date.
2. Create `data/intake/<batch-id>/` with `batch.json` and any of `places.csv`, `routes.json`, or `guides.json`.
3. Validate files: `pnpm data:intake:validate -- --batch=data/intake/<batch-id>`.
4. Dry-run against Staging, for example: `pnpm data:import:places:dry -- --env-file=.env.staging.local --file=data/intake/<batch-id>/places.csv`.
5. Run the corresponding Staging import only after the dry-run passes.
6. Edit, review, and add media in Admin; approve completed records.
7. QA Staging, then export approved content: `pnpm data:export:approved -- --env-file=.env.staging.local`.
8. Commit the resulting canonical content and dry-run the production approved import.
9. Import approved canonical content to Production only through the trusted release workflow.

`research_note` is intake-only metadata. Do not copy it into public content.
