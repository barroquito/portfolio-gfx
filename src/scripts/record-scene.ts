import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { gsap } from 'gsap';

type RecordProject = {slug:string;title:string;number:string;subtitle:string;theme:string;record:{color:string;ink:string;label:string}};
export type RecordScene = { play:(project:RecordProject)=>Promise<void>; hoverAt:(x:number,y:number)=>void; clearHover:()=>void; hoverCollection:()=>void; reset:()=>void; dispose:()=>void };

export async function createRecordScene(host:HTMLElement, projects:RecordProject[]):Promise<RecordScene> {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .85;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-7,7,4,-4,.1,80);
  camera.position.set(0,10.7,10.7);
  camera.lookAt(0,0,0);
  // A studio environment supplies broad reflections; the key supplies contact shadows.
  const pmrem=new THREE.PMREMGenerator(renderer);
  const studio=new RoomEnvironment();
  const environment=pmrem.fromScene(studio,.03);
  scene.environment=environment.texture;scene.environmentIntensity=.45;
  studio.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#fffdf4','#62675e',.55));
  const key = new THREE.DirectionalLight('#fff7e8',2.15);
  key.position.set(-4,10,6); key.castShadow=true;
  key.shadow.mapSize.set(window.innerWidth<761?1024:2048,window.innerWidth<761?1024:2048);
  key.shadow.camera.left=-9; key.shadow.camera.right=9; key.shadow.camera.top=7; key.shadow.camera.bottom=-7;
  key.shadow.normalBias=.018; key.shadow.bias=-.00015; key.shadow.radius=4;
  scene.add(key);
  const fill=new THREE.DirectionalLight('#e4eadf',.4);fill.position.set(6,5,-4);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({color:'#252a24',opacity:.24}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.08;floor.receiveShadow=true;scene.add(floor);
  const materials:THREE.Material[]=[];
  function mat(color:string,metalness=0,roughness=.5){const m=new THREE.MeshStandardMaterial({color,metalness,roughness});materials.push(m);return m;}
  // Fine deterministic surface maps keep metal, paper and vinyl physically distinct.
  function surfaceMap(kind:'brushed'|'paper'|'grooves'){
    const size=512,data=new Uint8Array(size*size*4);let seed=47;
    function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
    for(let y=0;y<size;y++){const line=random()*19;for(let x=0;x<size;x++){
      const radius=Math.hypot(x-size/2,y-size/2);
      const value=kind==='brushed'?170+line+random()*12:kind==='paper'?180+random()*48:128+Math.sin(radius*3.2)*35;
      const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
    }}
    const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;return t;
  }
  const brushedMap=surfaceMap('brushed'),paperMap=surfaceMap('paper'),groovesMap=surfaceMap('grooves');
  const red=new THREE.MeshPhysicalMaterial({color:'#292e27',metalness:.15,roughness:.3,clearcoat:.7,clearcoatRoughness:.22});
  const top=new THREE.MeshPhysicalMaterial({color:'#777d76',metalness:.8,roughness:.38,roughnessMap:brushedMap,bumpMap:brushedMap,bumpScale:.003,anisotropy:.45});
  const dark=new THREE.MeshPhysicalMaterial({color:'#171c16',metalness:.05,roughness:.3,clearcoat:.65,clearcoatRoughness:.22});
  const rubber=mat('#171c15',0,.94),metal=mat('#c3c9ba',.95,.23),ivory=mat('#f1f1e5',0,.9);
  materials.push(red,top,dark);
  async function loadImage(src:string):Promise<HTMLImageElement|null>{try{return await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});}catch{return null;}}
  const [logoImage,bulkImage]=await Promise.all([loadImage('/brand/jorge-mark.svg'),loadImage('/images/bulk-drink.webp')]);
  function mesh(parent:THREE.Object3D, geometry:THREE.BufferGeometry, material:THREE.Material|THREE.Material[],x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(parent:THREE.Object3D,w:number,h:number,d:number,material:THREE.Material,x=0,y=0,z=0,r=.03){return mesh(parent,new RoundedBoxGeometry(w,h,d,3,r),material,x,y,z);}
  function cyl(parent:THREE.Object3D,r:number,h:number,material:THREE.Material,x=0,y=0,z=0){return mesh(parent,new THREE.CylinderGeometry(r,r,h,80),material,x,y,z);}
  function texture(canvas:HTMLCanvasElement){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
  function textCanvas(width:number,height:number,draw:(ctx:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');draw(ctx);return texture(c);}
  const printFont='"DM Sans Variable", sans-serif';
  const deck=new THREE.Group();deck.position.set(-2.85,0,0);deck.rotation.y=.085;scene.add(deck);
  for(const x of [-1.9,1.9]) for(const z of [-1.45,1.45]) cyl(deck,.23,.24,rubber,x,.12,z);
  box(deck,5,.47,3.95,red,0,.39,0,.09);
  box(deck,4.86,.075,3.81,top,0,.662,0,.045);
  // The platen is empty until a project is selected.
  cyl(deck,1.72,.13,metal,-.5,.77,0);
  cyl(deck,1.64,.035,rubber,-.5,.85,0);
  const grooveTexture=textCanvas(1024,1024,ctx=>{
    ctx.fillStyle='#171c16';ctx.fillRect(0,0,1024,1024);
    for(let i=120;i<506;i+=3){ctx.beginPath();ctx.arc(512,512,i,0,Math.PI*2);ctx.strokeStyle=i%2?'#232b20':'#1c231a';ctx.lineWidth=1;ctx.stroke();}
    ctx.fillStyle='#f1f1e5';ctx.beginPath();ctx.arc(512,512,102,0,Math.PI*2);ctx.fill();
    if(logoImage)ctx.drawImage(logoImage,437,461,150,93);else{ctx.fillStyle='#232b20';ctx.textAlign='center';ctx.font=`600 48px ${printFont}`;ctx.fillText('JP',512,520);}
  });
  const matPrint=new THREE.MeshPhysicalMaterial({map:grooveTexture,metalness:.03,roughness:.3,bumpMap:groovesMap,bumpScale:.007,clearcoat:.65,clearcoatRoughness:.2});materials.push(matPrint);
  const platenPrint=mesh(deck,new THREE.CircleGeometry(1.63,96),matPrint,-.5,.873,0);platenPrint.rotation.x=-Math.PI/2;
  cyl(deck,.044,.2,metal,-.5,.94,0);
  const tonearm=new THREE.Group();tonearm.position.set(1.45,.81,-1.17);tonearm.rotation.y=.04;deck.add(tonearm);
  cyl(tonearm,.26,.15,metal,0,0,0);cyl(tonearm,.18,.13,dark,0,.12,0);
  function rod(parent:THREE.Object3D,a:THREE.Vector3,b:THREE.Vector3,r:number,material:THREE.Material){const m=mesh(parent,new THREE.CylinderGeometry(r,r,a.distanceTo(b),16),material);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return m;}
  rod(tonearm,new THREE.Vector3(0,.2,-.37),new THREE.Vector3(0,.2,1.95),.045,metal);
  const counter=cyl(tonearm,.16,.3,dark,0,.2,-.45);counter.rotation.x=Math.PI/2;
  box(tonearm,.22,.13,.4,dark,-.06,.16,2.0,.025);
  box(tonearm,.12,.04,.16,red,-.08,.08,2.12,.01);
  rod(tonearm,new THREE.Vector3(-.12,.2,1.87),new THREE.Vector3(-.32,.2,1.98),.02,metal);
  cyl(deck,.11,.14,metal,1.56,.78,1.35);cyl(deck,.09,.03,dark,1.56,.87,1.35);
  box(deck,.35,.03,.05,dark,1.56,.704,.77,.01);
  box(deck,.16,.055,.09,ivory,1.56,.73,.77,.01);
  const led=mesh(deck,new THREE.SphereGeometry(.035,12,8),new THREE.MeshBasicMaterial({color:'#d93222'}),-2.03,.731,1.42);
  const deckText=textCanvas(1024,90,ctx=>{ctx.fillStyle='#bfc4b9';ctx.fillRect(0,0,1024,90);if(logoImage)ctx.drawImage(logoImage,20,4,122,76);ctx.fillStyle='#2a3226';ctx.font=`500 18px ${printFont}`;ctx.fillText('JP—01 / PERSONAL SELECTION',185,53);ctx.fillText('33⅓   /   45',780,53);});
  const deckTextMat=new THREE.MeshStandardMaterial({map:deckText,metalness:.6,roughness:.46,roughnessMap:brushedMap});materials.push(deckTextMat);
  const plaque=mesh(deck,new THREE.PlaneGeometry(3.4,.29),deckTextMat,-.25,.708,1.62);plaque.rotation.x=-Math.PI/2;
  // Each cover is generated from the same project metadata as the accessible carousel.
  const coverTextures=projects.map(p=>textCanvas(1024,1024,ctx=>{
    ctx.fillStyle=p.record.color;ctx.fillRect(0,0,1024,1024);
    if(p.theme==='bulk'&&bulkImage){const scale=Math.max(1024/bulkImage.width,1024/bulkImage.height);const w=bulkImage.width*scale,h=bulkImage.height*scale;ctx.drawImage(bulkImage,(1024-w)/2,(1024-h)/2,w,h);}
    ctx.fillStyle=p.record.ink;ctx.strokeStyle=p.record.ink;ctx.lineWidth=2;
    ctx.font=`600 22px ${printFont}`;ctx.fillText('JORGE PINDADO',70,85);ctx.textAlign='right';ctx.fillText(`JP—${p.number}`,954,85);ctx.textAlign='left';ctx.beginPath();ctx.moveTo(70,120);ctx.lineTo(954,120);ctx.stroke();
    if(p.theme==='bulk'){ctx.fillStyle='#20352e';ctx.font=`600 90px ${printFont}`;ctx.fillText('BULK®',70,230);ctx.font=`600 30px ${printFont}`;ctx.fillText('COMER BIEN. SUBIR EL VOLUMEN.',70,843);}
    else if(p.theme==='one-more'){ctx.strokeStyle='#b6a0d3';ctx.save();ctx.translate(512,510);ctx.rotate(-.6);for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,660-i*50,270-i*45,0,0,Math.PI*2);ctx.stroke();}ctx.restore();ctx.fillStyle=p.record.ink;ctx.save();ctx.translate(70,385);ctx.rotate(-.1);ctx.font=`600 270px ${printFont}`;ctx.fillText('ONE',0,0);ctx.fillText('MORE',0,240);ctx.restore();ctx.font=`600 24px ${printFont}`;ctx.fillText('THE 2000s ARE CALLING.',70,840);}
    else if(p.theme==='li-onna'){ctx.globalAlpha=.45;ctx.beginPath();ctx.arc(840,465,310,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(840,465,240,0,Math.PI*2);ctx.stroke();ctx.font='300px serif';ctx.fillText('酒',690,575);ctx.globalAlpha=1;ctx.font=`500 180px ${printFont}`;ctx.fillText('Entre',65,490);ctx.font=`650 175px ${printFont}`;ctx.fillText('dos almas.',65,675);ctx.font=`600 24px ${printFont}`;ctx.fillText('LI-ONNA / CATA DE SAKES',70,840);}
    else {ctx.save();ctx.globalAlpha=.2;ctx.translate(512,512);ctx.rotate(-.4);for(let i=-700;i<700;i+=30){ctx.fillRect(-900,i,1800,3);}ctx.restore();ctx.save();ctx.transform(1,0,-.2,1,90,0);ctx.font=`600 460px ${printFont}`;ctx.fillText('F1',80,650);ctx.font=`600 130px ${printFont}`;ctx.fillText('WEEK',80,788);ctx.restore();}
    ctx.fillStyle=p.record.ink;ctx.font=`600 18px ${printFont}`;ctx.fillText(p.record.label,70,956);ctx.textAlign='right';ctx.fillText('33⅓ RPM / SIDE A',954,956);
  }));
  const stack=new THREE.Group();stack.position.set(3.05,.08,.0);scene.add(stack);
  const sleeves:{object:THREE.Group;restY:number;rank:number}[]=[];
  for(let i=projects.length-1;i>=0;i--){
    const p=projects[i];const sleeve=new THREE.Group();sleeve.position.set((i-1)*.07,.10+(projects.length-i)*.105, (i-1)*.035);sleeve.rotation.y=[-.12,.10,-.18,.22][i%4];stack.add(sleeve);
    sleeves.push({object:sleeve,restY:sleeve.position.y,rank:projects.length-i-1});
    const edge=mat(p.record.color,0,.92);box(sleeve,3.12,.095,3.12,edge,0,0,0,.018);
    const coverMat=new THREE.MeshStandardMaterial({map:coverTextures[i],metalness:0,roughness:.86,bumpMap:paperMap,bumpScale:.003,envMapIntensity:.2});materials.push(coverMat);const cover=mesh(sleeve,new THREE.PlaneGeometry(3.10,3.10),coverMat,0,.049,0);cover.rotation.x=-Math.PI/2;
  }
  // A loose record peeks out from under the top sleeve.
  const loose=new THREE.Group();loose.position.set(3.82,.43,-.15);scene.add(loose);
  cyl(loose,1.4,.035,dark);
  const looseGrooves=mesh(loose,new THREE.CircleGeometry(1.39,96),matPrint,0,.022,0);looseGrooves.rotation.x=-Math.PI/2;
  stack.position.y=.10; // top sleeve rests above the loose record
  let movingRecord:THREE.Group|null=null,playing=false,transitioning=false,disposed=false,visible=!document.hidden;
  let hovered:'deck'|'stack'|null=null;
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const positionPlayer=new THREE.Vector3();
  function render(){if(!disposed&&visible)renderer.render(scene,camera);}
  function setHover(next:'deck'|'stack'|null){
    if(disposed||transitioning||playing||reduced.matches)next=null;
    if(next===hovered)return;
    hovered=next;
    gsap.to(tonearm.rotation,{y:next==='deck'?-.22:.04,duration:.7,ease:'power2.inOut',overwrite:'auto',onUpdate:render});
    for(const sleeve of sleeves)gsap.to(sleeve.object.position,{y:sleeve.restY+(next==='stack'?sleeve.rank*.18:0),duration:.65,ease:'power2.out',overwrite:'auto',onUpdate:render});
  }
  function hoverAt(x:number,y:number){
    const bounds=renderer.domElement.getBoundingClientRect();
    if(!bounds.width||!bounds.height||x<bounds.left||x>bounds.right||y<bounds.top||y>bounds.bottom){setHover(null);return;}
    pointer.set((x-bounds.left)/bounds.width*2-1,-((y-bounds.top)/bounds.height)*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects([deck,stack,loose],true)[0]?.object;
    let object:THREE.Object3D|null=hit||null;
    while(object&&object!==deck&&object!==stack&&object!==loose)object=object.parent;
    setHover(object===deck?'deck':object===stack||object===loose?'stack':null);
  }
  function clearHover(){setHover(null);}
  function hoverCollection(){setHover('stack');}
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const ratio=w/h;const width=Math.max(window.innerWidth<761?13.1:15.4,ratio*4.65);const height=width/ratio;camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();camera.lookAt(0,0,0);render();}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  host.closest('.listening-table')?.classList.add('scene-ready');
  let previous=0;
  renderer.setAnimationLoop(time=>{if(!visible||disposed)return;if(playing&&!reduced.matches&&movingRecord){const delta=Math.min((time-previous)/1000,.05);movingRecord.rotation.y+=delta*1.9;render();}previous=time;});
  function visibility(){visible=!document.hidden;if(visible)render();}
  document.addEventListener('visibilitychange',visibility);
  function onMotionChange(){if(reduced.matches){hovered=null;gsap.killTweensOf(tonearm.rotation);gsap.set(tonearm.rotation,{y:playing?-.61:.04});for(const sleeve of sleeves){gsap.killTweensOf(sleeve.object.position);sleeve.object.position.y=sleeve.restY;}}render();}reduced.addEventListener('change',onMotionChange);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();host.closest('.listening-table')?.classList.remove('scene-ready');});
  async function play(p:RecordProject){
    if(disposed)return;
    clearHover();transitioning=true;
    gsap.killTweensOf(tonearm.rotation);
    if(movingRecord)scene.remove(movingRecord);
    movingRecord=new THREE.Group();scene.add(movingRecord);
    cyl(movingRecord,1.60,.04,dark);
    const grooves=mesh(movingRecord,new THREE.CircleGeometry(1.595,96),matPrint,0,.025,0);grooves.rotation.x=-Math.PI/2;
    const labelTex=textCanvas(512,512,ctx=>{ctx.fillStyle=p.record.color;ctx.fillRect(0,0,512,512);ctx.fillStyle=p.record.ink;ctx.textAlign='center';ctx.font=`600 21px ${printFont}`;ctx.fillText('JORGE PINDADO',256,100);ctx.font=`600 ${p.title.length>7?47:65}px ${printFont}`;ctx.fillText(p.title.toUpperCase(),256,225);ctx.font=`18px ${printFont}`;ctx.fillText(`JP—${p.number} / SIDE A`,256,345);ctx.fillText('33⅓ RPM',256,385);});
    const labelMat=new THREE.MeshStandardMaterial({map:labelTex,metalness:0,roughness:.95,bumpMap:paperMap,bumpScale:.001});materials.push(labelMat);
    const label=mesh(movingRecord,new THREE.CircleGeometry(.52,64),labelMat,0,.03,0);label.rotation.x=-Math.PI/2;
    cyl(movingRecord,.035,.06,ivory,0,.045,0);
    deck.updateMatrixWorld(true);deck.localToWorld(positionPlayer.set(-.5,.90,0));
    movingRecord.position.set(3.1,.8,.15);movingRecord.rotation.z=-.12;
    if(reduced.matches){movingRecord.position.copy(positionPlayer);movingRecord.rotation.z=0;tonearm.rotation.y=-.61;playing=true;transitioning=false;render();return;}
    return new Promise<void>(resolve=>{
      const tl=gsap.timeline({onUpdate:render,onComplete:()=>{playing=true;transitioning=false;resolve();}});
      tl.to(movingRecord!.position,{x:positionPlayer.x,duration:1.45,ease:'power1.inOut'},0)
        .to(movingRecord!.position,{keyframes:[{y:1.45,z:.55,duration:.65,ease:'power1.out'},{y:positionPlayer.y,z:positionPlayer.z,duration:.8,ease:'power1.in'}]},0)
        .to(movingRecord!.rotation,{z:0,duration:1.45,ease:'power1.inOut'},0)
        .to(tonearm.rotation,{y:-.61,duration:.65,ease:'power2.inOut'},1.15);
    });
  }
  function dispose(){disposed=true;gsap.killTweensOf(tonearm.rotation);for(const sleeve of sleeves)gsap.killTweensOf(sleeve.object.position);observer.disconnect();renderer.setAnimationLoop(null);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',onMotionChange);scene.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();}});materials.forEach(m=>{const standard=m as THREE.MeshStandardMaterial;standard.map?.dispose();m.dispose();});coverTextures.forEach(t=>t.dispose());grooveTexture.dispose();deckText.dispose();brushedMap.dispose();paperMap.dispose();groovesMap.dispose();environment.dispose();renderer.dispose();}
  function reset(){playing=false;transitioning=false;hovered=null;if(movingRecord){scene.remove(movingRecord);movingRecord=null;}gsap.killTweensOf(tonearm.rotation);tonearm.rotation.y=.04;for(const sleeve of sleeves){gsap.killTweensOf(sleeve.object.position);sleeve.object.position.y=sleeve.restY;}render();}
  return {play,hoverAt,clearHover,hoverCollection,reset,dispose};
}
