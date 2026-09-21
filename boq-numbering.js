(()=>{
'use strict';
const fmtCode=(division,seq)=>{
  const dd=division==='OTHER'?'99':String(division||'00').padStart(2,'0');
  return dd+'01'+String(seq).padStart(2,'0');
};
function codeEntries(){
  const counts={};
  return sortedItems().map(i=>{
    const d=i.division||'OTHER';
    counts[d]=(counts[d]||0)+1;
    return {item:i,code:fmtCode(d,counts[d])};
  });
}
function codeForItem(item){
  const found=codeEntries().find(x=>x.item.id===item.id);
  return found?found.code:'';
}
function patchEditorCodes(){
  const rows=[...document.querySelectorAll('#body tr')].filter(r=>!r.classList.contains('secrow')&&!r.classList.contains('scopeRow'));
  const entries=codeEntries();
  rows.forEach((r,idx)=>{const c=r.cells&&r.cells[0];if(c&&entries[idx]){c.textContent=entries[idx].code;c.style.fontFamily='ui-monospace,SFMono-Regular,Menlo,monospace';c.style.fontWeight='800';c.style.whiteSpace='nowrap';}});
  const th=document.querySelector('.boq thead th:first-child');
  if(th)th.textContent='Item Code';
}
const originalEditor=editor;
editor=function(){originalEditor();patchEditorCodes();};
setTimeout(patchEditorCodes,0);

function usedDivisionsWithCodes(){
  const entries=codeEntries();
  const map=new Map();
  entries.forEach(({item,code})=>{
    const k=item.division||'OTHER';
    if(!map.has(k))map.set(k,[]);
    map.get(k).push({item,code});
  });
  return [...map.entries()].sort((a,b)=>divOrder(a[0])-divOrder(b[0])).map(([code,rows])=>{
    const d=divByCode(code)||{en:'Other / Custom Scope',ar:'أخرى / سكوب خاص'};
    return {code,en:code==='OTHER'?(rows[0].item.customEn||d.en):d.en,ar:code==='OTHER'?(rows[0].item.customAr||d.ar):d.ar,rows,total:rows.reduce((s,x)=>s+(+x.item.qty||0)*(+x.item.rate||0),0),range:rows.length?(rows[0].code+' – '+rows.at(-1).code):''};
  });
}
function escN(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function moneyN(n){return Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
function taxPct(){return Number((S.project&&S.project.vat)||15)||0;}
function subtotal(){return (S.items||[]).reduce((s,i)=>s+(+i.qty||0)*(+i.rate||0),0);}
function taxAmt(){return subtotal()*taxPct()/100;}
function totalInc(){return subtotal()+taxAmt();}
function partyLogosN(){return (S.parties||[]).map(p=>'<div class="px-logo"><div class="px-logo-box">'+(p.logo?'<img src="'+p.logo+'">':escN(p.en||p.role))+'</div><span>'+escN(p.role)+'</span></div>').join('');}
function headerN(){const proj='<div class="px-project"><b>'+escN(S.project.pen)+'</b><span dir="rtl">'+escN(S.project.par)+'</span><small>'+escN(S.project.pno)+' • '+escN(S.project.rev)+'</small></div>',logos=partyLogosN();if(S.layout==='logorow')return '<div class="px-header logorow"><div class="px-logos">'+logos+'</div>'+proj+'</div>';if(S.layout==='minimal')return '<div class="px-header minimal">'+proj+'<div class="px-logos">'+logos+'</div></div>';if(S.layout==='project')return '<div class="px-header project">'+proj+'<div class="px-logos">'+logos+'</div></div>';return '<div class="px-header balanced"><div class="px-logos">'+logos+'</div>'+proj+'</div>';}
function itemTextN(i){const en='<b>'+escN(i.nameEn||'')+'</b><br>'+escN(i.descEn||''),ar='<div dir="rtl"><b>'+escN(i.nameAr||'')+'</b><br>'+escN(i.descAr||'')+'</div>';return S.lang==='en'?en:S.lang==='ar'?ar:en+'<div class="px-ar">'+ar+'</div>';}
function itemUnitsN(i){const len=((i.nameEn||'')+(i.descEn||'')+(i.nameAr||'')+(i.descAr||'')).length;return Math.max(1,Math.ceil(len/(S.ori==='l'?240:170)));}
function chunkRows(rows){const max=S.ori==='l'?9:13,chunks=[];let cur=[],u=0;rows.forEach(x=>{const n=itemUnitsN(x.item);if(cur.length&&u+n>max){chunks.push(cur);cur=[];u=0}cur.push(x);u+=n});if(cur.length)chunks.push(cur);return chunks;}
function pageShellN(content,pageNo,total,label=''){return '<section class="px-page '+(S.ori==='l'?'landscape':'portrait')+'">'+content+'<footer class="px-footer"><span>'+escN(S.project.pno||'')+(label?' • '+escN(label):'')+'</span><b>Page '+pageNo+' of '+total+'</b></footer></section>';}
function printCssN(){return `*{box-sizing:border-box}html,body{margin:0;padding:0;background:#d8dde2;font-family:Arial,"Segoe UI",Tahoma,sans-serif;color:#101828}.px-page{background:white;margin:12px auto;position:relative;page-break-after:always;overflow:hidden}.px-page.portrait{width:210mm;height:297mm;padding:13mm 12mm 14mm}.px-page.landscape{width:297mm;height:210mm;padding:10mm 12mm 13mm}.px-footer{position:absolute;bottom:6mm;left:12mm;right:12mm;border-top:.35mm solid #98a2b3;padding-top:2.2mm;font-size:8pt;display:flex;justify-content:space-between;color:#667085}.px-footer b{color:#101828}.px-cover{height:100%;display:flex;flex-direction:column}.px-cover>.px-logos{justify-content:center;margin-top:8mm}.px-cover-title{text-align:center;margin:auto 0}.px-cover-title span{color:#0d6b58;font-weight:800;font-size:12pt;letter-spacing:.12em;text-transform:uppercase}.px-cover-title h1{font-size:26pt;margin:5mm 0 2mm}.px-cover-title h2{font-size:18pt;margin:0;color:#344054}.px-cover-title p{margin-top:5mm;color:#667085}.px-cover-meta{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-bottom:8mm}.px-cover-meta>div{border:1px solid #d0d5dd;border-radius:3mm;padding:5mm}.px-cover-meta small,.px-cover-meta b{display:block}.px-cover-meta small{color:#667085;margin-bottom:2mm}.px-header{min-height:18mm;border-bottom:.45mm solid #344054;padding-bottom:3mm;margin-bottom:4mm;display:flex;align-items:center;justify-content:space-between;gap:4mm}.px-header.logorow{display:block}.px-header.logorow .px-logos{justify-content:center;margin-bottom:2mm}.px-header.minimal{border-bottom:1mm solid #0d6b58}.px-logos{display:flex;gap:2mm;align-items:center}.px-logo{text-align:center;min-width:23mm}.px-logo-box{height:10mm;max-width:30mm;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:7pt;color:#344054}.px-logo-box img{max-width:100%;max-height:100%;object-fit:contain}.px-logo span{display:block;font-size:6pt;color:#667085}.px-project{text-align:center}.px-project b,.px-project span,.px-project small{display:block}.px-project b{font-size:10pt}.px-project span{font-size:8pt;margin-top:1mm}.px-project small{font-size:6.5pt;color:#667085;margin-top:1mm}.px-title{text-align:center;margin:5mm 0 4mm}.px-title b,.px-title span{display:block}.px-title b{font-size:14pt}.px-title span{font-size:10pt;margin-top:1mm}.px-division{background:#edf7f4;border-left:1.5mm solid #0d6b58;padding:3.2mm 4mm;margin-bottom:3mm}.px-division strong,.px-division span{display:block}.px-division strong{font-size:10.5pt}.px-division span{font-size:9pt;margin-top:1mm}.px-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:7.5pt}.px-table th,.px-table td{border:.25mm solid #cfd6dc;padding:2.1mm;vertical-align:top}.px-table th{background:#e7efec;font-weight:800}.px-table th:nth-child(1),.px-table td:nth-child(1){width:14%;white-space:nowrap;font-family:ui-monospace,monospace;font-weight:700}.px-table th:nth-child(2),.px-table td:nth-child(2){width:42%}.px-table th:nth-child(3),.px-table td:nth-child(3){width:8%}.px-table th:nth-child(n+4),.px-table td:nth-child(n+4){width:12%;text-align:right}.px-table.summary{font-size:7.2pt}.px-table.summary th:nth-child(1){width:13%}.px-table.summary th:nth-child(2){width:25%}.px-table.summary th:nth-child(3){width:24%}.px-table.summary th:nth-child(4){width:18%}.px-table.summary th:nth-child(5){width:8%}.px-table.summary th:nth-child(6){width:12%}.px-ar{margin-top:1.5mm;padding-top:1.5mm;border-top:.2mm dashed #d0d5dd}.px-totals{display:flex;justify-content:flex-end;gap:8mm;margin-top:3mm;font-size:8.5pt}.sum-totals{width:76mm;margin:4mm 0 0 auto;border-top:.5mm solid #344054;font-size:8pt}.sum-totals div{display:flex;justify-content:space-between;padding:1.5mm 2mm;border-bottom:.2mm solid #d0d5dd}.sum-totals .grand{font-size:9.5pt;font-weight:800;background:#edf7f4}.code-range{font-family:ui-monospace,monospace;white-space:nowrap}@page{size:A4 portrait;margin:0}@media print{html,body{background:white}.px-page{margin:0;box-shadow:none}.px-page.landscape{page:landscape}@page landscape{size:A4 landscape;margin:0}}`;}
function printPdfCodes(){
  const divs=usedDivisionsWithCodes(),pages=[{type:'cover'},{type:'summary'}];
  divs.forEach(d=>chunkRows(d.rows).forEach((rows,idx)=>pages.push({type:'division',division:d,rows,continued:idx>0})));
  const total=pages.length;let html='',cumulative=0;
  pages.forEach((p,idx)=>{
    const no=idx+1;
    if(p.type==='cover'){
      html+=pageShellN('<div class="px-cover"><div class="px-logos">'+partyLogosN()+'</div><div class="px-cover-title"><span>Bill of Quantities</span><h1>'+escN(S.project.pen)+'</h1><h2 dir="rtl">'+escN(S.project.par)+'</h2><p>'+escN(S.project.pno)+' • '+escN(S.project.rev)+'</p></div><div class="px-cover-meta"><div><small>Subtotal before VAT</small><b>'+moneyN(subtotal())+' SAR</b></div><div><small>VAT ('+taxPct().toFixed(2)+'%)</small><b>'+moneyN(taxAmt())+' SAR</b></div><div><small>Grand Total incl. VAT</small><b>'+moneyN(totalInc())+' SAR</b></div><div><small>BOQ Items</small><b>'+(S.items||[]).length+'</b></div></div></div>',no,total);return;
    }
    if(p.type==='summary'){
      const rows=divs.map(d=>'<tr><td>'+(d.code==='OTHER'?'OTHER':'Division '+d.code)+'</td><td>'+escN(d.en)+'</td><td dir="rtl">'+escN(d.ar)+'</td><td class="code-range">'+escN(d.range)+'</td><td>'+d.rows.length+'</td><td>'+moneyN(d.total)+'</td></tr>').join('');
      const totals='<div class="sum-totals"><div><span>Subtotal / الإجمالي قبل الضريبة</span><b>'+moneyN(subtotal())+' SAR</b></div><div><span>VAT / الضريبة ('+taxPct().toFixed(2)+'%)</span><b>'+moneyN(taxAmt())+' SAR</b></div><div class="grand"><span>Grand Total incl. VAT / الإجمالي شامل الضريبة</span><b>'+moneyN(totalInc())+' SAR</b></div></div>';
      html+=pageShellN(headerN()+'<div class="px-title"><b>BOQ Division Summary</b><span dir="rtl">ملخص أقسام جدول الكميات</span></div><table class="px-table summary"><thead><tr><th>Division</th><th>English</th><th>العربية</th><th>Item Code Range</th><th>Items</th><th>Amount</th></tr></thead><tbody>'+rows+'</tbody></table>'+totals,no,total,'Summary');return;
    }
    const d=p.division;let pageTotal=0;
    const rows=p.rows.map(x=>{const i=x.item,amt=(+i.qty||0)*(+i.rate||0);pageTotal+=amt;return '<tr><td>'+x.code+'</td><td>'+itemTextN(i)+'</td><td>'+escN(i.unit)+'</td><td>'+moneyN(i.qty)+'</td><td>'+moneyN(i.rate)+'</td><td>'+moneyN(amt)+'</td></tr>'}).join('');
    cumulative+=pageTotal;
    const totals='<div class="px-totals"><span>Page Total: <b>'+moneyN(pageTotal)+' SAR</b></span>'+(S.totalMode==='cum'?'<span>Cumulative: <b>'+moneyN(cumulative)+' SAR</b></span>':'')+'</div>';
    html+=pageShellN(headerN()+'<div class="px-division"><strong>'+(d.code==='OTHER'?'OTHER':'Division '+d.code)+' — '+escN(d.en)+'</strong><span dir="rtl">'+escN(d.ar)+(p.continued?' — تابع':'')+'</span></div><table class="px-table"><thead><tr><th>Item Code</th><th>Item / Description</th><th>Unit</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>'+rows+'</tbody></table>'+totals,no,total,(d.code==='OTHER'?'OTHER':'Division '+d.code));
  });
  const w=window.open('','_blank');if(!w){toast('Allow pop-ups to print the PDF.');return;}w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+escN(S.project.pen)+' - BOQ</title><style>'+printCssN()+'</style></head><body>'+html+'<script>window.onload=()=>setTimeout(()=>window.print(),400)<\/script></body></html>');w.document.close();
}
async function exportExcelCodes(mode){
  if(!window.ExcelJS){toast('Excel engine is still loading. Try again in a moment.');return;}
  const wb=new ExcelJS.Workbook();wb.creator='Nusoq';wb.created=new Date();
  const styleHead=r=>r.eachCell(c=>{c.font={bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0D6B58'}};c.alignment={horizontal:'center',vertical:'middle'}});
  const base=(ws,title)=>{ws.pageSetup={paperSize:9,orientation:S.ori==='l'?'landscape':'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:.25,right:.25,top:.45,bottom:.45,header:.15,footer:.15}};ws.headerFooter.oddFooter='&L'+(S.project.pno||'')+'&C'+title+'&RPage &P of &N';ws.mergeCells('A1:F1');ws.getCell('A1').value=S.project.pen;ws.getCell('A1').font={bold:true,size:16};ws.getCell('A1').alignment={horizontal:'center'};ws.mergeCells('A2:F2');ws.getCell('A2').value=S.project.par;ws.getCell('A2').alignment={horizontal:'center',readingOrder:'rtl'};ws.mergeCells('A3:F3');ws.getCell('A3').value=title;ws.getCell('A3').font={bold:true,size:12,color:{argb:'FF0D6B58'}};ws.getCell('A3').alignment={horizontal:'center'};ws.getRow(6).values=['Item Code','Item / Description','Unit','Qty','Rate','Amount'];styleHead(ws.getRow(6));ws.columns=[{width:14},{width:68},{width:10},{width:12},{width:15},{width:17}]};};
  const addRow=(ws,r,x)=>{const i=x.item,row=ws.getRow(r);row.values=[x.code,(i.nameEn||'')+'\n'+(i.descEn||'')+'\n'+(i.nameAr||'')+'\n'+(i.descAr||''),i.unit,+i.qty||0,+i.rate||0,(+i.qty||0)*(+i.rate||0)];row.getCell(1).font={name:'Consolas',bold:true};row.getCell(2).alignment={wrapText:true,vertical:'top'};[4,5,6].forEach(n=>row.getCell(n).numFmt='#,##0.00');row.eachCell(c=>c.border={top:{style:'thin',color:{argb:'FFD0D5DD'}},left:{style:'thin',color:{argb:'FFD0D5DD'}},bottom:{style:'thin',color:{argb:'FFD0D5DD'}},right:{style:'thin',color:{argb:'FFD0D5DD'}}});};
  const cover=wb.addWorksheet('Cover');cover.columns=Array(6).fill({width:18});cover.mergeCells('A5:F5');cover.getCell('A5').value='BILL OF QUANTITIES';cover.getCell('A5').font={bold:true,size:18,color:{argb:'FF0D6B58'}};cover.getCell('A5').alignment={horizontal:'center'};cover.mergeCells('A7:F7');cover.getCell('A7').value=S.project.pen;cover.getCell('A7').font={bold:true,size:22};cover.getCell('A7').alignment={horizontal:'center'};cover.mergeCells('A10:F10');cover.getCell('A10').value='Subtotal: '+moneyN(subtotal())+' SAR';cover.mergeCells('A11:F11');cover.getCell('A11').value='VAT ('+taxPct().toFixed(2)+'%): '+moneyN(taxAmt())+' SAR';cover.mergeCells('A12:F12');cover.getCell('A12').value='Grand Total incl. VAT: '+moneyN(totalInc())+' SAR';['A10','A11','A12'].forEach(a=>{cover.getCell(a).font={bold:true};cover.getCell(a).alignment={horizontal:'center'}});cover.headerFooter.oddFooter='&CPage &P of &N';
  const summary=wb.addWorksheet('Summary');summary.pageSetup={paperSize:9,orientation:'portrait',fitToPage:true,fitToWidth:1,fitToHeight:1};summary.headerFooter.oddFooter='&CPage &P of &N';summary.getRow(1).values=['Division','English','العربية','Item Code Range','Items','Amount (SAR)'];styleHead(summary.getRow(1));let sr=2;usedDivisionsWithCodes().forEach(d=>{const r=summary.getRow(sr++);r.values=[d.code==='OTHER'?'OTHER':'Division '+d.code,d.en,d.ar,d.range,d.rows.length,d.total];r.getCell(4).font={name:'Consolas'};r.getCell(6).numFmt='#,##0.00'});summary.getCell('E'+(sr+1)).value='Subtotal';summary.getCell('F'+(sr+1)).value=subtotal();summary.getCell('E'+(sr+2)).value='VAT '+taxPct().toFixed(2)+'%';summary.getCell('F'+(sr+2)).value=taxAmt();summary.getCell('E'+(sr+3)).value='Grand Total incl. VAT';summary.getCell('F'+(sr+3)).value=totalInc();summary.getRow(sr+3).font={bold:true};summary.columns=[{width:16},{width:28},{width:28},{width:22},{width:10},{width:18}];
  if(mode==='division'){
    usedDivisionsWithCodes().forEach(d=>{const nm=(d.code==='OTHER'?'OTHER':'D'+d.code+' '+d.en).slice(0,31).replace(/[\\/*?:\[\]]/g,'-'),ws=wb.addWorksheet(nm);base(ws,(d.code==='OTHER'?'OTHER':'Division '+d.code)+' — '+d.en);let r=7;d.rows.forEach(x=>addRow(ws,r++,x));ws.getCell('E'+r).value='Division Total';ws.getCell('F'+r).value=d.total;ws.getRow(r).font={bold:true};ws.getCell('F'+r).numFmt='#,##0.00';});
  }else{
    const ws=wb.addWorksheet('Combined BOQ');base(ws,'Combined BOQ');let r=7,last=null;codeEntries().forEach(x=>{const i=x.item;if(i.division!==last){const d=divByCode(i.division)||{en:'Other',ar:'أخرى'};ws.mergeCells(r,1,r,6);const c=ws.getCell(r,1);c.value=(i.division==='OTHER'?'OTHER':'Division '+i.division)+' — '+(i.division==='OTHER'?(i.customEn||d.en):d.en)+' / '+(i.division==='OTHER'?(i.customAr||d.ar):d.ar);c.font={bold:true,color:{argb:'FF0D6B58'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFEAF6F2'}};r++;last=i.division;}addRow(ws,r++,x);});ws.getCell('E'+r).value='Subtotal';ws.getCell('F'+r).value=subtotal();ws.getCell('E'+(r+1)).value='VAT '+taxPct().toFixed(2)+'%';ws.getCell('F'+(r+1)).value=taxAmt();ws.getCell('E'+(r+2)).value='Grand Total incl. VAT';ws.getCell('F'+(r+2)).value=totalInc();ws.getRow(r+2).font={bold:true};[r,r+1,r+2].forEach(n=>ws.getCell('F'+n).numFmt='#,##0.00');
  }
  const buf=await wb.xlsx.writeBuffer(),blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(S.project.pen||'BOQ')+' - BOQ.xlsx';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);toast('Excel exported with BOQ item codes.');
}
function wire(){const pdf=document.querySelector('#pdfExportBtn');if(pdf)pdf.onclick=printPdfCodes;const run=document.querySelector('#runExcel');if(run)run.onclick=()=>{const m=document.querySelector('input[name="excelMode"]:checked')?.value||'combined';document.querySelector('#excelModal')?.classList.remove('on');exportExcelCodes(m);};patchEditorCodes();}
setTimeout(wire,250);
})();