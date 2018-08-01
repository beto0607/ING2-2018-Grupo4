DROP TRIGGER new_calificaciones;

delimiter //
CREATE TRIGGER new_calificaciones 
AFTER INSERT ON calificaciones FOR EACH ROW
BEGIN
	-- Si el idUsuarioCalificado es el piloto
	IF EXISTS(SELECT 1 
				FROM viajes v 
				INNER JOIN vehiculos ve 
					ON v.idVehiculo = ve.Id 
				WHERE 	ve.idUsuario = NEW.idUsuarioCalificado 
						AND v.id = NEW.idViaje)
    THEN
		UPDATE usuarios
			SET calificacionPiloto = calificacionPiloto + NEW.Calificacion
			WHERE 	id = NEW.idUsuarioCalificado
					AND calificacionPiloto + NEW.Calificacion > 0;
    ELSE
		UPDATE usuarios
			SET calificacionCopiloto = calificacionCopiloto + NEW.Calificacion
			WHERE 	id = NEW.idUsuarioCalificado
					AND calificacionCopiloto + NEW.Calificacion > 0;
    END IF;
	
END;//
