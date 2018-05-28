<?php
header("Access-Control-Allow-Origin: *");

date_default_timezone_set('America/Lima');

/* Require */
require_once 'lib/db/database.php';
require_once 'lib/auth/auth.factory.php';
require_once 'lib/mis_helpers.php';
require_once 'vendor/autoload.php';

/* Autenticacion: session|db|token */
define('__AUTH__', 'session');
define('__SECRET_KEY__', 'asdawdsd8ws.6@');

/* Controlador por defecto */
$controller = 'auth';

// Todo esta lógica hara el papel de un FrontController
if(!isset($_REQUEST['c']))
{
    require_once "controller/$controller.controller.php";
    $controller = ucwords($controller) . 'Controller';
    $controller = new $controller;
    $controller->Index();
}
else
{
    // Obtenemos el controlador que queremos cargar
    $controller = strtolower($_REQUEST['c']);
    $accion = isset($_REQUEST['a']) ? $_REQUEST['a'] : 'Index';

    // Instanciamos el controlador
    require_once "controller/$controller.controller.php";
    $controller = ucwords($controller) . 'Controller';
    $controller = new $controller;

    // Llama la accion
    call_user_func( array( $controller, $accion ) );
}
