DROP PROCEDURE viajes_eval;

DELIMITER $$
CREATE PROCEDURE viajes_eval(fechaDesde varchar(20), fechaHasta varchar(20), duracionViaje varchar(5), idVehiculo integer, idViaje integer)
BEGIN

	CALL make_intervals(STR_TO_DATE(fechaDesde, GET_FORMAT(DATETIME,'INTERNAL')), STR_TO_DATE(fechaHasta, GET_FORMAT(DATETIME,'INTERNAL')), 1, 'DAY');

	SELECT COUNT(1) AS 'Superpuestos'
		FROM time_intervals ti
		INNER JOIN viajes v
			ON	v.fecha BETWEEN DATE_FORMAT(ti.interval_start, GET_FORMAT(DATETIME,'INTERNAL')) AND ADDTIME(DATE_FORMAT(ti.interval_start, GET_FORMAT(DATETIME,'INTERNAL')), duracionViaje) 
				/*DATE_FORMAT(ti.interval_start, '%Y%m%d') = DATE_FORMAT(v.fecha, '%Y%m%d')*/
		INNER JOIN vehiculos ve
			ON	v.idVehiculo = ve.id
		WHERE	v.fechaCancelacion IS NULL
				AND v.idVehiculo = idVehiculo
                AND v.id != idViaje;

 END$$
DELIMITER ;
