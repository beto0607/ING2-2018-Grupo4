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
					if ($data->plazas <= 0 || $data->plazas < $val['plazas'])
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
							// No debería existir una calificación pendiente con más de 30 días de pendiente
							$sql = "SELECT	COUNT(1) AS 'Pendientes'
										FROM viajes v
									    INNER JOIN vehiculos ve
											ON	v.idVehiculo = ve.id
										INNER JOIN usuarios u
											ON	ve.idUsuario = u.id
										INNER JOIN copilotos cop
											ON	v.id = cop.idViaje
												AND cop.fechaAprobacion IS NOT NULL
									    LEFT JOIN calificaciones c
											ON	v.id = c.idViaje
												AND u.id = c.idUsuarioCalifica
									            AND cop.idUsuario = c.IdUsuarioCalificado
										WHERE 	v.fechaCierre IS NOT NULL
												AND DATEDIFF(NOW(), v.fecha) > 30
												AND ve.id = ?";
							$stm = $this->pdo->prepare($sql);
							$stm->execute(array($data->idVehiculo));
							$val = $stm->fetch();
							if ($val['Pendientes'] > 0)
							{
								$valido = 'Debe realizar las calificaciones con más de 30 días de pendientes antes de cargar un nuevo viaje.';
							}
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
			$sql = 	"INSERT INTO viajes(idVehiculo, fecha, origen, destino, plazas, descripcion, montoTotal, porcentajeComision, duracion) " . chr(13) .
					"SELECT ?, " . chr(13) .
					" f.interval_start, " . chr(13) .
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
			$sth->bindValue(9, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(10, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(11, $diaSemana, PDO::PARAM_INT);
			$sth->bindValue(12, $fechaHasta, PDO::PARAM_STR);
			$sth->bindValue(13, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(14, $fechaHasta, PDO::PARAM_STR);
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
			$stm = $this->pdo
			            ->prepare("UPDATE viajes SET fechaCancelacion = NOW() WHERE id = ?");
			$stm->execute(array($id));
		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function Actualizar($data)
	{
		try
		{
			$sql = "UPDATE viajes SET
						plazas 				= ?,
						descripcion			= ?,
						montoTotal        	= ?
				    WHERE id = ?";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$data->plazas,
				    	$data->descripcion,
                        $data->montoTotal,
						$data->id
					)
				);
		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

}
