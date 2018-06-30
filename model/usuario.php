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
    public $cbu;
    public $foto;
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
                "SELECT * FROM usuarios WHERE (( usuario = ? AND clave = ? ) OR ( ? like '%@%' AND ? = email AND clave = ? )) AND fechaBaja IS NULL"
            );

			//$stm->execute();

			$stm->execute([
                $usuario,
                sha1($clave),
                $usuario,
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

	public function ValidarEliminar($id)
	{
		// valido que no tenga viajes pendientes (ni como copiloto ni como piloto), que no tenga pagos pendientes ni calificaciones.
		try
		{
			$valido = "";

			$sql = "SELECT COUNT(vi.id) AS 'viajesP'
						FROM usuarios U
					    INNER JOIN vehiculos ve
							ON u.id = ve.idUsuario
						LEFT JOIN viajes vi
							ON	ve.id = vi.idvehiculo
								AND vi.fecha > NOW()
								AND vi.fechaCancelacion IS NULL
						WHERE	u.id = ?";

			$stm = $this->pdo->prepare($sql);
			$stm->execute(array($id));
			$val = $stm->fetch();
			if ($val['viajesP'] > 0)
			{
				$valido = 'El usuario tiene viajes pendientes.';
			}
			else
			{
				$sql = "SELECT COUNT(vi.id) AS 'copilotoP'
							FROM usuarios U
							INNER JOIN copilotos cop
								ON	u.id = cop.idUsuario
									AND cop.fechaAprobacion IS NOT NULL
						            AND cop.fechaCancelacion IS NULL
						            AND cop.fechaRechazo IS NULL
							INNER JOIN viajes vi
								ON	cop.idViaje = vi.id
									AND vi.fechaCancelacion IS NULL
						            AND vi.fecha > NOW()
							WHERE	u.id = ?";
				$stm = $this->pdo->prepare($sql);
				$stm->execute(array($id));
				$val = $stm->fetch();
				if ($val['copilotoP'] > 0)
				{
					$valido = 'El usuario participa en viajes pendientes.';
				}
				else
				{
					$sql = "SELECT COUNT(vi.id) AS 'calificacionesP'
							FROM copilotos cop
						    INNER JOIN viajes vi
								ON	cop.idViaje = vi.id
									AND vi.fechaCancelacion IS NULL
							LEFT JOIN calificaciones cal
								ON	cop.idViaje = cal.idViaje
									AND cop.idUsuario = cal.idUsuarioCalifica
							WHERE 	cop.idUsuario = ?
									AND cop.fechaCancelacion IS NULL
						            AND cop.fechaAprobacion IS NOT NULL
									AND cal.id IS NULL ";
					$stm = $this->pdo->prepare($sql);
					$stm->execute(array($id));
					$val = $stm->fetch();
					if ($val['calificacionesP'] > 0)
					{
						$valido = 'El usuario tiene calificaciones pendientes.';
					}
				}
			}

			return $valido;

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
						nombre          	= ?,
						apellido        	= ?,
						fechaNacimiento 	= ?,
						telefono			= ?, 
						cbu 				= ?,
						foto 				= CASE WHEN ? = 'NULO' THEN foto ELSE ? END
				    WHERE id = ?";

			$this->pdo->prepare($sql)
			     ->execute(
				    array(
				    	$data->nombre,
                        $data->apellido,
						$data->fechaNacimiento,
                        $data->telefono,
                        $data->cbu,
                        $data->foto,
                        $data->foto,
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
			$sql = "INSERT INTO usuarios (id, usuario, clave, nombre, apellido, fechaNacimiento, telefono, email, calificacionPiloto, calificacionCopiloto, fechaBaja, foto)
			        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

			$this->pdo->prepare($sql)
			     ->execute(
					array(
						$data->id,
	                    			$data->Usuario,
						sha1($data->clave),//$data->clave,
						$data->nombre,
						$data->apellido,
						$data->fechaNacimiento,
						$data->telefono,
						$data->email,
						$data->calificacionPiloto,
						$data->calificacionCopiloto,
						$data->fechaBaja,
						$data->foto
	                )
				);

			return $this->pdo->lastInsertId();

		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function Validar(Usuario $data, $action = "A")
	{
		$valido = '';

		// Mayor de edad DATEDIFF(FechaNacimiento, GETDATE()) >= 18
		$edad = date_diff(date_create_from_format('Ymd', $data->fechaNacimiento), date_create()); // diff(new DateTime(), date_create_from_format('Ymd', $data->fechaNacimiento));
		if ($edad->format('%Y') < 18)
		{
			$valido = 'El usuario debe ser mayor de 18 años.';
		}
		else
		{
			// Usuario repetido
			$sql = "SELECT COUNT(1) AS 'Repetido' FROM Usuarios WHERE usuario = ?";
			$stm = $this->pdo
						->prepare($sql);
			$stm->execute(array($data->Usuario));
			$val = $stm->fetch();
			if ($action == "A" && $val['Repetido'] > 0)
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
				if ($action == "A" && $val['Repetido'] > 0)
				{
					$valido = 'El correo ingresado ya se encuentra en uso.';
				}
			}
		}

		return $valido;
	}
}
