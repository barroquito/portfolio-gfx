import { gsap } from 'gsap';
import type { RecordScene } from './record-scene';

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const collection=document.querySelector<HTMLDialogElement>('#collection-dialog')!;
const about=document.querySelector<HTMLDialogElement>('#about-dialog')!;
const contact=document.querySelector<HTMLDialogElement>('#contact-dialog')!;
const carousel=document.querySelector<HTMLElement>('.vinyl-carousel')!;
const projects=JSON.parse(document.getElementById('record-project-data')!.textContent||'[]');
const host=document.getElementById('record-scene')!;
const table=host.closest<HTMLElement>('.listening-table')!;
const status=document.getElementById('room-status')!;
let scene:RecordScene|null=null;
let fallbackSpin:gsap.core.Tween|null=null;
const fineHover=window.matchMedia('(hover: hover) and (pointer: fine)');
let hoverFrame=0,hoverX=0,hoverY=0;
function clearObjectHover(){if(hoverFrame)cancelAnimationFrame(hoverFrame);hoverFrame=0;scene?.clearHover();table.classList.remove('hover-deck','hover-stack');}
table.addEventListener('pointermove',event=>{
  if(!fineHover.matches||reduced.matches||event.pointerType==='touch'||navigating||dialogs.some(dialog=>dialog.open)){clearObjectHover();return;}
  if(scene&&table.classList.contains('scene-ready')){
    hoverX=event.clientX;hoverY=event.clientY;
    if(!hoverFrame)hoverFrame=requestAnimationFrame(()=>{hoverFrame=0;scene?.hoverAt(hoverX,hoverY);});
    return;
  }
  const bounds=table.getBoundingClientRect();
  table.classList.toggle('hover-deck',event.clientX<bounds.left+bounds.width*.48);
  table.classList.toggle('hover-stack',event.clientX>bounds.left+bounds.width*.56);
});
table.addEventListener('pointerleave',clearObjectHover);
const stackHotspot=table.querySelector<HTMLElement>('.collection-hotspot')!;
stackHotspot.addEventListener('focus',()=>{if(!reduced.matches){if(scene&&table.classList.contains('scene-ready'))scene.hoverCollection();else table.classList.add('hover-stack');}});
stackHotspot.addEventListener('blur',clearObjectHover);
reduced.addEventListener('change',clearObjectHover);
function resetFallback(){fallbackSpin?.kill();fallbackSpin=null;document.querySelectorAll('.room-flying-record,.fallback-mounted-record').forEach(el=>el.remove());gsap.set('.fallback-player i',{clearProps:'transform'});}
async function playFallback(project:typeof projects[number]){
  resetFallback();
  const stack=document.querySelector<HTMLElement>('.fallback-stack')!;
  const platter=document.querySelector<HTMLElement>('.fallback-platter')!;
  const player=document.querySelector<HTMLElement>('.fallback-player')!;
  const source=stack.getBoundingClientRect(),target=platter.getBoundingClientRect();
  const disc=document.createElement('div');disc.className='room-flying-record';
  const label=document.createElement('span');label.style.background=project.record.color;label.style.color=project.record.ink;label.textContent=project.title;disc.append(label);document.body.append(disc);
  const size=Math.min(source.width,source.height)*.9;
  gsap.set(disc,{width:size,height:size,left:source.x+source.width/2-size/2,top:source.y+source.height/2-size/2,rotation:-10,rotationX:22});
  await new Promise<void>(resolve=>{
    gsap.timeline({onComplete:()=>{
      disc.remove();const mounted=disc.cloneNode(true) as HTMLElement;mounted.className='fallback-mounted-record';mounted.removeAttribute('style');player.append(mounted);
      fallbackSpin=gsap.to(mounted,{rotation:360,duration:3.3,ease:'none',repeat:-1});
      gsap.to('.fallback-player i',{rotation:24,duration:.4,onComplete:resolve});
    }})
    .to(disc,{left:target.x+(target.width-target.height)/2,width:target.height,height:target.height,rotation:0,rotationX:27,duration:1.3,ease:'power1.inOut'},0)
    .to(disc,{keyframes:[{top:Math.max(table.getBoundingClientRect().top+8,Math.min(source.y,target.y)-12),duration:.55,ease:'power1.out'},{top:target.y,duration:.75,ease:'power1.in'}]},0);
  });
}
let navigating=false,originFocus:HTMLElement|null=null;
const dialogs=[collection,about,contact];

