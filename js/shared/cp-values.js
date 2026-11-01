// CP is a decimal amount, not an integer and not an inferred unit such as "thousands".
function isValidCombatPower(value){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=Number.MAX_SAFE_INTEGER}
function parseCombatPower(value){var text=String(value).trim();if(!text)return null;if(!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(text))return NaN;return Number(text.replace(',','.'))}
function formatCombatPower(value){return value==null?'Não informado':value.toLocaleString('pt-BR',{minimumFractionDigits:Number.isInteger(value)?0:2,maximumFractionDigits:20})}
function combatPowerInputValue(value){if(value==null)return '';if(value!==0&&Math.abs(value)<1e-18)return String(value).replace('.',',');return value.toLocaleString('pt-BR',{useGrouping:false,minimumFractionDigits:Number.isInteger(value)?0:2,maximumFractionDigits:20})}
function combatPowerDifference(target,current){var difference=target-current;return Number.isInteger(difference)?difference:Number(difference.toPrecision(15))}
function compareCombatPowerRatio(value,bound){var delta=value-bound,tolerance=Number.EPSILON*Math.max(1,Math.abs(value),Math.abs(bound))*8;return Math.abs(delta)<=tolerance?0:Math.sign(delta)}
