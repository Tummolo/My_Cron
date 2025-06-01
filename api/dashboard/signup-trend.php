<?php
// signup-trend.php

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$days = isset($_GET['days']) ? (int)$_GET['days'] : 30;

try {
    $stmt = $pdo->prepare("
      SELECT DATE(created_at) AS date,
             COUNT(*)         AS count
      FROM patients
      WHERE created_at >= CURDATE() - INTERVAL :days DAY
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    ");
    $stmt->execute([':days'=>$days]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error'=>'DB error']);
}
