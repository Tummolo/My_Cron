<?php
// /api/chat/history.php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json; charset=utf-8');

$user_id = intval($_GET['user_id'] ?? 0);
if (!$user_id) {
  echo json_encode([]);
  exit;
}

$stmt = $pdo->prepare("
  SELECT sender AS user, text, ts
    FROM chat_messages
   WHERE user_id = ?
   ORDER BY ts ASC
");
$stmt->execute([$user_id]);
echo json_encode($stmt->fetchAll());
