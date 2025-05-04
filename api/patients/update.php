<?php
// api/patients/update.php
require_once __DIR__.'/../config.php';
header('Content-Type: application/json');

$in = json_decode(file_get_contents('php://input'),true);
$id    = (int)$in['id'];
$nome  = trim($in['nome']   ?? '');
$cogn  = trim($in['cognome']?? '');
$dob   = $in['dob']         ?? '';
$place = trim($in['place']  ?? '');
$sex   = $in['sesso']       ?? '';
$status= $in['status']      ?? '';

if(!$id||!$nome||!$cogn||!$dob||!in_array($sex,['M','F'],true)){
  http_response_code(400);
  exit(json_encode(['error'=>'Dati mancanti']));
}

// aggiorna
$stmt = $pdo->prepare("
  UPDATE patients SET
    nome=:n,cognome=:c,dob=:d,
    place_of_birth=:pl,sex=:sx,status=:st
  WHERE id=:id
");
$stmt->execute([
  ':n'=>$nome,':c'=>$cogn,':d'=>$dob,
  ':pl'=>$place,':sx'=>$sex,':st'=>$status,
  ':id'=>$id
]);

echo json_encode(['success'=>true]);
