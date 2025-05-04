<?php
// /api/chat/auth.php

require_once __DIR__ . '/../config.php';

// Leggo i parametri POST
$socket_id    = $_POST['socket_id']    ?? '';
$channel_name = $_POST['channel_name'] ?? '';
if (!$socket_id || !$channel_name) {
  http_response_code(400);
  exit(json_encode(['error'=>'Bad request']));
}

// Genero la firma HMAC SHA256: "socket_id:channel_name"
$sign_data = $socket_id . ':' . $channel_name;
$signature = hash_hmac('sha256', $sign_data, PUSHER_SECRET);

// Risposta JSON per Pusher.js
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
  'auth' => PUSHER_KEY . ':' . $signature
]);
