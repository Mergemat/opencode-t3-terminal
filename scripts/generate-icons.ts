import { Resvg } from '@resvg/resvg-js';
import { mkdir } from 'node:fs/promises';
const names=['arrow-left','git-pull-request','search','folder','folder-plus','square-pen','settings','chart-no-axes-column','refresh-cw','clock','check','undo-2','arrow-up','square','paperclip','chevron-down','chevron-up','pin','git-branch','lock-keyhole-open','lock-keyhole','panel-left-close','circle-dashed','circle-alert'];
await mkdir(new URL('../assets/icons/',import.meta.url),{recursive:true});
for(const name of names){
 const svg=await Bun.file(new URL(`../node_modules/lucide-static/icons/${name}.svg`,import.meta.url)).text();
 const shape=svg.slice(svg.indexOf('>',svg.indexOf('<svg'))+1,svg.lastIndexOf('</svg>'));
 const png=new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shape}</svg>`, {font:{loadSystemFonts:false}}).render().asPng();
 await Bun.write(new URL(`../assets/icons/${name}.png`,import.meta.url),png);
}

for(const name of ['opencode','openai','anthropic','google']){
 const svg=(await Bun.file(new URL(`../assets/brands/${name}.svg`,import.meta.url)).text()).replace('<svg ', '<svg width="32" height="32" ');
 await Bun.write(new URL(`../assets/icons/${name}.png`,import.meta.url),new Resvg(svg, {font:{loadSystemFonts:false}}).render().asPng());
}