function openDialog(dialog:HTMLDialogElement){
  if(navigating||dialog.open)return;
  clearObjectHover();
  const current=dialogs.find(d=>d.open);if(current)current.close();
  originFocus=document.activeElement as HTMLElement;
  dialog.showModal();
  if(dialog===collection)requestAnimationFrame(updateCarousel);
  if(!reduced.matches)gsap.fromTo(dialog,{y:dialog===collection?70:15,opacity:0},{y:0,opacity:1,duration:.45,ease:'power3.out',clearProps:'transform,opacity'});
}
function closeDialog(dialog:HTMLDialogElement){dialog.close();}
document.querySelectorAll<HTMLElement>('[data-open-collection]').forEach(el=>el.addEventListener('click',()=>openDialog(collection)));
for(const dialog of dialogs){
  dialog.querySelector('[data-close-dialog]')?.addEventListener('click',()=>closeDialog(dialog));
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeDialog(dialog);});
  dialog.addEventListener('close',()=>{if(!navigating)originFocus?.focus({preventScroll:true});});
}
// The same URL fragments work from project pages and direct links.
function navigateHash(hash:string){if(hash==='#proyectos')openDialog(collection);else if(hash==='#sobre-mi')openDialog(about);else if(hash==='#contacto')openDialog(contact);}
document.querySelectorAll<HTMLAnchorElement>('#main-nav a').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();navigateHash(new URL(link.href).hash);
}));
window.addEventListener('hashchange',()=>navigateHash(location.hash));

const prev=document.querySelector<HTMLButtonElement>('[data-carousel-prev]')!;
const next=document.querySelector<HTMLButtonElement>('[data-carousel-next]')!;
const position=document.querySelector<HTMLElement>('.collection-position')!;
const cards=Array.from(carousel.querySelectorAll<HTMLElement>('.vinyl-card'));
function step(){return (cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:300)||300;}
function scrollCards(direction:number){carousel.scrollBy({left:step()*direction,behavior:reduced.matches?'instant':'smooth'});}
prev.addEventListener('click',()=>scrollCards(-1));next.addEventListener('click',()=>scrollCards(1));
carousel.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();scrollCards(1);}if(e.key==='ArrowLeft'){e.preventDefault();scrollCards(-1);}if(e.key==='Home'){e.preventDefault();carousel.scrollTo({left:0,behavior:'instant'});}if(e.key==='End'){e.preventDefault();carousel.scrollTo({left:carousel.scrollWidth,behavior:'instant'});}});
function updateCarousel(){if(!collection.open)return;const max=carousel.scrollWidth-carousel.clientWidth;prev.disabled=carousel.scrollLeft<5;next.disabled=carousel.scrollLeft>=max-5;const index=Math.max(0,Math.min(cards.length-1,carousel.scrollLeft>=max-5&&max>5?cards.length-1:Math.floor(carousel.scrollLeft/step())));position.textContent=`${String(index+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;}
carousel.addEventListener('scroll',updateCarousel,{passive:true});new ResizeObserver(updateCarousel).observe(carousel);
collection.addEventListener('toggle',updateCarousel);
// The browser's back/forward cache must restore an interactive room.
window.addEventListener('pageshow',e=>{if(e.persisted){navigating=false;scene?.reset();resetFallback();document.querySelectorAll<HTMLButtonElement>('[data-open-collection]').forEach(b=>b.disabled=false);const caption=document.getElementById('player-description');if(caption)caption.textContent='Elige un proyecto.';gsap.set('.record-transition',{autoAlpha:0});gsap.set('.transition-line',{scaleX:0});status.textContent='';}});

async function initializeScene(){
  try{await document.fonts.ready;const {createRecordScene}=await import('./record-scene');scene=await createRecordScene(host,projects);}
  catch(error){host.style.display='none';console.warn('3D unavailable; accessible record collection remains active.',error);}
}
void initializeScene();

for(const link of document.querySelectorAll<HTMLAnchorElement>('[data-play-record]'))link.addEventListener('click',async event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();if(navigating)return;navigating=true;
  clearObjectHover();
  const project=projects.find((p:{slug:string})=>p.slug===link.dataset.playRecord);if(!project){location.assign(link.href);return;}
  const route=link.href;
  collection.close();
  const caption=document.getElementById('player-description');if(caption)caption.textContent=`Ahora en el plato: ${project.title}`;
  status.textContent=`Poniendo ${project.title}. Abriendo el proyecto.`;
  document.querySelectorAll<HTMLButtonElement>('[data-open-collection]').forEach(b=>b.disabled=true);
  const transition=document.querySelector<HTMLElement>('.record-transition')!;
  transition.querySelector('strong')!.textContent=project.title;
  transition.querySelector('.record-transition-subtitle')!.textContent=project.subtitle;
  // Hard upper bound: a failed GPU or motion callback must never block a project link.
  const watchdog=window.setTimeout(()=>location.assign(route),6500);
  try{
    if(!reduced.matches||scene)await Promise.race([scene?scene.play(project):playFallback(project),new Promise<void>(resolve=>setTimeout(resolve,2500))]);
    if(reduced.matches){location.assign(route);return;}
    gsap.timeline({onComplete:()=>{clearTimeout(watchdog);location.assign(route);}})
      .to(transition,{autoAlpha:1,duration:.4,ease:'power2.inOut'})
      .fromTo(transition.querySelector('strong'),{y:20},{y:0,duration:.45,ease:'power3.out'},0)
      .to('.transition-line',{scaleX:1,duration:.4,ease:'power2.inOut'},.15);
  }catch{clearTimeout(watchdog);location.assign(route);}
});
window.addEventListener('pagehide',e=>{if(!e.persisted)scene?.dispose();});

if(location.hash)navigateHash(location.hash);
