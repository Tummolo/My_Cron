<?php
// api/create_user.php

// 1) CORS: consenti tutte le origini (in sviluppo)
//    In produzione, sostituisci '*' con il dominio del frontend.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 2) Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// 3) JSON response
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$username = trim($_GET['username']  ?? '');
$password = $_GET['password']      ?? '';
$role     = $_GET['role']          ?? 'patient';

if ($username === '' || $password === '') {
  http_response_code(400);
  exit(json_encode(['error' => 'Username e password obbligatorie']));
}

if (!preg_match('/^[a-zA-Z0-9_]{3,50}$/', $username)) {
  http_response_code(400);
  exit(json_encode(['error' => 'Username non valido']));
}

if (!in_array($role, ['admin','patient'], true)) {
  http_response_code(400);
  exit(json_encode(['error' => 'Role non valido (admin o patient)']));
}

// Hash con MD5 (per test; in prod usa bcrypt)
$password_hash = md5($password);

try {
  $stmt = $pdo->prepare('
    INSERT INTO `users` (username, password_hash, role)
    VALUES (:username, :hash, :role)
  ');
  $stmt->execute([
    ':username' => $username,
    ':hash'     => $password_hash,
    ':role'     => $role
  ]);

  echo json_encode([
    'success'  => true,
    'id'       => (int)$pdo->lastInsertId(),
    'username' => $username,
    'role'     => $role
  ]);
} catch (PDOException $e) {
  // Duplicate
  if (isset($e->errorInfo[1]) && $e->errorInfo[1] === 1062) {
    http_response_code(409);
    exit(json_encode(['error' => 'Username già esistente']));
  }
  http_response_code(500);
  exit(json_encode(['error' => 'Errore DB: '.$e->getMessage()]));
}
