import type { APIRoute } from "astro";
export const prerender=false;
const json=(body:Record<string,unknown>,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store, max-age=0"}});
export const GET:APIRoute=async({url})=>{
  const search=(url.searchParams.get("search")||"").trim().slice(0,80);
  if(search.length<2) return json({error:"Enter an exercise name to search."},400);
  try {
    const response=await fetch("https://oss.exercisedb.dev/api/v1/exercises/search?search="+encodeURIComponent(search),{headers:{Accept:"application/json"},cache:"no-store"});
    if(!response.ok) return json({error:"Exercise reference search is temporarily unavailable."},502);
    const body=await response.json() as {success?:boolean;data?:Array<{name?:string;gifUrl?:string}>};
    const exercises=(Array.isArray(body.data)?body.data:[]).filter(item=>typeof item.name==="string"&&typeof item.gifUrl==="string"&&item.gifUrl.startsWith("https://static.exercisedb.dev/media/")).slice(0,8).map(item=>({name:item.name,gifUrl:item.gifUrl}));
    return json({exercises});
  } catch { return json({error:"Could not reach the exercise reference library."},502); }
};
