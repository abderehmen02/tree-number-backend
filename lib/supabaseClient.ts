const { createClient } = await import("@supabase/supabase-js");
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY! // NOT service_role!
);
