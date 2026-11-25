import type { APIRoute } from "astro";
import type { Document } from "mongodb";
import { authenticateRequest } from "../../lib/server-auth";
import { getMongoDb } from "../../lib/mongodb";
export const prerender = false;
export const maxDuration = 60;

type Provider = "openrouter" | "groq" | "gemini";
type Config = { durationMinutes:number; exerciseCount:number; trainingDays:number; goal:string; level:string; equipment:string; focus?:string };
const json = (body:Record<string,unknown>, status=200) => new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
function extractObject(text:string):Record<string,unknown>{
  const cleaned=text.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim();
  try { const value=JSON.parse(cleaned); if(value&&typeof value==="object"&&!Array.isArray(value)) return value as Record<string,unknown>; } catch {}
  const start=cleaned.indexOf("{"), end=cleaned.lastIndexOf("}");
  if(start<0||end<=start) throw new Error("The AI response was not valid JSON.");
  const value=JSON.parse(cleaned.slice(start,end+1));
  if(!value||typeof value!=="object"||Array.isArray(value)) throw new Error("The AI response had an unexpected format.");
  return value as Record<string,unknown>;
}
function validateDay(value:unknown, config:Config) {
  if(!value||typeof value!=="object") throw new Error("The AI returned an invalid workout day.");
  const d=value as Record<string,unknown>;
  const dayName=typeof d.dayName==="string"?d.dayName.slice(0,30):"Workout day";
  const focus=typeof d.focus==="string"?d.focus.slice(0,120):"Full body";
  const isRestDay=d.isRestDay===true;
  const exercises=Array.isArray(d.exercises)?d.exercises.slice(0,12).map((item)=>{
    if(!item||typeof item!=="object") throw new Error("An exercise was invalid.");
    const e=item as Record<string,unknown>;
    const name=typeof e.name==="string"?e.name.trim().slice(0,90):"";
    if(!name) throw new Error("An exercise was missing its name.");
    const number=(v:unknown,min:number,max:number,fallback:number)=>Math.max(min,Math.min(max,Math.round(Number(v)||fallback)));
    return {id:crypto.randomUUID(),name,sets:number(e.sets,1,8,3),reps:typeof e.reps==="string"?e.reps.slice(0,24):"10-12",restSeconds:number(e.restSeconds,0,300,60),durationMinutes:number(e.durationMinutes,1,45,Math.max(3,Math.floor(config.durationMinutes/config.exerciseCount))),instructions:typeof e.instructions==="string"?e.instructions.slice(0,400):"Use controlled movement and a comfortable range."};
  }):[];
  if(!isRestDay && exercises.length<2) throw new Error("The AI returned too few exercises for an active day.");
  return {dayName,focus,isRestDay,estimatedMinutes:Math.max(0,Math.min(180,Number(d.estimatedMinutes)||config.durationMinutes)),exercises:isRestDay?[]:exercises};
}
function buildPrompt(config:Config, weekStart:string, mode:string, dayIndex:number, currentDay:unknown) {
  const schemaDay='{"dayName":"Monday","focus":"Upper body strength","isRestDay":false,"estimatedMinutes":60,"exercises":[{"name":"Push-up","sets":3,"reps":"8-12","restSeconds":60,"durationMinutes":8,"instructions":"Keep a straight line from head to heels."}]}';
  const rules=[
    "You are Cal-Kie, a careful and practical personal workout planner. Create safe, balanced, realistic plans.",
    "Return JSON only. Do not include markdown, commentary, citations or extra text.",
    "The user wants a seven-day calendar. For a full week, return exactly seven days in Monday-to-Sunday order. Include exactly the requested number of training days; use active recovery/rest days for the remaining days.",
    "On every active day, include exactly the requested exercise count. Balance muscle groups and avoid training the same muscle group hard on consecutive days.",
    "Make every training day meaningfully distinct: vary the main movement patterns, exercise selection, order and training emphasis instead of reusing one template with renamed days.",
    "Do not repeat the exact same exercise anywhere else in the seven-day plan. Choose different but complementary exercises that fit the equipment and goal; repeated muscle-group focus is allowed only when the movement selection and stimulus are clearly different.",
    "Write exercise-specific instructions. The steps must describe the named movement and must not be generic copy-and-paste instructions shared across unrelated exercises.",
    "For day regeneration, do not reuse exercises from the adjacent days supplied in the existing plan; preserve the overall weekly split.",
    "Respect the selected experience level, goal, available equipment and personal instructions. Do not prescribe equipment the user does not have.",
    "Include warm-up/cool-down in the estimated session duration; the exercises' durationMinutes plus rest should fit the selected duration approximately. Do not exceed the requested session length by more than 10%.",
    "Use sensible sets, rep ranges and rest periods for the selected goal and level. Beginners should start conservatively. Do not prescribe maximal lifts or unsafe intensity.",
    "Rest days should have isRestDay=true, an empty exercises array and a short recovery suggestion in focus.",
    "Each exercise must have a clear searchable common name, sets (1-8), reps as a short string, restSeconds (0-300), durationMinutes (1-45), and concise form instructions.",
    'Full week output schema: {\"title\":\"...\",\"days\":[day,day,day,day,day,day,day]}. Day schema: '+schemaDay,
    "User preferences: "+JSON.stringify(config),
    "Requested session duration: "+config.durationMinutes+" minutes. Requested exercises per training day: "+config.exerciseCount+". Training days: "+config.trainingDays+"."
  ];
  if(mode==="day") rules.push("Replace only day index "+dayIndex+" in the existing plan. Preserve the week split and avoid repeating the adjacent days. Existing day: "+JSON.stringify(currentDay),'Return only {\"day\":'+schemaDay+'}.');
  else rules.push("Return the complete seven-day week now.");
  if(weekStart) rules.push("Week starts on "+weekStart+".");
  return rules.join("\n\n");
}
async function callOpenAI(provider:"openrouter"|"groq", key:string, model:string, prompt:string) {
  const endpoint=provider==="groq"?"https://api.groq.com/openai/v1/chat/completions":"https://openrouter.ai/api/v1/chat/completions";
  const response=await fetch(endpoint,{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json","HTTP-Referer":"https://cal-kie.vercel.app","X-Title":"Cal-Kie"},body:JSON.stringify({model,messages:[{role:"user",content:prompt}],temperature:0.45,max_tokens:6500})});
  const body=await response.json().catch(()=>({})) as any;
  if(!response.ok) throw new Error(body?.error?.message||"AI provider returned HTTP "+response.status);
  const content=body?.choices?.[0]?.message?.content;
  if(typeof content!=="string") throw new Error("AI provider returned no workout content.");
  return content;
}
async function callGemini(key:string,model:string,prompt:string) {
  const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(model)+":generateContent?key="+encodeURIComponent(key),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.45,maxOutputTokens:6500,responseMimeType:"application/json"}})});
  const body=await response.json().catch(()=>({})) as any;
  if(!response.ok) throw new Error(body?.error?.message||"Gemini returned HTTP "+response.status);
  const content=body?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||"").join("");
  if(typeof content!=="string"||!content) throw new Error("Gemini returned no workout content.");
  return content;
}
export const POST:APIRoute=async({request})=>{
  try {
    const input=await request.json() as {config?:Config;weekStart?:string;mode?:string;dayIndex?:number;currentDay?:unknown};
    const c=input.config;
    if(!c||!Number.isFinite(c.durationMinutes)||!Number.isFinite(c.exerciseCount)||!Number.isFinite(c.trainingDays)) return json({error:"Please provide valid workout preferences."},400);
    const config:Config={durationMinutes:Math.max(10,Math.min(180,Math.round(c.durationMinutes))),exerciseCount:Math.max(2,Math.min(12,Math.round(c.exerciseCount))),trainingDays:Math.max(3,Math.min(7,Math.round(c.trainingDays))),goal:String(c.goal||"general fitness").slice(0,80),level:String(c.level||"beginner").slice(0,30),equipment:String(c.equipment||"bodyweight only").slice(0,100),focus:String(c.focus||"").slice(0,600)};
    const providers:{provider:Provider;key:string;model:string}[]=[];
    if(process.env.OPENROUTER_API_KEY) providers.push({provider:"openrouter",key:process.env.OPENROUTER_API_KEY,model:process.env.OPENROUTER_MODEL||"openrouter/auto"});
    if(process.env.GROQ_API_KEY) providers.push({provider:"groq",key:process.env.GROQ_API_KEY,model:process.env.GROQ_MODEL||"llama-3.3-70b-versatile"});
    if(process.env.GEMINI_API_KEY) providers.push({provider:"gemini",key:process.env.GEMINI_API_KEY,model:process.env.GEMINI_MODEL||"gemini-2.5-flash"});
    if(!providers.length) return json({error:"AI workout generation is not configured yet. Add OPENROUTER_API_KEY, GROQ_API_KEY or GEMINI_API_KEY in Vercel Environment Variables, then redeploy."},503);
    const mode=input.mode==="day"?"day":"week";
    const today=new Date();
    const currentMonday=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate()-((today.getUTCDay()+6)%7)));
    const weekStart=typeof input.weekStart==="string"&&input.weekStart.trim()?input.weekStart.trim():currentMonday.toISOString().slice(0,10);
    const weekStartDate=new Date(weekStart+"T00:00:00.000Z");
    if(mode==="week"&&(!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)||Number.isNaN(weekStartDate.getTime())||weekStartDate.toISOString().slice(0,10)!==weekStart)) return json({error:"Please provide a valid week start date."},400);
    const prompt=buildPrompt(config,weekStart,mode,Math.max(0,Math.min(6,Number(input.dayIndex)||0)),input.currentDay);
    const failures:string[]=[];
    for(const provider of providers) {
      try {
        const text=provider.provider==="gemini"?await callGemini(provider.key,provider.model,prompt):await callOpenAI(provider.provider,provider.key,provider.model,prompt);
        const parsed=extractObject(text);
        if(mode==="day") return json({day:validateDay(parsed.day,config),provider:provider.provider,model:provider.model});
        if(!Array.isArray(parsed.days)||parsed.days.length!==7) throw new Error("AI must return exactly seven days.");
        const start=weekStart;
        const days=parsed.days.map((day,index)=>({...validateDay(day,config),date:new Date(Date.UTC(weekStartDate.getUTCFullYear(),weekStartDate.getUTCMonth(),weekStartDate.getUTCDate()+index)).toISOString().slice(0,10)}));
        if(days.filter(d=>!d.isRestDay).length!==config.trainingDays) throw new Error("AI did not follow the requested number of training days.");
        if(days.some(d=>!d.isRestDay&&d.exercises.length!==config.exerciseCount)) throw new Error("AI did not follow the requested exercise count.");
        const exerciseNames=days.filter(d=>!d.isRestDay).flatMap(d=>d.exercises.map(e=>e.name.toLowerCase().replace(/[^a-z0-9 ]/g,"").trim()));
        if(new Set(exerciseNames).size!==exerciseNames.length) throw new Error("AI repeated an exercise across training days; generate a more varied plan.");
        return json({plan:{title:typeof parsed.title==="string"?parsed.title.slice(0,80):"Your Cal-Kie training week",weekStart:start,durationMinutes:config.durationMinutes,exerciseCount:config.exerciseCount,trainingDays:config.trainingDays,goal:config.goal,level:config.level,equipment:config.equipment,days},provider:provider.provider,model:provider.model});
      } catch(error) { failures.push(provider.provider+": "+(error instanceof Error?error.message:"request failed")); }
    }
    return json({error:"Workout generation failed. "+failures.join(" · ").slice(0,700)},502);
  } catch(error) { return json({error:error instanceof Error?error.message:"Could not generate a workout plan."},400); }
};

