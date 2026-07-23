import { createClient } from "@supabase/supabase-js";

const productionProjectUrl = "https://fzloxqgzihxiqqrlmyoz.supabase.co";
const productionPublishableKey = "sb_publishable_RekL7_QQYRkuxZeYe9Hm8w_hRfrCbPw";
const configuredUrl = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
const configuredKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
const configuredForProductionProject = configuredUrl.includes("fzloxqgzihxiqqrlmyoz.supabase.co");

// These are browser-publishable values. Guard the project reference so a stale
// deployment variable cannot send account creation to a retired Supabase project.
const supabaseUrl = configuredForProductionProject ? configuredUrl : productionProjectUrl;
const supabaseAnonKey = configuredForProductionProject && configuredKey
  ? configuredKey
  : productionPublishableKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
