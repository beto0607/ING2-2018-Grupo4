<?php
require_once 'model/viaje.php';

class ViajesController{
    
    private $model,
            $auth;
    
    public function __CONSTRUCT(){
        $this->model = new Viajes();
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
        require_once 'view/viajes/viajes.php';
        require_once 'view/footer.php';
    }
    
    public function Listar(){
        echo json_encode($this->model->Listar());
    }

    public function Obtener(){
        $id = $_REQUEST['id'];
        echo json_encode($this->model->Obtener($id));
    }
}