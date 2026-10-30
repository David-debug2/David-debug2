export const ranks = [{name:'Apprentice',xp:0},{name:'Builder',xp:200},{name:'Engineer',xp:500},{name:'Inventor',xp:1000},{name:'Architect',xp:2000}];
export const escapeXml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function portfolio(projects) {
  if (!Array.isArray(projects)) throw new Error('Project registry must be an array');
  const unique = new Map();
  for (const p of projects) {
    if (!p.id || !p.name || !['software','hardware'].includes(p.kind) || typeof p.built !== 'boolean') throw new Error('Invalid project entry');
    if (p.built) unique.set(p.id,p);
  }
  const entries = [...unique.values()];
  const xp = entries.length * 100;
  const rank = ranks.findLast(r => xp >= r.xp);
  const next = ranks.find(r => r.xp > xp);
  return {entries,total:entries.length,software:entries.filter(p=>p.kind==='software').length,hardware:entries.filter(p=>p.kind==='hardware').length,xp,rank:rank.name,next,progress:next ? (xp-rank.xp)/(next.xp-rank.xp) : 1};
}
export function newest(videos) {
  return [...new Map(videos.filter(v=> /^[A-Za-z0-9_-]{11}$/.test(v.id) && typeof v.title === 'string' && Number.isFinite(Date.parse(v.publishedAt))).map(v=>[v.id,v])).values()].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||a.id.localeCompare(b.id)).slice(0,6);
}
export function subscriberLabel(data) {return data.hiddenSubscriberCount ? 'Hidden by channel' : data.subscriberCount ?? 'Unavailable';}
export async function fetchYouTube(key, request = fetch, now = new Date()) {
  if (!key) return null;
  async function api(resource,params) {
    const url = new URL('https://www.googleapis.com/youtube/v3/'+resource);
    Object.entries({...params,key}).forEach(([k,v])=>url.searchParams.set(k,v));
    let response;
    try { response = await request(url,{signal:AbortSignal.timeout(20000)}); } catch {throw new Error('YouTube request failed');}
    if (!response.ok) throw new Error('YouTube API request rejected');
    return response.json();
  }
  const channels = await api('channels',{part:'snippet,statistics,contentDetails',forHandle:'@Project-D-2026'});
  const channel = channels.items?.[0];
  const stats = channel?.statistics;
  const uploads = channel?.contentDetails?.relatedPlaylists?.uploads;
  if (!channel?.id || !uploads || !stats || !/^\d+$/.test(stats.viewCount) || (!stats.hiddenSubscriberCount && !/^\d+$/.test(stats.subscriberCount))) throw new Error('Incomplete channel response');
  const list = await api('playlistItems',{part:'contentDetails',playlistId:uploads,maxResults:'50'});
  if (!Array.isArray(list.items)) throw new Error('Incomplete uploads response');
  const ids = list.items.map(v=>v.contentDetails?.videoId).filter(Boolean);
  const details = ids.length ? await api('videos',{part:'snippet,status',id:ids.join(',')}) : {items:[]};
  if (!Array.isArray(details.items)) throw new Error('Incomplete video response');
  const videos = newest(details.items.filter(v=>v.status?.privacyStatus==='public').map(v=>({id:v.id,title:v.snippet?.title,publishedAt:v.snippet?.publishedAt})));
  return {status:'ready',handle:'@Project-D-2026',channelUrl:'https://www.youtube.com/@Project-D-2026',channelId:channel.id,updatedAt:now.toISOString(),subscriberCount:stats.hiddenSubscriberCount ? null : stats.subscriberCount,hiddenSubscriberCount:!!stats.hiddenSubscriberCount,viewCount:stats.viewCount,videos};
}
export async function refreshYouTube(previous,key,request=fetch,now=new Date()) {
  if (!key) return {data:previous,warning:'YOUTUBE_API_KEY is missing; YouTube data was preserved.'};
  try {return {data:await fetchYouTube(key,request,now),warning:null};}
  catch {return {data:previous,warning:'YouTube refresh failed; last successful data was preserved.'};}
}
export function replaceSection(readme,name,body) {
  const start='<!-- '+name+':START -->',end='<!-- '+name+':END -->';
  if (readme.split(start).length !== 2 || readme.split(end).length !== 2 || readme.indexOf(start)>readme.indexOf(end)) throw new Error('Missing or duplicate README markers');
  return readme.slice(0,readme.indexOf(start)+start.length)+'\n'+body+'\n'+readme.slice(readme.indexOf(end));
}
export function card(title,lines,accent='#39d9df',progress=null) {
  const height = 76 + lines.length*30 + (progress===null?0:28);
  return '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="'+height+'" viewBox="0 0 480 '+height+'" role="img" aria-labelledby="title desc"><title id="title">'+escapeXml(title)+'</title><desc id="desc">'+escapeXml(lines.join('. '))+'</desc><rect x="1" y="1" width="478" height="'+(height-2)+'" rx="14" fill="#0d1522" stroke="#314359"/><path d="M22 22h28" stroke="'+accent+'" stroke-width="3"/><g font-family="Segoe UI,Arial,sans-serif"><text x="22" y="54" fill="'+accent+'" font-size="20" font-weight="700">'+escapeXml(title)+'</text>'+lines.map((line,i)=>'<text x="22" y="'+(86+i*30)+'" fill="#e6edf3" font-size="15">'+escapeXml(line)+'</text>').join('')+'</g>'+(progress===null?'':'<rect x="22" y="'+(height-30)+'" width="436" height="8" rx="4" fill="#263449"/><rect x="22" y="'+(height-30)+'" width="'+Math.round(436*Math.max(0,Math.min(1,progress)))+'" height="8" rx="4" fill="'+accent+'"/>')+'</svg>\n';
}
export function videoSection(data) {
  if (data.status!=='ready') return 'Awaiting first sync. [Watch Project D on YouTube](https://www.youtube.com/@Project-D-2026).';
  const links = newest(data.videos).map(v=>'[![Video thumbnail](https://i.ytimg.com/vi/'+v.id+'/mqdefault.jpg)](https://www.youtube.com/watch?v='+v.id+')\n\n['+escapeXml(v.title).replace(/[\[\]\\]/g,'\\$&')+'](https://www.youtube.com/watch?v='+v.id+')');
  return (links.length?links.join('\n\n'):'No public uploads found.')+'\n\nUpdated: '+data.updatedAt.slice(0,10)+' (UTC).';
}
