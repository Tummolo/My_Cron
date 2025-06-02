<?php
// api/patients/activate.php

// 1) Includi config.php (deve chiamare session_start() e creare $pdo)
require_once __DIR__ . '/../config.php';
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 2) Leggi il token dalla query string
$token = trim($_GET['token'] ?? '');
if (!$token) {
    header('Content-Type: text/html; charset=UTF-8');
    echo '<!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>Errore</title></head>
    <body style="font-family:sans-serif; text-align:center; padding:2rem;">
      <h2>Token mancante</h2>
      <p>Il link di attivazione non contiene alcun token.</p>
    </body></html>';
    exit;
}

// 3) Controlla in activation_tokens se il token è valido e non scaduto
$stmt = $pdo->prepare("
    SELECT a.user_id
    FROM activation_tokens a
    WHERE a.token = :t
      AND a.expires_at > NOW()
");
$stmt->execute([':t' => $token]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    header('Content-Type: text/html; charset=UTF-8');
    echo '<!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>Token non valido</title></head>
    <body style="font-family:sans-serif; text-align:center; padding:2rem;">
      <h2>Token non valido o scaduto</h2>
      <p>Il link di attivazione non è valido oppure è già scaduto.</p>
    </body></html>';
    exit;
}

// 4) Se siamo arrivati qui, il token esiste e non è scaduto.
//    Prepariamo una variabile per eventuali errori di validazione della password.
$err = '';

// 5) Se il metodo è POST, significa che l’utente ha inviato il form con la nuova password
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pw = $_POST['password'] ?? '';

    if (strlen($pw) < 6) {
        // Password troppo corta
        $err = "La password deve contenere almeno 6 caratteri.";
    } else {
        // Tutto ok: aggiorniamo la password in `users`, attiviamo `patients` e cancelliamo il token
        $pdo->beginTransaction();

        // 5a) Salva la password (usiamo password_hash, non md5)
        $hash = password_hash($pw, PASSWORD_DEFAULT);
        $upd1 = $pdo->prepare("
            UPDATE users
            SET password_hash = :h
            WHERE id = :uid
        ");
        $upd1->execute([
            ':h'   => $hash,
            ':uid' => $row['user_id']
        ]);

        // 5b) Aggiorna lo status del paziente su 'active'
        $upd2 = $pdo->prepare("
            UPDATE patients
            SET status = 'active'
            WHERE user_id = :uid
        ");
        $upd2->execute([
            ':uid' => $row['user_id']
        ]);

        // 5c) Cancella il token da activation_tokens
        $del = $pdo->prepare("
            DELETE FROM activation_tokens
            WHERE user_id = :uid
        ");
        $del->execute([
            ':uid' => $row['user_id']
        ]);

        $pdo->commit();

        // 6) Tutto completato: mostriamo un HTML di conferma
        header('Content-Type: text/html; charset=UTF-8');
        echo '<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Registrazione completata</title>
          <style>
            body { 
              background-color: #f0f2f5; 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
            }
            .card {
              background: #ffffff;
              padding: 2rem; 
              border-radius: 8px; 
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 400px;
              width: 90%;
            }
            .card img {
              width: 48px;
              height: 48px;
              margin-bottom: 1rem;
            }
            .card h2 {
              margin-bottom: 1rem;
              font-size: 1.75rem;
              color: #333;
            }
            .card p {
              margin-top: 0.5rem;
              color: #555;
              font-size: 1rem;
              line-height: 1.5;
            }
            .card a {
              display: inline-block;
              margin-top: 1.5rem;
              padding: 0.75rem 1.5rem;
              background-color: #1976d2;
              color: #fff;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 500;
              transition: background-color 0.2s;
            }
            .card a:hover {
              background-color: #1565c0;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="logo.png" alt="My Cron Logo">
            <h2>Password impostata correttamente!</h2>
            <p>
              Ora puoi chiudere questa finestra e tornare all&rsquo;app<br>
              <strong>My Cron</strong>.
            </p>
            <a href="https://ios2020.altervista.org/login"> Vai a My Cron</a>
          </div>
        </body>
        </html>';
        exit;
    }
}

// 7) Se non è POST (ossia siamo in GET o la validazione ha fallito), mostriamo il form HTML
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Imposta la tua password</title>
  <style>
    /* Stile ispirato allo screenshot fornito */
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background-color: #f0f2f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .container {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
    }
    .logo {
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      background: url('logo.png') no-repeat center center;
      background-size: contain;
    }
    h2 {
      margin-bottom: 1rem;
      font-size: 1.5rem;
      color: #333;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    input[type="password"] {
      padding: 0.75rem 1rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    input[type="password"]:focus {
      border-color: #1976d2;
      outline: none;
    }
    .btn-submit {
      padding: 0.75rem 1rem;
      font-size: 1rem;
      font-weight: 500;
      color: #fff;
      background-color: #1976d2;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn-submit:hover {
      background-color: #1565c0;
    }
    .error {
      color: #d32f2f;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo"></div>
    <h2>Imposta la tua password</h2>

    <?php if (!empty($err)): ?>
      <div class="error"><?= htmlspecialchars($err) ?></div>
    <?php endif; ?>

    <form method="post">
      <input
        type="password"
        name="password"
        placeholder="Nuova password (min 6 caratteri)"
        required
        minlength="6"
      >
      <button type="submit" class="btn-submit">Salva Password</button>
    </form>
  </div>
</body>
</html>
