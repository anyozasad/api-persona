import {
  normalizeText,normalizeStatus,parseLocalDate,localDateIso,safeTime,normalizeEmail,normalizePhone,safeArray,uniqueById,sortNewest,sortOldest,clampPercent,safeNumber,nonNegative,
  daysUntil,isExpiringSoon,completedPayments,pendingPayments,totalCompletedAmount,latestCompletedPayment,paymentStatusLabel,membershipStatus,nextMembershipStart,normalizeOperationNumber,
  activeClasses,availableClasses,reservationActive,reservationCancelled,reservationAttended,hasDuplicateReservation,nextReservation,reservationSummary,searchClasses,sortClassesByName,
  attendanceOpen,attendanceThisMonth,attendanceDurationMinutes,totalAttendanceMinutesThisMonth,averageAttendanceMinutesThisMonth,
  activeRoutine,routineExercises,trainingSessionCompleted,safeRestSeconds,safeReps,safeSeries,nextExerciseIndex,trainingProgressPercent,weeklyTrainingDaysLimit,uniqueTrainingZones,
  safeModule,formatLocalDate,formatCurrencyPEN,profileCompletionPercent,missingProfileFields
} from './portal-cliente-quality';

describe('calidad funcional del portal cliente',()=>{
  const now=new Date('2026-10-11T12:00:00');
  it('normaliza datos generales',()=>{
    expect(normalizeText('  hola   gym ')).toBe('hola gym');
    expect(normalizeStatus(' ASISTIÓ ')).toBe('asistio');
    expect(parseLocalDate('2026-10-11')?.getDate()).toBe(11);
    expect(localDateIso(new Date(2026,9,11,23,30))).toBe('2026-10-11');
    expect(safeTime('2026-10-11')).toBeGreaterThan(0);
    expect(normalizeEmail(' USER@MAIL.COM ')).toBe('user@mail.com');
    expect(normalizePhone('+51 999-111-222')).toBe('51999111222');
    expect(safeArray(null)).toEqual([]);
    expect(uniqueById([{id:1},{id:1},{id:2}]).length).toBe(2);
    expect(sortNewest([{f:'2026-01-01'},{f:'2026-02-01'}],'f')[0].f).toBe('2026-02-01');
    expect(sortOldest([{f:'2026-02-01'},{f:'2026-01-01'}],'f')[0].f).toBe('2026-01-01');
    expect(clampPercent(150)).toBe(100);
    expect(safeNumber('x',7)).toBe(7);
    expect(nonNegative(-5)).toBe(0);
  });
  it('protege membresias y pagos',()=>{
    expect(daysUntil('2026-10-13',now)).toBe(3);
    expect(isExpiringSoon('2026-10-13',7,now)).toBeTrue();
    const p=[{estado_pago:'Completado',monto:20,fecha_pago:'2026-01-01'},{estado_pago:'Pendiente',monto:50,fecha_pago:'2026-02-01'}];
    expect(completedPayments(p).length).toBe(1);
    expect(pendingPayments(p).length).toBe(1);
    expect(totalCompletedAmount(p)).toBe(20);
    expect(latestCompletedPayment(p).monto).toBe(20);
    expect(paymentStatusLabel(p[1])).toBe('Pendiente');
    expect(membershipStatus({fecha_inicio:'2026-10-01',fecha_fin:'2026-10-30'},now)).toBe('Activa');
    expect(nextMembershipStart({fecha_inicio:'2026-12-01 00:00:00'})).toBe('2026-12-01');
    expect(normalizeOperationNumber(' OP #123-45 ')).toBe('OP123-45');
  });
  it('controla clases y reservas',()=>{
    const clases=[{nombre:'Spinning',estado:'Activo',cupo_disponible:1},{nombre:'Yoga',estado:'Inactivo',cupo_disponible:2}];
    expect(activeClasses(clases).length).toBe(1);
    expect(availableClasses(clases).length).toBe(1);
    expect(reservationActive({estado:'Reservada'})).toBeTrue();
    expect(reservationCancelled({estado:'Cancelada'})).toBeTrue();
    expect(reservationAttended({estado:'Asistio'})).toBeTrue();
    expect(reservationAttended({estado:'ASISTIÓ'})).toBeTrue();
    const r=[{estado:'Reservada',id_clase:4,fecha_clase:'2026-10-20'},{estado:'Cancelada',id_clase:5,fecha_clase:'2026-10-22'}];
    expect(hasDuplicateReservation(r,4,'2026-10-20')).toBeTrue();
    expect(nextReservation(r,now).id_clase).toBe(4);
    expect(reservationSummary([...r,{estado:'Asistio'}])).toEqual({activas:1,asistidas:1,canceladas:1});
    expect(searchClasses(clases,'spin').length).toBe(1);
    expect(sortClassesByName([{nombre:'Yoga'},{nombre:'Box'}])[0].nombre).toBe('Box');
  });
  it('resume asistencias',()=>{
    const a=[{fecha_hora_entrada:'2026-10-11T10:00:00',fecha_hora_salida:'2026-10-11T11:00:00'}];
    expect(attendanceOpen([{fecha_hora_entrada:'2026-10-11T10:00:00'}])).toBeTruthy();
    expect(attendanceThisMonth(a,now).length).toBe(1);
    expect(attendanceDurationMinutes(a[0],now)).toBe(60);
    expect(totalAttendanceMinutesThisMonth(a,now)).toBe(60);
    expect(averageAttendanceMinutesThisMonth(a,now)).toBe(60);
  });
  it('protege la logica de entrenamiento',()=>{
    const rutina={estado:'Activo',fecha_inicio:'2026-10-01',fecha_fin:'2026-10-30',detalles:[1,2]};
    expect(activeRoutine([rutina],now)).toBeTruthy();
    expect(routineExercises(rutina).length).toBe(2);
    expect(trainingSessionCompleted({estado:'Completada'})).toBeTrue();
    expect(safeRestSeconds(999)).toBe(300);
    expect(safeReps(0)).toBe(1);
    expect(safeSeries(99)).toBe(10);
    expect(nextExerciseIndex(0,3)).toBe(1);
    expect(trainingProgressPercent(1,4)).toBe(50);
    expect(weeklyTrainingDaysLimit(['Lunes','Martes','Miércoles','Jueves','Viernes']).length).toBe(4);
    expect(uniqueTrainingZones(['Piernas','piernas','Core'])).toEqual(['piernas','core']);
  });
  it('mantiene navegacion y perfil seguros',()=>{
    expect(safeModule('inventado')).toBe('inicio');
    expect(formatLocalDate('2026-10-11')).toContain('11');
    expect(formatCurrencyPEN(25)).toContain('25');
    expect(profileCompletionPercent({nombres:'A',apellidos:'B',correo:'c',telefono:'1',direccion:'d'})).toBe(100);
    expect(missingProfileFields({nombres:'A'}).length).toBe(4);
  });
});
