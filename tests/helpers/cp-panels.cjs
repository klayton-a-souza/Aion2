module.exports=async function expandCPAnalysis(page){
  const buttons=page.locator('.cp-panel-toggle[aria-expanded=false]:visible');
  while(await buttons.count())await buttons.first().click();
  const plan=page.locator('[data-expansion-id=cp-plan-target]:visible');
  if(await plan.count()&&!await plan.evaluate(el=>el.open))await plan.locator('summary').click();
};
