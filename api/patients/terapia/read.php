<?php
// api/patients/terapia/read.php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$user_id = intval($_GET['user_id'] ?? 0);
if (!$user_id) {
    echo json_encode(['success'=>false,'message'=>'user_id mancante'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("
      SELECT 
        id,
        drug_type,
        drug_name,
        dosage,
        schedule,
        mode,
        notes,
        created_at             -- ← aggiunto qui
      FROM therapy_entries
      WHERE user_id = :uid
      ORDER BY created_at DESC
    ");
    $stmt->execute([':uid' => $user_id]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Errore DB'], JSON_UNESCAPED_UNICODE);
}
