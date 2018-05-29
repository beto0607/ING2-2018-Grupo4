<?php
class Vehiculo
{
	private $pdo;

    public $id;
    public $idUsuario;
    public $dominio;
    public $descripcion;
    public $modelo;
    public $marca;
    public $plazas;
    public $fechaBaja;


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

	public function Listar($idUsuario)
	{
		try
		{
			$result = array();

			$stm = $this->pdo->prepare("SELECT * FROM vehiculos WHERE idUsuario = ? AND fechaBaja IS NULL");
			//echo json_encode($this->model->Listar($_POST['idUsuario']));
			$stm->execute(array($idUsuario));

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
			            ->prepare("SELECT * FROM vehiculos WHERE id = ?");

			$stm->execute(array($id));
			return $stm->fetch(PDO::FETCH_OBJ);
		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function Eliminar($id)
	{
		try
		{
			$stm = $this->pdo
			            ->prepare("UPDATE vehiculos SET fechaBaja = NOW() WHERE id = ?");

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
			$sql = "UPDATE vehiculos SET
						dominio 			= ?,
						descripcion			= ?,
						modelo          	= ?,
						marca        		= ?,
						plazas 				= ?
				    WHERE id = ?";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$data->dominio,
				    	$data->descripcion,
                        $data->modelo,
                        $data->marca,
						$data->plazas,
                        $data->id
					)
				);
		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function Agregar(Vehiculo $data)
	{
		try
		{
			$sql = "INSERT INTO vehiculos (idUsuario, dominio, descripcion, modelo, marca, plazas)
			        VALUES (?, ?, ?, ?, ?, ?)";

			$this->pdo->prepare($sql)
			     ->execute(
					array(
	                    $data->idUsuario,
						$data->dominio,
						$data->descripcion,
						$data->modelo,
						$data->marca,
						$data->plazas,
	                )
				);

			return $this->pdo->lastInsertId();

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}


	public function Validar(Vehiculo $data, $action = "A")
	{
		$valido = '';

		// Vehiculo repetido
		$sql = "SELECT COUNT(1) AS 'Repetido' FROM vehiculos WHERE idUsuario = ? AND fechaBaja IS NULL AND dominio = ? AND (id <> ? OR ? = 0)";
		$stm = $this->pdo
					->prepare($sql);
		$stm->execute(array($data->idUsuario, $data->dominio, $data->id, $data->id));
		$val = $stm->fetch();
		if ($action != "B" && $val['Repetido'] > 0)
		{
			$valido = 'El vehículo ingresado ya se encuentra en cargado.';
		}
		else
		{
			//vehiculo cargado en un viaje o a un usuario
			$sql2 = "SELECT COUNT(1) AS 'Repetido' 
						FROM vehiculos v 
						INNER JOIN viajes vi 
							ON v.id = vi.idVehiculo 
						WHERE vi.FechaCancelacion IS NULL AND vi.FechaCierre IS NULL AND v.idUsuario = ? AND v.id = ?";
			$stm = $this->pdo
						->prepare($sql2);
			$stm->execute(array($data->idUsuario, $data->id));
			$val = $stm->fetch();
			if ($action == "B" && $val['Repetido'] > 0)
			{
				$valido = 'El vehículo ingresado se encuentra asignado a un viaje vigente.';
			}


		}

		return $valido;
	}
}
