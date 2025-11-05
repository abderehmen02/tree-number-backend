import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // or anon key if you just read public data

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey);
