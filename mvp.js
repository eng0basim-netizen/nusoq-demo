(()=>{
'use strict';
const KEY='nusoq-mvp-account-v1';
const TEAM_KEY='nusoq-mvp-team-v1';
const MODE_KEY='nusoq-workspace-mode';
const TOOLS={
  boq:{name:'BOQ Creator',href:'boq-hub.html'},
  specs:{name:'Specifications',href:'specs.html'},
  cost:{name:'Cost Control',href:'cost-control.html'},
  tasks:{name:'My Tasks',href:'tasks.html'},
  reports:{name:'Daily Report',href:'plans.html?tool=reports'},
  dashboard:{name:'Smart Dashboard',href:'plans.html?tool=dashboard'},
  formatter:{name:'BOQ Formatting',href:'plans.html?tool=formatter'},
  cad:{name:'CAD Takeoff',href:'#'}
};
const defaults={
  mode:'personal',
  user:{name:'Basim Alzahrani',email:'eng0basim@gmail.com',initials:'BA'},
  personal:{active:true,license:'NSQ-P-DEMO-001',tools:['boq','specs','cost','tasks']},
  business:{active:true,license:'NSQ-B-DEMO-001',company:'Nusoq Demo Engineering',seats:6,role:'Owner',tools:['boq','specs','cost','tasks']},
  sallaUrl:'',
  lastUpdated:new Date().toISOString()
};
const defaultTeam=[
  {id:'u1',name:'Basim Alzahrani',email:'eng0basim@gmail.com',role:'Owner',status:'active',tools:['boq','specs','cost','tasks']},
  {id:'u2',name:'Architect User',email:'architect@example.com',role:'Member',status:'active',tools:['boq','specs','tasks']},
  {id:'u3',name:'Mechanical User',email:'mechanical@example.com',role:'Member',status:'active',tools:['boq','specs','cost','tasks']},
  {id:'u4',name:'Structural User',email:'structural@example.com',role:'Member',status:'active',tools:['boq','specs','tasks']}
];
const clone=o=>JSON.parse(JSON.stringify(o));
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return Object.assign(clone(defaults),x||{})}catch(e){return clone(defaults)}}
function save(a){a.lastUpdated=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(a));localStorage.setItem(MODE_KEY,a.mode)}
function account(){const a=load();const m=localStorage.getItem(MODE_KEY);if(m==='personal'||m==='business')a.mode=m;return a}
function mode(){return account().mode}
function setMode(m){if(!['personal','business'].includes(m))return;const a=account();a.mode=m;save(a);document.dispatchEvent(new CustomEvent('nusoq:mode',{detail:m}));syncShell();}
function workspace(){const a=account();return a[a.mode]}
function hasTool(tool){const w=workspace();return !!(w&&w.active&&(w.tools||[]).includes(tool))}
function status(tool){if(tool==='cad')return 'soon';return hasTool(tool)?'active':'plan'}
function team(){try{return JSON.parse(localStorage.getItem(TEAM_KEY)||'null')||clone(defaultTeam)}catch(e){return clone(defaultTeam)}}
function saveTeam(t){localStorage.setItem(TEAM_KEY,JSON.stringify(t))}
function initials(n){return String(n||'U').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'U'}
function shellHtml(){const a=account(),w=workspace(),business=a.mode==='business';return `<header class="global-head"><div class="head-left"><a class="brand" href="index.html"><span class="brand-mark">N</span>NUSOQ</a><a class="home-link" href="index.html">⌂ Home</a><div class="workspace-switch"><button data-mode="personal" class="${a.mode==='personal'?'on':''}">Personal</button><button data-mode="business" class="${a.mode==='business'?'on':''}">Business</button></div></div><div class="head-right"><div class="user-wrap"><button class="user-btn" id="nusoqUserBtn"><span class="avatar">${a.user.initials||initials(a.user.name)}</span><span class="user-meta"><strong>${business?(w.company||'Business Workspace'):a.user.name}</strong><span>${business?(w.role||'Member')+' • '+(w.active?'Active':'Inactive'): 'Personal • '+(w.active?'Active':'Inactive')}</span></span></button><div class="user-menu" id="nusoqUserMenu"><a href="account.html">Account & licenses</a>${business?'<a href="team.html">Team management</a>':''}<a href="plans.html">Subscription plans</a><button data-action="activate">Activate serial</button><hr><button data-action="logout">Sign out</button></div></div></div></header>`}
function mountShell(){document.querySelectorAll('[data-nusoq-shell]').forEach(el=>el.innerHTML=shellHtml());bindShell();}
function bindShell(){document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));const u=document.querySelector('#nusoqUserBtn'),m=document.querySelector('#nusoqUserMenu');if(u&&m)u.onclick=e=>{e.stopPropagation();m.classList.toggle('on')};document.addEventListener('click',e=>{if(m&&!e.target.closest('.user-wrap'))m.classList.remove('on')},{once:false});document.querySelectorAll('[data-action="activate"]').forEach(b=>b.onclick=showActivation);document.querySelectorAll('[data-action="logout"]').forEach(b=>b.onclick=()=>alert('Sign out will connect to Supabase Auth in the production version.'));}
function syncShell(){mountShell();syncToolCards();syncModeBlocks()}
function syncToolCards(){document.querySelectorAll('[data-tool]').forEach(card=>{const t=card.dataset.tool,s=status(t);card.dataset.state=s;card.classList.toggle('active',s==='active');const badge=card.querySelector('.badge');if(badge){badge.className='badge '+s;badge.textContent=s==='active'?'ACTIVE':s==='plan'?'PLAN REQUIRED':'COMING SOON'}const action=card.querySelector('[data-tool-action]');if(action){action.textContent=s==='active'?'Open →':s==='plan'?'View plans':'Soon'}if(s==='active'&&TOOLS[t]){card.style.cursor='pointer';card.onclick=e=>{if(e.target.closest('button,a')&&e.target!==card)return;location.href=TOOLS[t].href}}else if(s==='plan'){card.style.cursor='pointer';card.onclick=()=>location.href='plans.html?tool='+encodeURIComponent(t)}else{card.style.cursor='default';card.onclick=null}})}
function syncModeBlocks(){document.querySelectorAll('[data-only-mode]').forEach(el=>el.classList.toggle('hidden',el.dataset.onlyMode!==mode()));document.querySelectorAll('[data-workspace-name]').forEach(el=>{const a=account();el.textContent=a.mode==='business'?(a.business.company||'Business Workspace'):'Personal Workspace'})}
function ensureActivationModal(){if(document.querySelector('#activationModal'))return;document.body.insertAdjacentHTML('beforeend',`<div class="modal-bg" id="activationModal"><div class="modal"><div class="modal-head"><div><h3>Activate license</h3><p>The serial must match the selected workspace type.</p></div><button class="close" data-close>×</button></div><div class="modal-body"><div class="notice">Current workspace: <b id="activationMode"></b><br>Personal serials start with <b>NSQ-P-</b>. Business serials start with <b>NSQ-B-</b>.</div><label class="field" style="margin-top:12px">Serial number<input id="activationSerial" placeholder="NSQ-P-XXXX-XXXX"></label><div id="activationMsg" style="font-size:9px;margin-top:9px"></div></div><div class="modal-foot"><button class="btn sec" data-close>Cancel</button><button class="btn pri" id="activateSerialBtn">Activate</button></div></div></div>`);document.querySelectorAll('#activationModal [data-close]').forEach(b=>b.onclick=()=>document.querySelector('#activationModal').classList.remove('on'));document.querySelector('#activateSerialBtn').onclick=activateSerial;}
function showActivation(){ensureActivationModal();const a=account();document.querySelector('#activationMode').textContent=a.mode==='business'?'Business':'Personal';document.querySelector('#activationSerial').value='';document.querySelector('#activationMsg').textContent='';document.querySelector('#activationModal').classList.add('on')}
function activateSerial(){const a=account(),val=document.querySelector('#activationSerial').value.trim().toUpperCase(),msg=document.querySelector('#activationMsg');const required=a.mode==='business'?'NSQ-B-':'NSQ-P-';if(!val.startsWith(required)){msg.style.color='#b42318';msg.textContent='This serial belongs to a different license type. Switch workspace or use the correct serial.';return}a[a.mode].active=true;a[a.mode].license=val;save(a);msg.style.color='#0c6b58';msg.textContent='License activated for '+(a.mode==='business'?'Business':'Personal')+' workspace.';setTimeout(()=>{document.querySelector('#activationModal').classList.remove('on');syncShell()},700)}
function requireTool(tool){if(hasTool(tool))return true;location.href='plans.html?tool='+encodeURIComponent(tool);return false}
function enhanceLegacyBoq(){if(!/boq\.html$/i.test(location.pathname))return;const apply=()=>{document.querySelectorAll('[data-copy]').forEach(x=>x.remove());const side=document.querySelector('.side');if(side&&!document.querySelector('#nusoqLegacyHome')){const a=document.createElement('a');a.id='nusoqLegacyHome';a.href='index.html';a.textContent='← Home / All Tools';a.style.cssText='display:block;margin:0 8px 10px;padding:9px 10px;border:1px solid #34404a;border-radius:9px;color:#cbd5df;text-decoration:none;font-size:10px;font-weight:800';side.insertBefore(a,side.children[1]||null)}const top=document.querySelector('.top .actions');if(top&&!document.querySelector('#nusoqLegacyAccount')){const b=document.createElement('a');b.id='nusoqLegacyAccount';b.href='account.html';b.textContent='Account';b.style.cssText='border:1px solid #e4e7ec;border-radius:9px;padding:9px 11px;text-decoration:none;color:#475467;font-size:10px;font-weight:800';top.insertBefore(b,top.firstChild)}};new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});setTimeout(apply,300);setTimeout(apply,1200)}
window.Nusoq={account,save,setMode,mode,workspace,hasTool,status,team,saveTeam,mountShell,syncShell,requireTool,TOOLS,showActivation};
document.addEventListener('DOMContentLoaded',()=>{mountShell();syncToolCards();syncModeBlocks();enhanceLegacyBoq()});document.addEventListener('nusoq:mode',()=>{syncToolCards();syncModeBlocks()});
})();