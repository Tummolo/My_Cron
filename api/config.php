<?php
// API/config.php

// 1) Disabilito output errori (+ li loggo)
ini_set('display_errors', 0);
ini_set('log_errors',     1);
error_reporting(E_ALL);

// 2) CORS dinamico (dev e production)
$allowed = [
  'http://localhost:5173',
  'https://ios2020.altervista.org',
  // aggiungi altri domini se richiesto
];
if (!empty($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed, true)) {
  header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// 3) Cookie PHP con SameSite dinamico
$isHttps = (
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
 || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
);
session_set_cookie_params([
  'lifetime' => 0,
  'path'     => '/',
  'httponly' => true,
  'secure'   => $isHttps,
  'samesite' => $isHttps ? 'None' : 'Lax'
]);
session_start();

// 4) header JSON di default
header('Content-Type: application/json; charset=utf-8');

// 5) Connessione al DB (PDO)
$host     = 'localhost';
$db       = 'my_ios2020';
$user     = 'ios2020';
$password = 'DhM5rYJsPJP2';
$dsn      = "mysql:host=$host;dbname=$db;charset=utf8mb4";
$opts     = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];
$pdo = new PDO($dsn, $user, $password, $opts);
