<?php
// api/patients/create.php

// 1) CORS & JSON headers (solo per sviluppo)
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
header('Content-Type: application/json');

// 2) Configura PDO ed error handling
require_once __DIR__ . '/../config.php';
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 3) Leggi e valida input
$in         = json_decode(file_get_contents('php://input'), true);
$nome       = trim($in['nome']    ?? '');
$cogn       = trim($in['cognome'] ?? '');
$dob        = $in['dob']          ?? '';
$sesso      = $in['sesso']        ?? '';
$place      = trim($in['place']   ?? '');
$email      = trim($in['email']   ?? '');
$malattia   = $in['malattia']     ?? '';

$allowedMal = ['Diabete', 'Scompenso Cardiaco'];

if (
    !$nome || !$cogn || !$dob ||
    !in_array($sesso, ['M','F'], true) ||
    !$place ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    !in_array($malattia, $allowedMal, true)
) {
    http_response_code(400);
    exit(json_encode(['error'=>'Dati mancanti o non validi']));
}

// 4) Funzione helper per estrarre le tre lettere di cognome/nome\...
// (omessa qui per brevità: rimane identica)

try {
  $pdo->beginTransaction();

  // 5) Crea l’utente
  $username = strtolower(str_replace(' ', '.', "$nome.$cogn"));
  $stmt = $pdo->prepare(""
    INSERT INTO users (username, password_hash, role, created_at)
    VALUES (:u, '', 'patient', NOW())
  ""
  );
  $stmt->execute([':u'=>$username]);
  $uid = $pdo->lastInsertId();

  // ... Calcolo codice fiscale (rimane identico) ...

  // 11) Inserisci in patients con malattia
  $stmt = $pdo->prepare(""
    INSERT INTO patients
      (user_id, nome, cognome, dob, place_of_birth, sex, malattia, codice_fiscale, status, created_at)
    VALUES
      (:uid, :n, :c, :d, :pl, :sx, :mal, :cf, 'pending', NOW())
  ""
  );
  $stmt->execute([
    ':uid' => $uid,
    ':n'   => $nome,
    ':c'   => $cogn,
    ':d'   => $dob,
    ':pl'  => $place,
    ':sx'  => $sesso,
    ':mal' => $malattia,
    ':cf'  => $codice_fiscale
  ]);

  // 12) Token + email (idem)

  $pdo->commit();

  echo json_encode(['success'=>true,'user_id'=>$uid]);
}
catch (Throwable $e) {
  $pdo->rollBack();
  http_response_code(500);
  exit(json_encode(['error'=>'Errore interno: '.$e->getMessage()]));
}