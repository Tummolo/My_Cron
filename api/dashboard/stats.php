<?php
// /api/dashboard/stats.php

// CORS (solo sviluppo)
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// sopprimi warning/fatal HTML
ini_set('display_errors', '0');
error_reporting(0);

require_once __DIR__ . '/../config.php';
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // una singola query con sub‐select per raccogliere tutti i numeri
    $sql = "
      SELECT
        (SELECT COUNT(*) FROM patients)                                                            AS totalPatients,
        (SELECT COUNT(*) FROM patients WHERE status = 'active')                                   AS active,
        (SELECT COUNT(*) FROM patients WHERE status = 'inactive')                                 AS inactive,
        (SELECT COUNT(*) FROM patients WHERE status = 'pending')                                  AS pending,
        (SELECT ROUND(AVG(TIMESTAMPDIFF(YEAR, dob, CURDATE())),1) FROM patients)                  AS avgAge,
        (SELECT ROUND(
            IFNULL(AVG((glicemia_pre + glicemia_post) / 2), 0),
            1
         )
         FROM diary_entries
         WHERE glicemia_pre IS NOT NULL
           AND glicemia_post IS NOT NULL
        )                                                                                         AS avgGlycemia,
        (SELECT COUNT(*) FROM diary_entries)                                                       AS diaryCount,
        (SELECT COUNT(*) FROM therapy_entries)                                                     AS therapyCount
    ";

    $stmt  = $pdo->query($sql);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    // cast espliciti per far arrivare numeri in JS
    $stats['totalPatients'] = (int)$stats['totalPatients'];
    $stats['active']        = (int)$stats['active'];
    $stats['inactive']      = (int)$stats['inactive'];
    $stats['pending']       = (int)$stats['pending'];
    $stats['avgAge']        = (float)$stats['avgAge'];
    $stats['avgGlycemia']   = (float)$stats['avgGlycemia'];
    $stats['diaryCount']    = (int)$stats['diaryCount'];
    $stats['therapyCount']  = (int)$stats['therapyCount'];

    echo json_encode($stats, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB error']);
}
