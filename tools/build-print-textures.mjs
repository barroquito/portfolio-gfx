import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
const out=new URL('../public/textures/',import.meta.url);
await mkdir(out,{recursive:true});
let seed=220426;
const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
// These are baked once: no animated noise or live SVG filter in the page.
const size=768,paper=Buffer.alloc(size*size*3),wear=Buffer.alloc(size*size*4,255);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=y*size+x;
  const cloud=Math.sin(x*.016+Math.cos(y*.021))*1.8+Math.sin(y*.027)*1.4;
  const grain=(random()-.5)*10+cloud;
  paper[i*3]=232+grain;paper[i*3+1]=230+grain;paper[i*3+2]=222+grain;
  const r=random();wear[i*4+3]=r<.025?35:r<.07?170:255;
}
// Short fibres and broken ink flecks, rather than a uniform digital noise field.
for(let n=0;n<1100;n++){
  const x=Math.floor(random()*size),y=Math.floor(random()*size),length=2+Math.floor(random()*6),value=215+random()*12;
  for(let j=0;j<length;j++){
    const i=((y+(j%3===0?1:0))%size)*size+(x+j)%size;
    paper[i*3]=value;paper[i*3+1]=value-1;paper[i*3+2]=value-5;
    if(n%3===0)wear[i*4+3]=100;
  }
}
await sharp(paper,{raw:{width:size,height:size,channels:3}}).webp({quality:85}).toFile(fileURLToPath(new URL('paper.webp',out)));
await sharp(wear,{raw:{width:size,height:size,channels:4}}).png().toFile(fileURLToPath(new URL('ink-wear.png',out)));
// Large, sparse patina. Transparent centre keeps text and object materials clear.
const w=1600,h=1100,patina=Buffer.alloc(w*h*4);
for(let n=0;n<56000;n++){
  const x=Math.floor(random()*w),y=Math.floor(random()*h),edge=Math.min(x/w,1-x/w,y/h,1-y/h);
  if(random()>Math.max(.025,.22-edge))continue;
  const i=(y*w+x)*4;
  patina[i]=55;patina[i+1]=48;patina[i+2]=40;patina[i+3]=25+random()*70;
}
await sharp(patina,{raw:{width:w,height:h,channels:4}}).webp({quality:75}).toFile(fileURLToPath(new URL('patina.webp',out)));
console.log('Baked paper, ink wear and patina textures.');
