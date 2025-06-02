<?php
// api/patients/create.php

// 1) CORS & JSON headers (solo per sviluppo)
// Se in produzione non ti serve chiamare l’API da un dominio differente,
// puoi anche rimuovere questi header o adattarli al tuo dominio in produzione.
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
header('Content-Type: application/json; charset=UTF-8');

// 2) Configura PDO ed error handling
require_once __DIR__ . '/../config.php';  // __DIR__ è "api/patients"
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 3) Leggi e valida input JSON
$rawBody = file_get_contents('php://input');
$in       = json_decode($rawBody, true);

$nome     = trim($in['nome']       ?? '');
$cogn     = trim($in['cognome']    ?? '');
$dob      = trim($in['dob']        ?? '');
$sesso    = trim($in['sesso']      ?? '');
$place    = trim($in['place']      ?? '');
$email    = trim($in['email']      ?? '');
$malattia = trim($in['malattia']   ?? '');

$allowedMal = ['Diabete', 'Scompenso Cardiaco'];

if (
    !$nome ||
    !$cogn ||
    !$dob ||
    !in_array($sesso, ['M', 'F'], true) ||
    !$place ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    !in_array($malattia, $allowedMal, true)
) {
    http_response_code(400);
    echo json_encode(['error' => 'Dati mancanti o non validi']);
    exit;
}

// 4) Funzione helper per calcolare il codice fiscale
function calcolaCodiceFiscale($nome, $cogn, $dob, $sesso, $place) {
    // Qui dovresti mettere la tua logica completa per il CF.
    // Questo è soltanto un placeholder di esempio:
    return strtoupper(
        substr($cogn, 0, 3)
        . substr($nome, 0, 3)
        . date('ymd', strtotime($dob))
        . $sesso
        . 'XXX'
    );
}

try {
    $pdo->beginTransaction();

    // 5) Crea l’utente in tabella "users"
    $username = strtolower(str_replace(' ', '.', "$nome.$cogn"));
    $stmt = $pdo->prepare("
        INSERT INTO users (username, password_hash, role, created_at)
        VALUES (:u, '', 'patient', NOW())
    ");
    $stmt->execute([':u' => $username]);
    $uid = $pdo->lastInsertId();

    // 6) Calcolo codice fiscale
    $codice_fiscale = calcolaCodiceFiscale($nome, $cogn, $dob, $sesso, $place);

    // 7) Inserisci in tabella "patients"
    $stmt = $pdo->prepare("
        INSERT INTO patients
            (user_id, nome, cognome, dob, place_of_birth, sex, malattia, codice_fiscale, status, created_at)
        VALUES
            (:uid, :n, :c, :d, :pl, :sx, :mal, :cf, 'pending', NOW())
    ");
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

    // 8) Genera token per l’invito via email
    $token = bin2hex(random_bytes(16));

    // Inserisci su activation_tokens (sostituendo "created_at" con "expires_at")
    $stmt = $pdo->prepare("
        INSERT INTO activation_tokens (user_id, token, expires_at)
        VALUES (:uid, :tok, DATE_ADD(NOW(), INTERVAL 1 DAY))
    ");
    $stmt->execute([
        ':uid' => $uid,
        ':tok' => $token
    ]);

    // 9) Invia email con link di attivazione
    // Cambia "www.ios2020.altervista.org" con il tuo dominio se differente
    $activationLink = "http://www.ios2020.altervista.org/api/patients/activate.php?token=$token";

    $subject = 'Invito Paziente - MyCron';
    $message = 
        "Ciao $nome,\n\n" .
        "Per completare la registrazione e impostare la tua password, clicca sul link qui sotto:\n\n" .
        "$activationLink\n\n" .
        "Se non hai richiesto questa registrazione, ignora questa email.\n\n" .
        "A presto,\n" .
        "Il team MyCron";
    $headers = 
        'From: no-reply@ios2020.altervista.org' . "\r\n" .
        'Reply-To: no-reply@ios2020.altervista.org' . "\r\n" .
        'X-Mailer: PHP/' . phpversion();

    @mail($email, $subject, $message, $headers);

    $pdo->commit();

    echo json_encode(['success' => true, 'user_id' => $uid]);
}
catch (Throwable $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Errore interno: ' . $e->getMessage()]);
    exit;
}
