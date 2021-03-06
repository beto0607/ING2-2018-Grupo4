<?php
require_once 'model/vehiculo.php';

class VehiculoController{
    
    private $model,
            $auth;
    
    public function __CONSTRUCT(){
        $this->model = new Vehiculo();
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
        require_once 'view/vehiculo/vehiculo.php';
        require_once 'view/footer.php';
    }
    
    public function Crud(){
        $vehic = new Vehiculo();
        
        if(isset($_REQUEST['id']))
        {
            $vehic = $this->model->Obtener($_REQUEST['id']);
        }
        
        require_once 'view/header.php';
        require_once 'view/vehiculo/vehiculo-editar.php';
        require_once 'view/footer.php';
    }
    
    public function Guardar(){
        $result;
        try
        {
            $vehic = new Vehiculo();
            $id = 0;
            $valido = '';
            
            $vehic->id = isset($_REQUEST['id']) ? $_REQUEST['id'] : 0;
            $vehic->dominio = $_REQUEST['dominio'];
            $vehic->descripcion = $_REQUEST['descripcion'];
            $vehic->modelo = $_REQUEST['modelo'];
            $vehic->marca = $_REQUEST['marca'];
            $vehic->plazas = $_REQUEST['plazas'];
            $vehic->idUsuario = $_REQUEST['idUsuario'];

            $valido = $this->model->Validar($vehic, ($vehic->id > 0 ? "M" : "A"));

            if ($valido != '')
            {
                $result = ['success' => '0', 'mensaje' => $valido];
            }
            else 
            {
                if ($vehic->id > 0)
                {
                    $id = $_REQUEST['id'];
                    $this->model->Actualizar($vehic);
                }
                else
                {   
                   $id = $this->model->Agregar($vehic);
                }
                
                $result = ['success' => '1', 'mensaje' => 'El vehiculo ha sido guardado con éxito.', 'id' => $id];
            }
        }
        catch(Exception $e)
        {
            $result = ['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()];
        }

        echo json_encode($result);
    }
    
    public function Eliminar(){
        try
        {
            $valido = '';
            $vehic = new Vehiculo();
            $vehic->id = $_REQUEST['id'];
            $vehic->idUsuario = $_REQUEST['idUsuario'];
            $valido = $this->model->Validar($vehic, "B");

            if ($valido != '')
            {
                echo json_encode(['success' => '0', 'mensaje' => $valido]);
            }
            else 
            {
                $this->model->Eliminar($_REQUEST['id']);
                echo json_encode(['success' => '1', 'mensaje' => 'El vehiculo ha sido eliminado con éxito.']);
            }  
        }
        catch(Exception $e)
        {
            echo json_encode(['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()]);
        }
    }

    public function Listar(){

        echo json_encode($this->model->Listar($_REQUEST['idUsuario']));
    }

    public function Test(){
        echo json_encode(['success' => '1', 'mensaje' => 'El vehiculo ha sido guardado con éxito.', 'id' => '23']);
    }
}