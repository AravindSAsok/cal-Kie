import { loadSavedPlan, savePlan } from "../lib/workout-store";

type Exercise = { id: string; name: string; sets: number; reps: string; restSeconds: number; durationMinutes: number; instructions: string };
type WorkoutDay = { dayName: string; date: string; focus: string; isRestDay: boolean; estimatedMinutes: number; exercises: Exercise[] };
type WorkoutPlan = { title: string; weekStart: string; durationMinutes: number; exerciseCount: number; trainingDays: number; goal: string; level: string; equipment: string; days: WorkoutDay[] };
type Config = { durationMinutes: number; exerciseCount: number; trainingDays: number; goal: string; level: string; equipment: string; focus: string };
const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const form = byId<HTMLFormElement>("generator-form");
const grid = byId<HTMLDivElement>("week-grid");
const empty = byId<HTMLDivElement>("week-empty");
const status = byId<HTMLParagraphElement>("generator-status");
const generateButton = byId<HTMLButtonElement>("generate-plan");
const saveButton = byId<HTMLButtonElement>("save-plan");
const regenerateButton = byId<HTMLButtonElement>("regenerate-week");
const toast = byId<HTMLDivElement>("toast");
let plan: WorkoutPlan | null = null;
let currentConfig: Config | null = null;
let toastTimer = 0;

