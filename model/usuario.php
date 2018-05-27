<?php
class Usuario
{
	private $pdo;
    
    public $id;
    public $Usuario;
    public $clave;
    public $nombre;
    public $apellido;
    public $fechaNacimiento;
    public $telefono;
    public $email;
    public $calificacionPiloto;
    public $calificacionCopiloto;
    public $fechaBaja;
    public $Token;
    public $TokenCaducidad;

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

	public function Acceder($usuario, $clave)
	{
		try 
		{
			$stm = $this->pdo->prepare(
                "SELECT * FROM usuarios WHERE usuario = ? AND clave = ?"
            );

			//$stm->execute();

			$stm->execute([
                $usuario,
                sha1($clave)
            ]);
            
			$result = $stm->fetch(PDO::FETCH_OBJ);
            
            if(!is_object($result)) {
                return new Usuario;
            } else {
                return $result;
            }
		} catch (Exception $e) 
		{
			die($e->getMessage());
		}
	}

	public function Listar()
	{
		try
		{
			$result = array();

			$stm = $this->pdo->prepare("SELECT * FROM usuarios");
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
			            ->prepare("SELECT * FROM usuarios WHERE id = ?");

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
			            ->prepare("UPDATE usuarios SET fechaBaja = NOW() WHERE id = ?");			          

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
			$sql = "UPDATE usuarios SET 
						usuario 			= ?,
						clave 				= ?,
						nombre          	= ?, 
						apellido        	= ?,
						fechaNacimiento 	= ?,
						telefono			= ?,
						email        		= ?,
						calificacionPiloto  = ?, 
						calificacionCopiloto = ?,
						fechaBaja			= ?
				    WHERE id = ?";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$data->usuario, 
				    	$data->clave, 
                        $data->nombre, 
                        $data->apellido,
						$data->fechaNacimiento,
                        $data->telefono, 
                        $data->email,
                        $data->calificacionPiloto,
                        $data->calificacionCopiloto,
                        $data->fechaBaja,
                        $data->id
					)
				);
		} catch (Exception $e) 
		{
			die($e->getMessage());
		}
	}

	public function Registrar(Usuario $data)
	{
		try 
		{
			$sql = "INSERT INTO usuarios (id, usuario, clave, nombre, apellido, fechaNacimiento, telefono, email, calificacionPiloto, calificacionCopiloto, fechaBaja) 
			        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

			$this->pdo->prepare($sql)
			     ->execute(
					array(
						$data->id,
	                    $data->Usuario, 
						$data->clave, 
						$data->nombre, 
						$data->apellido,
						$data->fechaNacimiento,
						$data->telefono, 
						$data->email,
						$data->calificacionPiloto,
						$data->calificacionCopiloto,
						$data->fechaBaja
	                )
				);

			return $this->pdo->lastInsertId();

		} catch (Exception $e) 
		{
			die($e->getMessage());
		}
	}

	public function Validar(Usuario $data)
	{
		$valido = '';

		// Mayor de edad DATEDIFF(FechaNacimiento, GETDATE()) >= 18
		$edad = date_diff(date_create_from_format('Ymd', $data->fechaNacimiento), date_create()); // diff(new DateTime(), date_create_from_format('Ymd', $data->fechaNacimiento));
		if ($edad->format('Y') < 18)
		{
			$valido = 'El usuario debe ser mayor de 18 años.';
		}
		else
		{
			// Usuario repetido
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

		return $valido;
	}
}