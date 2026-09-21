window.NUSOQ_DEMO_ITEMS=[];
window.NUSOQ_ADD=function(rows){
  for(const r of rows){
    const [division,nameEn,nameAr,descEn,descAr,unit,qty,rate]=r;
    window.NUSOQ_DEMO_ITEMS.push({
      id:window.NUSOQ_DEMO_ITEMS.length+1,division,customEn:'',customAr:'',
      scope:'Entire Building',nameEn,nameAr,descEn,descAr,qty,unit,rate,needsReview:false
    });
  }
};