const esc = (value: string) => value.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] || c));
const uid = () => globalThis.crypto?.randomUUID?.() || String(Date.now() + Math.random());
function showToast(message: string) { toast.textContent = message; toast.classList.add("visible"); window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2600); }
function readConfig(): Config {
  const durationMinutes = Math.min(180, Math.max(10, Number(byId<HTMLInputElement>("duration").value) || 60));
  const exerciseCount = Math.min(12, Math.max(2, Number(byId<HTMLInputElement>("exercise-count").value) || 5));
  const trainingDays = Math.min(7, Math.max(3, Number(byId<HTMLSelectElement>("training-days").value) || 5));
  return { durationMinutes, exerciseCount, trainingDays, goal: byId<HTMLSelectElement>("goal").value, level: byId<HTMLSelectElement>("level").value, equipment: byId<HTMLSelectElement>("equipment").value, focus: byId<HTMLTextAreaElement>("focus").value.trim() };
}
function mondayKey(date = new Date()) { const d = new Date(date); d.setHours(0,0,0,0); d.setDate(d.getDate() - ((d.getDay()+6)%7)); return d.toISOString().slice(0,10); }
function dateLabel(value: string) { return new Date(value + "T12:00:00").toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"}); }
function updateSummary() {
  if (!plan) return;
  byId("summary-days").textContent = "7";
  byId("summary-sessions").textContent = String(plan.days.filter(d => !d.isRestDay).length);
  byId("summary-minutes").textContent = String(plan.durationMinutes);
}
function render() {
  if (!plan) { empty.hidden = false; grid.innerHTML = ""; saveButton.disabled = true; regenerateButton.disabled = true; return; }
  empty.hidden = true; saveButton.disabled = false; regenerateButton.disabled = false;
  byId("week-title").textContent = plan.title || "Your personalised week";
  byId("week-subtitle").textContent = "Starting " + dateLabel(plan.weekStart) + " · Edit any exercise, set, rep or rest period.";
  grid.innerHTML = plan.days.map((day, dayIndex) => {
    const active = !day.isRestDay;
    const exercises = active ? day.exercises.map((exercise, exerciseIndex) => `
      <article class="exercise-card" data-exercise-card="${esc(exercise.id)}">
        <div class="exercise-main">
          <div class="exercise-title-row"><input class="exercise-name-edit" type="text" maxlength="90" value="${esc(exercise.name)}" data-edit="name" data-day="${dayIndex}" data-exercise="${exerciseIndex}" aria-label="Edit exercise name" /><span class="exercise-tag">Exercise ${exerciseIndex+1}</span></div>
          <div class="exercise-controls">
            <label class="mini-field">Sets<input type="number" min="1" max="8" value="${exercise.sets}" data-edit="sets" data-day="${dayIndex}" data-exercise="${exerciseIndex}" /></label>
            <label class="mini-field reps">Reps<input type="text" maxlength="24" value="${esc(exercise.reps)}" data-edit="reps" data-day="${dayIndex}" data-exercise="${exerciseIndex}" /></label>
            <label class="mini-field">Rest · sec<input type="number" min="0" max="300" step="5" value="${exercise.restSeconds}" data-edit="restSeconds" data-day="${dayIndex}" data-exercise="${exerciseIndex}" /></label>
            <label class="mini-field">Time · min<input type="number" min="1" max="45" value="${exercise.durationMinutes}" data-edit="durationMinutes" data-day="${dayIndex}" data-exercise="${exerciseIndex}" /></label>
          </div>
        </div>
        <div class="exercise-side">
          <button class="demo-button" type="button" data-demo="${dayIndex}:${exerciseIndex}">View GIF</button>
          <button class="remove-button" type="button" data-remove="${dayIndex}:${exerciseIndex}">Remove</button>
        </div>
        <div class="demo-holder" id="demo-${dayIndex}-${exerciseIndex}"></div>
      </article>`).join("") : "";
    return `
      <article class="day-card">
        <header class="day-card-head">
          <div class="day-label"><span class="day-number">${String(dayIndex+1).padStart(2,"0")}</span><div><input class="day-name-edit" type="text" maxlength="30" value="${esc(day.dayName)}" data-day-name="${dayIndex}" aria-label="Edit day name" /><div class="day-meta">${dateLabel(day.date)} · ${active ? esc(day.focus) : "Recovery day"}</div></div></div>
          <div class="day-actions"><button class="small-button" type="button" data-regenerate-day="${dayIndex}">↻ Rebuild</button><button class="small-button" type="button" data-toggle-rest="${dayIndex}">${active ? "Make rest" : "Add workout"}</button></div>
        </header>
        ${active ? `<div class="day-focus"><input class="day-focus-edit" type="text" maxlength="120" value="${esc(day.focus)}" data-day-focus="${dayIndex}" aria-label="Edit day focus" /><span> · approx. ${day.estimatedMinutes} min</span></div><div class="exercise-list">${exercises}</div><div class="day-footer"><span class="day-total">${day.exercises.length} exercises · ${day.exercises.reduce((s,e)=>s+e.sets,0)} total sets</span><button class="small-button" type="button" data-add-exercise="${dayIndex}">+ Add exercise</button></div>` : `<div class="rest-day"><strong>Recovery is part of the plan.</strong><p>${esc(day.focus || "Take a lighter day, walk, stretch and let your body recover.")}</p></div>`}
      </article>`;
  }).join("");
  updateSummary();
}
async function requestPlan(payload: Record<string, unknown>) {
  const response = await fetch("/api/workout-plan", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
  const body = await response.json().catch(() => ({})) as { plan?: WorkoutPlan; day?: WorkoutDay; error?: string };
  if (!response.ok) throw new Error(body.error || "Cal-Kie could not generate your workout plan.");
  return body;
}
async function generateWeek() {
  currentConfig = readConfig();
  generateButton.disabled = true; form.classList.add("loading"); status.classList.remove("error"); status.textContent = "Building a balanced seven-day plan…";
  try {
    const result = await requestPlan({ config: currentConfig, weekStart: mondayKey() });
    if (!result.plan || !Array.isArray(result.plan.days) || result.plan.days.length !== 7) throw new Error("The AI returned an incomplete week. Please try again.");
    plan = result.plan; render(); status.textContent = "Your week is ready. Edit anything to make it yours."; showToast("Your personalised week is ready.");
  } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not generate the plan."; status.classList.add("error"); }
  finally { generateButton.disabled = false; form.classList.remove("loading"); }
}
async function regenerateDay(dayIndex: number) {
  if (!plan || !currentConfig) return;
  status.classList.remove("error"); status.textContent = "Rebuilding " + plan.days[dayIndex].dayName + "…";
  try {
    const result = await requestPlan({ mode:"day", config:currentConfig, dayIndex, currentDay:plan.days[dayIndex] });
    if (!result.day) throw new Error("The AI did not return a replacement day.");
    result.day.date = plan.days[dayIndex].date; plan.days[dayIndex] = result.day; render(); status.textContent = plan.days[dayIndex].dayName + " updated.";
  } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not rebuild this day."; status.classList.add("error"); }
}
async function loadDemo(dayIndex:number, exerciseIndex:number) {
  if (!plan) return;
  const exercise = plan.days[dayIndex]?.exercises[exerciseIndex]; const holder = byId<HTMLDivElement>(`demo-${dayIndex}-${exerciseIndex}`);
  if (!exercise || holder.dataset.loaded === "true") { holder.classList.toggle("visible"); return; }
  holder.classList.add("visible"); holder.textContent = "Finding a demonstration…";
  try {
    const response = await fetch("/api/exercises?search=" + encodeURIComponent(exercise.name), { cache:"no-store" });
    const body = await response.json() as { exercises?: {name:string;gifUrl:string}[] };
    const results = body.exercises || [];
    const normalized = exercise.name.toLowerCase().replace(/[^a-z0-9 ]/g,"").trim();
    const match = results.find(item => item.name.toLowerCase() === normalized) || results[0];
    if (!match) throw new Error("No GIF found for this exercise.");
    holder.innerHTML = `<img src="${esc(match.gifUrl)}" alt="${esc(match.name)} demonstration" loading="lazy" referrerpolicy="no-referrer" /><div class="demo-credit">Demo: ${esc(match.name)} · ExerciseDB</div>`;
    holder.dataset.loaded = "true";
  } catch (error) { holder.textContent = error instanceof Error ? error.message : "Demo unavailable right now."; }
}
function handleGridClick(event: Event) {
  const target = event.target as HTMLElement;
  const demo = target.closest<HTMLElement>("[data-demo]")?.dataset.demo;
  if (demo) { const [d,e] = demo.split(":").map(Number); void loadDemo(d,e); return; }
  const remove = target.closest<HTMLElement>("[data-remove]")?.dataset.remove;
  if (remove && plan) { const [d,e] = remove.split(":").map(Number); plan.days[d].exercises.splice(e,1); render(); return; }
  const rebuild = target.closest<HTMLElement>("[data-regenerate-day]")?.dataset.regenerateDay;
  if (rebuild !== undefined) { void regenerateDay(Number(rebuild)); return; }
  const toggle = target.closest<HTMLElement>("[data-toggle-rest]")?.dataset.toggleRest;
  if (toggle !== undefined && plan) { const d=Number(toggle); const day=plan.days[d]; day.isRestDay=!day.isRestDay; if(day.isRestDay) day.exercises=[]; else day.exercises=[{id:uid(),name:"Bodyweight squat",sets:3,reps:"10-12",restSeconds:60,durationMinutes:8,instructions:"Move with control."}]; render(); return; }
  const add = target.closest<HTMLElement>("[data-add-exercise]")?.dataset.addExercise;
  if (add !== undefined && plan) { const name=window.prompt("Exercise name"); if(name?.trim()){plan.days[Number(add)].isRestDay=false;plan.days[Number(add)].exercises.push({id:uid(),name:name.trim(),sets:3,reps:"10-12",restSeconds:60,durationMinutes:6,instructions:"Use controlled movement and comfortable range."});render();} }
}
form.addEventListener("submit", event => { event.preventDefault(); void generateWeek(); });
grid.addEventListener("click", handleGridClick);
grid.addEventListener("change", event => {
  const input = event.target as HTMLInputElement; const key=input.dataset.edit;
  if(!key || !plan) return;
  const day=Number(input.dataset.day), exercise=Number(input.dataset.exercise); const item=plan.days[day]?.exercises[exercise]; if(!item) return;
  if(key==="reps") item.reps=input.value.slice(0,24);
  else (item as unknown as Record<string,unknown>)[key]=Math.max(key==="restSeconds"?0:1,Math.min(key==="restSeconds"?300:key==="durationMinutes"?45:8,Number(input.value)||1));
  render();
});
saveButton.addEventListener("click", async () => {
  if(!plan) return;
  saveButton.disabled=true; saveButton.textContent="Saving…";
  try { const mode=await savePlan(plan); showToast(mode==="cloud"?"Week saved to your Cal-Kie account.":"Week saved on this device."); }
  catch(error){showToast(error instanceof Error?error.message:"Could not save this week.");}
  finally{saveButton.disabled=false;saveButton.textContent="Save week";}
});
regenerateButton.addEventListener("click", () => { void generateWeek(); });
void (async () => { try { const saved=await loadSavedPlan(); if(saved){plan=saved;currentConfig={durationMinutes:saved.durationMinutes,exerciseCount:saved.exerciseCount,trainingDays:saved.trainingDays,goal:saved.goal,level:saved.level,equipment:saved.equipment,focus:""};byId<HTMLInputElement>("duration").value=String(saved.durationMinutes);byId<HTMLInputElement>("exercise-count").value=String(saved.exerciseCount);byId<HTMLSelectElement>("training-days").value=String(saved.trainingDays);byId<HTMLSelectElement>("goal").value=saved.goal;byId<HTMLSelectElement>("level").value=saved.level;byId<HTMLSelectElement>("equipment").value=saved.equipment;render();status.textContent="Your saved week is ready to continue editing.";} } catch { /* A local plan can still be created if cloud storage is unavailable. */ } })();
