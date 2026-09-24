(()=>{
'use strict';
let bound=false;
function setup(){
  const actions=document.querySelector('.top .actions');
  if(!actions)return false;

  const projects=document.querySelector('#boqProjectsBtn');
  if(projects){
    if(projects.textContent!=='BOQ Projects')projects.textContent='BOQ Projects';
    if(projects.getAttribute('href')!=='boq-hub.html')projects.href='boq-hub.html';
  }

  const account=document.querySelector('#boqAccountBtn');
  if(account&&account.textContent!=='Account')account.textContent='Account';
  document.querySelectorAll('#nusoqLegacyAccount').forEach(x=>x.remove());

  if(!document.querySelector('#boqMoreWrap')){
    const wrap=document.createElement('div');
    wrap.id='boqMoreWrap';
    wrap.className='boq-more-wrap';
    wrap.innerHTML='<button class="btn sec" id="boqMoreBtn" type="button" aria-haspopup="true" aria-expanded="false">More ···</button><div class="boq-more-menu" id="boqMoreMenu"><button class="danger" id="boqResetAction" type="button">Reset BOQ</button></div>';
    actions.append(wrap);

    const btn=wrap.querySelector('#boqMoreBtn');
    const menu=wrap.querySelector('#boqMoreMenu');
    btn.onclick=e=>{
      e.stopPropagation();
      const on=menu.classList.toggle('on');
      btn.setAttribute('aria-expanded',String(on));
    };
    wrap.querySelector('#boqResetAction').onclick=()=>{
      menu.classList.remove('on');
      btn.setAttribute('aria-expanded','false');
      if(confirm('Reset this BOQ? This will restore the current demo/project data and cannot be undone.')){
        const r=document.querySelector('#reset');
        if(r)r.click();
      }
    };
  }

  if(!bound){
    bound=true;
    document.addEventListener('click',e=>{
      const wrap=document.querySelector('#boqMoreWrap');
      const menu=document.querySelector('#boqMoreMenu');
      const btn=document.querySelector('#boqMoreBtn');
      if(wrap&&menu&&btn&&!e.target.closest('#boqMoreWrap')){
        menu.classList.remove('on');
        btn.setAttribute('aria-expanded','false');
      }
    });
  }
  return true;
}

function init(){
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(setup()||tries>=20)clearInterval(timer);
  },150);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();