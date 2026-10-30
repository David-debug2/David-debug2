import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {portfolio,refreshYouTube,subscriberLabel,replaceSection,card,videoSection,escapeXml} from './profile-lib.mjs';
const root = new URL('../',import.meta.url);
const read = async p => readFile(new URL(p,root),'utf8');
const write = async (p,text) => {if(await read(p).catch(()=>null)!==text) await writeFile(new URL(p,root),text);};
const projects = portfolio(JSON.parse(await read('data/projects.json')));
const previous = JSON.parse(await read('data/youtube.json'));
const {data:youtube,warning} = await refreshYouTube(previous,process.env.YOUTUBE_API_KEY);
if(warning) console.warn(warning);
await mkdir(new URL('assets/',root),{recursive:true});
await write('data/youtube.json',JSON.stringify(youtube,null,2)+'\n');
const rankLine = projects.next ? projects.xp+' / '+projects.next.xp+' XP to '+projects.next.name : projects.xp+' XP — highest rank reached';
await write('assets/rank.svg',card('PERSONAL RANK // '+projects.rank,[projects.xp+' XP',rankLine,'100 XP per verified built project'],'#ffbf60',projects.progress));
const totals = projects.software+' software · '+projects.hardware+' hardware · '+projects.total+' total';
await write('assets/projects.svg',card('VERIFIED PORTFOLIO',[totals,...projects.entries.map(p=>p.name)]));
const ytLines = youtube.status==='ready' ? ['Subscribers: '+subscriberLabel(youtube),'Total channel views: '+youtube.viewCount,'Updated: '+youtube.updatedAt.slice(0,10)+' UTC'] : ['Subscribers: Awaiting first sync','Total channel views: Awaiting first sync'];
await write('assets/youtube.svg',card('PROJECT D // YOUTUBE',ytLines));
for(const [slug,label] of [['javascript','JavaScript'],['typescript','TypeScript'],['html','HTML'],['css','CSS'],['sql','SQL']]) {
  const width=30+label.length*9;
  await write('assets/'+slug+'.svg','<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="32" role="img" aria-label="'+label+'"><rect x=".5" y=".5" width="'+(width-1)+'" height="31" rx="7" fill="#0d1522" stroke="#314359"/><text x="'+width/2+'" y="21" text-anchor="middle" fill="#39d9df" font-family="Segoe UI,Arial,sans-serif" font-size="14">'+label+'</text></svg>\n');
}
let readme=await read('README.md');
readme=replaceSection(readme,'VIDEOS',videoSection(youtube));
readme=replaceSection(readme,'STATS','![Personal rank: '+projects.rank+', '+projects.xp+' XP](assets/rank.svg)\n\n![Verified portfolio: '+totals+'](assets/projects.svg)\n\n![YouTube channel stats](assets/youtube.svg)\n\n**Personal rank:** '+projects.rank+' · '+projects.xp+' XP · '+rankLine+'.\n\n**Verified portfolio entries:** '+totals+'.\n\n'+ytLines.join(' · ')+(youtube.status==='ready'?'\n\nSubscriber counts use YouTube’s public reporting precision.':''));
await write('README.md',readme);
