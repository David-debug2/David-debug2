import {writeFile,appendFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export function calendarTheme(calendar) {
  if (!Array.isArray(calendar?.colors) || ![4,5].includes(calendar.colors.length) ||
      !calendar.colors.every(color=>/^#[0-9a-f]{6}$/i.test(color)) ||
      typeof calendar.isHalloween!=='boolean') throw new Error('Invalid GitHub calendar theme');
  return {colors:calendar.colors.map(color=>color.toLowerCase()),
    // Keep the accepted dark canvas and empty cells; use GitHub's live intensity colors.
    dots:['#161b22',...(calendar.colors.length===5?calendar.colors.slice(1):calendar.colors).map(color=>color.toLowerCase())],
    isHalloween:calendar.isHalloween};
}

async function main() {
  const owner=process.env.GITHUB_REPOSITORY_OWNER, token=process.env.GITHUB_TOKEN;
  if (!/^[A-Za-z0-9-]+$/.test(owner??'') || !token || !process.env.GITHUB_OUTPUT) throw new Error('Workflow GitHub identity/output is missing');
  const response=await fetch('https://api.github.com/graphql',{
    method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','User-Agent':'project-d-snake'},
    body:JSON.stringify({query:'query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{colors isHalloween weeks{contributionDays{date weekday}}}}}}',variables:{login:owner}}),
    signal:AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error('Contribution calendar request failed');
  const result=await response.json();
  if (result.errors?.length) throw new Error('Contribution calendar response failed');
  const calendar=result.data?.user?.contributionsCollection?.contributionCalendar;
  console.log('GitHub source theme: '+JSON.stringify({colors:calendar?.colors,isHalloween:calendar?.isHalloween}));
  const theme=calendarTheme(calendar);
  await writeFile('snake-calendar.json',JSON.stringify({calendar,theme:{...theme,fetchedAt:new Date().toISOString()}}));
  await appendFile(process.env.GITHUB_OUTPUT,'dots='+theme.dots.join(',')+'\n');
  console.log('GitHub calendar palette: '+theme.colors.join(',')+'; Halloween: '+theme.isHalloween);
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  await main().catch(error=>{console.error('Snake theme selection failed: '+error.message+'. Existing published output was not replaced.');process.exitCode=1;});
}
