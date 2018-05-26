<?php
class Vehiculo
{
	private $pdo;
    
    public $id;
    public $IdUsuario;
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

	public function Listar()
	{
		try
		{
			$result = array();

			$stm = $this->pdo->prepare("SELECT * FROM vehiculos");
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
						idUsuario           = ?,
						dominio 			= ?,
						descripcion			= ?,
						modelo          	= ?, 
						marca        		= ?,
						plazas 				= ?,
						fechaBaja			= ?,
				    WHERE id = ?";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$data->idUsuario,
				    	$data->dominio, 
				    	$data->descripcion, 
                        $data->modelo, 
                        $data->marca,
						$data->plazas,
                        $data->fechaBaja,
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
			$sql = "INSERT INTO vehiculos (id, idUsuario, dominio, descripcion, modelo, marca, plazas, fechaBaja) 
			        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

			$this->pdo->prepare($sql)
			     ->execute(
					array(
						$data->id,
	                    $data->idUsuario, 
						$data->dominio, 
						$data->descripcion, 
						$data->modelo,
						$data->marca,
						$data->plazas, 
						$data->fechaBaja
	                )
				);

			return $this->pdo->lastInsertId();

		} catch (Exception $e) 
		{
			die($e->getMessage());
		}
	}

	public function Registrar(Vehiculo $data)
	{
		try 
		{
			$sql = "INSERT INTO vehiculos (id, idUsuario, dominio, descripcion, modelo, marca, plazas,  fechaBaja) 
			        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

			$this->pdo->prepare($sql)
			     ->execute(
					array(
						$data->id,
	                    $data->idUsuario, 
						$data->dominio, 
						$data->descripcion, 
						$data->modelo,
						$data->marca,
						$data->plazas, 
						$data->fechaBaja
	                )
				);

			return $this->pdo->lastInsertId();

		} catch (Exception $e) 
		{
			die($e->getMessage());
		}
	}


	public function Validar(Vehiculo $data)
	{
		$valido = '';
/*
		// Mayor de edad DATEDIFF(FechaNacimiento, GETDATE()) >= 18
		$edad = date_diff(date_create_from_format('Ymd', $data->fechaNacimiento), date_create()); // diff(new DateTime(), date_create_from_format('Ymd', $data->fechaNacimiento));
		if ($edad->format('Y') < 18)
		{
			/*$valido = 'El usuario debe ser mayor de 18 años.';
		}
		else
		{*/
			// Vehiculo repetido
			$sql = "SELECT COUNT(1) AS 'Repetido' FROM vehiculos WHERE dominio = ?";
			$stm = $this->pdo
						->prepare($sql);			          
			$stm->execute(array($data->id));
			$val = $stm->fetch();
			if ($val['Repetido'] > 0)
			{
				$valido = 'El vehiculo ingresado ya se encuentra en cargado.';
			}
			/*else
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
		}*/

		return $valido;
	}
}