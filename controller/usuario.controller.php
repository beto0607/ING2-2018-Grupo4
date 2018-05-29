<?php
require_once 'model/usuario.php';

class UsuarioController{
    
    private $model,
            $auth;
    
    public function __CONSTRUCT(){
        $this->model = new Usuario();
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
        require_once 'view/usuario/usuario.php';
        require_once 'view/footer.php';
    }
    
    public function Crud(){
        $usu = new Usuario();
        
        if(isset($_REQUEST['id']))
        {
            $usu = $this->model->Obtener($_REQUEST['id']);
        }
        
        require_once 'view/header.php';
        require_once 'view/usuario/usuario-editar.php';
        require_once 'view/footer.php';
    }
    
    public function Guardar(){
        $result;
        try
        {
            $usu = new Usuario();
            $id = 0;
            $valido = '';
            
            $usu->id = isset($_REQUEST['id']) ? $_REQUEST['id'] : 0 ;
            if (isset($_REQUEST['Usuario']))
            {
                $usu->Usuario = $_REQUEST['Usuario'];
            }
            if (isset($_REQUEST['clave']))
            {
                $usu->clave = $_REQUEST['clave'];
            }
            $usu->nombre = $_REQUEST['nombre'];
            $usu->apellido = $_REQUEST['apellido'];
            $usu->fechaNacimiento = $_REQUEST['fechaNacimiento'];
            $usu->telefono = $_REQUEST['telefono'];
            if (isset($_REQUEST['email']))
            {
                $usu->email = $_REQUEST['email'];
            }
            $usu->calificacionPiloto = isset($_REQUEST['calificacionPiloto']) ? $_REQUEST['calificacionPiloto'] : 0;
            $usu->calificacionCopiloto = isset($_REQUEST['calificacionCopiloto']) ? $_REQUEST['calificacionCopiloto'] : 0;
            $usu->fechaBaja = isset($_REQUEST['fechaBaja']) ? $_REQUEST['fechaBaja'] : null;

            $valido = $this->model->Validar($usu, ($usu->id > 0 ? "M" : "A"));

            if ($valido != '')
            {
                $result = ['success' => '0', 'mensaje' => $valido];
            }
            else 
            {
                if ($usu->id > 0)
                {
                    $id = $_REQUEST['id'];
                    $this->model->Actualizar($usu);
                }
                else
                {   
                   $id = $this->model->Registrar($usu);
                }
                
                $result = ['success' => '1', 'mensaje' => 'El usuario ha sido guardado con éxito.', 'id' => $id];
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
            $this->model->Eliminar($_REQUEST['id']);
            echo json_encode(['success' => '1', 'mensaje' => 'El usuario ha sido eliminado con éxito.']);
        }
        catch(Exception $e)
        {
            echo json_encode(['success' => '0', 'mensaje' => 'Ocurrió el siguiente error:' . $e->getMessage()]);
        }
    }

    public function Listar(){
        echo json_encode($this->model->Listar());
    }

    public function Obtener(){
        $id = $_REQUEST['id'];
        echo json_encode($this->model->Obtener($id));
    }

    public function Test(){
        echo json_encode(['success' => '1', 'mensaje' => 'El usuario ha sido guardado con éxito.', 'id' => '23']);
    }
}