<?php
class Viajes
{
	private $pdo;
	private $sql = "SELECT 	v.id AS idViaje, v.fecha, v.origen, v.destino, v.plazas AS plazasViaje, v.descripcion AS descripcionViaje, ROUND(v.montoTotal + (v.montoTotal * (v.PorcentajeComision/100)), 2) as montoTotal, ROUND((v.montoTotal + (v.montoTotal * (v.PorcentajeComision/100))) / 4, 2) as montoCopiloto, 
	v.fechaCancelacion, v.fechaCierre, v.idVehiculo, ve.dominio, ve.descripcion AS descripcionVehiculo, ve.modelo AS modeloVehiculo,
	ve.marca AS marcaVehiculo, ve.plazas AS plazasVehiculo, ve.idUsuario AS idUsuario, u.nombre, u.apellido, u.fechaNacimiento,
	u.telefono, u.email, u.calificacionPiloto, u.calificacionCopiloto
	FROM viajes v
    INNER JOIN vehiculos ve
		ON v.idvehiculo = ve.id
    INNER JOIN usuarios u
		ON	ve.idUsuario = u.id";
    
    public $idViaje;
    public $fecha;
    public $origen;
    public $destino;
    public $plazasViaje;
    public $descripcionViaje;
    public $montoTotal;
	public $fechaCancelacion;
	public $fechaCierre;
	public $idVehiculo;
	public $dominio;
	public $descripcionVehiculo;
	public $modeloVehiculo;
	public $marcaVehiculo;
	public $plazasVehiculo;
	public $idUsuario;
	public $nombre;
	public $apellido;
	public $fechaNacimiento;
	public $telefono;
	public $email;
	public $calificacionPiloto;
	public $calificacionCopiloto;

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

			$stm = $this->pdo->prepare($this->sql);
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
			            ->prepare($sql + " WHERE v.id = ?  ORDER BY v.fecha DESC");

			$stm->execute(array($id));
			return $stm->fetch(PDO::FETCH_OBJ);
		} catch (Exception $e) 
		{
			die($e->getMessage());
		}
	}
}