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
                //header("Location: ?c=Alumno&token=$r");
                echo json_encode(array('status' => "ok", "token"=>$r));
            } else {
                //header('Location: ?c=Alumno');
                //header('Location: ?c=Usuario');
                echo json_encode(array('status' => "error", "token"=>$r, 'error' => "usuario inválido"));
            }
        } catch(Exception $e) {
            //header('Location: index.php');
            echo json_encode(array('status' => "error", "token"=>null, 'error' => "usuario inválido"));
        }
    }

    public function Desconectarse() {
        $this->auth->destruir();
        header('Location: index.php');
    }
}
