<?php
class Viajes
{
	private $pdo;

	private $sql = "SELECT 	v.id AS idViaje, v.fecha, v.origen, v.destino, v.plazas AS plazasViaje, v.descripcion AS descripcionViaje, ROUND(v.montoTotal + (v.montoTotal * (v.PorcentajeComision/100)), 2) as montoTotal, ROUND((v.montoTotal + (v.montoTotal * (v.PorcentajeComision/100))) / 4, 2) as montoCopiloto,
	v.fechaCreacion, v.fechaCancelacion, v.fechaCierre, v.idVehiculo, ve.dominio, ve.descripcion AS descripcionVehiculo, ve.modelo AS modeloVehiculo,
	ve.marca AS marcaVehiculo, ve.plazas AS plazasVehiculo, ve.idUsuario AS idUsuario, u.usuario, u.nombre, u.apellido, u.fechaNacimiento,
	u.telefono, u.email, u.calificacionPiloto, u.calificacionCopiloto, v.duracion, v.plazas - COUNT(cop.idUsuario) AS 'plazasDisponibles'
	FROM viajes v
    INNER JOIN vehiculos ve
		ON v.idvehiculo = ve.id
    INNER JOIN usuarios u
		ON	ve.idUsuario = u.id
	LEFT JOIN copilotos cop
		ON	v.id = cop.idViaje
			AND cop.fechaCancelacion IS NULL
			AND cop.fechaAprobacion IS NOT NULL";

	private $group = " GROUP BY v.id, v.fecha, v.origen, v.destino, v.plazas, v.descripcion,
	v.FechaCreacion, v.fechaCancelacion, v.fechaCierre, v.idVehiculo, ve.dominio, ve.descripcion, ve.modelo,
	ve.marca, ve.plazas, ve.idUsuario, u.Usuario, u.nombre, u.apellido, u.fechaNacimiento,
	u.telefono, u.email, u.calificacionPiloto, u.calificacionCopiloto, v.duracion";

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

			$stm = $this->pdo->prepare($this->sql . $this->group . " ORDER BY v.fecha");
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
			            ->prepare($this->sql . " WHERE v.id = ?");

			$stm->execute(array($id));
			return $stm->fetch(PDO::FETCH_OBJ);
		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}
	public function ViajesUsuario($id){
		try{
			$stm = $this->pdo->prepare("SELECT v.id AS idViaje FROM viajes v INNER JOIN copilotos cop ON cop.idViaje = v.id WHERE cop.idUsuario = ?");
			$stm->execute(array($id));
			return $stm->fetch(PDO::FETCH_OBJ);
		} catch (Exception $e)
		{
			die($e->getMessage());
		}
	}
}
