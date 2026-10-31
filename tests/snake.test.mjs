import test from 'node:test';
import assert from 'node:assert/strict';
import {styleSnake} from '../scripts/style-snake.mjs';

function fixture() {
  const weeks = Array.from({length:53},()=>({contributionDays:[]}));
  const first = Date.UTC(2025,9,26);
  const cells = [];
  for (let i=0;i<370;i++) {
    const date = new Date(first+i*86400000);
    const x = Math.floor(i/7), y = date.getUTCDay();
    weeks[x].contributionDays.push({date:date.toISOString().slice(0,10),weekday:y});
    cells.push('<rect class="c" x="'+(2+x*16)+'" y="'+(2+y*16)+'"/>');
  }
  return {weeks,svg:'<svg viewBox="-16 -32 880 192" width="880" height="192"><style>@keyframes snake{to{transform:translate(16px,0)}}.s{fill:#58a6ff;animation:snake 1s infinite}</style>'+cells.join('')+'<rect class="s" width="12" height="12"/></svg>'};
}

test('calendar frame preserves the real animation and every contribution cell',()=>{
  const {svg,weeks} = fixture();
  const output = styleSnake(svg,weeks);
  assert.ok(output.includes('@keyframes snake{to{transform:translate(16px,0)}}'));
  assert.equal((output.match(/<rect class="c"/g) ?? []).length,370);
  assert.ok(output.includes('width="733" height="144"'));
  assert.ok(output.includes('>Nov</text>'));
  assert.ok(output.includes('>Mon</text>'));
  assert.ok(output.includes('>Fri</text>'));
  assert.ok(output.includes('>Less</text>'));
  assert.ok(output.includes('>More</text>'));
  assert.ok(output.includes('.u{display:none}'));
});

test('mismatched calendar data and changed upstream geometry are rejected before publishing',()=>{
  const {svg,weeks} = fixture();
  assert.throws(()=>styleSnake(svg.replace('<rect class="c" x="2" y="2"/>',''),weeks),/align/);
  assert.throws(()=>styleSnake(svg.replace('880 192','880 200'),weeks),/layout/);
  weeks[0].contributionDays[0].weekday = 4;
  assert.throws(()=>styleSnake(svg,weeks),/alignment/);
});
