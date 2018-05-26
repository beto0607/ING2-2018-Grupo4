<?php
interface IAuth {
    public function autenticar($usuario);
    public function estaAutenticado();
    public function destruir();
    public function usuario();
}

class FactoryAuth {
    public static function getInstance(){
        require_once sprintf('lib/auth/%s/auth.php', __AUTH__);
        return new Auth;
    }
}