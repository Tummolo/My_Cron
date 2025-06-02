<?php
// API/auth/login.php

// 1) Includi config.php (deve chiamare session_start() e creare $pdo)
require_once __DIR__ . '/../config.php'; 

// 2) Leggiamo il JSON inviato dal client
$in = json_decode(file_get_contents('php://input'), true);
$username = trim($in['username'] ?? '');
$password = $in['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Username e password obbligatori']);
    exit;
}

// 3) Preleva l’utente (e relativo hash) in base allo username
$stmt = $pdo->prepare("
    SELECT 
      u.id, 
      u.password_hash, 
      u.role,
      p.nome, 
      p.cognome, 
      p.malattia,
      p.status
    FROM users AS u
    LEFT JOIN patients AS p ON p.user_id = u.id
    WHERE u.username = ?
    LIMIT 1
");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    // Username inesistente
    http_response_code(401);
    echo json_encode(['error' => 'Credenziali non valide']);
    exit;
}

// 4) Se vuoi impedire il login se lo status non è ‘active’
//    Ad esempio, se appena creato, status = 'pending'
if (isset($user['status']) && $user['status'] !== 'active') {
    http_response_code(403);
    echo json_encode(['error' => 'Account non attivo']);
    exit;
}

// 5) Confronto password in chiaro vs hash Bcrypt memorizzato
if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenziali non valide']);
    exit;
}

// 6) Login OK: rimuovo password_hash dall’array e salvo il resto in sessione
unset($user['password_hash']);
// A questo punto $user contiene: id, role, nome, cognome, malattia, status...
$_SESSION['user'] = $user;

// 7) Restituisci il profilo utente come JSON
echo json_encode([
    'id'       => (int)$user['id'],
    'username' => $username,
    'role'     => strtolower($user['role']),
    'nome'     => $user['nome']    ?? null,
    'cognome'  => $user['cognome'] ?? null,
    'malattia' => $user['malattia'] ?? null,
]);
