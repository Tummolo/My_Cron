<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$input   = json_decode(file_get_contents('php://input'), true);
$id      = intval($input['id'] ?? 0);
$user_id = intval($input['user_id'] ?? 0);

$stmt = $pdo->prepare("
  DELETE FROM therapy_entries
   WHERE id = :id AND user_id = :uid
");
$ok = $stmt->execute([
  ':id'  => $id,
  ':uid' => $user_id,
]);

echo json_encode(['success' => (bool)$ok], JSON_UNESCAPED_UNICODE);
