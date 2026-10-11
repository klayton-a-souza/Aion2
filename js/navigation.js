// Hashes keep section navigation compatible with file:// and native history.
var sidebarCollapsed=false;
var currentInterfaceRoute=null;
function toggleSidebar(){sidebarCollapsed=!sidebarCollapsed;var sidebar=document.getElementById("sidebar"),button=document.getElementById("sidebar-toggle");sidebar.classList.toggle("is-collapsed",sidebarCollapsed);button.setAttribute("aria-expanded",String(!sidebarCollapsed));var label=sidebarCollapsed?"Expandir menu lateral":"Recolher menu lateral";button.setAttribute("aria-label",label);button.setAttribute("title",label);button.innerHTML='☰ <span>'+(sidebarCollapsed?'Expandir menu':'Recolher menu')+'</span>'}
var APP_ROUTES={home:{page:"dashboard-page",nav:"nav-home",title:"Visão Geral"},characters:{page:"characters-page",nav:"nav-characters",title:"Personagens"},progression:{page:"progress-page",nav:"nav-progress",title:"Progressão"},activities:{page:"activities-page",nav:"nav-activities",title:"Atividades"}};
function routeFromHash(hash){var key=String(hash||"").replace(/^#/,"");return Object.prototype.hasOwnProperty.call(APP_ROUTES,key)?key:"home"}
function applyRoute(){var key=routeFromHash(window.location.hash);Object.keys(APP_ROUTES).forEach(function(name){var route=APP_ROUTES[name],page=document.getElementById(route.page),nav=document.getElementById(route.nav);if(page)page.hidden=name!==key;if(nav){nav.classList.toggle("is-active",name===key);if(name===key)nav.setAttribute("aria-current","page");else nav.removeAttribute("aria-current")}});document.querySelector(".topbar h1").textContent=APP_ROUTES[key].title;progressPage=key==="progression";if(currentInterfaceRoute!==key){currentInterfaceRoute=key}}
function navigateTo(key){if(!Object.prototype.hasOwnProperty.call(APP_ROUTES,key))key="home";if(window.location.hash!=="#"+key)window.location.hash=key;applyRoute()}
showPage=function(progress){navigateTo(progress?"progression":"home")};
showActivities=function(){navigateTo("activities")};
document.addEventListener("DOMContentLoaded",function(){
  document.getElementById("sidebar-toggle").onclick=toggleSidebar;
  var main=document.querySelector(".main-content");main.insertBefore(document.getElementById("characters-page"),document.querySelector(".page-footer"));
  var navs=document.querySelectorAll(".nav-item");navs[1].id="nav-characters";
  Object.keys(APP_ROUTES).forEach(function(key){var nav=document.getElementById(APP_ROUTES[key].nav);nav.disabled=false;nav.onclick=function(){navigateTo(key)}});
  window.addEventListener("hashchange",applyRoute);
  if(!window.location.hash)window.history.replaceState(null,"","#home");applyRoute();
});
