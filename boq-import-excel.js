(()=>{
'use strict';
const AR=/[\u0600-\u06FF]/;
const KEY='nusoq-boq-final-v1';
const aliases={
 code:['item code','item no','item no.','item number','code','no.','no','رقم البند','رقم','كود البند','الكود'],
 division:['division','div','division no','division code','القسم','الديفجن','رقم القسم'],
 nameEn:['item name en','item name (en)','name en','english item name'],
 nameAr:['item name ar','item name (ar)','name ar','arabic item name','اسم البند','اسم البند عربي'],
 descEn:['description en','description (en)','english description','item description en'],
 descAr:['description ar','description (ar)','arabic description','item description ar','الوصف العربي'],
 description:['description','item description','scope description','work description','البيان','الوصف','وصف البند'],
 unit:['unit','uom','unit of measure','measurement unit','الوحدة','وحدة القياس'],
 qty:['qty','quantity','q.ty','الكمية','كمية'],
 rate:['rate','unit rate','price','unit price','السعر','سعر الوحدة'],
 amount:['amount','total amount','value','الإجمالي','الاجمالي','القيمة','المبلغ']
};
const norm=v=>String(v??'').trim().toLowerCase().replace(/\s+/g,' ');
const text=v=>String(v??'').trim();
const num=v=>{if(typeof v==='number')return Number.isFinite(v)?v:0;const s=String(v??'').replace(/,/g,'').replace(/[^0-9.\-]/g,'');const n=parseFloat(s);return Number.isFinite(n)?n:0};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function headerScore(row){const vals=(row||[]).map(norm);let score=0;['code','division','description','nameEn','nameAr','unit','qty','rate','amount'].forEach(k=>{if(vals.some(v=>(aliases[k]||[]).some(a=>v===a||v.includes(a))))score++});return score}
function detectHeader(data){let best={row:-1,score:0};for(let r=0;r<Math.min(data.length,35);r++){const score=headerScore(data[r]);if(score>best.score)best={row:r,score}}return best}
function mapHeaders(headers){const m={};Object.keys(aliases).forEach(k=>{m[k]=-1;headers.forEach((h,i)=>{if(m[k]>=0)return;const n=norm(h);if((aliases[k]||[]).some(a=>n===a||n.includes(a)))m[k]=i})});return m}
function get(row,idx){return idx>=0?(row[idx]??''):''}
function takeDivision(v){const valid=new Set((window.DIVS||[]).map(d=>d.code));const m=String(v??'').match(/(?:division\s*)?(\d{1,2})/i);if(!m)return'';const d=m[1].padStart(2,'0');return valid.has(d)?d:''}
function divisionFromCode(v){const s=String(v??'').trim();const six=s.match(/^(\d{2})\d{4}$/);if(six)return takeDivision(six[1]);const m=s.match(/^(\d{1,2})[.\-_\s]/);return m?takeDivision(m[1]):''}
function divisionFromSheet(name){return takeDivision(name)}
function headingDivision(row){for(const c of row||[]){const t=text(c);const m=t.match(/division\s*(\d{1,2})/i);if(m)return takeDivision(m[1]);const a=t.match(/(?:قسم|ديفجن)\s*(\d{1,2})/);if(a)return takeDivision(a[1])}return''}
function makeItem(row,m,currentDiv,sheetDiv,id){
 const importedCode=text(get(row,m.code));
 const explicitDiv=takeDivision(get(row,m.division));
 const division=explicitDiv||divisionFromCode(importedCode)||currentDiv||sheetDiv||'OTHER';
 let nameEn=text(get(row,m.nameEn)),nameAr=text(get(row,m.nameAr));
 let descEn=text(get(row,m.descEn)),descAr=text(get(row,m.descAr));
 const single=text(get(row,m.description));
 if(single&&!descEn&&!descAr){if(AR.test(single))descAr=single;else descEn=single}
 const unit=text(get(row,m.unit));
 const qtyRaw=get(row,m.qty),rateRaw=get(row,m.rate),amountRaw=get(row,m.amount);
 const qty=num(qtyRaw),rate=num(rateRaw),importedAmount=m.amount>=0?num(amountRaw):null;
 if(!nameEn&&!nameAr&&!descEn&&!descAr)return null;
 return {id,division,customEn:division==='OTHER'?'Imported BOQ':'',customAr:division==='OTHER'?'جدول كميات مستورد':'',scope:S.breakdown==='entire'?'Entire Building':'Imported',nameEn,nameAr,descEn,descAr,qty,unit,rate,needsReview:false,imported:true,importedCode,importedAmount,sourceQty:text(qtyRaw),sourceRate:text(rateRaw),sourceAmount:text(amountRaw)};
}
function extractSheet(ws,name){
 const data=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false,blankrows:false});
 const det=detectHeader(data);if(det.row<0||det.score<2)return {items:[],recognized:false,score:det.score};
 const headers=(data[det.row]||[]).map(v=>text(v));const m=mapHeaders(headers);
 const hasText=[m.description,m.descEn,m.descAr,m.nameEn,m.nameAr].some(i=>i>=0);
 if(!hasText)return {items:[],recognized:false,score:det.score};
 const out=[];let currentDiv='',seq=Date.now()+Math.floor(Math.random()*10000),sheetDiv=divisionFromSheet(name);
 for(let r=det.row+1;r<data.length;r++){
   const row=data[r]||[];if(row.every(v=>text(v)===''))continue;
   const hd=headingDivision(row);
   const maybeText=[m.description,m.descEn,m.descAr,m.nameEn,m.nameAr].map(i=>text(get(row,i))).join('');
   const hasNumeric=[m.qty,m.rate,m.amount].some(i=>i>=0&&text(get(row,i))!=='');
   if(hd&&!hasNumeric&&!maybeText){currentDiv=hd;continue}
   if(hd&&!hasNumeric&&row.filter(v=>text(v)).length<=2){currentDiv=hd;continue}
   const item=makeItem(row,m,currentDiv,sheetDiv,seq++);if(item)out.push(item);
 }
 return {items:out,recognized:true,score:det.score,headerRow:det.row,headers,map:m};
}
function saveImported(items,fileName,sheetCount){
 S.items=items;S.importMeta={fileName,sheetCount,importedAt:new Date().toISOString(),mode:'exact'};
 localStorage.setItem(KEY,JSON.stringify(S));
 try{editor()}catch(e){}try{preview()}catch(e){}try{changed()}catch(e){}try{go(4)}catch(e){}
 setTimeout(()=>{try{document.querySelector('#save')?.click()}catch(e){}},150);
 if(typeof toast==='function')toast(items.length+' items imported exactly from Excel.');
}
function injectFallback(){if(document.querySelector('#excelFallback'))return;const st=document.createElement('style');st.textContent='#excelFallback .modal{width:min(760px,100%)} .xi-note{background:#fff8e8;border:1px solid #f2d39b;border-radius:9px;padding:11px;font-size:10px;color:#7a4b09;margin-top:10px}.xi-preview{max-height:310px;overflow:auto;border:1px solid #e4e7ec;border-radius:9px;margin-top:12px}.xi-preview table{border-collapse:collapse;width:100%;font-size:9px}.xi-preview th,.xi-preview td{padding:7px;border-bottom:1px solid #e4e7ec;text-align:left}.xi-preview th{background:#f2f4f7}';document.head.appendChild(st);document.body.insertAdjacentHTML('beforeend',`<div class="modalbg" id="excelFallback"><div class="modal"><div class="mhead"><div><span class="eye">Excel Import</span><h3>Could not identify the BOQ columns automatically</h3><p>Nusoq did not change the file. Use a clear header row and try again.</p></div><button class="mx" id="xefClose">×</button></div><div class="mcontent"><div class="xi-note">Recommended headers: Item Code, Division, Description, Unit, Qty, Rate, Amount — or their Arabic equivalents.</div><div class="xi-preview"><table><thead><tr><th>Supported English</th><th>Supported Arabic</th></tr></thead><tbody><tr><td>Item Code / Item No.</td><td>رقم البند / كود البند</td></tr><tr><td>Description</td><td>الوصف / البيان</td></tr><tr><td>Unit</td><td>الوحدة / وحدة القياس</td></tr><tr><td>Qty / Quantity</td><td>الكمية</td></tr><tr><td>Rate / Unit Rate</td><td>السعر / سعر الوحدة</td></tr><tr><td>Amount</td><td>الإجمالي / القيمة</td></tr></tbody></table></div></div><div class="mactions"><button class="btn pri" id="xefOk">Close</button></div></div></div>`);const close=()=>document.querySelector('#excelFallback').classList.remove('on');document.querySelector('#xefClose').onclick=document.querySelector('#xefOk').onclick=close}
async function openFile(file){
 if(!window.XLSX){toast('Excel engine is loading. Try again in a moment.');return}
 try{
   const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:'array',cellDates:false});
   let all=[],recognized=0;
   wb.SheetNames.forEach(name=>{const x=extractSheet(wb.Sheets[name],name);if(x.recognized&&x.items.length){recognized++;all.push(...x.items)}});
   if(!all.length){injectFallback();document.querySelector('#excelFallback').classList.add('on');return}
   saveImported(all,file.name,recognized);
 }catch(e){console.error(e);toast('Could not read this Excel file.')}
}
function patchSourceCard(){const label=[...document.querySelectorAll('label.source')].find(l=>/Import Excel/i.test(l.textContent));if(!label)return;const input=label.querySelector('input[type=file]');const small=label.querySelector('small');if(small)small.textContent='Automatic import — keeps source values unchanged';input.accept='.xlsx,.xls,.xlsm,.xlsb';input.addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(f)openFile(f);e.target.value=''},true)}
window.NUSOQ_EXCEL_IMPORT={openFile};
setTimeout(()=>{injectFallback();patchSourceCard()},350);
})();