import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SavedWorkoutPlan = {
  title: string;
  weekStart: string;
  durationMinutes: number;
  exerciseCount: number;
  trainingDays: number;
  goal: string;
  level: string;
  equipment: string;
  days: unknown[];
};
const STORAGE_KEY = "calkie.workout-plan.v1";
const url = import.meta.env.PUBLIC_SUPABASE_URL?.trim();
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.trim();
let client: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export async function loadSavedPlan(): Promise<SavedWorkoutPlan | null> {
  if (client) {
    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (userId) {
      const { data, error } = await client.from("workout_plans").select("plan_data").eq("user_id", userId).order("updated_at", { ascending:false }).limit(1).maybeSingle();
      if (!error && data?.plan_data) return data.plan_data as SavedWorkoutPlan;
    }
  }
  try { const raw=localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) as SavedWorkoutPlan : null; } catch { return null; }
}

export async function savePlan(plan: SavedWorkoutPlan): Promise<"cloud" | "local"> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  if (!client) return "local";
  let { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session?.user) {
    const { data, error } = await client.auth.signInAnonymously();
    if (error) throw new Error("Supabase guest sign-in is unavailable. Enable Anonymous Sign-ins or use local saving.");
    sessionData = { session: data.session, user: data.user } as typeof sessionData;
  }
  const userId = sessionData.session?.user.id;
  if (!userId) return "local";
  const { error } = await client.from("workout_plans").upsert({
    user_id: userId,
    week_start: plan.weekStart,
    title: plan.title,
    plan_data: plan,
    updated_at: new Date().toISOString()
  }, { onConflict:"user_id,week_start" });
  if (error) throw new Error("Local copy saved, but Supabase sync failed: " + error.message);
  return "cloud";
}
