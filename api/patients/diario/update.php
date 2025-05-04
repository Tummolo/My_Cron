<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$in = json_decode(file_get_contents('php://input'), true);
$id      = intval($in['id']      ?? 0);
$user_id = intval($in['user_id'] ?? 0);
$date    = $in['entry_date']       ?? null;
$pre     = $in['glicemia_pre']     ?? null;
$post    = $in['glicemia_post']    ?? null;
$chetoni = isset($in['chetoni_checked']) ? (int)$in['chetoni_checked'] : 0;
$peso    = $in['peso']             ?? null;
$sis     = $in['pressione_sistolica']  ?? null;
$dia     = $in['pressione_diastolica'] ?? null;
$att     = $in['attivita']         ?? null;
$alim    = $in['alimentazione']    ?? null;
$note    = $in['note']             ?? null;

try {
  $stmt = $pdo->prepare("
    UPDATE diary_entries
      SET entry_date          = :date,
          glicemia_pre       = :pre,
          glicemia_post      = :post,
          chetoni_checked    = :che,
          peso               = :peso,
          pressione_sistolica   = :sis,
          pressione_diastolica  = :dia,
          attivita           = :att,
          alimentazione      = :alim,
          note               = :note
    WHERE id = :id AND user_id = :uid
  ");
  $stmt->execute([
    ':date'=>$date,':pre'=>$pre,':post'=>$post,
    ':che'=>$chetoni,':peso'=>$peso,
    ':sis'=>$sis,':dia'=>$dia,
    ':att'=>$att,':alim'=>$alim,':note'=>$note,
    ':id'=>$id,':uid'=>$user_id
  ]);
  echo json_encode(['success'=>true]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Errore nell’aggiornamento']);
}
