import { gsap } from 'gsap';
import type { RecordScene } from './record-scene';

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const collection=document.querySelector<HTMLDialogElement>('#collection-dialog')!;
const about=document.querySelector<HTMLDialogElement>('#about-dialog')!;
const contact=document.querySelector<HTMLDialogElement>('#contact-dialog')!;
const carousel=document.querySelector<HTMLElement>('.vinyl-carousel')!;
type PlaybackProject=Parameters<RecordScene['play']>[0];
const projects=JSON.parse(document.getElementById('record-project-data')!.textContent||'[]') as PlaybackProject[];
const playbackURL=new URL(location.href);
const requestedSlug=playbackURL.searchParams.get('play');
let automaticProject=projects.find(project=>project.slug===requestedSlug)||null;
let automaticWatchdog:number|undefined;
// Consume the request before playback, so Back/BFCache cannot replay it again.
if(requestedSlug!==null){
  playbackURL.searchParams.delete('play');
  if(automaticProject)playbackURL.hash='';
  history.replaceState(history.state,'',playbackURL.pathname+playbackURL.search+playbackURL.hash);
}
function cancelAutomaticPlayback(){automaticProject=null;clearTimeout(automaticWatchdog);}
const host=document.getElementById('record-scene')!;
const table=host.closest<HTMLElement>('.listening-table')!;
const status=document.getElementById('room-status')!;
let scene:RecordScene|null=null;
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
function resetFallback(){document.querySelectorAll('.room-flying-record,.fallback-mounted-record').forEach(el=>el.remove());}
async function playFallback(){/* The static poster remains still; project navigation is always available. */}
let navigating=false,originFocus:HTMLElement|null=null;
let pageActive=true;
let playbackGeneration=0;
let playbackWatchdog:number|undefined,playbackLimit:number|undefined;
let playbackTransition:gsap.core.Timeline|null=null;
function cancelPlayback(){
  playbackGeneration++;
  clearTimeout(playbackWatchdog);clearTimeout(playbackLimit);
  playbackWatchdog=undefined;playbackLimit=undefined;
  playbackTransition?.kill();playbackTransition=null;
}
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
document.querySelectorAll<HTMLElement>('[data-open-collection]').forEach(el=>el.addEventListener('click',()=>{cancelAutomaticPlayback();openDialog(collection);}));
for(const dialog of dialogs){
  dialog.querySelector('[data-close-dialog]')?.addEventListener('click',()=>closeDialog(dialog));
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeDialog(dialog);});
  dialog.addEventListener('close',()=>{if(!navigating)originFocus?.focus({preventScroll:true});});
}
// The same URL fragments work from project pages and direct links.
function navigateHash(hash:string){if(automaticProject||document.documentElement.classList.contains('room-loading'))return;if(hash==='#proyectos')openDialog(collection);else if(hash==='#sobre-mi')openDialog(about);else if(hash==='#contacto')openDialog(contact);}
document.querySelectorAll<HTMLAnchorElement>('#main-nav a').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();cancelAutomaticPlayback();navigateHash(new URL(link.href).hash);
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
window.addEventListener('pageshow',e=>{pageActive=true;if(e.persisted){cancelAutomaticPlayback();cancelPlayback();navigating=false;scene?.reset();resetFallback();host.style.visibility='';document.querySelectorAll<HTMLButtonElement>('[data-open-collection]').forEach(b=>b.disabled=false);gsap.set('.record-transition',{autoAlpha:0});gsap.set('.transition-line',{scaleX:0});status.textContent='';void finishLoading();}});

