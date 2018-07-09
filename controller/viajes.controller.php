<?php
require_once 'model/viajes.php';

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

    public function ViajesUsuario(){
      $id = $_REQUEST['idUsuario'];
      echo json_encode($this->model->ViajesUsuario($id));
    }

    public function Buscar(){
        $fechaDesde = '19990101';
        $fechaHasta = '20791230';
        $origen = '';
        $destino = '';

        $fechaDesde = isset($_REQUEST['fechaDesde'])? $_REQUEST['fechaDesde'] : $fechaDesde;
        $fechaHasta = isset($_REQUEST['fechaHasta'])? $_REQUEST['fechaHasta'] : $fechaHasta;
        $origen = isset($_REQUEST['origen'])? $_REQUEST['origen'] : $origen;
        $destino = isset($_REQUEST['destino'])? $_REQUEST['destino'] : $destino;

        $filtros = array(
                        'fechaDesde' => $fechaDesde,
                        'fechaHasta' => $fechaHasta,
                        'origen' => $origen,
                        'destino' => $destino
                    );
        echo json_encode($this->model->Buscar($filtros));
    }
}
