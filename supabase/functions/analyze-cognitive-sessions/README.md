# Cognitive analysis Edge Function

Deploy the function with JWT verification enabled:

```bash
supabase functions deploy analyze-cognitive-sessions
```

Before deployment, configure these **server-only** Supabase secrets:

```bash
supabase secrets set OPENAI_API_KEY=your_server_side_key
# Optional; defaults to gpt-4o-mini.
supabase secrets set OPENAI_COGNITIVE_ANALYSIS_MODEL=gpt-4o-mini
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are supplied to Edge Functions by Supabase. Do not put `OPENAI_API_KEY` in `.env.local`, `.env.example`, or any `VITE_*` variable.
