const fs=require('fs'),vm=require('vm'),assert=require('assert');
const panels=[{open:true},{open:true}],elements=new Map();
function element(id){if(!elements.has(id))elements.set(id,{hidden:false,setAttribute(){},removeAttribute(){},classList:{toggle(){}},querySelectorAll(){return panels}});return elements.get(id)}
const context=vm.createContext({document:{getElementById:element,querySelector:element,addEventListener(){}},window:{location:{hash:'#home'}},activityVisibility:{dashboard:{daily:true,weekly:true},management:{daily:true,weekly:true}},renderDashboard(){},renderActivities(){}});
vm.runInContext(fs.readFileSync('js/navigation.js','utf8'),context);
context.applyRoute();assert(panels.every(p=>p.open));
panels.forEach(p=>p.open=true);context.activityVisibility.dashboard.daily=false;context.activityVisibility.dashboard.weekly=false;
context.applyRoute();assert(panels.every(p=>p.open));assert(!context.activityVisibility.dashboard.daily);
context.window.location.hash='#activities';context.applyRoute();assert(panels.every(p=>p.open));
context.activityVisibility.management.daily=false;context.activityVisibility.management.weekly=false;
context.window.location.hash='#home';context.applyRoute();assert(!context.activityVisibility.dashboard.daily&&!context.activityVisibility.dashboard.weekly);
context.window.location.hash='#activities';context.applyRoute();assert(!context.activityVisibility.management.daily&&!context.activityVisibility.management.weekly);
assert(!context.sidebarCollapsed);
for(const file of ['js/progression.js','js/dashboard.js','js/catalog.js'])assert(!/<details[^>]*\sopen(?:[\s=>])/.test(fs.readFileSync(file,'utf8')));
assert(fs.readFileSync('js/activities.js','utf8').includes('var activityVisibility={dashboard:{daily:true,weekly:true},management:{daily:true,weekly:true}}'));
console.log('PASS seções recolhidas: padrões iniciais estáticos, múltiplas expansões preservadas na navegação e exceção do menu, em ambiente simulado.');
