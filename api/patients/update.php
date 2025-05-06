<?php
// api/patients/update.php

// 1) Headers JSON + (dev) CORS
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 2) Leggo input
$in       = json_decode(file_get_contents('php://input'), true);
$user_id  = (int)   ($in['id']           ?? 0);       // ← qui arriva user_id
$nome     = trim(   $in['nome']         ?? '');
$cogn     = trim(   $in['cognome']      ?? '');
$dob      =         $in['dob']           ?? '';
$place    = trim(   $in['place']         ?? '');
$sex      =         $in['sesso']         ?? '';
$status   =         $in['status']        ?? '';
$malattia =         $in['malattia']      ?? '';
$cfManual = isset($in['cfManual'])
              ? trim(strtoupper($in['cfManual']))
              : null;

// 3) Validazioni
$allowedSex = ['M','F'];
$allowedMal = ['Diabete','Scompenso Cardiaco'];
$allowedSt  = ['pending','active','inactive'];

if (
    !$user_id ||
    !$nome || !$cogn || !$dob || !$place ||
    !in_array($sex, $allowedSex, true) ||
    !in_array($status, $allowedSt,  true) ||
    !in_array($malattia, $allowedMal, true)
) {
    http_response_code(400);
    exit(json_encode(['error'=>'Dati mancanti o non validi']));
}

// 4) Preparo UPDATE su patients **usando user_id**
$sql = "
  UPDATE patients SET
    nome           = :n,
    cognome        = :c,
    dob            = :d,
    place_of_birth = :pl,
    sex            = :sx,
    malattia       = :mal,
    status         = :st"
  . ($cfManual !== null ? ", codice_fiscale = :cf" : "")
  . "
  WHERE user_id = :uid
";

$stmt = $pdo->prepare($sql);

// 5) Bind dei parametri
$params = [
  ':n'   => $nome,
  ':c'   => $cogn,
  ':d'   => $dob,
  ':pl'  => $place,
  ':sx'  => $sex,
  ':mal' => $malattia,
  ':st'  => $status,
  ':uid' => $user_id,
];

if ($cfManual !== null) {
  $params[':cf'] = $cfManual;
}

// 6) Esecuzione
try {
  $stmt->execute($params);
  echo json_encode(['success'=>true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error'=>'Errore DB: '.$e->getMessage()]);
}
