<?php
require_once 'model/usuario.php';

class AuthController{
    
    private $model,
            $auth;
    
    public function __CONSTRUCT() {
        $this->model = new Usuario();
        $this->auth  = FactoryAuth::getInstance();
    }
    
    public function Index() {
        require_once 'view/header.php';
        require_once 'view/auth/index.php';
        require_once 'view/footer.php';
    }
    
    public function Autenticar() {
        try {
            $r = $this->auth->autenticar(
                $this->model->Acceder(
                    $_POST['usuario'],
                    $_POST['password']
                )
            );
            
            if(__AUTH__ === 'token') {
                header("Location: ?c=Alumno&token=$r");
            } else {
                //header('Location: ?c=Alumno');
                header('Location: ?c=Usuario');
            }
        } catch(Exception $e) {
            header('Location: index.php');
        }
    }
    
    public function Desconectarse() {
        $this->auth->destruir();
        header('Location: index.php');
    }
}