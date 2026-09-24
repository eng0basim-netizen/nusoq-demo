(()=>{
'use strict';
const KEY='nusoq-boq-final-v1';
const ORDER=['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','21','22','23','26','27','28','31','32','33','OTHER'];
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
function order(d){const i=ORDER.indexOf(d);return i<0?999:i}
function code(i,n,d){return String(i.importedCode||i.itemCode||i.code||'').trim()||((d==='OTHER'?'99':String(d||'00').padStart(2,'0'))+'01'+String(n).padStart(2,'0'))}
function entries(){const s=state(),counts={};return [...(s.items||[])].sort((a,b)=>order(a.division||'OTHER')-order(b.division||'OTHER')||(Number(a.id)||0)-(Number(b.id)||0)).map(i=>{const d=i.division||'OTHER';counts[d]=(counts[d]||0)+1;return{item:i,code:code(i,counts[d],d)}})}
function patchTable(table){if(!table)return;const es=entries();let idx=0;[...table.querySelectorAll('tbody tr')].forEach(r=>{if(r.classList.contains('secrow')||r.classList.contains('scopeRow'))return;const c=r.cells&&r.cells[0],x=es[idx++];if(c&&x&&c.textContent!==x.code){c.textContent=x.code;c.style.fontFamily='ui-monospace,SFMono-Regular,Menlo,monospace';c.style.fontWeight='800';c.style.whiteSpace='nowrap'}});const th=table.querySelector('thead th:first-child');if(th&&th.textContent!=='Item Code')th.textContent='Item Code'}
function patchAll(){patchTable(document.querySelector('.boq'));document.querySelectorAll('.ptable').forEach(patchTable)}
let scheduled=false;const obs=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;patchAll()})});
function start(){const targets=[document.querySelector('#body'),document.querySelector('#paperIn'),document.querySelector('#paperIn2')].filter(Boolean);targets.forEach(t=>obs.observe(t,{childList:true,subtree:true}));patchAll();setTimeout(patchAll,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();