import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { gsap } from 'gsap';

export type RecordProject = {slug:string;title:string;number:string;subtitle:string;description?:string;intro?:string;theme:string;record:{color:string;ink:string;label:string}};
export type RecordScene = {
  openCollection:(index?:number)=>Promise<void>; closeCollection:()=>Promise<void>;
  select:(index:number)=>void; flip:(back:boolean)=>void; pick:(x:number,y:number)=>number|null;
  play:(project:RecordProject)=>Promise<void>; hoverAt:(x:number,y:number)=>void;
  clearHover:()=>void; hoverCollection:()=>void; reset:()=>void; dispose:()=>void;
};

export async function createRecordScene(host:HTMLElement, projects:RecordProject[],onProgress?:(value:number|null)=>void,initialHomeFrame?:{host:DOMRectReadOnly;table:DOMRectReadOnly}):Promise<RecordScene> {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Let Chrome select the available GPU. Some dual-GPU Macs cannot grant
  // a context when a particular power preference is requested.
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}
  catch{renderer=new THREE.WebGLRenderer({antialias:false,alpha:true});}
  let contextLost=false;
  let onContextLoss=()=>{};
  function loseContext(event:Event){event.preventDefault();contextLost=true;host.closest('.listening-table')?.classList.remove('scene-ready');host.dataset.renderState='context-lost';onContextLoss();}
  renderer.domElement.addEventListener('webglcontextlost',loseContext);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth<761?1.25:1.5));
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
  scene.environment=environment.texture;scene.environmentIntensity=.8;
  studio.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#fffdf4','#62675e',.55));
  const key = new THREE.DirectionalLight('#fff7e8',2.15);
  key.position.set(-4,10,6); key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);
  key.shadow.camera.left=-9; key.shadow.camera.right=9; key.shadow.camera.top=7; key.shadow.camera.bottom=-7;
  key.shadow.normalBias=.018; key.shadow.bias=-.00015; key.shadow.radius=4;
  scene.add(key);
  const fill=new THREE.DirectionalLight('#e4eadf',.4);fill.position.set(6,5,-4);scene.add(fill);
  RectAreaLightUniformsLib.init();
  const softbox=new THREE.RectAreaLight('#f4f7ff',3.5,5.5,1.2);softbox.position.set(-1,5,-2);softbox.lookAt(-1,0,0);scene.add(softbox);
  const strip=new THREE.RectAreaLight('#fff7ee',2,1.1,4);strip.position.set(5,4,2);strip.lookAt(2,0,0);scene.add(strip);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({color:'#252a24',opacity:.16}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.08;floor.receiveShadow=true;scene.add(floor);
  const materials:THREE.Material[]=[];
  function mat(color:string,metalness=0,roughness=.5){const m=new THREE.MeshStandardMaterial({color,metalness,roughness});materials.push(m);return m;}
  // Fine deterministic surface maps keep metal, paper and vinyl physically distinct.
  function surfaceMap(kind:'brushed'|'paper'|'grooves'){
    const size=512,data=new Uint8Array(size*size*4);let seed=47;
    function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
    for(let y=0;y<size;y++){const line=random()*19;for(let x=0;x<size;x++){
      const radius=Math.hypot(x-size/2,y-size/2);
      const value=kind==='brushed'?170+line+random()*12:kind==='paper'?225+random()*30:128+Math.sin(radius*1.8)*22;
      const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
    }}
    const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;return t;
  }
  const brushedMap=surfaceMap('brushed'),paperMap=surfaceMap('paper'),groovesMap=surfaceMap('grooves');
  paperMap.repeat.set(3,3);
  const dark=new THREE.MeshPhysicalMaterial({color:'#0b0f12',metalness:0,roughness:.24,clearcoat:1,clearcoatRoughness:.12});
  const ivory=mat('#f1f1e5',0,.9);materials.push(dark);
  async function loadImage(src:string):Promise<HTMLImageElement|null>{try{return await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});}catch{return null;}}
  const [logoImage,redLogoImage,bulkImage,personalCover]=await Promise.all([loadImage('/brand/jorge-mark.svg'),loadImage('/brand/jorge-mark-red.svg'),loadImage('/images/bulk-drink.webp'),loadImage('/images/sobre-mi-cover.svg')]);
  function mesh(parent:THREE.Object3D, geometry:THREE.BufferGeometry, material:THREE.Material|THREE.Material[],x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(parent:THREE.Object3D,w:number,h:number,d:number,material:THREE.Material,x=0,y=0,z=0,r=.03){return mesh(parent,new RoundedBoxGeometry(w,h,d,3,r),material,x,y,z);}
  function cyl(parent:THREE.Object3D,r:number,h:number,material:THREE.Material,x=0,y=0,z=0){return mesh(parent,new THREE.CylinderGeometry(r,r,h,80),material,x,y,z);}
  function texture(canvas:HTMLCanvasElement){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
  function textCanvas(width:number,height:number,draw:(ctx:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');draw(ctx);return texture(c);}
  const printFont='"Inter Variable", sans-serif';
  const deck=new THREE.Group();deck.position.set(-2.85,0,0);deck.rotation.y=.085;scene.add(deck);
  const grooveTexture=textCanvas(1024,1024,ctx=>{
    ctx.fillStyle='#080b0d';ctx.fillRect(0,0,1024,1024);
    for(let i=120;i<506;i+=3){ctx.beginPath();ctx.arc(512,512,i,0,Math.PI*2);ctx.strokeStyle=i%2?'#232b20':'#1c231a';ctx.lineWidth=1;ctx.stroke();}
    ctx.fillStyle='#f1f1e5';ctx.beginPath();ctx.arc(512,512,102,0,Math.PI*2);ctx.fill();
    if(logoImage)ctx.drawImage(logoImage,437,461,150,93);else{ctx.fillStyle='#232b20';ctx.textAlign='center';ctx.font=`600 48px ${printFont}`;ctx.fillText('JP',512,520);}
  });
  const matPrint=new THREE.MeshPhysicalMaterial({map:grooveTexture,metalness:0,roughness:.2,bumpMap:groovesMap,bumpScale:.0016,clearcoat:1,clearcoatRoughness:.12,anisotropy:.45,envMapIntensity:1.6});materials.push(matPrint);
  let tonearm:THREE.Object3D;
  const modelMaterials=new Map<THREE.Material,THREE.Material>();
  try{
    const model=await new GLTFLoader().loadAsync('/models/tocadiscos.glb?v=metal-02',event=>onProgress?.(event.lengthComputable?event.loaded/event.total:null));
    const modelArm=model.scene.getObjectByName('TONEARM_PIVOT');
    if(!modelArm)throw new Error('Turntable arm pivot is missing');
    model.scene.traverse(object=>{if(object instanceof THREE.Mesh){
      object.castShadow=true;object.receiveShadow=true;
      const source=Array.isArray(object.material)?object.material:[object.material];
      object.material=source.map(material=>{
        if(modelMaterials.has(material))return modelMaterials.get(material)!;
        const m=material as THREE.MeshStandardMaterial;
        if(m.metalness>.7){
          const physical=new THREE.MeshPhysicalMaterial({color:m.color,map:m.map,metalness:.97,roughness:m.roughness,roughnessMap:brushedMap,bumpMap:brushedMap,bumpScale:.0015,anisotropy:.55,envMapIntensity:1.15});
          modelMaterials.set(material,physical);material.dispose();materials.push(physical);return physical;
        }
        if(!materials.includes(material))materials.push(material);return material;
      });
      if(source.length===1)object.material=object.material[0];
    }});
    deck.add(model.scene);tonearm=modelArm;tonearm.rotation.y=.04;
  }catch(error){renderer.dispose();environment.dispose();host.replaceChildren();throw error;}
  // Each cover is generated from the same project metadata as the accessible carousel.
  const coverTextures=projects.map(p=>textCanvas(1024,1024,ctx=>{
    if(p.theme==='personal'&&personalCover){ctx.drawImage(personalCover,0,0,1024,1024);return;}
    ctx.fillStyle=p.record.color;ctx.fillRect(0,0,1024,1024);
    if(p.theme==='bulk'&&bulkImage){const scale=Math.max(1024/bulkImage.width,1024/bulkImage.height);const w=bulkImage.width*scale,h=bulkImage.height*scale;ctx.drawImage(bulkImage,(1024-w)/2,(1024-h)/2,w,h);}
    ctx.fillStyle=p.record.ink;ctx.strokeStyle=p.record.ink;ctx.lineWidth=2;
    ctx.font=`600 22px ${printFont}`;ctx.fillText('JORGE PINDADO',70,85);ctx.textAlign='right';ctx.fillText(`JP—${p.number}`,954,85);ctx.textAlign='left';ctx.beginPath();ctx.moveTo(70,120);ctx.lineTo(954,120);ctx.stroke();
    if(p.theme==='bulk'){ctx.fillStyle='#20352e';ctx.font=`600 90px ${printFont}`;ctx.fillText('BULK®',70,230);ctx.font=`600 30px ${printFont}`;ctx.fillText('COMER BIEN. SUBIR EL VOLUMEN.',70,843);}
    else if(p.theme==='one-more'){ctx.strokeStyle='#b6a0d3';ctx.save();ctx.translate(512,510);ctx.rotate(-.6);for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,660-i*50,270-i*45,0,0,Math.PI*2);ctx.stroke();}ctx.restore();ctx.fillStyle=p.record.ink;ctx.save();ctx.translate(70,385);ctx.rotate(-.1);ctx.font=`600 270px ${printFont}`;ctx.fillText('ONE',0,0);ctx.fillText('MORE',0,240);ctx.restore();ctx.font=`600 24px ${printFont}`;ctx.fillText('THE 2000s ARE CALLING.',70,840);}
    else if(p.theme==='li-onna'){ctx.globalAlpha=.45;ctx.beginPath();ctx.arc(840,465,310,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(840,465,240,0,Math.PI*2);ctx.stroke();ctx.font='300px serif';ctx.fillText('酒',690,575);ctx.globalAlpha=1;ctx.font=`500 180px ${printFont}`;ctx.fillText('Entre',65,490);ctx.font=`650 175px ${printFont}`;ctx.fillText('dos almas.',65,675);ctx.font=`600 24px ${printFont}`;ctx.fillText('LI-ONNA / CATA DE SAKES',70,840);}
    else if(p.slug==='sobre-mi'||p.theme==='personal'){
      ctx.fillStyle='#f5f4ef';ctx.fillRect(0,145,1024,730);
      if(redLogoImage)ctx.drawImage(redLogoImage,130,295,764,474);
      ctx.fillStyle='#ce3024';ctx.font=`600 26px ${printFont}`;ctx.fillText('SOBRE MÍ / EL PORTFOLIO',70,840);
    }
    else {ctx.save();ctx.globalAlpha=.2;ctx.translate(512,512);ctx.rotate(-.4);for(let i=-700;i<700;i+=30){ctx.fillRect(-900,i,1800,3);}ctx.restore();ctx.save();ctx.transform(1,0,-.2,1,90,0);ctx.font=`600 460px ${printFont}`;ctx.fillText('F1',80,650);ctx.font=`600 130px ${printFont}`;ctx.fillText('WEEK',80,788);ctx.restore();}
    ctx.fillStyle=p.record.ink;ctx.font=`600 18px ${printFont}`;ctx.fillText(p.record.label,70,956);ctx.textAlign='right';ctx.fillText('33⅓ RPM / SIDE A',954,956);
    // Print grain lives in the albedo as well as the paper bump/roughness maps.
    const print=ctx.getImageData(0,0,1024,1024);let seed=781;
    for(let i=0;i<print.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const grain=((seed>>>24)-128)/32;print.data[i]+=grain;print.data[i+1]+=grain;print.data[i+2]+=grain;}
    ctx.putImageData(print,0,0);
  }));
  // The reverse is a separate printed face. It shares the same source copy as
  // the HTML controls, so a canvas never becomes the only way to read a project.
  const backTextures=projects.map(p=>textCanvas(1024,1024,ctx=>{
    ctx.fillStyle='#f5f4ef';ctx.fillRect(0,0,1024,1024);
    ctx.fillStyle='#181a17';ctx.font='600 25px '+printFont;
    ctx.fillText('JORGE PINDADO',70,88);ctx.textAlign='right';ctx.fillText('JP—'+p.number+' / LADO B',954,88);ctx.textAlign='left';
    ctx.strokeStyle='#181a1733';ctx.beginPath();ctx.moveTo(70,124);ctx.lineTo(954,124);ctx.stroke();
    ctx.fillStyle='#ce3024';ctx.font='700 '+(p.title.length>10?69:86)+'px '+printFont;ctx.fillText(p.title.toUpperCase(),70,250,884);
    ctx.fillStyle='#181a17';ctx.font='450 48px '+printFont;
    const words=(p.description||p.intro||p.subtitle).split(/\s+/);let line='',y=370;
    for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>865&&line){ctx.fillText(line,70,y);y+=63;line=word;}else line=next;}
    if(line)ctx.fillText(line,70,y);
    ctx.font='600 23px '+printFont;ctx.fillText(p.record.label,70,940,800);
  }));
  const stack=new THREE.Group();stack.position.set(3.05,.10,0);scene.add(stack);
  type Sleeve={object:THREE.Group;index:number;home:THREE.Vector3;homeQuaternion:THREE.Quaternion;rank:number;hit:THREE.Mesh;progress:number;turn:number};
  const sleeves:Sleeve[]=[];
  const hitMeshes:THREE.Mesh[]=[];
  for(let i=0;i<projects.length;i++){
    const p=projects[i],sleeve=new THREE.Group();
    sleeve.position.set((i-1)*.07,.10+(projects.length-i)*.105,(i-1)*.035);
    sleeve.rotation.y=[-.12,.10,-.18,.22][i%4];stack.add(sleeve);
    const edge=mat(p.record.color,0,.86);
    box(sleeve,3.12,.095,3.12,edge,0,0,0,.018);
    const frontMat=new THREE.MeshStandardMaterial({map:coverTextures[i],color:'#d4d4d4',metalness:0,roughness:.9,roughnessMap:paperMap,bumpMap:paperMap,bumpScale:.004,envMapIntensity:.3});materials.push(frontMat);
    const front=mesh(sleeve,new THREE.PlaneGeometry(3.10,3.10),frontMat,0,.049,0);front.rotation.x=-Math.PI/2;
    // Avoid tone mapping the printed reverse so its small text stays legible.
    const backMat=new THREE.MeshBasicMaterial({map:backTextures[i],toneMapped:false});materials.push(backMat);
    const back=mesh(sleeve,new THREE.PlaneGeometry(3.10,3.10),backMat,0,-.049,0);back.rotation.set(Math.PI/2,0,Math.PI);
    front.userData.recordIndex=i;back.userData.recordIndex=i;hitMeshes.push(front,back);
    sleeves.push({object:sleeve,index:i,home:sleeve.position.clone().add(stack.position),homeQuaternion:sleeve.quaternion.clone(),rank:projects.length-i-1,hit:front,progress:0,turn:0});
  }
  // Once home coordinates are captured, world-space siblings make orbit paths
  // and the extraction path independent of the old stack transform.
  for(const sleeve of sleeves){scene.attach(sleeve.object);sleeve.object.position.copy(sleeve.home);}
  const loose=new THREE.Group();loose.position.set(3.82,.43,-.15);scene.add(loose);
  cyl(loose,1.4,.035,dark);
  const looseGrooves=mesh(loose,new THREE.CircleGeometry(1.39,96),matPrint,0,.022,0);looseGrooves.rotation.x=-Math.PI/2;

  // Reuse a single flying record. Changing projects replaces only its label map.
  const movingRecord=new THREE.Group();movingRecord.visible=false;scene.add(movingRecord);
  cyl(movingRecord,1.60,.04,dark);
  const grooves=mesh(movingRecord,new THREE.CircleGeometry(1.595,96),matPrint,0,.025,0);grooves.rotation.x=-Math.PI/2;
  const labelMat=new THREE.MeshStandardMaterial({color:'#ffffff',metalness:0,roughness:.95,bumpMap:paperMap,bumpScale:.001});materials.push(labelMat);
  const label=mesh(movingRecord,new THREE.CircleGeometry(.52,64),labelMat,0,.03,0);label.rotation.x=-Math.PI/2;
  cyl(movingRecord,.035,.06,ivory,0,.045,0);

  type SceneMode='home'|'opening'|'collection'|'closing'|'playing';
  let mode:SceneMode='home',activeIndex=0,orbitTarget=0,disposed=false,visible=!document.hidden,playing=false;
  let hovered:'deck'|'stack'|null=null,backRequested=false;
  const layout={collection:0,orbit:0,flip:0,focus:0,flight:0,needle:0,hoverStack:0,hoverDeck:0};
  const tau=Math.PI*2,step=tau/projects.length;
  const wrap=(index:number)=>((index%projects.length)+projects.length)%projects.length;
  const smooth=(value:number)=>{const t=THREE.MathUtils.clamp(value,0,1);return t*t*(3-2*t);};
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),hitPoint=new THREE.Vector3();
  const cameraTarget=new THREE.Vector3(),orbitPosition=new THREE.Vector3();
  const facing=new THREE.Quaternion(),yaw=new THREE.Quaternion();
  const upright=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2);
  const vertical=new THREE.Vector3(0,1,0),flightStartQuaternion=new THREE.Quaternion(),flightEndQuaternion=new THREE.Quaternion();
  const flightCurve=new THREE.CubicBezierCurve3(new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3());
  const flightPosition=new THREE.Vector3();
  let renderFrame=0,previous=0,lastStats=0,renderedFrames=0;
  let ownedTransition:gsap.core.Timeline|null=null,settleTransition:(()=>void)|null=null;
  let orbitTween:gsap.core.Tween|null=null,flipTween:gsap.core.Tween|null=null,hoverTween:gsap.core.Tween|null=null;
  let homeRect=initialHomeFrame?.host||host.getBoundingClientRect();
  const table=host.closest<HTMLElement>('.listening-table')!;
  let homeTableRect=initialHomeFrame?.table||table.getBoundingClientRect();
  let width=host.clientWidth,height=host.clientHeight;

  function updateData(){
    host.dataset.sceneMode=mode;host.dataset.activeRecord=projects[activeIndex]?.slug||'';
    host.dataset.recordFace=sleeves[activeIndex]?.turn>.5?'back':'front';
  }
  function render(){
    if(disposed||!visible||contextLost||renderFrame)return;
    renderFrame=requestAnimationFrame(time=>{
      renderFrame=0;if(disposed||!visible||contextLost)return;
      if(playing&&!reduced.matches){const delta=previous?Math.min((time-previous)/1000,.05):0;movingRecord.rotation.y+=delta*1.9;}
      previous=time;renderer.render(scene,camera);renderedFrames++;
      if(time-lastStats>500){host.dataset.renderedFrames=String(renderedFrames);host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.triangles=String(renderer.info.render.triangles);lastStats=time;}
      if(playing&&!reduced.matches)render();
    });
  }
  function liveHomeFrame(){
    const rect=table.getBoundingClientRect();
    const sx=homeTableRect.width?rect.width/homeTableRect.width:1,sy=homeTableRect.height?rect.height/homeTableRect.height:1;
    return {left:rect.left+(homeRect.left-homeTableRect.left)*sx,top:rect.top+(homeRect.top-homeTableRect.top)*sy,width:homeRect.width*sx,height:homeRect.height*sy};
  }
  function applyCamera(){
    const bounds=host.getBoundingClientRect(),home=liveHomeFrame();
    const homeWidth=Math.max(window.innerWidth<761?13.1:15.4,(home.width/Math.max(1,home.height))*4.65);
    const units=homeWidth/Math.max(1,home.width);
    const startWidth=units*width,startHeight=units*height;
    const offsetX=(bounds.left+width/2-home.left-home.width/2)*units;
    const offsetY=(home.top+home.height/2-bounds.top-height/2)*units;
    const portrait=width/height<.85,ratio=width/Math.max(1,height);
    const safe=host.ownerDocument.querySelector<HTMLElement>('.orbit-stage')?.getBoundingClientRect();
    const safeWidth=safe&&safe.width>0?safe.width:width;
    const safeHeight=safe&&safe.height>0?safe.height:height;
    const collectionWidth=portrait?Math.max(9.4*width/safeWidth,8.8*width/safeHeight):Math.max(15.8*width/safeWidth,6.4*width/safeHeight);
    const safeOffsetX=safe?(width/2-safe.left-safe.width/2):0;
    const safeOffsetY=safe?(safe.top+safe.height/2-height/2):0;
    const focusWidth=portrait?8.5:Math.max(8.8,ratio*7.1);
    const blend=Math.max(layout.collection,layout.focus);
    const endWidth=THREE.MathUtils.lerp(collectionWidth,focusWidth,layout.focus);
    const viewWidth=THREE.MathUtils.lerp(startWidth,endWidth,blend);
    const viewHeight=THREE.MathUtils.lerp(startHeight,endWidth/ratio,blend);
    const safeUnits=collectionWidth/Math.max(1,width);
    const cx=offsetX*(1-blend)+safeOffsetX*safeUnits*layout.collection*(1-layout.focus),cy=offsetY*(1-blend)+safeOffsetY*safeUnits*layout.collection*(1-layout.focus);
    camera.left=cx-viewWidth/2;camera.right=cx+viewWidth/2;camera.top=cy+viewHeight/2;camera.bottom=cy-viewHeight/2;
    const targetY=THREE.MathUtils.lerp(.7,.5,layout.focus)*blend;
    cameraTarget.set(0,targetY,0);
    camera.position.set(0,THREE.MathUtils.lerp(10.7,9.5,blend),THREE.MathUtils.lerp(10.7,12.8,blend));
    camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  }
  function applyLayout(){
    if(disposed)return;
    applyCamera();
    const portrait=width/height<.85;
    const deckBlend=Math.max(layout.collection,layout.focus);
    deck.position.x=THREE.MathUtils.lerp(-2.85,0,deckBlend);
    for(const sleeve of sleeves){
      // A short stagger lets each jacket leave the pile separately, without
      // chaining pauses between lift, turn and arrival.
      const delay=sleeve.index*.045;
      const progress=smooth((layout.collection-delay)/(1-delay));sleeve.progress=progress;
      const angle=(sleeve.index-layout.orbit)*step;
      const front=Math.pow(Math.max(0,Math.cos(angle)),3);
      const radiusX=portrait?3.45:6.05,radiusZ=portrait?5.2:2.65;
      orbitPosition.set(Math.sin(angle)*radiusX-(portrait?0:4.05)*front,1.55-front*.35,Math.cos(angle)*radiusZ);
      sleeve.object.position.lerpVectors(sleeve.home,orbitPosition,progress);
      sleeve.object.position.y+=Math.sin(progress*Math.PI)*1.1+(1-progress)*layout.hoverStack*sleeve.rank*.18;
      // During playback the jackets retreat while the actual record stays in view.
      sleeve.object.position.x+=Math.sin(angle)*layout.focus*1.8;
      sleeve.object.position.y-=layout.focus*.7;
      yaw.setFromAxisAngle(vertical,Math.sin(angle)*-.22+sleeve.turn*Math.PI);
      facing.copy(camera.quaternion).multiply(yaw).multiply(upright);
      sleeve.object.quaternion.slerpQuaternions(sleeve.homeQuaternion,facing,progress);
      const orbitScale=THREE.MathUtils.lerp(portrait?.59:.74,portrait?1.24:1.08,front);
      const scale=THREE.MathUtils.lerp(1,orbitScale,progress)*(1-layout.focus*.82);
      sleeve.object.scale.setScalar(scale);sleeve.object.visible=scale>.03;
    }
    loose.scale.setScalar(1-layout.collection*.95-layout.focus*.05);loose.visible=layout.collection<.96&&layout.focus<.8;
    tonearm.rotation.y=THREE.MathUtils.lerp(.04,-.61,layout.needle)-layout.hoverDeck*.26;
    if(mode==='playing'&&!playing){
      flightCurve.getPoint(layout.flight,flightPosition);movingRecord.position.copy(flightPosition);
      movingRecord.quaternion.slerpQuaternions(flightStartQuaternion,flightEndQuaternion,smooth(layout.flight));
    }
    scene.updateMatrixWorld(true);updateData();render();
  }
  function stopTransition(){
    ownedTransition?.kill();ownedTransition=null;
    const resolve=settleTransition;settleTransition=null;resolve?.();
  }
  function stopTweens(){
    stopTransition();orbitTween?.kill();flipTween?.kill();hoverTween?.kill();for(const sleeve of sleeves)gsap.killTweensOf(sleeve);orbitTween=flipTween=hoverTween=null;
  }
  function animate(build:(timeline:gsap.core.Timeline)=>void,complete:()=>void):Promise<void>{
    stopTransition();
    return new Promise(resolve=>{
      settleTransition=resolve;
      ownedTransition=gsap.timeline({onUpdate:applyLayout,onComplete:()=>{ownedTransition=null;settleTransition=null;complete();applyLayout();resolve();}});
      build(ownedTransition);
      if(reduced.matches)ownedTransition?.progress(1);
    });
  }
  function resize(){
    if(disposed)return;
    const bounds=host.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
    // Parent expands the same canvas synchronously before openCollection/play.
    // Never replace the saved home frame with that fullscreen rectangle.
    if(mode==='home'&&!document.body.classList.contains('collection-open')){homeRect=bounds;homeTableRect=table.getBoundingClientRect();}
    width=bounds.width;height=bounds.height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.innerWidth<761?1.25:1.5));
    renderer.setSize(width,height);applyLayout();
  }
  function clearHover(){setHover(null);}
  function setHover(next:'deck'|'stack'|null){
    if(disposed||mode!=='home'||reduced.matches)next=null;if(next===hovered)return;hovered=next;
    hoverTween?.kill();hoverTween=gsap.to(layout,{hoverStack:next==='stack'?1:0,hoverDeck:next==='deck'?1:0,duration:.6,ease:'power2.out',onUpdate:applyLayout});
  }
  deck.updateMatrixWorld(true);loose.updateMatrixWorld(true);
  const deckBounds=new THREE.Box3().setFromObject(deck),stackBounds=new THREE.Box3();
  for(const sleeve of sleeves){sleeve.object.updateMatrixWorld(true);stackBounds.expandByObject(sleeve.object);}
  stackBounds.union(new THREE.Box3().setFromObject(loose));stackBounds.max.y+=1;
  function setPointer(x:number,y:number){
    const bounds=renderer.domElement.getBoundingClientRect();
    if(!bounds.width||!bounds.height||x<bounds.left||x>bounds.right||y<bounds.top||y>bounds.bottom)return false;
    pointer.set((x-bounds.left)/bounds.width*2-1,-((y-bounds.top)/bounds.height)*2+1);raycaster.setFromCamera(pointer,camera);return true;
  }
  function hoverAt(x:number,y:number){
    if(mode!=='home'||!setPointer(x,y)){clearHover();return;}
    setHover(raycaster.ray.intersectBox(deckBounds,hitPoint)?'deck':raycaster.ray.intersectBox(stackBounds,hitPoint)?'stack':null);
  }
  function hoverCollection(){setHover('stack');}
  function pick(x:number,y:number){
    if(mode!=='collection'||contextLost||!setPointer(x,y))return null;
    const hit=raycaster.intersectObjects(hitMeshes,false)[0];return hit?Number(hit.object.userData.recordIndex):null;
  }
  async function openCollection(index=0){
    if(disposed||contextLost)return;
    stopTweens();backRequested=false;for(const sleeve of sleeves)sleeve.turn=0;activeIndex=wrap(index);layout.orbit=orbitTarget=activeIndex;layout.flip=0;layout.focus=0;layout.hoverDeck=layout.hoverStack=0;playing=false;movingRecord.visible=false;
    mode='opening';resize();
    return animate(timeline=>{timeline.to(layout,{collection:1,duration:1.55,ease:'power2.inOut'});},()=>{mode='collection';});
  }
  async function closeCollection(){
    if(disposed)return;
    stopTweens();playing=false;mode='closing';layout.flip=0;movingRecord.visible=false;for(const sleeve of sleeves)gsap.to(sleeve,{turn:0,duration:reduced.matches?0:.6,onUpdate:applyLayout});
    return animate(timeline=>{timeline.to(layout,{collection:0,focus:0,needle:0,duration:1.1,ease:'power2.inOut'});},()=>{mode='home';layout.orbit=activeIndex=0;});
  }
  function select(index:number){
    if(mode!=='collection'||disposed)return;
    const next=wrap(index);if(next===activeIndex)return;backRequested=false;
    for(const sleeve of sleeves)gsap.to(sleeve,{turn:0,duration:reduced.matches?0:.55,ease:'power2.inOut',overwrite:true,onUpdate:applyLayout});layout.flip=0;
    let delta=next-activeIndex;
    if(delta>projects.length/2)delta-=projects.length;if(delta<-projects.length/2)delta+=projects.length;
    const target=orbitTarget+delta;orbitTarget=target;activeIndex=next;
    orbitTween?.kill();orbitTween=gsap.to(layout,{orbit:target,duration:reduced.matches?0:.85,ease:'power3.out',onUpdate:applyLayout,onComplete:()=>{layout.orbit=orbitTarget=next;applyLayout();}});
    updateData();
  }
  function flip(back:boolean){
    if(mode!=='collection'||disposed)return;
    backRequested=back;const sleeve=sleeves[activeIndex];gsap.killTweensOf(sleeve);flipTween=gsap.to(sleeve,{turn:back?1:0,duration:reduced.matches?0:.8,ease:'power2.inOut',onUpdate:applyLayout});
  }
  function setLabel(p:RecordProject){
    labelMat.map?.dispose();
    labelMat.map=textCanvas(512,512,ctx=>{
      ctx.fillStyle=p.record.color;ctx.fillRect(0,0,512,512);ctx.fillStyle=p.record.ink;ctx.textAlign='center';
      ctx.font='600 21px '+printFont;ctx.fillText('JORGE PINDADO',256,100);
      ctx.font='600 '+(p.title.length>7?47:65)+'px '+printFont;ctx.fillText(p.title.toUpperCase(),256,225,440);
      ctx.font='18px '+printFont;ctx.fillText('JP—'+p.number+' / LADO A',256,345);ctx.fillText('33⅓ RPM',256,385);
    });labelMat.needsUpdate=true;
  }
  async function play(p:RecordProject){
    if(disposed||contextLost)return;
    stopTweens();layout.hoverDeck=layout.hoverStack=0;layout.flip=0;
    activeIndex=Math.max(0,projects.findIndex(project=>project.slug===p.slug));
    // Finish an interrupted orbit at the selected jacket before extracting it.
    if(layout.collection>.5){layout.orbit=activeIndex;layout.collection=1;}
    mode='playing';playing=false;layout.flight=0;layout.needle=0;resize();
    const sleeve=sleeves[activeIndex];
    flightCurve.v0.copy(sleeve.object.position);flightStartQuaternion.copy(sleeve.object.quaternion);
    const end=new THREE.Vector3(-.5,.90,0).applyQuaternion(deck.quaternion);
    flightCurve.v3.copy(end);
    flightCurve.v1.copy(flightCurve.v0).add(new THREE.Vector3(1.9,2,.7));
    flightCurve.v2.copy(end).add(new THREE.Vector3(1.2,3,1.8));
    movingRecord.position.copy(flightCurve.v0);movingRecord.quaternion.copy(flightStartQuaternion);movingRecord.visible=true;setLabel(p);
    return animate(timeline=>{
      timeline.to(layout,{focus:1,duration:1.9,ease:'power2.inOut'},0)
        .to(layout,{flight:1,duration:2.15,ease:'power1.inOut'},0)
        .to(layout,{needle:1,duration:.65,ease:'power2.inOut'},1.8);
    },()=>{playing=true;previous=0;movingRecord.position.copy(flightCurve.v3);movingRecord.quaternion.identity();render();});
  }
  function reset(){
    if(disposed)return;
    stopTweens();playing=false;mode='home';activeIndex=orbitTarget=0;hovered=null;backRequested=false;previous=0;
    Object.assign(layout,{collection:0,orbit:0,flip:0,focus:0,flight:0,needle:0,hoverStack:0,hoverDeck:0});
    movingRecord.visible=false;for(const sleeve of sleeves)sleeve.turn=0;resize();
  }
  function visibility(){
    visible=!document.hidden;previous=0;
    if(!visible){if(renderFrame)cancelAnimationFrame(renderFrame);renderFrame=0;ownedTransition?.pause();orbitTween?.pause();flipTween?.pause();hoverTween?.pause();for(const sleeve of sleeves)gsap.getTweensOf(sleeve).forEach(tween=>tween.pause());}
    else{ownedTransition?.resume();orbitTween?.resume();flipTween?.resume();hoverTween?.resume();for(const sleeve of sleeves)gsap.getTweensOf(sleeve).forEach(tween=>tween.resume());render();}
  }
  function onMotionChange(){
    if(reduced.matches){ownedTransition?.progress(1);orbitTween?.progress(1);flipTween?.progress(1);for(const sleeve of sleeves)gsap.getTweensOf(sleeve).forEach(tween=>tween.progress(1));hoverTween?.kill();layout.hoverDeck=layout.hoverStack=0;}
    applyLayout();
  }
  function restoreContext(){
    if(disposed)return;contextLost=false;host.dataset.renderState='ready';host.closest('.listening-table')?.classList.add('scene-ready');resize();
  }
  function dispose(){
    if(disposed)return;
    stopTweens();disposed=true;playing=false;observer.disconnect();if(renderFrame)cancelAnimationFrame(renderFrame);renderFrame=0;
    document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',onMotionChange);
    renderer.domElement.removeEventListener('webglcontextlost',loseContext);renderer.domElement.removeEventListener('webglcontextrestored',restoreContext);
    const geometries=new Set<THREE.BufferGeometry>(),allMaterials=new Set<THREE.Material>(materials),textures=new Set<THREE.Texture>([...coverTextures,...backTextures,grooveTexture,brushedMap,paperMap,groovesMap]);
    scene.traverse(object=>{if(object instanceof THREE.Mesh){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material])allMaterials.add(material);}});
    for(const material of allMaterials){const m=material as THREE.MeshStandardMaterial;for(const t of [m.map,m.normalMap,m.roughnessMap,m.metalnessMap,m.bumpMap,m.aoMap])if(t)textures.add(t);material.dispose();}
    geometries.forEach(geometry=>geometry.dispose());textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();
  }
  onContextLoss=()=>{
    stopTweens();playing=false;if(renderFrame)cancelAnimationFrame(renderFrame);renderFrame=0;
    if(mode==='opening'){layout.collection=1;mode='collection';}
    if(mode==='closing'){layout.collection=layout.focus=layout.needle=0;mode='home';}
    layout.orbit=orbitTarget=activeIndex;
    for(const sleeve of sleeves)sleeve.turn=sleeve.index===activeIndex&&backRequested?1:0;
    applyLayout();
  };
  const observer=new ResizeObserver(resize);observer.observe(host);
  const safeStage=host.ownerDocument.querySelector('.orbit-stage');if(safeStage)observer.observe(safeStage);resize();
  let compileTimer:ReturnType<typeof setTimeout>|undefined;
  await Promise.race([renderer.compileAsync(scene,camera),new Promise<void>(resolve=>{compileTimer=setTimeout(resolve,4000);})]).finally(()=>clearTimeout(compileTimer));
  if(contextLost||renderer.getContext().isContextLost()){dispose();throw new Error('WEBGL_CONTEXT_LOST');}
  renderer.render(scene,camera);host.closest('.listening-table')?.classList.add('scene-ready');host.dataset.renderState='ready';
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',onMotionChange);renderer.domElement.addEventListener('webglcontextrestored',restoreContext);
  return {openCollection,closeCollection,select,flip,pick,play,hoverAt,clearHover,hoverCollection,reset,dispose};
}
