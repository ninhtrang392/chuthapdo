const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const M=require('../ban-do-so-model.js');
const ctx={window:{DigitalMapModel:M}};vm.createContext(ctx);for(const file of ['ban-do-so-locations.js','ban-do-so-data.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
(async()=>{const d=await ctx.window.DigitalMapSource.load();let checks=0;const check=(name,fn)=>{fn();checks++;console.log('PASS '+name)};const select=s=>M.select(d.records,s,d.context,d.units);let s=M.initialState();
check('All five layers default, only eligible positions count',()=>{const r=select(s);assert.equal(r.total,176);assert.equal(r.counts.volunteers,65);assert(!r.rows.some(x=>['outside-scope','no-coordinates','not-shared'].includes(x.id)))});
check('Administrative catalog has 34 provinces and 3321 wards',()=>{assert.equal(d.locations.length,34);assert.equal(d.locations.reduce((n,p)=>n+p.wards.length,0),3321)});
check('Outside working scope retains public layers only',()=>{s.province='79';const r=select(s);assert.equal(r.total,3);assert.equal(r.counts.volunteers,0);assert.equal(r.counts.clubs,0)});
check('Unit subtree includes clubs and their volunteers, not police/medical',()=>{s=M.initialState();s.unit='ward-382';const r=select(s);assert.equal(r.counts.offices,1);assert.equal(r.counts.clubs,2);assert.equal(r.counts.volunteers,22);assert.equal(r.counts.police,34)});
check('OR within skills and AND between geographic and skill filters',()=>{s=M.initialState();s.province='1';s.ward='382';s.skills=['Sơ cấp cứu','Sơ cứu tâm lý'];const r=select(s);assert(r.rows.filter(x=>x.layer==='volunteers').every(x=>x.ward==='382'&&x.skills.some(v=>s.skills.includes(v))));assert.equal(r.counts.clubs,2);assert(r.counts.volunteers>0&&r.counts.volunteers<22)});
check('Vietnamese search is case/diacritic insensitive',()=>{s=M.initialState();s.query='NGUYEN THANH MINH';const r=select(s);assert(r.total>0);assert(r.rows.every(x=>x.name.startsWith('Nguyễn Thanh Minh')))});
check('Phone search',()=>{s.query='0900 000 100';assert.equal(select(s).total,1)});
check('No layers selected produces zero total while retaining layer counts',()=>{s=M.initialState();s.layers.clear();const r=select(s);assert.equal(r.total,0);assert.equal(r.counts.offices,37)});
check('National context sees volunteer beyond local unit',()=>{s=M.initialState();const r=M.select(d.records,s,{unitId:'national',national:true},d.units);assert.equal(r.counts.volunteers,66)});
check('Order is layer first then Vietnamese name',()=>{const r=select(M.initialState());assert.equal(r.rows[0].layer,'offices');assert.equal(r.rows.at(-1).layer,'medical');for(let i=1;i<r.rows.length;i++){const a=r.rows[i-1],b=r.rows[i];if(a.layer===b.layer)assert(a.name.localeCompare(b.name,'vi')<=0)}});
check('Invalid coordinates and non-shared volunteer positions are excluded',()=>{assert(!M.validPosition({lat:null,lng:100}));assert(!M.validPosition({lat:91,lng:100}));assert(!M.validPosition({lat:20,lng:Infinity}));assert(!M.eligible({...d.records.find(x=>x.layer==='volunteers'),lastSeen:null},d.context,d.units))});
console.log(`${checks} business-rule checks passed`);
})();

