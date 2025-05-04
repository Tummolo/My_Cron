<?php
require_once __DIR__ . '/../../config.php';
header('Content-Type: application/json; charset=utf-8');

$in = json_decode(file_get_contents('php://input'), true);
$user_id = intval($in['user_id'] ?? 0);
$date    = $in['entry_date'] ?? null;
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
    INSERT INTO diary_entries
      (user_id, entry_date, glicemia_pre, glicemia_post, chetoni_checked,
       peso, pressione_sistolica, pressione_diastolica, attivita, alimentazione, note)
    VALUES
      (:uid, :date, :pre, :post, :che,
       :peso, :sis, :dia, :att, :alim, :note)
  ");
  $stmt->execute([
    ':uid'  => $user_id,
    ':date' => $date,
    ':pre'  => $pre,
    ':post' => $post,
    ':che'  => $chetoni,
    ':peso' => $peso,
    ':sis'  => $sis,
    ':dia'  => $dia,
    ':att'  => $att,
    ':alim' => $alim,
    ':note' => $note
  ]);
  echo json_encode(['success'=>true]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Errore nel salvataggio']);
}
