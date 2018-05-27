<?php
class Viaje
{
	private $pdo;
    
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
		/*
		// La fecha debe ser mayor a la fecha actual
		if (date_create_from_format('Ymd', $data->fecha) < date_create())
		{
			$valido = 'La fecha del viaje debe ser superior a la fecha actual.';
		}
		else
		{
			// Monto debería ser mayor a cero
			// Origen y Destino no deberían ser iguales
			// Plazas debería ser mayor a 1 y <= a la cantidad de plazas del auto
			// No debería existir otro viaje en la misma fecha para el piloto
			// No debería existir una calificación pendiente con más de 30 días de pendiente
			$sql = "SELECT COUNT(1) AS 'Repetido' FROM Usuarios WHERE usuario = ?";
			$stm = $this->pdo
						->prepare($sql);			          
			$stm->execute(array($data->id));
			$val = $stm->fetch();
			if ($val['Repetido'] > 0)
			{
				$valido = 'El usuario ingresado ya se encuentra en uso.';
			}
			else
			{
				// Correo repetido
				$sql = "SELECT COUNT(1) AS 'Repetido' FROM Usuarios WHERE email = ?";
				$stm = $this->pdo
							->prepare($sql);			          
				$stm->execute(array($data->email));
				$val = $stm->fetch();
				if ($val['Repetido'] > 0)
				{
					$valido = 'El correo ingresado ya se encuentra en uso.';
				}
			}
		}
		*/
		return $valido;
	}

	public function Crear($data, $tipoAlta, $fechaHasta)
	{
		/*try 
		{*/
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

			//$fechas = "SELECT '20180506' AS fecha UNION SELECT '20180507' AS fecha UNION SELECT '20180508' AS fecha ";
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
					/*var_dump($data);
					var_dump($fechaHasta);
					var_dump($tipo);
					var_dump($sql);*/

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
			$sth->bindValue(10, $data->porcentajeComision, PDO::PARAM_STR);
			$sth->bindValue(11, $data->cbu, PDO::PARAM_STR);
			$sth->bindValue(12, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(13, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(14, $diaSemana, PDO::PARAM_INT);
			$sth->bindValue(15, $fechaHasta, PDO::PARAM_STR);
			$sth->bindValue(16, $tipoAlta, PDO::PARAM_STR);
			$sth->bindValue(17, $fechaHasta, PDO::PARAM_STR);
			$sth->execute(
					/*array(
						$data->fecha,
						$fechaHasta,
						$tipo,
						$data->idVehiculo,
						$data->origen, 
						$data->destino, 
						$data->plazas,
						$data->descripcion,
						$data->montoTotal, 
						$data->porcentajeComision,
						$data->cbu,
						$tipoAlta,
						$tipoAlta,
						$diaSemana,
						$fechaHasta,
						$tipoAlta,
						$fechaHasta
	                )*/
				);

			$sth->debugDumpParams();
			var_dump($data);
			var_dump($fechaHasta);
			var_dump($tipo);
			var_dump($tipoAlta);
			var_dump($diaSemana);

			return $this->pdo->lastInsertId();

		/*} catch (Exception $e) 
		{
			//echo $e->getMessage();
			die($e->getMessage());
		}*/
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