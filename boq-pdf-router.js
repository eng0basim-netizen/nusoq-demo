(()=>{
'use strict';
let realPdf=null;
let ready=false;

function toastMsg(msg){
  try{ if(typeof window.toast==='function') return window.toast(msg); }catch(e){}
  alert(msg);
}

function captureRealExporter(){
  const b=document.querySelector('#pdfExportBtn');
  if(!b || typeof b.onclick!=='function') return false;
  const fn=b.onclick;
  const name=String(fn.name||'');
  if(name!=='generateRealPdf') return false;
  realPdf=fn;
  window.NUSOQ_REAL_PDF=fn;
  ready=true;
  b.textContent='PDF';
  return true;
}

function ensureReady(){
  if(ready && typeof realPdf==='function') return true;
  return captureRealExporter();
}

function runPdf(){
  if(!ensureReady()){
    toastMsg('PDF engine is loading. Please try again in a moment.');
    return;
  }
  realPdf();
}

function runProjectPdf(button){
  const card=button.closest('.workspace-project');
  if(!card){ runPdf(); return; }
  const open=card.querySelector('[data-open]');
  if(open) open.click();
  setTimeout(runPdf,120);
}

document.addEventListener('click',e=>{
  const target=e.target.closest && e.target.closest('button');
  if(!target) return;
  const isTop=target.id==='pdfExportBtn';
  const isProjectPdf=target.classList.contains('sketch-export') && /^pdf$/i.test((target.textContent||'').trim());
  if(!isTop && !isProjectPdf) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  if(isProjectPdf) runProjectPdf(target); else runPdf();
},true);

const timer=setInterval(()=>{
  if(captureRealExporter()) clearInterval(timer);
},100);
setTimeout(()=>clearInterval(timer),10000);
})();