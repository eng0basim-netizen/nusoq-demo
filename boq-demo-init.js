(()=>{
const VERSION='hq-demo-v3';
const KEY='nusoq-boq-final-v1';
const VKEY='nusoq-boq-demo-version';
const logo=(brand,sub,bg,accent)=>{
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="520" height="180" viewBox="0 0 520 180"><rect width="520" height="180" rx="26" fill="${bg}"/><circle cx="86" cy="90" r="48" fill="${accent}"/><path d="M59 107 L86 52 L113 107 Z" fill="white"/><rect x="75" y="96" width="22" height="27" rx="4" fill="white"/><text x="154" y="82" fill="white" font-family="Arial,sans-serif" font-size="30" font-weight="700">${brand}</text><text x="154" y="119" fill="#dbe7ef" font-family="Arial,sans-serif" font-size="17">${sub}</text></svg>`;
  return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
};
const DEMO={
 step:1,lang:'both',layout:'balanced',ori:'p',totalMode:'page',breakdown:'entire',
 project:{pen:'Orion Crest Global Headquarters',par:'المقر الرئيسي العالمي لمجموعة أوريون كريست',ten:'Bill of Quantities',tar:'جدول الكميات',pno:'OCG-HQ-001',rev:'Rev.00'},
 parties:[
  {id:1,role:'Owner',en:'Orion Crest Group',ar:'مجموعة أوريون كريست',logo:logo('ORION CREST','ORION CREST GROUP','#0d2235','#0d6b58')},
  {id:2,role:'Main Contractor',en:'Summit Axis Contracting',ar:'شركة سامت أكسس للمقاولات',logo:logo('SUMMIT AXIS','SUMMIT AXIS CONTRACTING','#322f45','#a2783a')}
 ],
 items:window.NUSOQ_DEMO_ITEMS||[]
};
if(!localStorage.getItem(KEY)||localStorage.getItem(VKEY)!==VERSION){
 localStorage.setItem(KEY,JSON.stringify(DEMO));
 localStorage.setItem(VKEY,VERSION);
}
})();
