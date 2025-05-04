<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$user_id  = intval($input['user_id'] ?? 0);
$drug_type = $input['drug_type'] ?? '';
$drug_name = $input['drug_name'] ?? '';
$dosage    = $input['dosage'] ?? '';
$schedule  = $input['schedule'] ?? '';
$mode      = $input['mode'] ?? null;
$notes     = $input['notes'] ?? null;

$stmt = $pdo->prepare("
  INSERT INTO therapy_entries
    (user_id, drug_type, drug_name, dosage, schedule, mode, notes)
  VALUES
    (:uid, :dtype, :dname, :dosage, :schedule, :mode, :notes)
");
$ok = $stmt->execute([
  ':uid'      => $user_id,
  ':dtype'    => $drug_type,
  ':dname'    => $drug_name,
  ':dosage'   => $dosage,
  ':schedule' => $schedule,
  ':mode'     => $mode,
  ':notes'    => $notes,
]);

echo json_encode(['success' => (bool)$ok], JSON_UNESCAPED_UNICODE);
