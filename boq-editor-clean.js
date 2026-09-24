(()=>{
'use strict';
function setup(){
  const actions=document.querySelector('.top .actions');
  if(!actions)return;
  const projects=document.querySelector('#boqProjectsBtn');
  if(projects){projects.textContent='BOQ Projects';projects.href='boq-hub.html';}
  const account=document.querySelector('#boqAccountBtn');
  if(account)account.textContent='Account';
  document.querySelectorAll('#nusoqLegacyAccount').forEach(x=>x.remove());
  if(!document.querySelector('#boqMoreWrap')){
    const wrap=document.createElement('div');
    wrap.id='boqMoreWrap';wrap.className='boq-more-wrap';
    wrap.innerHTML='<button class="btn sec" id="boqMoreBtn" type="button" aria-haspopup="true" aria-expanded="false">More ···</button><div class="boq-more-menu" id="boqMoreMenu"><button class="danger" id="boqResetAction" type="button">Reset BOQ</button></div>';
    actions.append(wrap);
    const btn=wrap.querySelector('#boqMoreBtn'),menu=wrap.querySelector('#boqMoreMenu');
    btn.onclick=e=>{e.stopPropagation();const on=menu.classList.toggle('on');btn.setAttribute('aria-expanded',String(on));};
    wrap.querySelector('#boqResetAction').onclick=()=>{
      menu.classList.remove('on');btn.setAttribute('aria-expanded','false');
      const ok=confirm('Reset this BOQ? This will restore the current demo/project data and cannot be undone.');
      if(ok){const r=document.querySelector('#reset');if(r)r.click();}
    };
    document.addEventListener('click',e=>{if(!e.target.closest('#boqMoreWrap')){menu.classList.remove('on');btn.setAttribute('aria-expanded','false');}});
  }
}
const obs=new MutationObserver(setup);obs.observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('DOMContentLoaded',setup);setTimeout(setup,300);setTimeout(setup,900);setTimeout(setup,1800);
})();