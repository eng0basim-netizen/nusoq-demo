const navItems=[...document.querySelectorAll('.nav-item[data-page]')];
const pages=[...document.querySelectorAll('.page')];
function goTo(id){
  pages.forEach(p=>p.classList.toggle('active',p.id===id));
  navItems.forEach(n=>n.classList.toggle('active',n.dataset.page===id));
  window.scrollTo({top:0,behavior:'smooth'});
  const side=document.getElementById('sidebar'); if(side) side.classList.remove('open');
}
navItems.forEach(n=>n.addEventListener('click',()=>goTo(n.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(el=>el.addEventListener('click',()=>goTo(el.dataset.goto)));
const menuBtn=document.getElementById('menuBtn');if(menuBtn)menuBtn.addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
const modal=document.getElementById('licenseModal');
['activateBtn','activateBtn2','activateBtn3','activateBtn4'].forEach(id=>{const b=document.getElementById(id);if(b&&modal)b.addEventListener('click',()=>modal.classList.add('show'))});
const close=document.getElementById('closeModal');if(close)close.addEventListener('click',()=>modal.classList.remove('show'));
if(modal)modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('show')});
const confirm=document.getElementById('confirmActivate');if(confirm)confirm.addEventListener('click',()=>{const input=document.getElementById('licenseInput');if(!input.value.trim()){input.style.borderColor='#d92d20';input.focus();return;}confirm.textContent='License activated ✓';confirm.style.background='#0d6b58';setTimeout(()=>modal.classList.remove('show'),900)});