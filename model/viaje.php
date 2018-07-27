<?php
class Viaje
{
	private $pdo;
	private $comision = 5;

    public $id;
	public $idVehiculo;
	public $fecha;
	public $origen;
	public $destino;
	public $plazas;
	public $descripcion;
	public $montoTotal;
	public $porcentajeComision;
	public $fechaCancelacion;
	public $fechaCierre;
	public $duracion;
	public $mensajes;

	public function __CONSTRUCT()
	{
		try
		{
			$this->pdo = Database::StartUp();
		}
		catch(Exception $e)
		{
			die($e->getMessage());
		}
	}

	function obtenerComision(){
    	return $this->comision;
	}

	function CantidadPlazasDisponibles($idViaje)
	{
		$sql = "SELECT	v.plazas - COUNT(cop.idUsuario) AS 'PlazasDisponibles'
				FROM viajes v
			    LEFT JOIN copilotos cop
					ON	v.id = cop.idViaje
						AND cop.fechaCancelacion IS NULL
						AND cop.fechaAprobacion IS NOT NULL
			    WHERE 	v.id = ?;";

	    $stm = $this->pdo->prepare($sql);
		$stm->execute(array($idViaje));
		$val = $stm->fetch();

		return $val['PlazasDisponibles'];
	}

	function ValidarCalificaciones($idUsuario)
	{
		try
		{
			$valido = "";
			// No debería existir una calificación pendiente con más de 30 días de pendiente
			$sql = "SELECT COUNT(1) AS 'Pendientes'
						FROM (
						SELECT	1
							FROM viajes v
						    INNER JOIN vehiculos ve
								ON	v.idVehiculo = ve.id
							LEFT JOIN calificaciones cal
								ON	v.id = cal.idViaje
									AND ve.idUsuario = cal.idUsuarioCalifica
							WHERE 	ve.idUsuario = ?
									AND v.fechaCierre IS NOT NULL
									AND DATEDIFF(NOW(), v.fecha) > 30
						            AND cal.id IS NULL
						UNION
						SELECT	1
							FROM copilotos cop
							INNER JOIN viajes v
								ON	cop.idViaje = v.id
							LEFT JOIN calificaciones cal
								ON	v.id = cal.idViaje
									AND cop.idUsuario = cal.IdUsuarioCalificado
							WHERE	cop.idUsuario = ?
									AND v.fechaCierre IS NOT NULL
									AND DATEDIFF(NOW(), v.fecha) > 30
						            AND cal.id IS NULL
						) AS tmp";
			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($idUsuario, $idUsuario));
			$val = $stm->fetch();
			if ($val['Pendientes'] > 0)
			{
				$valido = 'Debe realizar las calificaciones con más de 30 días de pendientes antes de cargar un nuevo viaje.';
			}

			return $valido;
		}
		catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function Listar()
	{
		try
		{
			$result = array();

			$stm = $this->pdo->prepare("SELECT * FROM viajes");
			$stm->execute();

			return $stm->fetchAll(PDO::FETCH_OBJ);
		}
		catch(Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function Obtener($id)
	{
		try
		{
			$stm = $this->pdo
			            ->prepare("SELECT * FROM viajes WHERE id = ?");

			$stm->execute(array($id));
			return $stm->fetch(PDO::FETCH_OBJ);
		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function ObtenerMensajes($id)
	{
		try
		{
			$stm = $this->pdo
			            ->prepare("SELECT	m.id AS 'idMensaje', 
			            					m.fecha AS 'fechaMensaje', 
			            					m.mensaje, 
			            					u.usuario, 
			            					r.fecha AS 'fechaRespuesta', 
			            					r.respuesta
										FROM mensajes m
									    INNER JOIN usuarios u
											ON m.idUsuario = u.id
									    LEFT JOIN respuestas r
											ON m.id = r.idmensaje
										WHERE	m.idViaje = ?");

			$stm->execute(array($id));
			return $stm->fetchAll(PDO::FETCH_OBJ);
		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function ObtenerCopilotos($id)
	{
		try
		{
			$stm = $this->pdo
			            ->prepare("SELECT	cop.fechaPostulacion, cop.fechaAprobacion, cop.fechaPago, cop.montoPago, cop.fechaCancelacion, cop.fechaRechazo,
											u.id, u.usuario, u.nombre, u.apellido, u.email, u.calificacionPiloto, u.calificacionCopiloto,
											CASE
												WHEN cop.fechaCancelacion IS NOT NULL THEN 'Cancelado'
									            WHEN cop.fechaAprobacion IS NOT NULL THEN 'Aprobado'
									            ELSE '--'
											END AS 'estado'
									FROM viajes v
									INNER JOIN copilotos cop
										ON	v.id = cop.idViaje
											AND cop.fechaAprobacion IS NOT NULL
											AND cop.fechaCancelacion IS NULL
									INNER JOIN usuarios u
										ON	cop.idUsuario = u.id
									WHERE 	v.id = ?");

			$stm->execute(array($id));
			return $stm->fetchAll(PDO::FETCH_OBJ);
		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function ObtenerPostulaciones($id)
	{
		try
		{
			$stm = $this->pdo
			            ->prepare("SELECT	cop.fechaPostulacion, cop.fechaAprobacion, cop.fechaPago, cop.montoPago, cop.fechaCancelacion, cop.fechaRechazo,
											u.id, u.usuario, u.nombre, u.apellido, u.email, u.calificacionPiloto, u.calificacionCopiloto,
											CASE
												WHEN cop.fechaRechazo IS NOT NULL THEN 'Rechazado'
									            WHEN cop.fechaAprobacion IS NOT NULL AND cop.fechaCancelacion IS NOT NULL THEN 'Cancelado'
									            ELSE 'Pendiente'
									        END AS 'estado'
									FROM viajes v
									INNER JOIN copilotos cop
										ON	v.id = cop.idViaje
											AND (cop.fechaAprobacion IS NULL OR (cop.fechaAprobacion IS NULL AND cop.fechaCancelacion IS NOT NULL))
									INNER JOIN usuarios u
										ON	cop.idUsuario = u.id
									WHERE 	v.id = ?");

			$stm->execute(array($id));
			return $stm->fetchAll(PDO::FETCH_OBJ);
		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function Validar(Viaje $data, $tipoAlta = '', $fechaHasta = '')
	{
		$valido = '';

		// La fecha debe ser mayor a la fecha actual
		if (date_create_from_format('Ymd His', $data->fecha) <= date_create())
		{
			$valido = 'La fecha del viaje debe ser superior a la fecha actual.';
		}
		else
		{
			// Monto debería ser mayor a cero
			if ($data->montoTotal <= 0)
			{
				$valido = 'El monto del viaje debe ser mayor a cero.';
			}
			else
			{
				// Origen y Destino no deberían ser iguales
				if (strtoupper(trim($data->origen)) == strtoupper(trim($data->destino)))
				{
					$valido = 'Origen y Destino no deben ser iguales.';
				}
				else
				{
					// Plazas debería ser mayor a 1 y <= a la cantidad de plazas del auto
					$sql = "SELECT plazas FROM unaventon.vehiculos WHERE id = ?";
					$stm = $this->pdo->prepare($sql);
					$stm->execute(array($data->idVehiculo));
					$val = $stm->fetch();
					if ($data->plazas <= 0 || $data->plazas > $val['plazas'])
					{
						$valido = 'La cantidad de plazas no corresponde con la cantidad de plazas del vehículo seleccionado(' . $val['plazas'] . ').';
					}
					else
					{
						// No debería existir otro viaje en la misma fecha para el piloto
						$sql = "CALL viajes_eval(?, ?, ?, ?, ?);";

						$stm = $this->pdo->prepare($sql);
						$stm->execute(array($data->fecha, $fechaHasta, $data->duracion, $data->idVehiculo, $data->id));
						$val = $stm->fetch();
						if ($val['Superpuestos'] > 0)
						{
							$valido = 'Ya tiene un viajes para las fechas seleccionadas.';
						}
						else
						{
							$sql = "SELECT idUsuario FROM vehiculos WHERE id = ?";
							$stm = $this->pdo->prepare($sql);
							$stm->execute(array($data->idVehiculo));
							$val = $stm->fetch();
							$idUsuario = $val['idUsuario'];
							$valido = $this->ValidarCalificaciones($idUsuario);
						}
					}
				}
			}
		}

		return $valido;
	}

	public function Crear($data, $tipoAlta, $fechaHasta)
	{
		try
		{
			$diaSemana = -1;
			$tipo = 'DAY';
			switch ($tipoAlta) {
				case "O":			// OCASIONAL
					$fechaHasta = $data->fecha;
					break;
				case "S":			// SEMANAL
					$diaSemana = date('w', strtotime($data->fecha)) + 1;
					$tipo = "WEEK";
					break;
				case "D":			// DIARIO
					break;
				default:
			}
			$this->pdo->beginTransaction();
			$sql = "CALL make_intervals(STR_TO_DATE(?, GET_FORMAT(DATETIME,'INTERNAL')), STR_TO_DATE(?, GET_FORMAT(DATETIME,'INTERNAL')), 1, ?); " . chr(13) . chr(13);
			$sth = $this->pdo->prepare($sql);
			$sth->bindValue(1, $data->fecha, PDO::PARAM_STR);
			$sth->bindValue(2, $fechaHasta, PDO::PARAM_STR);
			$sth->bindValue(3, $tipo, PDO::PARAM_STR);
			$sth->execute();
			$sql = 	"INSERT INTO viajes(idVehiculo, fecha, origen, destino, plazas, descripcion, montoTotal, porcentajeComision, duracion, cbu) " . chr(13) .
					"SELECT ?, " . chr(13) .
					" f.interval_start, " . chr(13) .
					" ?, " . chr(13) .
					" ?, " . chr(13) .
					" ?, " . chr(13) .
					" ?, " . chr(13) .
					" ?, " . chr(13) .
					" ?, " . chr(13) .
					" ?, " . chr(13) .
					" ? " . chr(13) .
					" FROM time_intervals AS f " . chr(13) .
					" WHERE 	(? = 'O') " . chr(13) .
					"		OR (? = 'S' AND DAYOFWEEK(f.interval_start) = ? AND f.interval_start <= STR_TO_DATE(?, GET_FORMAT(DATETIME,'INTERNAL')))  " . chr(13) .
					"       OR (? = 'D' AND f.interval_start <= STR_TO_DATE(?, GET_FORMAT(DATETIME,'INTERNAL'))); ";
			$sth = $this->pdo->prepare($sql);
			$sth->bindValue(1, $data->idVehiculo, PDO::PARAM_INT);
			$sth->bindValue(2, $data->origen, PDO::PARAM_STR);
			$sth->bindValue(3, $data->destino, PDO::PARAM_STR);
			$sth->bindValue(4, $data->plazas, PDO::PARAM_INT);
			$sth->bindValue(5, $data->descripcion, PDO::PARAM_STR);
			$sth->bindValue(6, $data->montoTotal, PDO::PARAM_STR);
			$sth->bindValue(7, $this->obtenerComision(), PDO::PARAM_STR);
			$sth->bindValue(8, $data->duracion, PDO::PARAM_STR);
			$sth->bindValue(9, $data->cbu, PDO::PARAM_STR);
			$sth->bindValue(10, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(11, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(12, $diaSemana, PDO::PARAM_INT);
			$sth->bindValue(13, $fechaHasta, PDO::PARAM_STR);
			$sth->bindValue(14, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(15, $fechaHasta, PDO::PARAM_STR);
			$sth->execute();
			$id = $this->pdo->lastInsertId();
			$this->pdo->commit();
			return $id;
		} catch (Exception $e)
		{
			$this->pdo->rollBack();
			die($e->getMessage());
		}
	}

	public function Cancelar($id)
	{
		try
		{
			$this->pdo->beginTransaction();
			$stm = $this->pdo->prepare("UPDATE viajes SET fechaCancelacion = NOW() WHERE id = ?");
			$stm->execute(array($id));

			$stm = $this->pdo->prepare("UPDATE copilotos SET fechaCancelacion = NOW() WHERE idViaje = ?");
			$stm->execute(array($id));

			$this->pdo->commit();
		} catch (Exception $e)
		{
			$this->pdo->rollBack();
			die($e->getMessage());
		}
	}

	public function ValidarActualizar(Viaje $data)
	{
		$valido = '';

		// Monto debería ser mayor a cero
		if ($data->montoTotal <= 0)
		{
			$valido = 'El monto del viaje debe ser mayor a cero.';
		}
		else
		{
			// Plazas debería ser mayor a 1 y <= a la cantidad de plazas del auto
			$sql = "SELECT plazas FROM unaventon.vehiculos WHERE id = ?";
			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($data->idVehiculo));
			$val = $stm->fetch();
			if ($data->plazas <= 0 || $data->plazas < $val['plazas'])
			{
				$valido = 'La cantidad de plazas no corresponde con la cantidad de plazas del vehículo seleccionado(' . $val['plazas'] . ').';
			}
			else
			{
				// No debería existir otro viaje en la misma fecha para el piloto
				$sql = "SELECT COUNT(1) AS 'Copilotos' FROM copilotos WHERE idViaje = ? AND fechaCancelacion IS NULL AND fechaRechazo IS NULL AND fechaAprobacion IS NOT NULL;";
				$stm = $this->pdo->prepare($sql);
				$stm->execute(array($data->id));
				$val = $stm->fetch();
				if ($val['Copilotos'] > 0)
				{
					$valido = 'El viaje ya tiene copilotos aprobados.';
				}
				else
				{
					// No debería existir otro viaje en la misma fecha para el piloto
					$sql = "CALL viajes_eval(?, ?, ?, ?, ?);";

					$stm = $this->pdo->prepare($sql);
					$stm->execute(array($data->fecha, $data->fecha, $data->duracion, $data->idVehiculo, $data->id));
					$val = $stm->fetch();
					if ($val['Superpuestos'] > 0)
					{
						$valido = 'Ya tiene un viajes para las fechas seleccionadas.';
					}
				}
			}
		}

		return $valido;
	}


	public function Actualizar($data)
	{
		try
		{
			$sql = "UPDATE viajes SET
						idVehiculo			= ?,
						plazas 				= ?,
						descripcion			= ?,
						montoTotal        	= ?,
						duracion			= ?,
						cbu 				= ?
				    WHERE id = ?";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$data->idVehiculo,
				    	$data->plazas,
				    	$data->descripcion,
                        $data->montoTotal,
                        $data->duracion,
                        $data->cbu,
						$data->id
					)
				);
		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function UsuarioEnViaje($idViaje, $idUsuario)
	{
		try
		{
			$valido = "";

			$sql = "SELECT COUNT(1) AS 'Copiloto' FROM copilotos WHERE idViaje = ? AND idUsuario = ? AND fechaCancelacion IS NULL AND fechaRechazo IS NULL";
			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($idViaje, $idUsuario));
			$val = $stm->fetch();
			if ($val['Copiloto'] > 0)
			{
				$valido = 'El usuario ya participa en el viaje.';
			}

			return $valido;

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function ValidarPostulacion($idViaje, $idUsuario)
	{
		$valido = "";

		$valido = $this->ValidarCalificaciones($idUsuario);

		if ($valido == "")
		{
			$valido = $this->CantidadPlazasDisponibles($idViaje) > 0 ? "" : "No hay plazas disponibles para el viaje.";
		}
		else
		{
			$valido = $this->UsuarioEnViaje($idViaje, $idUsuario);
		}

		//falta validar que el usuario ya no se encuentre postulado

		return $valido;
	}

	public function PostularCopiloto($idViaje, $idUsuarioCopiloto)
	{
		try
		{
			$sql = "INSERT INTO copilotos(idViaje, idUsuario, fechaPostulacion) VALUES(?, ?, NOW())";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$idViaje,
				    	$idUsuarioCopiloto
					)
				);

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function AprobarPostulacion($idViaje, $idUsuarioCopiloto)
	{
		try
		{
			$sql = "UPDATE copilotos SET fechaAprobacion = NOW() WHERE idViaje = ? AND idUsuario = ?;";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$idViaje,
				    	$idUsuarioCopiloto
					)
				);

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function DesaprobarPostulacion($idViaje, $idUsuarioCopiloto)
	{
		try
		{
			$sql = "UPDATE copilotos SET fechaRechazo = NOW() WHERE idViaje = ? AND idUsuario = ?;";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$idViaje,
				    	$idUsuarioCopiloto
					)
				);

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function ValidarCancelacionPostulacion($idViaje, $idUsuarioCopiloto)
	{
		try
		{
			$valido = "";

			$sql = "SELECT COUNT(1) AS 'Aprobada' FROM copilotos WHERE idViaje = ? AND idUsuario = ? AND fechaAprobacion IS NOT NULL;";
			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($idViaje, $idUsuarioCopiloto));
			$val = $stm->fetch();
			if ($val['Aprobada'] > 0)
			{
				$valido = 'No puede cancelar la postulación, ya se encuentra aprobada.';
			}

			return $valido;

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function CancelarPostulacion($idViaje, $idUsuarioCopiloto)
	{
		try
		{
			$sql = "UPDATE copilotos SET fechaCancelacion = NOW() WHERE idViaje = ? AND idUsuario = ?;";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$idViaje,
				    	$idUsuarioCopiloto
					)
				);

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function ValidarCancelacionReserva($idViaje, $idUsuarioCopiloto)
	{
		try
		{
			$valido = "";

			$sql = "SELECT COUNT(1) AS 'Aprobada' FROM copilotos WHERE idViaje = ? AND idUsuario = ? AND fechaAprobacion IS NOT NULL;";
			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($idViaje, $idUsuarioCopiloto));
			$val = $stm->fetch();
			if ($val['Aprobada'] == 0)
			{
				$valido = 'Debe contar con una postulación aprobada para cancelar la reserva.';
			}

			return $valido;

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function CancelarReserva($idViaje, $idUsuarioCopiloto, $observaciones)
	{
		try
		{
			$this->pdo->beginTransaction();
			$stm = $this->pdo->prepare("UPDATE copilotos SET fechaCancelacion = NOW() WHERE idViaje = ?");
			$stm->execute(array($idViaje));

			$sql = "INSERT INTO calificaciones(idViaje, idUsuarioCalifica, idUsuarioCalificado, fechaCalificacion, calificacion, observaciones)
					SELECT	v.id, ve.idUsuario, ?, NOW(), -1, ?
						FROM viajes v
    					INNER JOIN vehiculos ve
							ON	v.idVehiculo = ve.id
						WHERE	v.id = ?";
			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($idUsuarioCopiloto, $observaciones, $idViaje));

			$sql = "INSERT INTO calificaciones(idViaje, idUsuarioCalifica, idUsuarioCalificado, fechaCalificacion, calificacion, observaciones)
					SELECT	v.id, ?, ve.idUsuario, NOW(), 0, 'Reserva cancelada por el copiloto.'
						FROM viajes v
    					INNER JOIN vehiculos ve
							ON	v.idVehiculo = ve.id
						WHERE	v.id = ?";
			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($idUsuarioCopiloto, $idViaje));

			$this->pdo->commit();
		} catch (Exception $e)
		{
			$this->pdo->rollBack();
			die($e->getMessage());
		}
	}

	public function ValidarCalificarPiloto($idViaje, $idUsuarioCalifica, $idUsuarioPiloto)
	{
		/*
			- Debe existir una calificación pendiente por parte del usuario.
			- El viaje tiene que estar pago
		*/
		try
		{
			$valido = "";

			$sql = "SELECT	COUNT(1) AS 'Pendiente'
						FROM copilotos cop
					    LEFT JOIN calificaciones cal
							ON	cop.idViaje = cal.idViaje
								AND cop.idUsuario = cal.idUsuarioCalifica
						WHERE cop.idViaje = ? AND cop.idUsuario = ? AND cal.IdUsuarioCalificado ? AND cop.fechaPago IS NOT NULL";
			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($idViaje, $idUsuarioCalifica, $idUsuarioPiloto));
			$val = $stm->fetch();
			if ($val['Pendiente'] == 0)
			{
				$valido = 'No hay calificación pendiente para realizar.';
			}
			else
			{
				$sql = "SELECT COUNT(1) AS 'Pendiente'
							FROM copilotos cop
						    WHERE 	cop.idViaje = ? AND cop.idUsuario = ? AND cop.fechaAprobacion IS NOT NULL AND cop.fechaCancelacion IS NULL AND cop.fechaPago IS NULL";
				$stm = $this->pdo->prepare($sql);
				$stm->execute(array($idViaje, $idUsuarioCopiloto));
				$val = $stm->fetch();
				if ($val['Pendiente'] > 0)
				{
					$valido = 'Debe pagar su participación en el viaje para poder calificar al piloto.';	
				}
			}

			return $valido;

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function ValidarCalificarCopiloto($idViaje, $idUsuarioCalifica, $idUsuarioCopiloto)
	{
		/*
			- Debe existir una calificación pendiente por parte del usuario.
		*/
		try
		{
			$valido = "";

			$sql = "SELECT	COUNT(1) AS 'Pendiente'
						FROM viajes v
					    INNER JOIN vehiculos ve
							ON v.idVehiculo = ve.id
					    INNER JOIN copilotos cop
							ON v.id = cop.idViaje
						INNER JOIN calificaciones cal
							ON 	v.id = cal.idViaje
								AND cop.idUsuario = cal.idUsuarioCalificado
								AND cal.idUsuarioCalifica = ve.idUsuario
					    WHERE v.id = ? AND cop.fechaPago IS NOT NULL AND cop.idUsuario = ? AND ve.idUsuario = ?";
			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($idViaje, $idUsuarioCopiloto, $idUsuarioCalifica));
			$val = $stm->fetch();
			if ($val['Pendiente'] == 0)
			{
				$valido = 'No hay calificación pendiente para realizar.';
			}

			return $valido;

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function CalificarUsuario($idViaje, $idUsuarioCalifica, $idUsuarioCalificado, $calificacion, $observaciones)
	{
		try
		{
			$sql = "INSERT INTO calificaciones(idViaje, idUsuarioCalifica, IdUsuarioCalificado, FechaCalificacion, Calificacion, observaciones)
					VALUES (?, ?, ?, NOW(), ?, ?)";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$idViaje,
				    	$idUsuarioCalifica,
				    	$idUsuarioCalificado,
				    	$calificacion,
				    	$observaciones
					)
				);

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function EnviarMensaje($idViaje, $mensaje, $idUsuario)
	{
		try
		{
			$sql = "INSERT INTO mensajes (fecha, mensaje, idViaje, idUsuario)
					VALUES (NOW(), ?, ?, ?)";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$idViaje,
				    	$mensaje,
				    	$idUsuario
					)
				);

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function ValidarRespuesta($idMensaje)
	{
		/*
			- Debe existir una respuesta pendiente por parte del usuario.
		*/
		try
		{
			$valido = "";

			$sql = "SELECT	COUNT(1) AS 'Respuesta'
						FROM mensajes men
					    INNER JOIN respuestas res
							ON	men.id = res.idMensaje
						WHERE men.id = ?";
			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($idMensaje));
			$val = $stm->fetch();
			if ($val['Respuesta'] > 0)
			{
				$valido = 'No hay respuesta pendiente para realizar.';
			}

			return $valido;

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function ResponderMensaje($idMensaje, $respuesta)
	{
		try
		{
			$sql = "INSERT INTO respuesta (fecha, respuesta, idMensaje)
					VALUES (NOW(), ?, ?)";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$idMensaje,
				    	$respuesta
					)
				);

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function ValidarPago($data)
	{
		/*
			- Debe existir un pago pendiente por parte del usuario.
		*/
		try
		{
			$valido = "";

			$sql = "SELECT	COUNT(1) AS 'Pendiente'
						FROM copilotos cop
					    WHERE	cop.idViaje = ?
								AND cop.idUsuario = ?
					            AND fechaAprobacion IS NOT NULL
					            AND fechaCancelacion IS NULL
					            AND fechaPago IS NULL";
			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($data['idViaje'], $data['idUsuario']));
			$val = $stm->fetch();
			if ($val['Pendiente'] == 0)
			{
				$valido = 'No hay pago pendiente para realizar.';
			}

			return $valido;

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function ObtenerValoresPago($data)
	{
		try
		{
			$sql = "SELECT 	vi.id, 
							ROUND(ROUND(vi.montoTotal / vi.plazas, 2) 
							- 	CASE 
									WHEN COUNT(cop.idUsuario) = 0 
										THEN ROUND(vi.montoTotal / vi.plazas, 2) * (vi.porcentajeComision / 100) 
									ELSE 0 
								END, 2) AS 'montoPago', 
					        CASE 
								WHEN COUNT(cop.idUsuario) = 0 
									THEN CONCAT(ROUND(ROUND(vi.montoTotal / vi.plazas, 2) * (vi.porcentajeComision / 100), 2), ' (', CONVERT(vi.porcentajeComision, char), ')') 
								ELSE ''
							END AS 'porcentajeComision', 
					        vi.cbu
						FROM Viajes vi
					    LEFT JOIN copilotos cop
							ON	vi.id = cop.idViaje
								AND cop.fechaAprobacion IS NOT NULL
					            AND cop.fechaCancelacion IS NULL
					            AND cop.fechaPago IS NOT NULL
						WHERE vi.id = ?
					    GROUP BY vi.id, vi.cbu ";

			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($data['idViaje']));

			$val = $stm->fetch();
			
			return $val;

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function RealizarPago($data)
	{
		try
		{
			$sql = "UPDATE copilotos
						SET fechaPago = NOW(),
							montoPago = ?
						WHERE 	idviaje = ?
								AND idusuario = ?
					            AND fechaCancelacion IS NULL
					            AND fechaRechazo IS NULL";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$data['importe'],
				    	$data['idViaje'],
				    	$data['idUsuario']
					)
				);

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

}
