<?php
// api/set_password.php
require_once __DIR__ . '/config.php';

$token = $_GET['token'] ?? '';
if (!$token) {
    die("Token mancante");
}

// Verifica token valido e non scaduto
$stmt = $pdo->prepare(
    "SELECT user_id FROM activation_tokens
     WHERE token = ? AND expires_at > NOW()"
);
$stmt->execute([$token]);
$row = $stmt->fetch();

if (!$row) {
    die("Link non valido o scaduto.");
}

$user_id = $row['user_id'];
$error     = '';
$password_set = false; //aggiungiamo una variabile per tracciare se la password è stata impostata

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pw = $_POST['password'] ?? '';
    if (strlen($pw) < 6) {
        $error = "La password deve essere almeno 6 caratteri";
    } else {
        // Aggiorna password e attiva il paziente
        $pdo->beginTransaction();
        $hash = md5($pw);
        $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?")
            ->execute([$hash, $user_id]);
        $pdo->prepare("UPDATE patients SET status = 'active' WHERE user_id = ?")
            ->execute([$user_id]);
        // Elimina token
        $pdo->prepare("DELETE FROM activation_tokens WHERE user_id = ?")
            ->execute([$user_id]);
        $pdo->commit();

        $password_set = true;
        //Rimuoviamo l'exit, così il codice HTML viene sempre renderizzato
    }
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Completa Registrazione MyCron</title>
    <style>
        body {
            font-family: sans-serif;
            padding: 1rem; /* Ridotto il padding per schermi piccoli */
            max-width: 400px;
            margin: auto;
        }

        h2 {
            margin-bottom: 1rem;
            text-align: center; /* Centra il titolo */
        }

        input {
            width: 100%;
            padding: .75rem; /* Aumentato leggermente il padding per migliore usabilità touch */
            margin: .5rem 0;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 1rem; /* Aumentato la dimensione del font per migliore leggibilità */
        }

        .error {
            color: red;
            margin-bottom: 1rem;
            padding: 0.5rem;
            border: 1px solid red;
            border-radius: 5px;
            background-color: #ffe0e0;
        }

        .success {
            color: green;
            font-weight: bold;
            padding: 1rem;
            background-color: #e2f3e5;
            border: 1px solid #c6e0c8;
            margin-bottom: 1rem;
            border-radius: 5px;
            text-align: center;
        }

        form {
            background-color: #f9f9f9;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }

        label {
            display: block;
            margin-bottom: 0.25rem;
            color: #555;
            font-weight: bold;
            font-size: 0.9rem;
        }

        button {
            width: 100%;
            padding: 0.75rem;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s ease;
            margin-top: 0.5rem;
        }

        button:hover {
            background-color: #45a049;
        }

        @media (max-width: 480px) {
            body {
                padding: 1rem; /* Regola il padding per schermi molto piccoli se necessario */
            }
            h2{
               font-size: 1.5rem;
            }
        }
    </style>
    <script>
        function showSuccessAlert() {
            alert("Password impostata con successo! Ora puoi chiudere questa pagina e tornare all'app.");
        }
    </script>
</head>
<body>
    <h2>Completa Registrazione MyCron</h2>
    <?php if ($error): ?>
        <p class="error"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>
    <?php if ($password_set): ?>
        <p class="success">Password impostata con successo! Ora puoi chiudere questa pagina e tornare all'app.</p>
        <script>
            showSuccessAlert();
        </script>
    <?php else: ?>
        <form method="post">
            <label>Nuova Password:</label>
            <input type="password" name="password" required minlength="6">
            <button type="submit">Imposta Password</button>
        </form>
    <?php endif; ?>
</body>
</html>
