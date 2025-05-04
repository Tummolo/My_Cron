<?php
// api/test_mail.php
$to        = 'tccrcc00@gmail.com';          // destinatario di test
$subject   = 'Finalizzazione Registrazione MyCron (test)';
$link      = 'https://www.ios2020.altervista.org/'; // link finto
$username  = 'nome.cognome';

$body = "Ciao!\n\n"
      . "Questo è un test di invio email da AlterVista.\n"
      . "Il tuo username sarà: $username\n"
      . "Per completare la registrazione clicca qui:\n$link\n\n"
      . "Saluti, Team MyCron";

$fromName  = 'MyCron';
$fromEmail = 'noreply@ios2020.altervista.org'; // deve esistere o almeno usare il tuo dominio

$headers   = [
  "From: $fromName <$fromEmail>",
  "Reply-To: support@ios2020.altervista.org",
  "MIME-Version: 1.0",
  "Content-Type: text/plain; charset=UTF-8"
];

$result = mail($to, $subject, $body, implode("\r\n", $headers));

echo $result
  ? '📧 Mail inviata: controlla la casella “tccrcc00@gmail.com”'
  : '❌ mail() ha restituito FALSE – AlterVista potrebbe averla bloccata';
