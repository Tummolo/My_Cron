<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$in = json_decode(file_get_contents('php://input'), true);
$id      = intval($in['id']      ?? 0);
$user_id = intval($in['user_id'] ?? 0);

try {
  $stmt = $pdo->prepare("
    DELETE FROM diary_entries
     WHERE id = :id AND user_id = :uid
  ");
  $stmt->execute([':id'=>$id,':uid'=>$user_id]);
  echo json_encode(['success'=>true]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Errore nella cancellazione']);
}
