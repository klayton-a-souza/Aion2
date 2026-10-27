const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const document={activeElement:null,getElementById(id){return root.nodes.find(n=>n.id===id)}};
const root={nodes:[],contains(node){return this.nodes.includes(node)},querySelectorAll(){return this.nodes},closest(){return this.inert?{}:null},focus(){document.activeElement=this}};
function node(attrs={}){return {id:attrs.id,disabled:false,getAttribute(key){return attrs[key]??null},hasAttribute(key){return key in attrs},focus(){document.activeElement=this}}}
const ctx=vm.createContext({document});
const source=fs.readFileSync('js/progression.js','utf8');
vm.runInContext(source.slice(source.indexOf('function panelFocusToken'),source.indexOf('// UI-only state')),ctx);
const old=node({'data-activity-action':'edit','data-id':'a'});root.nodes=[old];document.activeElement=old;
const token=ctx.panelFocusToken(root),other=node({'data-activity-action':'edit','data-id':'b'}),replacement=node({'data-activity-action':'edit','data-id':'a'});
root.nodes=[other,replacement];ctx.restorePanelFocus(root,token);assert.equal(document.activeElement,replacement);
const filter=node({id:'activity-status'});root.nodes=[filter];document.activeElement=filter;
const filterToken=ctx.panelFocusToken(root),newFilter=node({id:'activity-status'});root.nodes=[newFilter];ctx.restorePanelFocus(root,filterToken);assert.equal(document.activeElement,newFilter);
root.nodes=[];ctx.restorePanelFocus(root,token);assert.equal(document.activeElement,root);assert.equal(root.tabIndex,-1);
root.inert=true;document.activeElement=other;root.nodes=[replacement];ctx.restorePanelFocus(root,token);assert.equal(document.activeElement,other);root.inert=false;
const summary=node();summary.tagName='SUMMARY';summary.parentElement={dataset:{expansionId:'stage-1'}};root.nodes=[summary];document.activeElement=summary;
const stageToken=ctx.panelFocusToken(root),newSummary=node();root.nodes=[{dataset:{expansionId:'stage-1'},querySelector(){return newSummary}}];ctx.restorePanelFocus(root,stageToken);assert.equal(document.activeElement,newSummary);
document.activeElement=other;assert.equal(ctx.panelFocusToken(root),null);
console.log('PASS foco dos painéis: IDs, ações homônimas, etapas, remoção e proteção de modal inerte.');