const root=document.documentElement;
const loader=document.getElementById('room-loader');
const loaderMessage=document.getElementById('loader-message');
const loaderProgress=document.getElementById('loader-progress');
const skip=document.getElementById('loader-skip') as HTMLButtonElement|null;
let entryPromise:Promise<void>|null=null;
const skipTimer=window.setTimeout(()=>{if(skip)skip.hidden=false;},5000);
function finishLoading():Promise<void>{
  if(entryPromise)return entryPromise;
  clearTimeout(skipTimer);
  const wasLoading=root.classList.contains('room-loading');
  loader?.classList.add('is-leaving');
  root.classList.remove('room-loading','room-static');root.classList.add('room-loaded');
  if(location.hash)navigateHash(location.hash);
  if(document.activeElement===skip&&!dialogs.some(dialog=>dialog.open))document.querySelector<HTMLButtonElement>('.collection-main-button')?.focus({preventScroll:true});
  if(reduced.matches||!wasLoading){loader?.remove();return entryPromise=Promise.resolve();}
  const elements=document.querySelectorAll('.site-header,.room-heading-copy,.room-identity,.listening-table,.room-bottom');
  return entryPromise=new Promise(resolve=>{
    gsap.timeline({onComplete:resolve})
      .to(loader,{opacity:0,duration:.35,ease:'power2.out',onComplete:()=>loader?.remove()},0)
      .fromTo(elements,{y:16,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,stagger:.065,ease:'power3.out',clearProps:'transform,opacity,visibility'},.08);
  });
}
skip?.addEventListener('click',()=>{cancelAutomaticPlayback();void finishLoading();openDialog(collection);});
function playAutomaticProject(){
  const project=automaticProject;
  if(!project)return;
  cancelAutomaticPlayback();
  // Replace the intermediate room entry, so Back returns to the preceding case.
  void playProject(project,new URL(`/proyectos/${project.slug}/`,location.origin).href,true);
}
// A stalled model/font download must not strand a project-to-project navigation.
if(automaticProject)automaticWatchdog=window.setTimeout(()=>{
  void finishLoading().then(playAutomaticProject);
},18000);
async function initializeScene(){
  try{
    await document.fonts.ready;
    if(!pageActive||navigating)return;
    const {createRecordScene}=await import('./record-scene');
    if(!pageActive||navigating)return;
    if(loaderMessage)loaderMessage.textContent='Cargando el tocadiscos';
    const loadedScene=await createRecordScene(host,projects,value=>{
      if(value!==null&&loaderProgress)loaderProgress.style.transform=`scaleX(${Math.max(.05,value)})`;
    });
    // A late model must not replace a fallback navigation already in progress.
    if(!pageActive||navigating){
      loadedScene.dispose();host.replaceChildren();table.classList.remove('scene-ready');host.dataset.renderState='fallback';
      return;
    }
    scene=loadedScene;
    if(loaderProgress)loaderProgress.style.transform='scaleX(1)';
  }catch(error){if(!pageActive||navigating)return;host.style.display='none';host.dataset.renderState='failed';
    const message=document.createElement('p');message.className='scene-recovery';
    const reason=error instanceof Error?error.message:String(error);
    message.textContent=reason.includes('context')||reason.includes('WebGL')||reason.includes('WEBGL')?'Vista est\u00e1tica: Chrome no ha podido activar los gr\u00e1ficos 3D. ':'Vista est\u00e1tica: no se ha podido cargar el modelo 3D. ';
    const retry=document.createElement('button');retry.textContent='Reintentar';retry.addEventListener('click',()=>location.reload());message.append(retry);
    const detail=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Ver diagn\u00f3stico';detail.append(summary,document.createTextNode(reason));message.append(detail);table.append(message);
    console.warn('3D unavailable; the same turntable poster and accessible collection remain active.',error);}
  await new Promise<void>(resolve=>requestAnimationFrame(()=>{void finishLoading().then(resolve);}));
  playAutomaticProject();
}
void initializeScene();

async function playProject(project:PlaybackProject,route:string,replace=false){
  if(navigating||!pageActive)return;navigating=true;
  const generation=++playbackGeneration;
  const isCurrent=()=>pageActive&&generation===playbackGeneration;
  cancelAutomaticPlayback();
  clearObjectHover();
  const navigate=()=>{if(!isCurrent())return;cancelPlayback();if(replace)location.replace(route);else location.assign(route);};
  const playbackScene=scene;
  if(!playbackScene)host.style.visibility='hidden';
  for(const dialog of dialogs)if(dialog.open)dialog.close();
  status.textContent=`Poniendo ${project.title}. Abriendo el proyecto.`;
  document.querySelectorAll<HTMLButtonElement>('[data-open-collection]').forEach(b=>b.disabled=true);
  const transition=document.querySelector<HTMLElement>('.record-transition')!;
  transition.querySelector('strong')!.textContent=project.title;
  transition.querySelector('.record-transition-subtitle')!.textContent=project.subtitle;
  // Hard upper bound: a failed GPU or motion callback must never block a project link.
  playbackWatchdog=window.setTimeout(navigate,6500);
  try{
    if(!reduced.matches||playbackScene)await Promise.race([
      playbackScene?playbackScene.play(project).then(()=>{if(!isCurrent()&&!navigating)playbackScene.reset();}):playFallback(),
      new Promise<void>(resolve=>{playbackLimit=window.setTimeout(resolve,2500);})
    ]);
    if(!isCurrent())return;
    clearTimeout(playbackLimit);playbackLimit=undefined;
    if(reduced.matches){navigate();return;}
    playbackTransition=gsap.timeline({onComplete:navigate})
      .to(transition,{autoAlpha:1,duration:.4,ease:'power2.inOut'})
      .fromTo(transition.querySelector('strong'),{y:20},{y:0,duration:.45,ease:'power3.out'},0)
      .to('.transition-line',{scaleX:1,duration:.4,ease:'power2.inOut'},.15);
  }catch{if(isCurrent())navigate();}
}
for(const link of document.querySelectorAll<HTMLAnchorElement>('[data-play-record]'))link.addEventListener('click',event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  const project=projects.find(project=>project.slug===link.dataset.playRecord);
  if(!project){location.assign(link.href);return;}
  void playProject(project,link.href);
});
window.addEventListener('pagehide',e=>{pageActive=false;cancelAutomaticPlayback();cancelPlayback();clearObjectHover();if(!e.persisted)scene?.dispose();});

if(location.hash)navigateHash(location.hash);