function validSavedPlan(value: unknown): value is Record<string, unknown> & { weekStart: string; days: unknown[] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const plan = value as Record<string, unknown>;
  if (typeof plan.weekStart !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(plan.weekStart)) return false;
  const date = new Date(plan.weekStart + "T00:00:00.000Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== plan.weekStart) return false;
  if (!Array.isArray(plan.days) || plan.days.length !== 7) return false;
  if (!Number.isFinite(Number(plan.durationMinutes)) || !Number.isFinite(Number(plan.exerciseCount)) ||
      !Number.isFinite(Number(plan.trainingDays))) return false;
  return JSON.stringify(plan).length <= 150_000;
}

async function workoutCollection() {
  const db = await getMongoDb();
  const collection = db.collection("workout_plans");
  await Promise.all([
    collection.createIndex({ userId: 1, weekStart: 1 }, { unique: true, name: "user_workout_week_unique" }),
    collection.createIndex({ userId: 1, updatedAt: -1 }, { name: "user_workout_updated" })
  ]);
  return collection;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const { user } = await authenticateRequest(request);
    const collection = await workoutCollection();
    const weekStart = new URL(request.url).searchParams.get("weekStart");
    const filter: Document = { userId: user.id };
    if (weekStart && /^\d{4}-\d{2}-\d{2}$/.test(weekStart)) filter.weekStart = weekStart;
    const saved = await collection.findOne(filter, { sort: { updatedAt: -1 }, projection: { _id: 0, userId: 0 } });
    return json({ plan: saved?.plan_data ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load your saved workout.";
    return json({ error: message }, /session|sign in|auth/i.test(message) ? 401 : 503);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  let body: { plan?: unknown };
  try { body = await request.json() as { plan?: unknown }; }
  catch { return json({ error: "Send a valid workout plan." }, 400); }
  if (!validSavedPlan(body.plan)) return json({ error: "The workout plan is incomplete or too large to save." }, 400);
  try {
    const { user } = await authenticateRequest(request);
    const collection = await workoutCollection();
    const plan = body.plan;
    await collection.updateOne(
      { userId: user.id, weekStart: plan.weekStart },
      { $set: {
        userId: user.id,
        weekStart: plan.weekStart,
        title: typeof plan.title === "string" ? plan.title.slice(0, 80) : "Your Cal-Kie training week",
        plan_data: plan,
        updatedAt: new Date()
      } },
      { upsert: true }
    );
    return json({ saved: true, weekStart: plan.weekStart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save your workout.";
    return json({ error: message }, /session|sign in|auth/i.test(message) ? 401 : 503);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const weekStart = new URL(request.url).searchParams.get("weekStart")?.trim();
  if (!weekStart || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return json({ error: "Choose a valid workout week." }, 400);
  try {
    const { user } = await authenticateRequest(request);
    const collection = await workoutCollection();
    await collection.deleteOne({ userId: user.id, weekStart });
    return json({ deleted: true, weekStart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete your saved workout.";
    return json({ error: message }, /session|sign in|auth/i.test(message) ? 401 : 503);
  }
};
