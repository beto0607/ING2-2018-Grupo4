<?php
use Firebase\JWT\JWT;

class Auth implements IAuth {
    private $encrypt = array('HS256');
    private $tiempo = 1; // Horas
    
    // Crea un nuevo token guardando la información del usuario que hemos autenticado
    public function autenticar($usuario) {
        if(!is_object($usuario)) {
            throw new Exception("Fallo autenticación");
        } else if(empty($usuario->id)){
            throw new Exception("Fallo autenticación");
        }
        
        $time = time();
        
        $token = array(
            'exp'  => $time + (3600*$this->tiempo),
            'aud'  => tokenPorCliente(),
            'data' => $usuario
        );

        return JWT::encode($token, __SECRET_KEY__);
    }
    
    public function estaAutenticado() {
        if(empty($_GET['token'])) {
            throw new Exception('No esta autenticado');
        }
        
        $token = $_GET['token'];
        
        $decode = JWT::decode(
            $token,
            __SECRET_KEY__,
            $this->encrypt
        );
        
        if($decode->aud !== tokenPorCliente()) {
            throw new Exception("No esta autenticado");
        }
    }
    
    public function usuario() {
        $this->estaAutenticado();
        
        $token = $_GET['token'];
        
        return JWT::decode(
            $token,
            __SECRET_KEY__,
            $this->encrypt
        )->data;
    }
    
    public function destruir() {
        
    }
}