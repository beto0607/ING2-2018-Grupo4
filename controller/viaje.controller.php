<?php
require_once 'model/viaje.php';

class ViajeController{
    
    private $model,
            $auth;
    
    public function __CONSTRUCT(){
        $this->model = new Viaje();
        $this->auth  = FactoryAuth::getInstance();
        
        try
        {
            if(!isset($_REQUEST['debug']))
            {
                $this->auth->estaAutenticado();
            }
        } catch(Exception $e){
            header('Location: index.php');
        }
    }
    
    public function Index(){
    
        require_once 'view/header.php';
        require_once 'view/menu.php';
        require_once 'view/viaje/viaje.php';
        require_once 'view/footer.php';
    }
    
    public function Obtener(){
        $result;
        try
        {
            $result = $this->model->Obtener($_REQUEST['id']);
        }
        catch(Exception $e)
        {
            $result = ['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()];
        }

        echo json_encode($result);
    }

    public function ObtenerCopilotos(){
        $result;
        try
        {
            $result = $this->model->ObtenerCopilotos($_REQUEST['id']);
            $result = ['success' => '1', 'copilotos' => $result];
        }
        catch(Exception $e)
        {
            $result = ['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()];
        }

        echo json_encode($result);
    }

    public function ObtenerPostulaciones(){
        $result;
        try
        {
            $result = $this->model->ObtenerPostulaciones($_REQUEST['id']);
            $result = ['success' => '1', 'postulaciones' => $result];
        }
        catch(Exception $e)
        {
            $result = ['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()];
        }

        echo json_encode($result);
    }
    
    public function Guardar(){
        $result;
        try
        {
            $viaje = new Viaje();
            $id = 0;
            $valido = '';
            $flagEditar = (!isset($_REQUEST['id']) ? 0 : $_REQUEST['id']) != 0 ;
            
            $viaje->id = isset($_REQUEST['id']) ? $_REQUEST['id'] : 0;
            $viaje->idVehiculo = $_REQUEST['idVehiculo'];
            $viaje->fecha = $_REQUEST['fecha'];
            $viaje->origen = $_REQUEST['origen'];
            $viaje->destino = $_REQUEST['destino'];
            $viaje->plazas = $_REQUEST['plazas'];
            $viaje->descripcion = $_REQUEST['descripcion'];
            $viaje->montoTotal = $_REQUEST['montoTotal'];
            $viaje->duracion = $_REQUEST['duracion'];
            $viaje->duracion = $_REQUEST['cbu'];
            /*$viaje->porcentajeComision = $_REQUEST['porcentajeComision'];
            $viaje->fechaCancelacion = $_REQUEST['fechaCancelacion'];
            $viaje->fechaCierre = $_REQUEST['fechaCierre'];*/

            if ($flagEditar)
            {
                $valido = $this->model->ValidarActualizar($viaje);
            }
            else
            {
                $tipoAlta = $_REQUEST['tipoAlta'];
                $fechaHasta = $_REQUEST['fechaHasta'];
                $valido = $this->model->Validar($viaje, $tipoAlta, $fechaHasta);
            }

            if ($valido != '')
            {
                $result = ['success' => '0', 'mensaje' => $valido];
            }
            else 
            {
                if ($flagEditar)
                {
                    $id = $_REQUEST['id'];
                    $this->model->Actualizar($viaje);
                    $result = ['success' => '1', 'mensaje' => 'El viaje ha sido modificado con éxito.', 'id' => $id];
                }
                else
                {   
                   $id = $this->model->Crear($viaje, $tipoAlta, $fechaHasta);
                   $result = ['success' => '1', 'mensaje' => 'El viaje ha sido guardado con éxito.', 'id' => $id];
                }
            }
        }
        catch(Exception $e)
        {
            $result = ['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()];
        }

        echo json_encode($result);
    }
    
    public function Cancelar(){
        try
        {
            $this->model->Cancelar($_REQUEST['id']);
            echo json_encode(['success' => '1', 'mensaje' => 'El viaje ha sido cancelado con éxito.']);
        }
        catch(Exception $e)
        {
            echo json_encode(['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()]);
        }
    }

    public function PostularCopiloto(){
        try 
        {
            $valido = "";
            $idViaje = $_REQUEST['idViaje'];
            $idUsuario = $_REQUEST['idUsuario'];
            $valido = $this->model->ValidarPostulacion($idViaje, $idUsuario);
            if ($valido != '')
            {
                $result = ['success' => '0', 'mensaje' => $valido];
            }
            else 
            {
                $this->model->PostularCopiloto($idViaje, $idUsuario);
                $result = ['success' => '1', 'mensaje' => 'La postulación ha sido guardada con éxito.'];
            }
        }
        catch(Exception $e)
        {
            $result = ['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()];
        }

        echo json_encode($result);
    }

    public function AprobarPostulacion()
    { 
        try 
        {
            $valido = "";
            $idViaje = $_REQUEST['idViaje'];
            $idUsuario = $_REQUEST['idUsuario'];
            $valido = $this->model->ValidarPostulacion($idViaje, $idUsuario);
            if ($valido != '')
            {
                $result = ['success' => '0', 'mensaje' => $valido];
            }
            else 
            {
                $this->model->AprobarPostulacion($idViaje, $idUsuario);
                $result = ['success' => '1', 'mensaje' => 'La postulación ha sido aprobada con éxito.'];
            }
        }
        catch(Exception $e)
        {
            $result = ['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()];
        }

        echo json_encode($result);
    }

    public function DesaprobarPostulacion()
    { 
        try 
        {
            $valido = "";
            $idViaje = $_REQUEST['idViaje'];
            $idUsuario = $_REQUEST['idUsuario'];
            $this->model->DesaprobarPostulacion($idViaje, $idUsuario);
            $result = ['success' => '1', 'mensaje' => 'La postulación ha sido desaprobada con éxito.'];
        }
        catch(Exception $e)
        {
            $result = ['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()];
        }

        echo json_encode($result);
    }    

    public function CancelarPostulacion()
    { 
        try 
        {
            $valido = "";
            $idViaje = $_REQUEST['idViaje'];
            $idUsuario = $_REQUEST['idUsuario'];
            $valido = $this->model->ValidarCancelacionPostulacion($idViaje, $idUsuario);
            if ($valido != '')
            {
                $result = ['success' => '0', 'mensaje' => $valido];
            }
            else 
            {
                $this->model->CancelarPostulacion($idViaje, $idUsuario);
                $result = ['success' => '1', 'mensaje' => 'La postulación ha sido cancelada con éxito.'];
            }
        }
        catch(Exception $e)
        {
            $result = ['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()];
        }

        echo json_encode($result);
    }

    public function CancelarReserva()
    { 
        try 
        {
            $valido = "";
            $idViaje = $_REQUEST['idViaje'];
            $idUsuario = $_REQUEST['idUsuario'];
            $observaciones = $_REQUEST['observaciones'];
            $valido = $this->model->ValidarCancelacionReserva($idViaje, $idUsuario);
            if ($valido != '')
            {
                $result = ['success' => '0', 'mensaje' => $valido];
            }
            else 
            {
                $this->model->CancelarReserva($idViaje, $idUsuario, $observaciones);
                $result = ['success' => '1', 'mensaje' => 'La reserva ha sido cancelada con éxito.'];
            }
        }
        catch(Exception $e)
        {
            $result = ['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()];
        }

        echo json_encode($result);
    }        

    public function Listar(){
        echo json_encode($this->model->Listar());
    }

    public function Test(){
        echo json_encode(['success' => '1', 'mensaje' => 'El viaje ha sido guardado con éxito.', 'id' => '23']);
    }
}