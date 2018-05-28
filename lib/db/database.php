<?php
class Database
{
    public static function StartUp()
    {
      $pdo = new PDO('mysql:host='.$_SERVER['SERVER_NAME']'.;dbname=unaventon;charset=utf8', 'root', '');
      
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    }
}
