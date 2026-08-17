# Tutor Hub

A Next.js 16 prototype for an independent tutor business portal.

## Included now

- Product landing page
- Tutor dashboard
- Student list and student detail page
- Weekly calendar prototype
- Typed mock data
- Initial Supabase/Postgres schema with row-level security

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and select **Open prototype**.

## Next implementation step

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add project credentials.
3. Run `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL editor.
4. Replace mock data with Supabase server queries.
5. Add email/password authentication and tutor onboarding.

The first real persisted workflow should be: tutor signs up → creates a student → schedules a lesson → sees both on the dashboard.
