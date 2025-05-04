<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$id        = intval($input['id'] ?? 0);
$user_id   = intval($input['user_id'] ?? 0);
$drug_type = $input['drug_type'] ?? '';
$drug_name = $input['drug_name'] ?? '';
$dosage    = $input['dosage'] ?? '';
$schedule  = $input['schedule'] ?? '';
$mode      = $input['mode'] ?? null;
$notes     = $input['notes'] ?? null;

$stmt = $pdo->prepare("
  UPDATE therapy_entries
     SET drug_type  = :dtype,
         drug_name  = :dname,
         dosage     = :dosage,
         schedule   = :schedule,
         mode       = :mode,
         notes      = :notes,
         updated_at = CURRENT_TIMESTAMP
   WHERE id = :id AND user_id = :uid
");
$ok = $stmt->execute([
  ':dtype'    => $drug_type,
  ':dname'    => $drug_name,
  ':dosage'   => $dosage,
  ':schedule' => $schedule,
  ':mode'     => $mode,
  ':notes'    => $notes,
  ':id'       => $id,
  ':uid'      => $user_id,
]);

echo json_encode(['success' => (bool)$ok], JSON_UNESCAPED_UNICODE);
