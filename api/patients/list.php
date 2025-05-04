<?php
// api/patients/list.php

// CORS (dev)
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// sopprimi warning/fatal HTML
ini_set('display_errors', '0');
error_reporting(0);

require_once __DIR__ . '/../config.php';
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $stmt = $pdo->query("
      SELECT
        u.id           AS user_id,
        u.username,
        p.nome,
        p.cognome,
        p.dob,
        p.place_of_birth,
        p.sex,
        p.codice_fiscale,
        p.status
      FROM patients p
      JOIN users    u ON u.id = p.user_id
      WHERE p.status IN ('pending','active')
      ORDER BY p.created_at DESC
    ");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB error']);
}
