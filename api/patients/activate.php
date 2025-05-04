<?php
require_once __DIR__ . '/../api/config.php';

$token = $_GET['token'] ?? '';
if (!$token) {
  die("Token mancante");
}
// verifica token
$stmt = $pdo->prepare("
  SELECT a.user_id
  FROM activation_tokens a
  WHERE a.token = :t AND a.expires_at > NOW()
");
$stmt->execute([':t'=>$token]);
$row = $stmt->fetch();
if (!$row) {
  die("Token non valido o scaduto");
}

if ($_SERVER['REQUEST_METHOD']==='POST') {
  $pw = $_POST['password'] ?? '';
  if (strlen($pw) < 6) {
    $err = "Password troppo corta";
  } else {
    // salva password e attiva patient
    $pdo->beginTransaction();
    $h = md5($pw);
    $pdo->prepare("UPDATE users SET password_hash=:h WHERE id=:uid")
        ->execute([':h'=>$h,':uid'=>$row['user_id']]);
    $pdo->prepare("
      UPDATE patients SET status='active'
      WHERE user_id=:uid
    ")->execute([':uid'=>$row['user_id']]);
    // rimuovi token
    $pdo->prepare("DELETE FROM activation_tokens WHERE user_id=:uid")
        ->execute([':uid'=>$row['user_id']]);
    $pdo->commit();
    echo "Password impostata! Ora puoi tornare all'app.";
    exit;
  }
}

// form HTML semplice
?>
<!DOCTYPE html>
<html><body>
  <h2>Imposta la tua password</h2>
  <?php if (!empty($err)) echo "<p style='color:red;'>$err</p>"; ?>
  <form method="post">
    <input type="password" name="password" placeholder="Nuova password" required>
    <button type="submit">Salva</button>
  </form>
</body></html>
