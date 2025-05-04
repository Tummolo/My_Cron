<?php
// API/auth/login.php
require_once __DIR__ . '/../config.php'; // include CORS, session_start(), PDO

// Nota: config.php già ha gestito OPTIONS/preflight

// leggiamo il JSON del body
$in = json_decode(file_get_contents('php://input'), true);
$username = trim($in['username'] ?? '');
$password = $in['password'] ?? '';

if (!$username || !$password) {
  http_response_code(400);
  exit(json_encode(['error' => 'Username e password obbligatori']));
}

// verifica credenziali
$stmt = $pdo->prepare("
  SELECT u.id, u.password_hash, u.role,
         p.nome, p.cognome, p.malattia
    FROM users AS u
    LEFT JOIN patients AS p ON p.user_id = u.id
   WHERE u.username = ?
   LIMIT 1
");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || md5($password) !== $user['password_hash']) {
  http_response_code(401);
  exit(json_encode(['error' => 'Credenziali non valide']));
}

// salva in sessione (senza hash)
unset($user['password_hash']);
$_SESSION['user'] = $user;

// restituisci profilo
echo json_encode([
  'id'       => (int)$user['id'],
  'username' => $username,
  'role'     => strtolower($user['role']),
  'nome'     => $user['nome']    ?? null,
  'cognome'  => $user['cognome'] ?? null,
  'malattia' => $user['malattia'] ?? null,
]);
