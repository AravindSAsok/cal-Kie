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

function readLocalPlan(): SavedWorkoutPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as SavedWorkoutPlan : null;
  } catch {
    return null;
  }
}

export async function loadSavedPlan(): Promise<SavedWorkoutPlan | null> {
  try {
    const response = await fetch("/api/workout-plan", { credentials: "same-origin", cache: "no-store" });
    if (response.ok) {
      const payload = await response.json() as { plan?: SavedWorkoutPlan | null };
      if (payload.plan) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.plan));
        return payload.plan;
      }
    }
  } catch {
    // Keep the locally cached week available while the network is unavailable.
  }
  return readLocalPlan();
}

export async function savePlan(plan: SavedWorkoutPlan): Promise<"cloud" | "local"> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  let response: Response;
  try {
    response = await fetch("/api/workout-plan", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
  } catch {
    return "local";
  }
  if (response.status === 401) return "local";
  const payload = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) {
    throw new Error("Your week is saved on this device, but MongoDB sync failed: " + (payload.error || "Please try again."));
  }
  return "cloud";
}
