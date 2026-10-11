// Basic keyboard behavior shared by the existing modals.
document.addEventListener("DOMContentLoaded",function(){
  var outside=document.getElementById("add-character"),current=null;
  function visibleModal(){return Array.from(document.querySelectorAll(".modal-backdrop")).find(function(x){return !x.hidden})}
  function focusables(modal){return Array.from(modal.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')).filter(function(x){return !x.disabled&&x.type!=="hidden"&&x.getClientRects().length})}
  document.addEventListener("focusin",function(e){if(!visibleModal())outside=e.target});
  new MutationObserver(function(){var modal=visibleModal();if(modal===current)return;current=modal;document.querySelectorAll(".sidebar,.main-content").forEach(function(x){x.inert=!!modal});if(!modal&&outside&&outside.isConnected)outside.focus()}).observe(document.body,{subtree:true,attributes:true,attributeFilter:["hidden"]});
  document.addEventListener("keydown",function(e){var modal=visibleModal();if(!modal)return;if(e.key==="Escape"){modal.hidden=true;return}if(e.key!=="Tab")return;var items=focusables(modal);if(!items.length)return;var first=items[0],last=items[items.length-1];if(e.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){e.preventDefault();first.focus()}});
});
