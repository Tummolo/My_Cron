<?php
// /api/chat/save.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$in = json_decode(file_get_contents('php://input'), true);
if (
  empty($in['user_id']) ||
  !in_array($in['sender'], ['user','admin'], true) ||
  !isset($in['text'], $in['ts'])
) {
  http_response_code(400);
  exit(json_encode(['error'=>'Bad payload']));
}

try {
  // 1) salva in DB
  $stmt = $pdo->prepare("
    INSERT INTO chat_messages (user_id, sender, text, ts)
    VALUES (?, ?, ?, ?)
  ");
  $stmt->execute([
    (int)$in['user_id'],
    $in['sender'],
    $in['text'],
    (int)$in['ts']
  ]);
  error_log("save.php: DB insert OK for user_id={$in['user_id']}");

  // 2) trigger via HTTP REST
  $room = "private-chat-{$in['user_id']}";
  $payload = [
    'name'     => 'new-message',
    'channels' => [$room],
    'data'     => json_encode([
      'user' => $in['sender'],
      'text' => $in['text'],
      'ts'   => $in['ts']
    ]),
  ];
  $body = json_encode($payload);

  // firma HMAC
  $signature = hash_hmac('sha256', $body, PUSHER_SECRET);

  $ch = curl_init("https://api-" . PUSHER_CLUSTER . ".pusher.com/apps/" . PUSHER_APP_ID . "/events");
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $body,
    CURLOPT_HTTPHEADER     => [
      'Content-Type: application/json',
      'X-Pusher-Key: '       . PUSHER_KEY,
      'X-Pusher-Signature: ' . $signature,
    ],
  ]);

  $res       = curl_exec($ch);
  $errno     = curl_errno($ch);
  $errmsg    = curl_error($ch);
  $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  error_log("save.php: Pusher HTTP API response code: {$http_code}");
  error_log("save.php: cURL errno={$errno} errmsg=\"{$errmsg}\"");
  error_log("save.php: response body: {$res}");

  // 3) rispondi OK (restituiamo anche i dettagli Pusher per debug)
  echo json_encode([
    'ok' => true,
    'pusher' => [
      'http_code' => $http_code,
      'errno'     => $errno,
      'errmsg'    => $errmsg,
      'body'      => json_decode($res, true),
    ],
  ]);

} catch (Throwable $e) {
  error_log("save.php error: ".$e->getMessage());
  http_response_code(500);
  echo json_encode(['error'=>'Internal Server Error']);
}
