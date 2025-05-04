<?php
// API/auth/logout.php
require_once __DIR__ . '/../config.php'; // include CORS, session_start()

// distruggi la sessione
$_SESSION = [];
session_destroy();

// conferma al client
echo json_encode(['success' => true]);
