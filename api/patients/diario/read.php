<?php
// api/patients/diario/read.php

// 1) Headers CORS + JSON
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// 2) Include config
require_once __DIR__ . '/../../config.php';
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 3) Prendo i parametri
$lastDays = isset($_GET['lastDays']) ? (int)$_GET['lastDays'] : null;
$limit    = isset($_GET['last'])     ? (int)$_GET['last']     : null;
$user_id  = isset($_GET['user_id'])  ? (int)$_GET['user_id']  : null;

try {
    // 4) Se chiedo gli ultimi N giorni...
    if ($lastDays) {
        $stmt = $pdo->prepare("
          SELECT
            id, user_id, entry_date,
            glicemia_pre, glicemia_post, chetoni_checked,
            peso, pressione_sistolica, pressione_diastolica,
            attivita, alimentazione, note
          FROM diary_entries
          WHERE entry_date >= CURDATE() - INTERVAL :days DAY
          ORDER BY entry_date ASC
        ");
        $stmt->execute([':days' => $lastDays]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        //  → se non trovo nulla, ripiego automaticamente su limit = $lastDays
        if (count($rows) === 0) {
            $limit = $lastDays;
            $lastDays = null;
        }
    }

    // 5) Se ho un limite (o arrivo qui per fallback)...
    if (!$lastDays && $limit) {
        $stmt = $pdo->prepare("
          SELECT
            id, user_id, entry_date,
            glicemia_pre, glicemia_post, chetoni_checked,
            peso, pressione_sistolica, pressione_diastolica,
            attivita, alimentazione, note
          FROM diary_entries
          ORDER BY entry_date DESC
          LIMIT :lim
        ");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 6) Se chiedo le voci di un singolo utente
    if (!$lastDays && !$limit && $user_id) {
        $stmt = $pdo->prepare("
          SELECT
            id, user_id, entry_date,
            glicemia_pre, glicemia_post, chetoni_checked,
            peso, pressione_sistolica, pressione_diastolica,
            attivita, alimentazione, note
          FROM diary_entries
          WHERE user_id = :uid
          ORDER BY entry_date DESC
        ");
        $stmt->execute([':uid' => $user_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 7) Se non ho né lastDays, né limit, né user_id → 400
    if (!isset($rows)) {
        http_response_code(400);
        exit(json_encode(['error' => 'Missing parameter']));
    }

    // 8) Cast dei tipi
    foreach ($rows as &$r) {
      $r['id']                   = (int)$r['id'];
      $r['user_id']              = (int)$r['user_id'];
      $r['glicemia_pre']         = $r['glicemia_pre']  !== null ? (int)$r['glicemia_pre'] : null;
      $r['glicemia_post']        = $r['glicemia_post'] !== null ? (int)$r['glicemia_post']: null;
      $r['chetoni_checked']      = (bool)$r['chetoni_checked'];
      $r['peso']                 = $r['peso']          !== null ? (float)$r['peso']      : null;
      $r['pressione_sistolica']  = $r['pressione_sistolica']  !== null ? (int)$r['pressione_sistolica']  : null;
      $r['pressione_diastolica'] = $r['pressione_diastolica'] !== null ? (int)$r['pressione_diastolica'] : null;
      // entry_date, attivita, alimentazione, note restano stringhe
    }
    unset($r);

    // 9) Output JSON
    echo json_encode($rows, JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
      'error'  => 'DB error',
      'detail' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
