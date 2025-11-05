import type { Database } from "../types/supabase.js";
import dotenv from "dotenv";
dotenv.config();
const { createClient } = await import("@supabase/supabase-js");
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY! // NOT service_role!
);
