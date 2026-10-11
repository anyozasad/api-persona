export const PORTAL_MODULES=['inicio','casa','rutinas','clases','reservas','calendario','asistencias','pagos','progreso','club','avisos','soporte','perfil'] as const;
export function normalizeText(value:any):string{return String(value??'').trim().replace(/\s+/g,' ');}
export function normalizeStatus(value:any):string{return normalizeText(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
export function parseLocalDate(value:any):Date|null{const raw=normalizeText(value);if(!raw)return null;let source=raw;if(/^\d{4}-\d{2}-\d{2}$/.test(raw))source=raw+'T00:00:00';else if(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(raw))source=raw.replace(' ','T');const d=new Date(source);return isNaN(d.getTime())?null:d;}
export function localDateIso(value=new Date()):string{const y=value.getFullYear();const m=String(value.getMonth()+1).padStart(2,'0');const d=String(value.getDate()).padStart(2,'0');return `${y}-${m}-${d}`;}
export function safeTime(value:any):number{return parseLocalDate(value)?.getTime()??0;}
export function normalizeEmail(value:any):string{return normalizeText(value).toLowerCase();}
export function normalizePhone(value:any):string{return String(value??'').replace(/\D+/g,'').slice(0,15);}
export function safeArray<T=any>(value:any):T[]{return Array.isArray(value)?value:[];}
export function uniqueById<T=any>(items:T[],keys:string[]=['id','id_cliente','id_pago','id_reserva']):T[]{const seen=new Set<string>();return safeArray<T>(items).filter((item:any)=>{const key=keys.map(k=>item?.[k]).find(v=>v!==undefined&&v!==null);const id=String(key??JSON.stringify(item));if(seen.has(id))return false;seen.add(id);return true;});}
export function sortNewest<T=any>(items:T[],field:string):T[]{return [...safeArray<T>(items)].sort((a:any,b:any)=>safeTime(b?.[field])-safeTime(a?.[field]));}
export function sortOldest<T=any>(items:T[],field:string):T[]{return [...safeArray<T>(items)].sort((a:any,b:any)=>safeTime(a?.[field])-safeTime(b?.[field]));}
export function clampPercent(value:any):number{return Math.max(0,Math.min(100,Math.round(Number(value)||0)));}
export function safeNumber(value:any,fallback=0):number{const n=Number(value);return Number.isFinite(n)?n:fallback;}
export function nonNegative(value:any):number{return Math.max(0,safeNumber(value));}
export function daysUntil(value:any,now=new Date()):number{if(!value)return 0;const base=String(value).slice(0,10);const d=parseLocalDate(base+'T23:59:59');if(!d)return 0;return Math.max(0,Math.ceil((d.getTime()-now.getTime())/86400000));}
export function isExpiringSoon(value:any,days=7,now=new Date()):boolean{const d=daysUntil(value,now);return d>0&&d<=days;}
export function completedPayments(items:any[]):any[]{return safeArray(items).filter(x=>String(x?.estado_pago||'').toLowerCase()==='completado');}
export function pendingPayments(items:any[]):any[]{return safeArray(items).filter(x=>String(x?.estado_pago||'').toLowerCase()==='pendiente');}
export function totalCompletedAmount(items:any[]):number{return completedPayments(items).reduce((s,x)=>s+nonNegative(x?.monto),0);}
export function latestCompletedPayment(items:any[]):any{return sortNewest(completedPayments(items),'fecha_pago')[0]||null;}
export function paymentStatusLabel(item:any):string{const s=normalizeText(item?.estado_pago).toLowerCase();return s==='completado'?'Completado':s==='pendiente'?'Pendiente':s==='cancelado'?'Cancelado':normalizeText(item?.estado_pago)||'Sin estado';}
export function membershipStatus(item:any,now=new Date()):'Activa'|'Programada'|'Vencida'|'Sin membresía'{if(!item)return'Sin membresía';const ini=item?.fecha_inicio?parseLocalDate(String(item.fecha_inicio).slice(0,10)+'T00:00:00'):null;const fin=item?.fecha_fin?parseLocalDate(String(item.fecha_fin).slice(0,10)+'T23:59:59'):null;if(ini&&ini.getTime()>now.getTime())return'Programada';if(fin&&fin.getTime()<now.getTime())return'Vencida';return'Activa';}
export function nextMembershipStart(item:any):string{return item?.fecha_inicio?String(item.fecha_inicio).slice(0,10):'';}
export function normalizeOperationNumber(value:any):string{return String(value??'').replace(/[^A-Za-z0-9-]/g,'').slice(0,40);}
export function activeClasses(items:any[]):any[]{return safeArray(items).filter(x=>String(x?.estado||'').toLowerCase()==='activo');}
export function availableClasses(items:any[]):any[]{return activeClasses(items).filter(x=>safeNumber(x?.cupo_disponible,x?.cupo??1)>0);}
export function reservationActive(item:any):boolean{return normalizeStatus(item?.estado)==='reservada';}
export function reservationCancelled(item:any):boolean{return normalizeStatus(item?.estado)==='cancelada';}
export function reservationAttended(item:any):boolean{return normalizeStatus(item?.estado)==='asistio';}
export function hasDuplicateReservation(items:any[],classId:any,date:any):boolean{const d=String(date??'').slice(0,10);return safeArray(items).some(x=>reservationActive(x)&&Number(x?.id_clase??x?.clase?.id_clase)===Number(classId)&&String(x?.fecha_clase??'').slice(0,10)===d);}
export function nextReservation(items:any[],now=new Date()):any{const inicio=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();return safeArray(items).filter(reservationActive).filter(x=>safeTime(x?.fecha_clase)>=inicio).sort((a,b)=>safeTime(a?.fecha_clase)-safeTime(b?.fecha_clase))[0]||null;}
export function reservationSummary(items:any[]):any{return{activas:safeArray(items).filter(reservationActive).length,asistidas:safeArray(items).filter(reservationAttended).length,canceladas:safeArray(items).filter(reservationCancelled).length};}
export function searchClasses(items:any[],query:any):any[]{const q=normalizeText(query).toLowerCase();if(!q)return safeArray(items);return safeArray(items).filter(x=>[x?.nombre,x?.descripcion,x?.sala,x?.entrenador?.nombres,x?.entrenador?.apellidos].some(v=>String(v??'').toLowerCase().includes(q)));}
export function sortClassesByName(items:any[]):any[]{return [...safeArray(items)].sort((a,b)=>normalizeText(a?.nombre).localeCompare(normalizeText(b?.nombre),'es'));}
export function attendanceOpen(items:any[]):any{return safeArray(items).find(x=>x?.fecha_hora_entrada&&!x?.fecha_hora_salida)||null;}
export function attendanceThisMonth(items:any[],now=new Date()):any[]{return safeArray(items).filter(x=>{const d=parseLocalDate(x?.fecha_hora_entrada);return!!d&&d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth();});}
export function attendanceDurationMinutes(item:any,now=new Date()):number{if(!item?.fecha_hora_entrada)return 0;const a=parseLocalDate(item.fecha_hora_entrada);const b=item?.fecha_hora_salida?parseLocalDate(item.fecha_hora_salida):now;if(!a||!b)return 0;return Math.max(0,Math.floor((b.getTime()-a.getTime())/60000));}
export function totalAttendanceMinutesThisMonth(items:any[],now=new Date()):number{return attendanceThisMonth(items,now).reduce((s,x)=>s+attendanceDurationMinutes(x,now),0);}
export function averageAttendanceMinutesThisMonth(items:any[],now=new Date()):number{const list=attendanceThisMonth(items,now);return list.length?Math.round(totalAttendanceMinutesThisMonth(list,now)/list.length):0;}
export function activeRoutine(items:any[],now=new Date()):any{const day=new Date(now);day.setHours(0,0,0,0);return safeArray(items).find(x=>{if(normalizeStatus(x?.estado)!=='activo')return false;const ini=x?.fecha_inicio?parseLocalDate(String(x.fecha_inicio).slice(0,10)+'T00:00:00'):null;const fin=x?.fecha_fin?parseLocalDate(String(x.fecha_fin).slice(0,10)+'T23:59:59'):null;return(!ini||ini.getTime()<=day.getTime())&&(!fin||fin.getTime()>=day.getTime());})||null;}
export function routineExercises(routine:any):any[]{return safeArray(routine?.detalles);}
export function trainingSessionCompleted(item:any):boolean{return['completada','completado','finalizada','finalizado'].includes(String(item?.estado||'').toLowerCase())||Boolean(item?.fecha_fin||item?.finalizado_en);}
export function safeRestSeconds(value:any):number{return Math.max(15,Math.min(300,Math.round(safeNumber(value,60))));}
export function safeReps(value:any):number{return Math.max(1,Math.min(100,Math.round(safeNumber(value,1))));}
export function safeSeries(value:any):number{return Math.max(1,Math.min(10,Math.round(safeNumber(value,1))));}
export function nextExerciseIndex(current:any,total:any):number{const t=Math.max(0,Math.round(safeNumber(total)));if(!t)return 0;return Math.min(t-1,Math.max(0,Math.round(safeNumber(current))+1));}
export function trainingProgressPercent(index:any,total:any):number{const t=Math.max(0,safeNumber(total));if(!t)return 0;return clampPercent(((safeNumber(index)+1)/t)*100);}
export function weeklyTrainingDaysLimit(days:any[]):string[]{return[...new Set(safeArray<string>(days).map(normalizeText).filter(Boolean))].slice(0,4);}
export function uniqueTrainingZones(zones:any[]):string[]{return[...new Set(safeArray<string>(zones).map(x=>normalizeText(x).toLowerCase()).filter(Boolean))].slice(0,7);}
export function safeModule(value:any):string{const m=normalizeText(value).toLowerCase();return(PORTAL_MODULES as readonly string[]).includes(m)?m:'inicio';}
export function formatLocalDate(value:any):string{if(!value)return'-';const d=parseLocalDate(value);return d?d.toLocaleDateString('es-PE'):String(value);}
export function formatCurrencyPEN(value:any):string{return new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN',minimumFractionDigits:2}).format(nonNegative(value));}
export function profileCompletionPercent(profile:any):number{const keys=['nombres','apellidos','correo','telefono','direccion'];const done=keys.filter(k=>normalizeText(profile?.[k])).length;return Math.round((done/keys.length)*100);}
export function missingProfileFields(profile:any):string[]{const map:any={nombres:'Nombres',apellidos:'Apellidos',correo:'Correo',telefono:'Teléfono',direccion:'Dirección'};return Object.keys(map).filter(k=>!normalizeText(profile?.[k])).map(k=>map[k]);}
