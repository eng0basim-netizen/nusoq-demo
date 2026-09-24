(()=>{
'use strict';

const KEY='nusoq-boq-final-v1';
const ORDER=['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','21','22','23','26','27','28','31','32','33','OTHER'];
const FALLBACK_DIVS={
'00':['Procurement and Contracting Requirements','متطلبات التعاقد والشراء'],'01':['General Requirements','المتطلبات العامة'],'02':['Existing Conditions','الظروف القائمة للموقع'],'03':['Concrete','الخرسانة'],'04':['Masonry','المباني'],'05':['Metals','المعادن'],'06':['Wood, Plastics, and Composites','الخشب والبلاستيك والمواد المركبة'],'07':['Thermal and Moisture Protection','العزل والرطوبة'],'08':['Openings','الفتحات'],'09':['Finishes','التشطيبات'],'10':['Specialties','المواد التخصصية'],'11':['Equipment','المعدات'],'12':['Furnishings','التأثيث'],'13':['Special Construction','الإنشاءات الخاصة'],'14':['Conveying Equipment','أنظمة النقل'],'21':['Fire Suppression','أنظمة إطفاء الحريق'],'22':['Plumbing','الأعمال الصحية والسباكة'],'23':['HVAC','التكييف والتهوية'],'26':['Electrical','الأعمال الكهربائية'],'27':['Communications','أنظمة الاتصالات'],'28':['Electronic Safety and Security','الأنظمة الأمنية'],'31':['Earthwork','الأعمال الترابية'],'32':['Exterior Improvements','التحسينات الخارجية'],'33':['Utilities','المرافق والبنية التحتية'],'OTHER':['Other / Custom Scope','أخرى / سكوب خاص']};

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const state=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
const divNames=d=>(window.DIVS&&window.DIVS[d])||FALLBACK_DIVS[d]||FALLBACK_DIVS.OTHER;
const divOrder=d=>{const i=ORDER.indexOf(d);return i<0?999:i};
const itemCode=(i,n,d)=>String(i.importedCode||i.itemCode||i.code||'').trim()||((d==='OTHER'?'99':String(d||'00').padStart(2,'0'))+'01'+String(n).padStart(2,'0'));
const amount=i=>(+i.qty||0)*(+i.rate||0);

function groups(s){
  const map=new Map();
  [...(s.items||[])].sort((a,b)=>divOrder(a.division||'OTHER')-divOrder(b.division||'OTHER')||(Number(a.id)||0)-(Number(b.id)||0)).forEach(i=>{
    const d=i.division||'OTHER';
    if(!map.has(d)) map.set(d,[]);
    map.get(d).push(i);
  });
  return [...map.entries()].map(([d,items])=>{
    let names=divNames(d);
    if(d==='OTHER'&&items[0]) names=[items[0].customEn||names[0],items[0].customAr||names[1]];
    return {d,items,en:names[0],ar:names[1],total:items.reduce((a,i)=>a+amount(i),0)};
  });
}

function totals(s){
  const sub=(s.items||[]).reduce((a,i)=>a+amount(i),0);
  const vp=Number.isFinite(+(s.vatPct??s.project?.vat))?+(s.vatPct??s.project?.vat):15;
  return {sub,vp,vat:sub*vp/100,total:sub+(sub*vp/100)};
}

function css(){return `
*{box-sizing:border-box}
.npdf-stage{position:fixed;left:-50000px;top:0;background:#fff;font-family:Arial,"Segoe UI",Tahoma,sans-serif;color:#101828;z-index:-1}
.npdf-page{position:relative;background:#fff;overflow:hidden}
.npdf-page.p{width:210mm;height:297mm}.npdf-page.l{width:297mm;height:210mm}
/* RED ZONE: fixed header / footer */
.npdf-header{position:absolute;left:10mm;right:10mm;top:7mm;height:21mm;border-bottom:.45mm solid #344054;padding-bottom:2mm;display:flex;align-items:center;justify-content:space-between;gap:5mm;overflow:hidden;background:#fff}
.npdf-footer{position:absolute;left:10mm;right:10mm;bottom:5mm;height:9mm;border-top:.35mm solid #98a2b3;padding-top:1.8mm;display:flex;justify-content:space-between;align-items:flex-start;font-size:7pt;color:#667085;background:#fff}
.npdf-footer b{color:#101828}
/* GREEN ZONE: the only area BOQ content is allowed to occupy */
.npdf-viewport{position:absolute;left:10mm;right:10mm;top:32mm;bottom:20mm;overflow:hidden;background:#fff}
.npdf-viewport.with-total{bottom:29mm}
.npdf-page-total{position:absolute;left:10mm;right:10mm;bottom:20mm;height:7mm;border-top:.25mm solid #d0d5dd;padding-top:1.3mm;display:flex;justify-content:flex-end;gap:8mm;font-size:7pt;background:#fff}
.npdf-logos{display:flex;align-items:center;gap:2.5mm;min-width:0}.npdf-logo{text-align:center;min-width:18mm;max-width:30mm}.npdf-logo-box{height:9mm;display:flex;align-items:center;justify-content:center;font-size:6pt;font-weight:700;overflow:hidden}.npdf-logo-box img{max-width:100%;max-height:100%;object-fit:contain}.npdf-logo small{display:block;font-size:5pt;color:#667085;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.npdf-project{text-align:right;margin-left:auto;min-width:42mm}.npdf-project b,.npdf-project span,.npdf-project small{display:block}.npdf-project b{font-size:9pt}.npdf-project span{font-size:7.3pt;margin-top:.5mm}.npdf-project small{font-size:6pt;color:#667085;margin-top:.5mm}
.npdf-title{text-align:center;margin:0 0 3mm}.npdf-title b,.npdf-title span{display:block}.npdf-title b{font-size:12pt}.npdf-title span{font-size:8.5pt;margin-top:.8mm}
.npdf-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:6.6pt;line-height:1.23}.npdf-table th,.npdf-table td{border:.22mm solid #cfd6dc;padding:1.35mm;vertical-align:top;word-break:break-word;overflow-wrap:anywhere}.npdf-table th{background:#e8f0ee;font-weight:800}
.npdf-table.items th:nth-child(1),.npdf-table.items td:nth-child(1){width:13%;white-space:nowrap;font-family:ui-monospace,monospace;font-weight:700}.npdf-table.items th:nth-child(2),.npdf-table.items td:nth-child(2){width:43%}.npdf-table.items th:nth-child(3),.npdf-table.items td:nth-child(3){width:8%}.npdf-table.items th:nth-child(n+4),.npdf-table.items td:nth-child(n+4){width:12%;text-align:right}
.npdf-table.summary th:nth-child(1),.npdf-table.summary td:nth-child(1){width:14%}.npdf-table.summary th:nth-child(2),.npdf-table.summary td:nth-child(2){width:25%}.npdf-table.summary th:nth-child(3),.npdf-table.summary td:nth-child(3){width:25%}.npdf-table.summary th:nth-child(4),.npdf-table.summary td:nth-child(4){width:18%}.npdf-table.summary th:nth-child(5),.npdf-table.summary td:nth-child(5){width:8%;text-align:center}.npdf-table.summary th:nth-child(6),.npdf-table.summary td:nth-child(6){width:10%;text-align:right}
.npdf-ar{border-top:.2mm dashed #d0d5dd;margin-top:1mm;padding-top:1mm}
/* fixed main cover */
.npdf-cover{position:absolute;left:10mm;right:10mm;top:10mm;bottom:20mm;display:flex;flex-direction:column;overflow:hidden}.npdf-cover>.npdf-logos{justify-content:center;margin-top:4mm}.npdf-cover-title{text-align:center;margin:auto 0}.npdf-cover-title>span{font-size:10pt;font-weight:900;letter-spacing:.12em;color:#0c6b58}.npdf-cover-title h1{font-size:23pt;margin:4mm 0 2mm}.npdf-cover-title h2{font-size:15pt;margin:0;color:#344054}.npdf-cover-title p{font-size:8pt;color:#667085}.npdf-totalbox{width:105mm;margin:4mm auto 0;border:1px solid #cfd6dc}.npdf-totalbox div{display:flex;justify-content:space-between;gap:8mm;padding:1.6mm 2mm;border-bottom:1px solid #e4e7ec;font-size:7.5pt}.npdf-totalbox div:last-child{border-bottom:0}.npdf-totalbox .grand{background:#0c6b58;color:#fff;font-weight:800}
/* division cover */
.npdf-divcover{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:10mm}.npdf-divcover .code{font-size:11pt;font-weight:900;letter-spacing:.12em;color:#0c6b58;text-transform:uppercase}.npdf-divcover h1{font-size:24pt;margin:5mm 0 2mm}.npdf-divcover h2{font-size:16pt;margin:0;color:#475467}.npdf-divcover .stats{display:grid;grid-template-columns:1fr 1fr;gap:4mm;width:min(120mm,80%);margin-top:10mm}.npdf-divcover .stats div{border:1px solid #d0d5dd;border-radius:3mm;padding:5mm}.npdf-divcover .stats small,.npdf-divcover .stats b{display:block}.npdf-divcover .stats small{font-size:7pt;color:#667085}.npdf-divcover .stats b{font-size:13pt;margin-top:2mm}
`}

function logos(s){return (s.parties||[]).map(p=>`<div class="npdf-logo"><div class="npdf-logo-box">${p.logo?'<img src="'+p.logo+'">':esc(p.en||p.role||'LOGO')}</div><small>${esc(p.role||'')}</small></div>`).join('')}
function header(s){return `<div class="npdf-logos">${logos(s)}</div><div class="npdf-project"><b>${esc(s.project?.pen||'')}</b><span dir="rtl">${esc(s.project?.par||'')}</span><small>${esc(s.project?.pno||'')} • ${esc(s.project?.rev||'')}</small></div>`}
function footer(s,label){return `<div class="npdf-footer"><span>${esc(s.project?.pno||'')}${label?' • '+esc(label):''}</span><b class="npdf-page-number"></b></div>`}
function page(stage,s,label,{headerOn=true,totalBar=false}={}){
  const p=document.createElement('section');
  p.className='npdf-page '+(s.ori==='l'?'l':'p');
  p.innerHTML=`${headerOn?`<div class="npdf-header">${header(s)}</div>`:''}<div class="npdf-viewport ${totalBar?'with-total':''}"></div>${totalBar?'<div class="npdf-page-total"></div>':''}${footer(s,label)}`;
  stage.appendChild(p);return p;
}
function fits(p,guard=4){
  const v=p.querySelector('.npdf-viewport');
  if(!v)return true;
  const vr=v.getBoundingClientRect();
  const last=v.lastElementChild;
  if(!last)return true;
  const lr=last.getBoundingClientRect();
  return v.scrollHeight<=v.clientHeight-guard && lr.bottom<=vr.bottom-guard;
}

function mainCover(stage,s){
  const t=totals(s),p=document.createElement('section');p.className='npdf-page '+(s.ori==='l'?'l':'p');
  p.innerHTML=`<div class="npdf-cover"><div class="npdf-logos">${logos(s)}</div><div class="npdf-cover-title"><span>BILL OF QUANTITIES</span><h1>${esc(s.project?.pen||'')}</h1><h2 dir="rtl">${esc(s.project?.par||'')}</h2><p>${esc(s.project?.pno||'')} • ${esc(s.project?.rev||'')}</p></div><div class="npdf-totalbox"><div><span>Subtotal before VAT</span><b>${fmt(t.sub)} SAR</b></div><div><span>VAT (${t.vp.toFixed(2)}%)</span><b>${fmt(t.vat)} SAR</b></div><div class="grand"><span>Grand Total incl. VAT</span><b>${fmt(t.total)} SAR</b></div></div></div>${footer(s,'Cover')}`;
  stage.appendChild(p);
}

function newSummaryPage(stage,s,continued){
  const p=page(stage,s,continued?'Summary Continued':'Summary');
  const v=p.querySelector('.npdf-viewport');
  v.innerHTML=`<div class="npdf-title"><b>BOQ Division Summary${continued?' — Continued':''}</b><span dir="rtl">ملخص أقسام جدول الكميات${continued?' — تابع':''}</span></div><table class="npdf-table summary"><thead><tr><th>Division</th><th>English</th><th>العربية</th><th>Item Code Range</th><th>Items</th><th>Amount</th></tr></thead><tbody></tbody></table>`;
  return p;
}
function buildSummary(stage,s,gs){
  let p=newSummaryPage(stage,s,false),tbody=p.querySelector('tbody');
  for(const g of gs){
    const first=itemCode(g.items[0]||{},1,g.d),last=itemCode(g.items[g.items.length-1]||{},g.items.length||1,g.d);
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${g.d==='OTHER'?'OTHER':'Division '+g.d}</td><td>${esc(g.en)}</td><td dir="rtl">${esc(g.ar)}</td><td>${esc(first)} – ${esc(last)}</td><td>${g.items.length}</td><td>${fmt(g.total)}</td>`;
    tbody.appendChild(tr);
    if(!fits(p)){
      tr.remove();
      p=newSummaryPage(stage,s,true);tbody=p.querySelector('tbody');tbody.appendChild(tr);
    }
  }
}

function divisionCover(stage,s,g){
  const p=page(stage,s,g.d==='OTHER'?'OTHER Cover':'Division '+g.d+' Cover');
  const v=p.querySelector('.npdf-viewport');
  v.innerHTML=`<div class="npdf-divcover"><div class="code">${g.d==='OTHER'?'OTHER':'DIVISION '+esc(g.d)}</div><h1>${esc(g.en)}</h1><h2 dir="rtl">${esc(g.ar)}</h2><div class="stats"><div><small>Items / عدد البنود</small><b>${g.items.length}</b></div><div><small>Division Total before VAT / إجمالي الديفجن قبل الضريبة</small><b>${fmt(g.total)} SAR</b></div></div></div>`;
}

function itemText(i,s){
  const en=`<b>${esc(i.nameEn||'')}</b>${i.descEn?'<br>'+esc(i.descEn):''}`;
  const ar=`<div dir="rtl"><b>${esc(i.nameAr||'')}</b>${i.descAr?'<br>'+esc(i.descAr):''}</div>`;
  return s.lang==='en'?en:s.lang==='ar'?ar:en+`<div class="npdf-ar">${ar}</div>`;
}
function newItemPage(stage,s,g,continued){
  const p=page(stage,s,g.d==='OTHER'?'OTHER':'Division '+g.d,{totalBar:true});
  const v=p.querySelector('.npdf-viewport');
  v.innerHTML=`<div class="npdf-title"><b>${g.d==='OTHER'?'OTHER':'Division '+g.d} — ${esc(g.en)}${continued?' — Continued':''}</b><span dir="rtl">${esc(g.ar)}${continued?' — تابع':''}</span></div><table class="npdf-table items"><thead><tr><th>Item Code</th><th>Item / Description</th><th>Unit</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody></tbody></table>`;
  return p;
}
function setPageTotal(p,total,cumulative,s){
  const bar=p.querySelector('.npdf-page-total');
  if(!bar)return;
  bar.innerHTML=`<span>Page Total: <b>${fmt(total)} SAR</b></span>${(s.totalMode||s.tot)==='cum'?`<span>Cumulative: <b>${fmt(cumulative+total)} SAR</b></span>`:''}`;
}
function buildDivisionItems(stage,s,g,cumulativeStart){
  let p=newItemPage(stage,s,g,false),tbody=p.querySelector('tbody'),pageTotal=0,cumulative=cumulativeStart;
  for(let idx=0;idx<g.items.length;idx++){
    const i=g.items[idx],a=amount(i),tr=document.createElement('tr');
    tr.innerHTML=`<td>${esc(itemCode(i,idx+1,g.d))}</td><td>${itemText(i,s)}</td><td>${esc(i.unit||'')}</td><td>${fmt(i.qty)}</td><td>${fmt(i.rate)}</td><td>${fmt(a)}</td>`;
    tbody.appendChild(tr);pageTotal+=a;setPageTotal(p,pageTotal,cumulative,s);
    if(!fits(p)){
      tr.remove();pageTotal-=a;setPageTotal(p,pageTotal,cumulative,s);cumulative+=pageTotal;
      p=newItemPage(stage,s,g,true);tbody=p.querySelector('tbody');tbody.appendChild(tr);pageTotal=a;setPageTotal(p,pageTotal,cumulative,s);
      /* emergency only for a single abnormally tall row */
      if(!fits(p)){
        tr.style.fontSize='5.4pt';tr.style.lineHeight='1.15';
      }
    }
  }
  return cumulative+pageTotal;
}

function progress(on,text){
  let x=document.querySelector('#npdf-progress');
  if(!x){x=document.createElement('div');x.id='npdf-progress';x.style.cssText='position:fixed;inset:0;background:#101828bb;z-index:999999;display:none;place-items:center;font-family:Arial';x.innerHTML='<div style="background:#fff;padding:22px 28px;border-radius:14px;min-width:310px;text-align:center"><b id="npdf-progress-text">Preparing PDF…</b><div style="font-size:11px;color:#667085;margin-top:7px">Fixed A4 viewport pagination</div></div>';document.body.appendChild(x)}
  x.style.display=on?'grid':'none';const t=document.querySelector('#npdf-progress-text');if(t)t.textContent=text||'Preparing PDF…';
}
async function waitImages(root){const imgs=[...root.querySelectorAll('img')];await Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=img.onerror=r})))}

async function generate(){
  const s=state();
  if(!(s.items||[]).length)return alert('No BOQ items found.');
  if(!window.html2canvas||!window.jspdf?.jsPDF)return alert('PDF engine is still loading.');
  let stage;
  try{
    progress(true,'Building fixed A4 viewport pages…');
    if(document.fonts?.ready)await document.fonts.ready;
    stage=document.createElement('div');stage.className='npdf-stage';
    const st=document.createElement('style');st.textContent=css();stage.appendChild(st);document.body.appendChild(stage);

    const gs=groups(s);
    mainCover(stage,s);
    buildSummary(stage,s,gs);
    let cumulative=0;
    for(const g of gs){
      divisionCover(stage,s,g);
      cumulative=buildDivisionItems(stage,s,g,cumulative);
    }

    await waitImages(stage);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const pages=[...stage.querySelectorAll('.npdf-page')];
    pages.forEach((p,i)=>{const n=p.querySelector('.npdf-page-number');if(n)n.textContent=`Page ${i+1} of ${pages.length}`});

    const land=s.ori==='l',pdf=new window.jspdf.jsPDF({orientation:land?'landscape':'portrait',unit:'mm',format:'a4',compress:true});
    for(let i=0;i<pages.length;i++){
      progress(true,`Generating PDF ${i+1} / ${pages.length}`);
      if(i)pdf.addPage('a4',land?'landscape':'portrait');
      const canvas=await html2canvas(pages[i],{scale:1.55,backgroundColor:'#fff',useCORS:true,logging:false});
      pdf.addImage(canvas.toDataURL('image/jpeg',.92),'JPEG',0,0,land?297:210,land?210:297,undefined,'FAST');
      canvas.width=canvas.height=1;
      await new Promise(r=>setTimeout(r,0));
    }
    const name=(s.project?.pno||'Nusoq_BOQ').replace(/[^a-z0-9_-]/gi,'_');
    pdf.save(name+'_BOQ.pdf');
  }catch(err){console.error(err);alert('Unable to generate PDF. Please try again.')}finally{stage?.remove();progress(false)}
}

function wire(){const b=document.querySelector('#pdfExportBtn');if(!b)return false;b.textContent='PDF';b.onclick=e=>{e.preventDefault();generate()};return true}
let tries=0;const timer=setInterval(()=>{tries++;if(wire()||tries>80)clearInterval(timer)},100);
window.NUSOQ_GENERATE_PDF=generate;
})();