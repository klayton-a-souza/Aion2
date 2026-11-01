var A2=(function(){
  var entries=[],initializers=[],applied=0,started=false;
  return {
    extensions:{register:function(feature,target,factory){if(typeof factory!=='function')throw Error('Extensão inválida: '+feature);entries.push({feature:feature,target:target,factory:factory})},composePending:function(order){if(order&&applied===0)entries.sort(function(a,b){return order.indexOf(a.feature)-order.indexOf(b.feature)});while(applied<entries.length){var e=entries[applied++];globalThis[e.target]=e.factory(globalThis[e.target])}}},
    lifecycle:{register:function(feature,initialize){initializers.push({feature:feature,initialize:initialize})},run:function(feature){initializers.filter(function(x){return x.feature===feature}).forEach(function(x){x.initialize()})},start:function(order){if(started)return;started=true;if(order)initializers.sort(function(a,b){return order.indexOf(a.feature)-order.indexOf(b.feature)});initializers.forEach(function(x){x.initialize()})}},
    store:{snapshot:function(){return cloneData(AION_STATE.data)},transact:function(action,options){options=options||{};var before=cloneData(AION_STATE.data),saved;try{if(options.before)options.before();action();if(options.after)options.after();if(options.validate)options.validate();else prepareState(AION_STATE.data);saved=saveState()}catch(error){AION_STATE.data=before;return {ok:false,error:error}}if(options.render)options.render();else renderApp();return {ok:true,saved:saved}}}
  };
})();
