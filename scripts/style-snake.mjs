import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export const snakeColors = ['#161b22','#ffd19a','#d97706','#a84b00','#e3df52'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function styleSnake(svg,weeks) {
  if (!Array.isArray(weeks) || weeks.length<50 || weeks.length>54) throw new Error('Unexpected contribution calendar');
  const dates = new Set();
  const points = new Set();
  const labels = [];
  weeks.forEach((week,x)=>{
    if (!Array.isArray(week.contributionDays) || !week.contributionDays.length) throw new Error('Missing calendar dates');
    for (const day of week.contributionDays) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date)) throw new Error('Invalid calendar date');
      const date = new Date(day.date+'T00:00:00Z');
      if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==day.date || date.getUTCDay()!==day.weekday || dates.has(day.date)) throw new Error('Invalid calendar alignment');
      dates.add(day.date);
      points.add(x+','+day.weekday);
      if (date.getUTCDate()===1) labels.push({x:38+x*13,label:months[date.getUTCMonth()]});
    }
  });
  const cells = [...svg.matchAll(/<rect class="c(?: [^"]*)?" x="(\d+)" y="(\d+)"/g)];
  const actualPoints = new Set(cells.map(m=>(Number(m[1])-2)/16+','+(Number(m[2])-2)/16));
  if (cells.length!==points.size || actualPoints.size!==points.size || [...points].some(p=>!actualPoints.has(p))) throw new Error('SVG and calendar dates do not align');
  if (!/^<svg\b[^>]*viewBox="-16 -32 \d+ 192"/.test(svg) || !svg.endsWith('</svg>')) throw new Error('Unexpected upstream SVG layout');
  if (labels.length && labels[0].x>64) labels.unshift({x:38,label:months[new Date(weeks[0].contributionDays[0].date+'T00:00:00Z').getUTCMonth()]});
  const width = 44+weeks.length*13;
  const inner = svg.replace(/^<svg\b[^>]*>/,'').replace(/<\/svg>$/,'');
  const monthText = labels.map(m=>'<text x="'+m.x+'" y="20">'+m.label+'</text>').join('');
  const dayText = [[1,'Mon'],[3,'Wed'],[5,'Fri']].map(([row,label])=>'<text x="31" y="'+(34+row*13)+'" text-anchor="end">'+label+'</text>').join('');
  const legendX = width-156;
  const legend = snakeColors.map((color,i)=>'<rect x="'+(legendX+30+i*13)+'" y="125" width="10" height="10" rx="2" fill="'+color+'"/>').join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="144" viewBox="0 0 '+width+' 144" role="img" aria-labelledby="snake-title snake-description"><title id="snake-title">GitHub contribution snake</title><desc id="snake-description">Actual GitHub contributions arranged by week, with amber contribution levels and an animated snake.</desc><rect width="100%" height="100%" fill="#0d1117"/><defs><clipPath id="calendar-grid"><rect x="36" y="24" width="'+(width-40)+'" height="92"/></clipPath></defs><g clip-path="url(#calendar-grid)"><g transform="translate(36.375 24.375) scale(.8125)">'+inner+'</g></g><style>.u{display:none}.c{stroke:none}.calendar-labels{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;font-size:11px;fill:#c9d1d9}.calendar-footer{fill:#8b949e;font-size:10px}</style><g class="calendar-labels">'+monthText+dayText+'<g class="calendar-footer"><text x="33" y="134">GitHub contributions</text><text x="'+legendX+'" y="134">Less</text>'+legend+'<text x="'+(legendX+100)+'" y="134">More</text></g></g></svg>\n';
}

async function main() {
  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  const token = process.env.GITHUB_TOKEN;
  if (!/^[A-Za-z0-9-]+$/.test(owner ?? '') || !token) throw new Error('Workflow GitHub identity is missing');
  const response = await fetch('https://api.github.com/graphql',{
    method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','User-Agent':'project-d-snake'},
    body:JSON.stringify({query:'query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date weekday}}}}}}',variables:{login:owner}}),
    signal:AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error('Contribution calendar request failed');
  const result = await response.json();
  if (result.errors?.length) throw new Error('Contribution calendar response failed');
  const weeks = result.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  const files = ['dist/github-snake.svg','dist/github-snake-dark.svg'];
  const styled = await Promise.all(files.map(async file=>styleSnake(await readFile(file,'utf8'),weeks)));
  await mkdir('styled',{recursive:true});
  await Promise.all(files.map((file,i)=>writeFile(file.replace('dist/','styled/'),styled[i])));
}

if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  await main().catch(error=>{console.error('Snake calendar styling failed: '+(error instanceof Error?error.message:'unknown error')+'. Existing published output was not replaced.');process.exitCode=1;});
}
