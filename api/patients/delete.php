<?php
// api/patients/delete.php

// CORS (sviluppo)
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

$in = json_decode(file_get_contents('php://input'), true);
$id = (int) ($in['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    exit(json_encode(['error' => 'ID mancante']));
}

try {
    // avvia transazione
    $pdo->beginTransaction();

    // 1) recupera il user_id
    $stmt = $pdo->prepare("SELECT user_id FROM patients WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        // nessun paziente con quell'id
        throw new Exception("Paziente non trovato");
    }
    $userId = (int) $row['user_id'];

    // 2) soft‐delete del paziente (se preferisci hard‐delete, usa DELETE FROM patients)
    $stmt = $pdo->prepare("UPDATE patients SET status = 'inactive' WHERE id = :id");
    $stmt->execute([':id' => $id]);

    // 3) elimina l’utente corrispondente
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = :uid");
    $stmt->execute([':uid' => $userId]);

    // 4) opzionale: elimina anche eventuali token di attivazione
    $stmt = $pdo->prepare("DELETE FROM activation_tokens WHERE user_id = :uid");
    $stmt->execute([':uid' => $userId]);

    // conferma transazione
    $pdo->commit();

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    // rollback in caso di errore
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Errore interno: ' . $e->getMessage()]);
}
