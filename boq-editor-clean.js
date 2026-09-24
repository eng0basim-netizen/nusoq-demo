(()=>{
'use strict';
let bound=false;
function currentStep(){return Number(document.querySelector('.screen.on')?.dataset.screen||1)}
function applyContext(){const n=currentStep();const more=document.querySelector('#boqMoreWrap');if(more)more.style.display=n===4?'block':'none';const ex=document.querySelector('#excelExportBtn'),pdf=document.querySelector('#pdfExportBtn');if(ex)ex.style.display=n===5?'inline-flex':'none';if(pdf)pdf.style.display=n===5?'inline-flex':'none'}
function setup(){
  const actions=document.querySelector('.top .actions');
  if(!actions)return false;
  document.querySelectorAll('#boqAccountBtn,#nusoqLegacyAccount,#boqHomeBtn').forEach(x=>x.remove());
  const projects=document.querySelector('#boqProjectsBtn');
  if(projects){if(projects.textContent!=='BOQ Projects')projects.textContent='BOQ Projects';if(projects.getAttribute('href')!=='boq-hub.html')projects.href='boq-hub.html'}
  if(!document.querySelector('#boqMoreWrap')){
    const wrap=document.createElement('div');wrap.id='boqMoreWrap';wrap.className='boq-more-wrap';
    wrap.innerHTML='<button class="btn sec" id="boqMoreBtn" type="button" aria-haspopup="true" aria-expanded="false">More ···</button><div class="boq-more-menu" id="boqMoreMenu"><button class="danger" id="boqResetAction" type="button">Reset BOQ</button></div>';
    actions.append(wrap);
    const btn=wrap.querySelector('#boqMoreBtn'),menu=wrap.querySelector('#boqMoreMenu');
    btn.onclick=e=>{e.stopPropagation();const on=menu.classList.toggle('on');btn.setAttribute('aria-expanded',String(on))};
    wrap.querySelector('#boqResetAction').onclick=()=>{menu.classList.remove('on');btn.setAttribute('aria-expanded','false');if(confirm('Reset this BOQ? This will restore the current project data and cannot be undone.')){const r=document.querySelector('#reset');if(r)r.click()}};
  }
  const badge=document.querySelector('.side .tool span');if(badge)badge.remove();
  applyContext();
  if(!bound){bound=true;document.addEventListener('click',e=>{const wrap=document.querySelector('#boqMoreWrap'),menu=document.querySelector('#boqMoreMenu'),btn=document.querySelector('#boqMoreBtn');if(wrap&&menu&&btn&&!e.target.closest('#boqMoreWrap')){menu.classList.remove('on');btn.setAttribute('aria-expanded','false')}if(e.target.closest('.step,.next,.prev'))setTimeout(applyContext,0)})}
  return true;
}
function init(){let tries=0;const timer=setInterval(()=>{tries++;if(setup()||tries>=20)clearInterval(timer)},120)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();