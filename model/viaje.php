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
	public $cbu;

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
    	return $comision;
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
		if (date_create_from_format('Ymd', $data->fecha) < date_create())
		{
			$valido = 'La fecha del viaje debe ser superior a la fecha actual.';
		}
		else
		{
			// Monto debería ser mayor a cero
			if ($data->montoTotal > 0)
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
					$stm = $this->pdo
								->prepare($sql);			          
					$stm->execute(array($data->id));
					$val = $stm->fetch();
					if ($data->plazas <= 0 || $data->plazas > $val['plazas'])
					{
						$valido = 'La cantidad de plazas no corresponde con la cantidad de plazas del vehículo seleccionado(' . $val['plazas'] . ').';
					}
					/*else
					{
						// No debería existir otro viaje en la misma fecha para el piloto
						$sql = "SELECT COUNT(1) AS 'Repetido' FROM Usuarios WHERE usuario = ?";
						$stm = $this->pdo
									->prepare($sql);			          
						$stm->execute(array($data->id));
						$val = $stm->fetch();
						if ($val['Repetido'] > 0)
						{
							$valido = 'Ya tiene un viaje para la fecha seleccionada.';
						}
						else
						{
							// No debería existir una calificación pendiente con más de 30 días de pendiente
							$sql = "SELECT COUNT(1) AS 'Repetido' FROM Usuarios WHERE usuario = ?";
							$stm = $this->pdo
										->prepare($sql);			          
							$stm->execute(array($data->id));
							$val = $stm->fetch();
							if ($val['Repetido'] > 0)
							{
								$valido = 'Debe realizar las calificaciones con más de 30 días de pendientes antes de cargar un nuevo viaje.';
							}
						}
					}*/
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

			$sql = 	"START TRANSACTION;" . chr(13) .
					"CALL make_intervals(?, ?, 1, ?); " . chr(13) . chr(13) .

					"INSERT INTO viajes(idVehiculo, fecha, origen, destino, plazas, descripcion, montoTotal, porcentajeComision, cbu) " . chr(13) .
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
					"		OR (? = 'S' AND DAYOFWEEK(f.interval_start) = ? AND f.interval_start <= ?)  " . chr(13) .
					"       OR (? = 'D' AND f.interval_start <= ?); " . chr(13) . chr(13) .
					
					"COMMIT;";

			$sth = $this->pdo->prepare($sql);
			$sth->bindValue(1, $data->fecha, PDO::PARAM_STR);
			$sth->bindValue(2, $fechaHasta, PDO::PARAM_STR);
			$sth->bindValue(3, $tipo, PDO::PARAM_STR);
			$sth->bindValue(4, $data->idVehiculo, PDO::PARAM_INT);
			$sth->bindValue(5, $data->origen, PDO::PARAM_STR);
			$sth->bindValue(6, $data->destino, PDO::PARAM_STR);
			$sth->bindValue(7, $data->plazas, PDO::PARAM_INT);
			$sth->bindValue(8, $data->descripcion, PDO::PARAM_STR);
			$sth->bindValue(9, $data->montoTotal, PDO::PARAM_STR);
			$sth->bindValue(10, obtenerComision(), PDO::PARAM_STR);
			$sth->bindValue(11, $data->cbu, PDO::PARAM_STR);
			$sth->bindValue(12, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(13, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(14, $diaSemana, PDO::PARAM_INT);
			$sth->bindValue(15, $fechaHasta, PDO::PARAM_STR);
			$sth->bindValue(16, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(17, $fechaHasta, PDO::PARAM_STR);
			$sth->execute();

			return $this->pdo->lastInsertId();

		} catch (Exception $e) 
		{
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
						montoTotal        	= ?, 
						cbu        			= ?
				    WHERE id = ?";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$data->plazas, 
				    	$data->descripcion, 
                        $data->montoTotal, 
                        $data->cbu,
						$data->id
					)
				);
		} catch (Exception $e) 
		{
			die($e->getMessage());
		}
	}
	
}