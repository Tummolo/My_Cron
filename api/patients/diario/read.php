<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';

// Prendo e valido user_id
$user_id = filter_input(INPUT_GET,'user_id',FILTER_VALIDATE_INT);
if (!$user_id) {
  echo '[]';
  exit;
}

try {
  $stmt = $pdo->prepare(
    "SELECT
       id,
       entry_date,
       glicemia_pre,
       glicemia_post,
       chetoni_checked,
       peso,
       pressione_sistolica,
       pressione_diastolica,
       attivita,
       alimentazione,
       note
     FROM diary_entries
     WHERE user_id = :uid
     ORDER BY entry_date ASC"
  );
  $stmt->execute([':uid'=>$user_id]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Cast dei tipi
  foreach($rows as &$r){
    $r['id']                   = (int)$r['id'];
    $r['glicemia_pre']         = $r['glicemia_pre']    !== null ? (int)$r['glicemia_pre']    : null;
    $r['glicemia_post']        = $r['glicemia_post']   !== null ? (int)$r['glicemia_post']   : null;
    $r['chetoni_checked']      = (bool)$r['chetoni_checked'];
    $r['peso']                 = $r['peso']            !== null ? (float)$r['peso']         : null;
    $r['pressione_sistolica']  = $r['pressione_sistolica']  !== null ? (int)$r['pressione_sistolica']  : null;
    $r['pressione_diastolica'] = $r['pressione_diastolica'] !== null ? (int)$r['pressione_diastolica'] : null;
    // attivita, alimentazione, note sono stringhe o null
  }
  unset($r);

  echo json_encode($rows, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo '[]';
}