<?php
function tokenPorCliente() {
    $aud = __SECRET_KEY__;

    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $aud .= $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $aud .= $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $aud .= $_SERVER['REMOTE_ADDR'];
    }

    $aud .= @$_SERVER['HTTP_USER_AGENT'];
    $aud .= gethostname();

    return sha1($aud);
}