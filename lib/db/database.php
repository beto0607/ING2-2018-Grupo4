<?php
class Database
{
    public static function StartUp()
    {
      $mysqURL = 'mysql:host='.$_SERVER["SERVER_NAME"].';dbname=unaventon;charset=utf8';
      $pdo = new PDO($mysqURL, 'root', '');

        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    }
}
