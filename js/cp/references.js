// User-supplied planning compilation. No verified primary URL is available.
var CP_COMMUNITY_STUDY={id:'community-2026-10',collectedMonth:'2026-10',compiledOn:'2026-10-31',totalReports:62,
  bands:[[1400,1599,72,null],[1600,1799,88,4],[1800,1999,90,null],[2000,2199,92,null],[2200,2399,107,null],[2400,2599,120,null],[2600,2799,131,2],[2800,Number.MAX_SAFE_INTEGER,158,2]]};
function seedCPCommunityStudy(assessment){
  if(assessment.communityStudyVersion===2)return assessment;
  var now=new Date().toISOString();
  CP_COMMUNITY_STUDY.bands.forEach(function(b){
    var id=CP_COMMUNITY_STUDY.id+'-'+b[0];
    var existing=assessment.references.find(function(r){return r.id===id});
    if(existing){
      // Only an identifiable original seed is converted. Custom values stay intact.
      if(existing.preliminary===true&&existing.minIlevel===b[0]&&existing.maxIlevel===b[1]&&existing.medianCP===b[2]*1000){
        existing.scaleMigrationFrom=existing.medianCP;existing.medianCP=b[2];existing.updatedAt=now;
      }
      return;
    }
    if(assessment.communityStudyVersion!==undefined)return;
    assessment.references.push({id:id,className:'',role:'',minIlevel:b[0],maxIlevel:b[1],medianCP:b[2],sampleSize:b[3],
      source:'Levantamento comunitário discutido no planejamento — fonte primária pendente de documentação',collectedOn:null,
      collectedMonth:CP_COMMUNITY_STUDY.collectedMonth,compiledOn:CP_COMMUNITY_STUDY.compiledOn,totalReports:CP_COMMUNITY_STUDY.totalReports,
      preliminary:true,sourcePending:true,confidence:'limited',notes:'Mediana aproximada, sem segmentação por classe. 62 relatos no levantamento total; não correspondem à amostra desta faixa. Não é estatística oficial do Global LA.',
      createdAt:now,updatedAt:now});
  });
  assessment.communityStudyVersion=2;return assessment;
}
