<?php
// api/auth/me.php
require_once __DIR__ . '/../config.php';

// CORS + credenziali
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

header('Content-Type: application/json');
session_start();

// se non loggato → 401
if (empty($_SESSION['user'])) {
  http_response_code(401);
  exit(json_encode(['error' => 'Non autenticato']));
}

$user = $_SESSION['user'];
$malattia = null;

// se paziente, leggo la sua malattia
if (trim(strtolower($user['role'])) === 'patient') {
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  $stmt = $pdo->prepare('SELECT malattia FROM patients WHERE user_id = ? LIMIT 1');
  $stmt->execute([$user['id']]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  $malattia = $row['malattia'] ?? null;
}

// restituisco il profilo
echo json_encode([
  'id'       => (int)$user['id'],
  'role'     => trim(strtolower($user['role'])),
  'username' => $user['username'],
  'nome'     => $user['nome']    ?? null,
  'cognome'  => $user['cognome'] ?? null,
  'malattia' => $malattia,
]);
