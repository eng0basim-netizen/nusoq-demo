(()=>{
'use strict';
const KEY='nusoq-boq-final-v1';
const DIV_ORDER=['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','21','22','23','26','27','28','31','32','33','OTHER'];
const state=()=>{try{return typeof S!=='undefined'?S:JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
const order=d=>{const i=DIV_ORDER.indexOf(d);return i<0?999:i};
const generated=(d,n)=>(d==='OTHER'?'99':String(d||'00').padStart(2,'0'))+'01'+String(n).padStart(2,'0');
function sortedItems(){const s=state();return [...(s.items||[])].sort((a,b)=>((s.breakdown||'entire')==='entire'?0:String(a.scope||'').localeCompare(String(b.scope||'')))||order(a.division)-order(b.division)||(Number(a.id)||0)-(Number(b.id)||0))}
function entries(){const counts={};return sortedItems().map(i=>{const d=i.division||'OTHER';counts[d]=(counts[d]||0)+1;return {item:i,code:(i.importedCode&&String(i.importedCode).trim())?String(i.importedCode).trim():generated(d,counts[d])}})}
function valAmount(i){if(i.imported&&i.sourceAmount!==undefined&&String(i.sourceAmount).trim()!=='')return String(i.sourceAmount);return Number((+i.qty||0)*(+i.rate||0)).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function valQty(i){return i.imported&&i.sourceQty!==undefined&&String(i.sourceQty).trim()!==''?String(i.sourceQty):Number(i.qty||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function valRate(i){return i.imported&&i.sourceRate!==undefined&&String(i.sourceRate).trim()!==''?String(i.sourceRate):Number(i.rate||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function patchTable(table){if(!table)return;const es=entries();let idx=0;[...table.querySelectorAll('tbody tr')].forEach(r=>{if(r.classList.contains('secrow')||r.classList.contains('scopeRow'))return;const e=es[idx++];if(!e||!r.cells)return;const cells=r.cells;if(cells[0]){cells[0].textContent=e.code;cells[0].style.fontFamily='ui-monospace,SFMono-Regular,Menlo,monospace';cells[0].style.fontWeight='800';cells[0].style.whiteSpace='nowrap'}if(cells.length>=6){cells[3].textContent=valQty(e.item);cells[4].textContent=valRate(e.item);cells[5].textContent=valAmount(e.item)}});const th=table.querySelector('thead th:first-child');if(th)th.textContent='Item Code'}
function patchAll(){patchTable(document.querySelector('.boq'));document.querySelectorAll('.ptable').forEach(patchTable)}
let busy=false;const obs=new MutationObserver(()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{patchAll();busy=false})});
function start(){document.querySelectorAll('#body,.ptable tbody').forEach(t=>obs.observe(t,{childList:true,subtree:true,characterData:true}));patchAll();setInterval(patchAll,900)}
setTimeout(start,700);
})();