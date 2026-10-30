import test from 'node:test';
import assert from 'node:assert/strict';
import {portfolio,newest,subscriberLabel,refreshYouTube,replaceSection,videoSection,card} from '../scripts/profile-lib.mjs';
const p=(id,kind='software')=>({id,name:id,kind,built:true});
test('portfolio deduplicates projects and separates kinds',()=>{
  const result=portfolio([p('a'),p('a'),p('b','hardware'),{...p('draft'),built:false}]);
  assert.equal(result.total,2);assert.equal(result.software,1);assert.equal(result.hardware,1);assert.equal(result.xp,200);assert.equal(result.rank,'Builder');assert.equal(result.next.name,'Engineer');assert.equal(result.progress,0);
});
test('rank boundaries and top rank',()=>{
  for(const [n,rank] of [[0,'Apprentice'],[1,'Apprentice'],[2,'Builder'],[4,'Builder'],[5,'Engineer'],[10,'Inventor'],[20,'Architect'],[25,'Architect']]) assert.equal(portfolio(Array.from({length:n},(_,i)=>p(String(i)))).rank,rank);
  assert.equal(portfolio(Array.from({length:20},(_,i)=>p(String(i)))).progress,1);
});
test('invalid project categories are rejected',()=>assert.throws(()=>portfolio([p('a','demo')])));
test('six newest distinct public video entries sorted by timestamp',()=>{
  const entries=Array.from({length:8},(_,i)=>({id:'abcdefghij'+i,title:'Video '+i,publishedAt:'2026-10-'+String(i+1).padStart(2,'0')+'T00:00:00Z'}));
  const result=newest([...entries,entries[7],{id:'invalid',title:'bad',publishedAt:'bad'}]);
  assert.equal(result.length,6);assert.equal(result[0].id,'abcdefghij7');assert.equal(result[5].id,'abcdefghij2');
});
test('hidden subscriber counts remain hidden',()=>assert.equal(subscriberLabel({hiddenSubscriberCount:true,subscriberCount:'999'}),'Hidden by channel'));
test('missing key preserves previous success and skips requests',async()=>{
  const old={status:'ready',updatedAt:'2026-10-01T00:00:00Z'};
  const result=await refreshYouTube(old,'',()=>{throw new Error('must not request');});assert.equal(result.data,old);assert.ok(result.warning);
});
test('API errors preserve previous videos, counts and timestamp',async()=>{
  const old={status:'ready',updatedAt:'2026-10-01T00:00:00Z',videos:[{id:'abcdefghij0'}],viewCount:'123'};
  const result=await refreshYouTube(old,'private-key',async()=>({ok:false}));assert.equal(result.data,old);assert.ok(!result.warning.includes('private-key'));
});
test('successful API response resolves handle and filters private videos',async()=>{
  const requests=[];const fixtures=[{items:[{id:'UCtest',statistics:{viewCount:'1234',subscriberCount:'123'},contentDetails:{relatedPlaylists:{uploads:'UUtest'}}}]},{items:[{contentDetails:{videoId:'abcdefghij0'}},{contentDetails:{videoId:'abcdefghij1'}}]},{items:[{id:'abcdefghij0',snippet:{title:'Public <build>',publishedAt:'2026-10-01T00:00:00Z'},status:{privacyStatus:'public'}},{id:'abcdefghij1',snippet:{title:'Private',publishedAt:'2026-10-02T00:00:00Z'},status:{privacyStatus:'private'}}]}];
  const result=await refreshYouTube({},'key',async url=>{requests.push(url);return {ok:true,json:async()=>fixtures.shift()};},new Date('2026-10-30T00:00:00Z'));
  assert.equal(result.warning,null);assert.equal(result.data.channelId,'UCtest');assert.equal(result.data.videos.length,1);assert.equal(result.data.updatedAt,'2026-10-30T00:00:00.000Z');assert.equal(requests[0].searchParams.get('forHandle'),'@Project-D-2026');
});
test('partial API failure does not overwrite successful cache',async()=>{
  let count=0;const old={status:'ready',viewCount:'456'};const result=await refreshYouTube(old,'key',async()=>++count===1?{ok:true,json:async()=>({items:[{id:'UCtest',statistics:{viewCount:'9',subscriberCount:'8'},contentDetails:{relatedPlaylists:{uploads:'UUtest'}}}]})}:{ok:false});assert.equal(result.data,old);
});
test('generated sections preserve authored biography and reject malformed markers',()=>{
  const original='Bio\n<!-- X:START -->\nold\n<!-- X:END -->\nFooter';assert.equal(replaceSection(original,'X','new'),'Bio\n<!-- X:START -->\nnew\n<!-- X:END -->\nFooter');assert.throws(()=>replaceSection('bio','X','new'));
});
test('initial state never invents YouTube counts',()=>assert.match(videoSection({status:'pending'}),/Awaiting first sync/));
test('SVG escapes titles and descriptions',()=>{const svg=card('<script>',['A & B']);assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('&lt;script&gt;'));assert.ok(svg.includes('A &amp; B'));});
