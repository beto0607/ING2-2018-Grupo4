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

            echo json_encode(array('status' => "ok", "token"=>$r));
        } catch(Exception $e) {
            echo json_encode(array('status' => "error", "token"=>null, 'error' => "usuario inválido"));
        }
    }

    public function Desconectarse() {
        $this->auth->destruir();
        header('Location: index.php');
    }
}
