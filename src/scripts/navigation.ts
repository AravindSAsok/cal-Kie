const toggle=document.getElementById("menu-toggle") as HTMLButtonElement|null;
const drawer=document.getElementById("app-menu") as HTMLElement|null;
const backdrop=document.getElementById("menu-backdrop") as HTMLButtonElement|null;
const close=document.getElementById("menu-close") as HTMLButtonElement|null;
if(toggle&&drawer&&backdrop&&close){
 const setOpen=(open:boolean)=>{drawer.hidden=!open;backdrop.hidden=!open;toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Close navigation menu":"Open navigation menu");document.body.classList.toggle("menu-open",open);if(open)close.focus();else toggle.focus();};
 toggle.addEventListener("click",()=>setOpen(drawer.hidden));
 close.addEventListener("click",()=>setOpen(false));
 backdrop.addEventListener("click",()=>setOpen(false));
 document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!drawer.hidden)setOpen(false);});
}