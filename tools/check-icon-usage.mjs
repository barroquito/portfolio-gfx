import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

async function pages(directory) {
  const files=[];
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const path=join(directory,entry.name);
    if(entry.isDirectory())files.push(...await pages(path));
    else if(entry.name.endsWith('.html'))files.push(path);
  }
  return files;
}

const files=await pages('dist');
let failed=false;
for(const file of files){
  const html=await readFile(file,'utf8');
  const counts=new Map();
  // Count the complete generated document, including closed dialogs and noscript.
  for(const match of html.matchAll(/\bclass\s*=\s*(["'])(.*?)\1/g)){
    for(const name of match[2].split(/\s+/)){
      if(name.startsWith('user-icon--'))counts.set(name,(counts.get(name)||0)+1);
    }
  }
  for(const [name,count] of counts){
    if(count>1){failed=true;console.error(`${relative('dist',file)}: ${name} occurs ${count} times (maximum: 1).`);}
  }
}
if(failed)process.exitCode=1;
else console.log(`Icon usage checked: ${files.length} pages, no repeated symbols.`);
